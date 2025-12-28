'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/main-sidebar';
import { ChatLayout } from '@/components/chat-layout';
import { useChat } from '@/lib/hooks/use-chat';

export default function ChatPage() {
  const chat = useChat();

  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <ChatLayout {...chat} />
      </SidebarInset>
    </SidebarProvider>
  );
}
