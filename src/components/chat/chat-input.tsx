'use client';

import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Icons } from '../icons';
import { type ChangeEvent, type FormEvent, useRef, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isPending,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // This is a bit of a hack to submit the form from the textarea
      e.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full items-end gap-2">
      <Textarea
        ref={textareaRef}
        name="message"
        rows={1}
        placeholder="Ask a question or type a command... (e.g. /recap)"
        value={input}
        onChange={handleInputChange}
        onKeyDown={onKeyDown}
        disabled={isPending}
        className="max-h-48 resize-none pr-12"
        aria-label="Chat input"
      />
      <div className="absolute bottom-2 right-2 flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                size="icon"
                disabled={isPending || !input.trim()}
                aria-label="Send message"
              >
                {isPending ? (
                  <Icons.Spinner className="animate-spin" />
                ) : (
                  <Icons.Send />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send message</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </form>
  );
}
