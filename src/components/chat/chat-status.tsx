'use client';

import { type ChatStatus } from '@/lib/hooks/use-chat';
import { cn } from '@/lib/utils';

const statusMap: Record<ChatStatus, { label: string; progress: string }> = {
  idle: { label: 'Idle', progress: '0%' },
  saving: { label: 'Saving...', progress: '20%' },
  'memory-updated': { label: 'Memory Updated', progress: '40%' },
  retrieving: { label: 'Retrieving...', progress: '60%' },
  answering: { label: 'Answering...', progress: '80%' },
  done: { label: 'Done', progress: '100%' },
  error: { label: 'FIRESTORE ERROR', progress: '100%' },
};

interface ChatStatusProps {
  status: ChatStatus;
}

export function ChatStatus({ status }: ChatStatusProps) {
  const { label, progress } = statusMap[status] || statusMap.idle;
  const isVisible = status !== 'idle' && status !== 'done';
  const isError = status === 'error';

  return (
    <div
      className={cn(
        'mb-2 h-6 text-center text-xs transition-all duration-300',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <p className={cn('font-medium', isError ? 'text-destructive' : 'text-muted-foreground')}>
        {label}
      </p>
      <div className="relative mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            'absolute h-full transition-all duration-500',
            isError ? 'bg-destructive' : 'bg-primary'
          )}
          style={{ width: progress }}
        ></div>
      </div>
    </div>
  );
}
