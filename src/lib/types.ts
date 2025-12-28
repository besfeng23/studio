import type { Timestamp } from "firebase/firestore";

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'model';
  content: string;
  timestamp: Date;
  createdAt?: Timestamp | { seconds: number, nanoseconds: number };
  isPinned?: boolean;
  isDecision?: boolean;
  type: 'chat' | 'command' | 'decision';
  thread_id: string;
  source_ids?: string[];
};

export type Pin = {
  id: string;
  messageId: string;
  content: string;
  timestamp: Date;
};
