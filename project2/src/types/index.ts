export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  contexts?: RetrievedContext[];
}

export interface RetrievedContext {
  id: string;
  content: string;
  relevanceScore: number;
  source: string;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}