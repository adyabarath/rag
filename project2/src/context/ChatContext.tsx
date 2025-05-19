import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { Conversation, Message } from '../types';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  setActiveConversation: (conversation: Conversation) => void;
  addMessage: (content: string, role: 'user' | 'assistant') => void;
  createNewChat: () => void;
  deleteConversation: (id: string) => void;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const API_URL = 'http://localhost:5000/api';

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversationState] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API_URL}/sessions`);
      const sessions = response.data.sessions.map((session: any) => ({
        ...session,
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })),
        createdAt: new Date(session.created_at),
        updatedAt: new Date(session.updated_at)
      }));
      
      setConversations(sessions);
      if (sessions.length > 0 && !activeConversation) {
        setActiveConversationState(sessions[0]);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/sessions/${id}`);
      
      setConversations(prev => prev.filter(conv => conv.id !== id));
      
      if (activeConversation?.id === id) {
        const remainingConversations = conversations.filter(conv => conv.id !== id);
        setActiveConversationState(remainingConversations[0] || null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const setActiveConversation = (conversation: Conversation) => {
    setActiveConversationState(conversation);
  };

  const addMessage = async (content: string, role: 'user') => {
    if (!activeConversation) return;

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_URL}/sessions/${activeConversation.id}/messages`,
        { message: content }
      );

      const { messages } = response.data;
      const formattedMessages = messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));

      const updatedConversation = {
        ...activeConversation,
        messages: [...activeConversation.messages, ...formattedMessages],
        updatedAt: new Date()
      };

      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === activeConversation.id ? updatedConversation : conv
        )
      );

      setActiveConversationState(updatedConversation);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await axios.post(`${API_URL}/sessions`);
      const newSession = response.data.session;
      
      const formattedSession = {
        ...newSession,
        messages: [],
        createdAt: new Date(newSession.created_at),
        updatedAt: new Date(newSession.updated_at)
      };

      setConversations(prev => [formattedSession, ...prev]);
      setActiveConversationState(formattedSession);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  return (
    <ChatContext.Provider 
      value={{ 
        conversations, 
        activeConversation, 
        setActiveConversation, 
        addMessage,
        createNewChat,
        deleteConversation,
        isLoading
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};