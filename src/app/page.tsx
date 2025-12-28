'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/main-sidebar';
import { ChatLayout } from '@/components/chat-layout';
import { useChat } from '@/lib/hooks/use-chat';

export default function Home() {
  const chat = useChat({
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content: "Welcome to Pandora's Box. How can I assist you today?",
        timestamp: new Date(),
      },
    ],
  });

  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <ChatLayout {...chat} />
      </SidebarInset>
    </SidebarProvider>
  );
}
