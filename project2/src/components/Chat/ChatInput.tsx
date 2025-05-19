import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { addMessage, isLoading } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isLoading) {
      addMessage(message.trim(), 'user');
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-[#0A192F] focus-within:border-[#0A192F]">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about Navy Regulations..."
          className="flex-1 max-h-[200px] p-3 pr-12 bg-transparent resize-none outline-none rounded-l-lg"
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className={`
            p-3 rounded-r-lg transition-colors
            ${message.trim() && !isLoading
              ? 'text-[#0A192F] hover:text-[#172A46]' 
              : 'text-gray-400 cursor-not-allowed'}
          `}
        >
          <Send size={20} />
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2 ml-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
};

export default ChatInput;