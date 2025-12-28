'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from './icons';
import type { Message } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface ContextPanelProps {
  pins: Message[];
  togglePin: (messageId: string) => void;
}

export function ContextPanel({ pins, togglePin }: ContextPanelProps) {
  return (
    <aside className="hidden w-80 border-l bg-card md:flex md:flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icons.Pinned className="size-5" />
          Pinned Items
        </CardTitle>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent>
          {pins.length > 0 ? (
            <ul className="space-y-3">
              {pins.map((pin) => (
                <li
                  key={pin.id}
                  className="group relative rounded-lg border bg-background p-3 text-sm"
                >
                  <p className="pr-6 leading-snug text-muted-foreground">
                    {pin.content}
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 size-6 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => togglePin(pin.id)}
                        >
                          <Icons.Unpin className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Unpin this item</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center text-center text-sm text-muted-foreground">
              <Icons.Pin className="mb-2 size-8" />
              <p>No pinned items yet.</p>
              <p>Hover over a message and click the pin icon to save it here.</p>
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </aside>
  );
}
