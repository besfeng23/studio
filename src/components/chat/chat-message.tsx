'use client';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Icons } from '../icons';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface ChatMessageProps {
  message: Message;
  onPinToggle: (messageId: string) => void;
}

export function ChatMessage({ message, onPinToggle }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isDecision = !!message.isDecision;

  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  const botAvatar = PlaceHolderImages.find((img) => img.id === 'bot-avatar');

  if (isSystem) {
    return (
      <div className="my-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <hr className="flex-1" />
        <span className="shrink-0">{message.content}</span>
        <hr className="flex-1" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group/message relative my-4 flex items-start gap-4',
        isUser ? 'flex-row-reverse' : ''
      )}
    >
      <Avatar className="shrink-0">
        <AvatarImage
          src={isUser ? userAvatar?.imageUrl : botAvatar?.imageUrl}
          data-ai-hint={isUser ? userAvatar?.imageHint : botAvatar?.imageHint}
        />
        <AvatarFallback>
          {isUser ? <Icons.User /> : <Icons.Bot />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          'flex-1 space-y-1',
          isUser ? 'text-right' : 'text-left'
        )}
      >
        <p className="text-xs text-muted-foreground">
          {isUser ? 'You' : 'Pandora'}
        </p>
        <div
          className={cn(
            'relative inline-block rounded-lg p-3',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-card',
            isDecision && !isUser && 'border-2 border-amber-500 bg-amber-50'
          )}
        >
          {isDecision && !isUser && (
             <div className="mb-2 flex items-center gap-2 font-semibold text-amber-700">
               <Icons.Decision className="size-4" />
               <span>Decision Point</span>
             </div>
          )}
          <p className="whitespace-pre-wrap">{message.content.replace(/^\/decision\s*/i, '')}</p>
        </div>
      </div>
      
      <div
        className={cn(
          'absolute top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover/message:opacity-100',
          isUser ? 'left-0' : 'right-0'
        )}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => onPinToggle(message.id)}
              >
                <Icons.Pin
                  className={cn(
                    'size-4',
                    message.isPinned && 'fill-primary text-primary'
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{message.isPinned ? 'Unpin message' : 'Pin message'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
