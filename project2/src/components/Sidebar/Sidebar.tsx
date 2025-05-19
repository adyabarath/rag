import React from 'react';
import { X } from 'lucide-react';
import NewChatButton from './NewChatButton';
import ConversationList from './ConversationList';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
  toggleContext: () => void;
  isContextOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  closeSidebar, 
  toggleContext, 
  isContextOpen 
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={closeSidebar}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          w-72 bg-[#0F2848] text-white flex flex-col
          transition-all duration-300 ease-in-out
          ${isMobile ? 'fixed inset-y-0 left-0 z-30' : 'relative'}
          ${isOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : 'w-0'}
        `}
      >
        {isMobile && (
          <button 
            onClick={closeSidebar}
            className="absolute top-4 right-4 p-1 rounded-md hover:bg-[#172A46] transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
        
        <div className="p-4">
          <NewChatButton 
            closeSidebarOnMobile={() => isMobile && closeSidebar()} 
            toggleContext={toggleContext}
            isContextOpen={isContextOpen}
          />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <ConversationList closeSidebarOnMobile={() => isMobile && closeSidebar()} />
        </div>
        
        <div className="p-4 border-t border-[#203A59] text-xs text-gray-400">
          <p>NavyRegAI v1.0</p>
          <p className="mt-1">© 2025 adya.ai</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;