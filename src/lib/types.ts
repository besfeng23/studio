export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isPinned?: boolean;
  isDecision?: boolean;
};

export type Pin = {
  id: string;
  messageId: string;
  content: string;
  timestamp: Date;
};
