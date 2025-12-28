import type { useChat } from '@/lib/hooks/use-chat';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ChatMessages } from '@/components/chat/chat-messages';
import { ChatInput } from '@/components/chat/chat-input';
import { ContextPanel } from '@/components/context-panel';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type ChatLayoutProps = ReturnType<typeof useChat>;

export function ChatLayout(props: ChatLayoutProps) {
  return (
    <div className="relative flex h-full max-h-[100svh] overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-lg font-semibold md:text-xl">Conversation</h1>
        </header>
        <main className="flex-1 overflow-hidden">
          <ChatMessages
            messages={props.messages}
            isPending={props.isPending}
            togglePin={props.togglePin}
          />
        </main>
        <footer className="border-t bg-card p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" >CONTINUE</Button>
            <Button variant="outline" size="sm" >RECAP</Button>
            <Button variant="outline" size="sm" >PIN</Button>
            <Button variant="outline" size="sm" >DECISION</Button>
          </div>
          <ChatInput
            input={props.input}
            handleInputChange={props.handleInputChange}
            handleSubmit={props.handleSubmit}
            isPending={props.isPending}
          />
        </footer>
      </div>
      <ContextPanel pins={props.pins} togglePin={props.togglePin} />
    </div>
  );
}
