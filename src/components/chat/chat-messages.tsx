'use client';

import { useEffect, useRef } from 'react';
import type { Message } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './chat-message';
import { Icons } from '../icons';

interface ChatMessagesProps {
  messages: Message[];
  isPending: boolean;
  togglePin: (messageId: string) => void;
}

export function ChatMessages({ messages, isPending, togglePin }: ChatMessagesProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, isPending]);

  return (
    <ScrollArea className="h-full" viewportRef={viewportRef}>
      <div className="p-4 md:p-6">
        {messages.length > 0 ? (
           messages.map((message) => (
            <ChatMessage key={message.id} message={message} onPinToggle={togglePin} />
          ))
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>Type a message to begin.</p>
          </div>
        )}
        
        {isPending && !messages.some(m => m.role === 'assistant' && m.id === 'thinking') && (
          <div className="flex items-start gap-4 py-4">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icons.Bot className="size-5" />
            </div>
            <div className="group flex-1 space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <Icons.Spinner className="size-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
