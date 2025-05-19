import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import ChatContainer from '../Chat/ChatContainer';
import Header from '../Header/Header';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useState } from 'react';

const Layout: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [contextOpen, setContextOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const toggleContext = () => {
    setContextOpen(prev => !prev);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          closeSidebar={() => setSidebarOpen(false)} 
          toggleContext={toggleContext}
          isContextOpen={contextOpen}
        />
        <main className={`flex-1 transition-all duration-300 ${isMobile && sidebarOpen ? 'blur-sm' : ''}`}>
          <ChatContainer showContext={contextOpen} />
        </main>
      </div>
    </div>
  );
};

export default Layout;