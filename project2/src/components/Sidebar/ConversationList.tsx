import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

interface ConversationListProps {
  closeSidebarOnMobile: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ closeSidebarOnMobile }) => {
  const { conversations, activeConversation, setActiveConversation, deleteConversation } = useChat();

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupedConversations = conversations.reduce<Record<string, typeof conversations>>(
    (groups, conversation) => {
      const dateGroup = formatDate(conversation.createdAt);
      if (!groups[dateGroup]) {
        groups[dateGroup] = [];
      }
      groups[dateGroup].push(conversation);
      return groups;
    },
    {}
  );

  const handleConversationClick = (conversation: typeof conversations[0]) => {
    setActiveConversation(conversation);
    closeSidebarOnMobile();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id);
  };

  return (
    <div className="px-2">
      {Object.entries(groupedConversations).map(([dateGroup, conversations]) => (
        <div key={dateGroup} className="mb-4">
          <h3 className="text-xs text-gray-400 px-2 mb-2">{dateGroup}</h3>
          {conversations.map(conversation => (
            <button
              key={conversation.id}
              onClick={() => handleConversationClick(conversation)}
              className={`
                w-full text-left p-2 rounded-lg mb-1 flex items-start group transition-colors duration-200
                ${activeConversation?.id === conversation.id 
                  ? 'bg-[#1F3A5F] text-white' 
                  : 'hover:bg-[#172A46] text-gray-200'}
              `}
            >
              <MessageSquare size={16} className="mt-1 mr-2 flex-shrink-0" />
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium">{conversation.title}</p>
                <p className="text-xs text-gray-400 truncate">
                  {conversation.messages.length > 0 
                    ? conversation.messages[conversation.messages.length - 1].content.substring(0, 30) + '...'
                    : 'No messages yet'}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(e, conversation.id)}
                className={`
                  p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity
                  ${activeConversation?.id === conversation.id 
                    ? 'hover:bg-[#0F2848] text-white' 
                    : 'hover:bg-[#0F2848] text-gray-300'}
                `}
                aria-label="Delete conversation"
              >
                <Trash2 size={16} />
              </button>
            </button>
          ))}
        </div>
      ))}
      
      {conversations.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No conversations yet</p>
          <p className="text-sm mt-2">Start a new chat to begin</p>
        </div>
      )}
    </div>
  );
};

export default ConversationList;