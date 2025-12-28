'use client';

import { MainSidebar } from '@/components/main-sidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useDoc } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

type StateDoc = {
  note?: string;
  items?: string[];
  last_user_message?: string;
  last_assistant_reply?: string;
  next_action?: string;
};

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-1/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);

export default function MemoryPage() {
  const {
    data: contextData,
    loading: contextLoading,
  } = useDoc<StateDoc>('state/context');
  const { data: pinsData, loading: pinsLoading } = useDoc<StateDoc>('state/pins');
  const {
    data: lastStateData,
    loading: lastStateLoading,
  } = useDoc<StateDoc>('state/last_state');

  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <div className="flex h-full flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4">
            <h1 className="text-lg font-semibold md:text-xl">Memory</h1>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Context Note</CardTitle>
                  <CardDescription>
                    A summary of the ongoing conversation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {contextLoading ? (
                    <LoadingSkeleton />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {contextData?.note || 'No context note available.'}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pins</CardTitle>
                  <CardDescription>
                    Important items you have saved.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pinsLoading ? (
                    <LoadingSkeleton />
                  ) : (
                    <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                      {pinsData?.items && pinsData.items.length > 0 ? (
                        pinsData.items.map((pin, index) => (
                          <li key={index}>{pin}</li>
                        ))
                      ) : (
                        <li>No items pinned.</li>
                      )}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Last State</CardTitle>
                  <CardDescription>
                    The most recent turn in the conversation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lastStateLoading ? (
                    <LoadingSkeleton />
                  ) : (
                    <>
                      <div>
                        <h4 className="font-semibold">Last User Message</h4>
                        <p className="text-sm text-muted-foreground">
                          {lastStateData?.last_user_message || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          Last Assistant Reply
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {lastStateData?.last_assistant_reply || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Next Action</h4>
                        <p className="text-sm text-muted-foreground">
                          {lastStateData?.next_action || 'N/A'}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
