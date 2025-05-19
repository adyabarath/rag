import React from 'react';
import { PlusCircle, BookOpen } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

interface NewChatButtonProps {
  closeSidebarOnMobile: () => void;
  toggleContext: () => void;
  isContextOpen: boolean;
}

const NewChatButton: React.FC<NewChatButtonProps> = ({ 
  closeSidebarOnMobile, 
  toggleContext, 
  isContextOpen 
}) => {
  const { createNewChat } = useChat();
  
  const handleNewChat = () => {
    createNewChat();
    closeSidebarOnMobile();
  };
  
  return (
    <div className="space-y-2">
      <button 
        onClick={handleNewChat}
        className="w-full flex items-center justify-center gap-2 bg-[#172A46] hover:bg-[#1F3A5F] text-white py-3 px-4 rounded-lg transition-colors duration-200"
      >
        <PlusCircle size={18} />
        <span className="font-medium">New Chat</span>
      </button>
      
      <button
        onClick={toggleContext}
        className={`
          w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors duration-200 font-medium
          ${isContextOpen 
            ? 'bg-[#1F3A5F] text-white' 
            : 'bg-[#172A46] hover:bg-[#1F3A5F] text-white'}
        `}
      >
        <BookOpen size={18} />
        <span>Retrieved Context</span>
      </button>
    </div>
  );
};

export default NewChatButton;