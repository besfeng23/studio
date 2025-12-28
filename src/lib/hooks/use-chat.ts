'use client';

import { useState, useTransition, useCallback, type FormEvent, type ChangeEvent } from 'react';
import type { Message } from '@/lib/types';
import { handleUserMessage } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export type UseChatOptions = {
  initialMessages?: Message[];
  initialPins?: Message[];
};

export function useChat({ initialMessages = [], initialPins = [] }: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [pins, setPins] = useState<Message[]>(initialPins);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      isDecision: input.toLowerCase().startsWith('/decision'),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    startTransition(async () => {
      const assistantMessage = await handleUserMessage(messages, pins, input);
      setMessages((prev) => [...prev, assistantMessage]);
    });
  }, [input, isPending, messages, pins]);

  const togglePin = useCallback((messageId: string) => {
    const messageToPin = messages.find(msg => msg.id === messageId);
    if (!messageToPin) return;

    const isAlreadyPinned = pins.some(p => p.id === messageId);

    if (isAlreadyPinned) {
      setPins(prev => prev.filter(p => p.id !== messageId));
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isPinned: false } : m));
      toast({ title: 'Unpinned', description: 'Message removed from pins.' });
    } else {
      setPins(prev => [messageToPin, ...prev]);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isPinned: true } : m));
      toast({ title: 'Pinned', description: 'Message added to pins.' });
    }
  }, [messages, pins, toast]);

  return {
    messages,
    pins,
    input,
    isPending,
    handleInputChange,
    handleSubmit,
    togglePin,
  };
}
