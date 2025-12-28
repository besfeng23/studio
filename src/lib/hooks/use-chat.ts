'use client';

import {
  useState,
  useTransition,
  useCallback,
  type FormEvent,
  type ChangeEvent,
  useEffect,
  useRef,
} from 'react';
import type { Message } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
  where,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import {
  memoryLane,
  type MemoryLaneOutput,
} from '@/ai/flows/memory-lane-flow';
import {
  answerLane,
  type AnswerLaneOutput,
} from '@/ai/flows/answer-lane-flow';
import { runRetrieval } from '../retrieval';

export type ChatStatus =
  | 'idle'
  | 'saving'
  | 'memory-updated'
  | 'retrieving'
  | 'answering'
  | 'done'
  | 'error';

export type UseChatOptions = {
  initialMessages?: Message[];
  initialPins?: Message[];
};

export function useChat({
  initialMessages = [],
  initialPins = [],
}: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [pins, setPins] = useState<Message[]>(initialPins);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ChatStatus>('idle');
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load initial chat history
  useEffect(() => {
    if (!db || !user) return;
    const historyQuery = query(
      collection(db, 'history'),
      where('thread_id', '==', 'default'),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      historyQuery,
      (snapshot) => {
        const history = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.createdAt?.toDate() || new Date(),
          } as Message;
        });
        setMessages(history);
      },
      (err) => {
        console.error(err);
        setStatus('error');
        toast({
          variant: 'destructive',
          title: 'FIRESTORE ERROR',
          description: 'Could not load chat history.',
        });
      }
    );

    return () => unsubscribe();
  }, [db, user, toast]);

  // Load initial state (pins) and map content
  useEffect(() => {
    if (!db || !user) return;

    const unsub = onSnapshot(doc(db, 'state', 'pins'), async (doc) => {
      if (doc.exists()) {
        const pinIds = doc.data().items || [];
        const pinnedMessages: Message[] = [];
        for (const pinId of pinIds) {
          const msgRef = doc(db, 'history', pinId);
          const msgSnap = await getDoc(msgRef);
          if (msgSnap.exists()) {
             const data = msgSnap.data();
             pinnedMessages.push({
               id: msgSnap.id,
               content: data.content,
               role: data.role,
               type: data.type,
               thread_id: data.thread_id,
               timestamp: data.createdAt?.toDate() ?? new Date(),
               isPinned: true
             });
          }
        }
        setPins(pinnedMessages);
        setMessages(prev => prev.map(m => ({...m, isPinned: pinIds.includes(m.id)})))
      }
    });

    return () => unsub();
  }, [db, user]);


  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const processMessage = useCallback(
    async (userInput: string) => {
      if (!db || !user) return;
      setStatus('saving');

      const messageType = userInput.startsWith('/') ? 'command' : 'chat';
      const userMessage: Omit<Message, 'id' | 'timestamp' | 'isPinned'> = {
        role: 'user',
        content: userInput,
        createdAt: serverTimestamp(),
        thread_id: 'default',
        type: messageType,
      };

      try {
        await addDoc(collection(db, 'history'), userMessage);
      } catch (error) {
        setStatus('error');
        toast({
          variant: 'destructive',
          title: 'FIRESTORE ERROR',
          description: 'Could not save your message.',
        });
        const permissionError = new FirestorePermissionError({
          path: 'history',
          operation: 'create',
          requestResourceData: userMessage,
        });
        errorEmitter.emit('permission-error', permissionError);
        return;
      }

      // Start the two-lane process
      startTransition(async () => {
        try {
          // Fetch current state for Lane 1
          const [contextDoc, lastStateDoc, pinsDoc] = await Promise.all([
            getDoc(doc(db, 'state', 'context')),
            getDoc(doc(db, 'state', 'last_state')),
            getDoc(doc(db, 'state', 'pins')),
          ]);

          const contextNote = contextDoc.exists()
            ? contextDoc.data().note
            : '';
          const lastState = lastStateDoc.exists() ? lastStateDoc.data() : {};
          const pinItems = pinsDoc.exists() ? pinsDoc.data().items : [];
          
          const textPins = pins
            .filter(p => pinItems.includes(p.id))
            .map(p => p.content);

          // Lane 1: memoryLane
          const memoryLaneResult: MemoryLaneOutput = await memoryLane({
            user_message: userInput,
            context_note: contextNote,
            last_state: lastState,
            pins: textPins,
          });

          // Actions from memoryLane
          setStatus('memory-updated');
          const batch = writeBatch(db);
          batch.set(doc(db, 'state', 'context'), {
            note: memoryLaneResult.new_context_note,
          });
          if (memoryLaneResult.updated_pins) {
            batch.set(doc(db, 'state', 'pins'), {
              items: memoryLaneResult.updated_pins,
            });
          }
          batch.update(doc(db, 'state', 'last_state'), {
            last_user_message: userInput,
          });
          await batch.commit();

          // Clarification Protocol
          if (memoryLaneResult.needs_clarification) {
            const clarificationMessage: Omit<Message, 'id' | 'timestamp' | 'isPinned'> = {
              role: 'assistant',
              content: memoryLaneResult.clarifying_question!,
              createdAt: serverTimestamp(),
              thread_id: 'default',
              type: 'chat',
            };
            await addDoc(collection(db, 'history'), clarificationMessage);
            await setDoc(
              doc(db, 'state', 'last_state'),
              { last_assistant_reply: memoryLaneResult.clarifying_question! },
              { merge: true }
            );
            setStatus('done');
            return;
          }

          // Retrieval
          setStatus('retrieving');
          const retrievedSnippets = await runRetrieval(
            db,
            memoryLaneResult.search_queries
          );

          // Lane 2: answerLane
          setStatus('answering');
          const answerLaneResult: AnswerLaneOutput = await answerLane({
            user_message: userInput,
            context_note: memoryLaneResult.new_context_note,
            retrieved_history: retrievedSnippets,
            pins: textPins,
          });

          // Actions from answerLane
          const assistantMessage: Omit<Message, 'id' | 'timestamp' | 'isPinned'> = {
            role: 'assistant',
            content: answerLaneResult.reply_text,
            createdAt: serverTimestamp(),
            thread_id: 'default',
            type: answerLaneResult.reply_text.startsWith('/decision') ? 'decision' : 'chat',
            source_ids: answerLaneResult.source_ids,
          };
          await addDoc(collection(db, 'history'), assistantMessage);

          const finalStateUpdate: any = {
            last_assistant_reply: answerLaneResult.reply_text,
          };
          if (answerLaneResult.next_action) {
            finalStateUpdate.next_action = answerLaneResult.next_action;
          }
          await setDoc(doc(db, 'state', 'last_state'), finalStateUpdate, {
            merge: true,
          });

          setStatus('done');
        } catch (error: any) {
          console.error('Error processing message flow:', error);
          setStatus('error');
          toast({
            variant: 'destructive',
            title: error.message === 'FIRESTORE ERROR' ? 'FIRESTORE ERROR' : 'AI Error',
            description: 'Failed to get a response.',
          });
          if (error.message !== 'FIRESTORE ERROR') {
             try {
                await addDoc(collection(db, 'history'), {
                  role: 'system',
                  content: `ERROR: ${error.message}`,
                  createdAt: serverTimestamp(),
                  thread_id: 'default',
                  type: 'chat'
                });
              } catch (e) { /* ignore */ }
          }
        }
      });
    },
    [db, user, toast, pins]
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmedInput = input.trim();
      if (!trimmedInput || isPending) return;

      setInput('');
      processMessage(trimmedInput);
    },
    [input, isPending, processMessage]
  );

  const handleCommand = useCallback((command: string) => {
      const currentInput = input.trim();
      if (currentInput.startsWith('/')) {
        setInput(command + ' ');
      } else {
        setInput(command + ' ' + currentInput);
      }
      textareaRef.current?.focus();
  }, [input]);

  const togglePin = useCallback(
    async (messageId: string) => {
      if (!db) return;
      const messageToToggle = messages.find((msg) => msg.id === messageId);
      if (!messageToToggle) return;

      const pinsRef = doc(db, 'state', 'pins');
      try {
        const pinsDoc = await getDoc(pinsRef);
        const currentPins = pinsDoc.exists() ? pinsDoc.data().items || [] : [];
        const isAlreadyPinned = currentPins.includes(messageId);

        let updatedPins;
        if (isAlreadyPinned) {
          updatedPins = currentPins.filter((id: string) => id !== messageId);
          toast({ title: 'Unpinned', description: 'Message removed from pins.' });
        } else {
          updatedPins = [messageId, ...currentPins];
          toast({ title: 'Pinned', description: 'Message added to pins.' });
        }
        await setDoc(pinsRef, { items: updatedPins });

      } catch (error) {
         toast({
          variant: 'destructive',
          title: 'FIRESTORE ERROR',
          description: 'Could not update pins.',
        });
         const permissionError = new FirestorePermissionError({
          path: 'state/pins',
          operation: 'update',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    },
    [db, messages, toast]
  );

  return {
    messages,
    pins,
    input,
    isPending: isPending || (status !== 'done' && status !== 'idle' && status !== 'error'),
    status,
    handleInputChange,
    handleSubmit,
    togglePin,
    handleCommand,
    textareaRef,
  };
}
