import React, { useRef, useEffect } from 'react';
import Message from './Message';
import ChatInput from './ChatInput';
import ContextDisplay from './ContextDisplay';
import { useChat } from '../../context/ChatContext';
import { ArrowDown, Loader2 } from 'lucide-react';

interface ChatContainerProps {
  showContext: boolean;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ showContext }) => {
  const { activeConversation, addMessage, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = React.useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNotAtBottom = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isNotAtBottom);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleSampleQuestion = (question: string) => {
    addMessage(question, 'user');
  };

  const latestMessage = activeConversation?.messages[activeConversation.messages.length - 1];

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6"
      >
        {activeConversation?.messages && activeConversation.messages.length > 0 ? (
          <>
            <div className="max-w-3xl mx-auto space-y-6">
              {activeConversation.messages.map((message, index) => (
                <Message 
                  key={message.id} 
                  message={message}
                  isFirstMessage={index === 0}
                />
              ))}
              {isLoading && (
                <div className="flex items-center gap-3 animate-fadeIn">
                  <div className="w-8 h-8 rounded-full bg-[#0A192F] text-white flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold">AI</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">Assistant</div>
                    <div className="bg-gray-100 text-gray-800 rounded-lg rounded-tl-none p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        <span>Generating response...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-[#0A192F] mb-2">
                NavyRegAI Assistant
              </h2>
              <p className="text-gray-600 mb-6">
                Ask me any questions about Navy Regulations Part II, and I'll provide you with accurate, helpful information.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                {[
                  "What are the uniform requirements?",
                  "Explain the chain of command",
                  "What are the leave policies?",
                  "Describe conduct expectations"
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSampleQuestion(suggestion)}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 p-2 bg-[#0A192F] text-white rounded-full shadow-lg hover:bg-[#172A46] transition-colors"
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={20} />
        </button>
      )}
      
      <div className="p-4 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <ChatInput />
        </div>
      </div>

      <ContextDisplay 
        contexts={latestMessage?.contexts}
        isOpen={showContext}
        onToggle={() => {}}
      />
    </div>
  );
};

export default ChatContainer;