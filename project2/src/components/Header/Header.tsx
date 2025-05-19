import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="bg-[#0A192F] text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="mr-4 p-1 rounded-md hover:bg-[#172A46] transition-colors md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center">
            {/* Logo placeholder - replace with actual logo */}
            <div className="font-bold text-xl mr-2">adya.ai</div>
            <div className="h-6 w-px bg-gray-400 mx-3"></div>
            <div>
              <h1 className="text-lg font-semibold">NavyRegAI</h1>
              <p className="text-xs text-gray-300">Conversational Assistant for Navy</p>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex items-center">
          <span className="text-sm text-gray-300">
            Navy Regulations Part II Assistant
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;