'use client';

import type { useChat } from '@/lib/hooks/use-chat';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ChatMessages } from '@/components/chat/chat-messages';
import { ChatInput } from '@/components/chat/chat-input';
import { ContextPanel } from '@/components/context-panel';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import { Icons } from './icons';
import { ChatStatus } from './chat/chat-status';

type ChatLayoutProps = ReturnType<typeof useChat>;

export function ChatLayout(props: ChatLayoutProps) {
  const {
    messages,
    pins,
    input,
    isPending,
    handleInputChange,
    handleSubmit,
    togglePin,
    status,
    handleCommand,
  } = props;

  const commandButtons = useMemo(
    () => [
      { command: '/continue', label: 'CONTINUE' },
      { command: '/recap', label: 'RECAP' },
      { command: '/pin', label: 'PIN' },
      { command: '/decision', label: 'DECISION' },
    ],
    []
  );

  return (
    <div className="relative flex h-full max-h-[100svh] overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-lg font-semibold md:text-xl">Conversation</h1>
        </header>
        <main className="flex-1 overflow-hidden">
          <ChatMessages
            messages={messages}
            isPending={isPending}
            togglePin={togglePin}
          />
        </main>
        <footer className="border-t bg-card p-4">
          <ChatStatus status={status} />
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {commandButtons.map(({ command, label }) => (
              <Button
                key={command}
                variant="outline"
                size="sm"
                onClick={() => handleCommand(command)}
                disabled={isPending}
              >
                {label}
              </Button>
            ))}
          </div>
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isPending={isPending}
          />
        </footer>
      </div>
      <ContextPanel pins={pins} togglePin={togglePin} />
    </div>
  );
}
