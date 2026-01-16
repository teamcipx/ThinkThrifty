
import React from 'react';

interface NavbarProps {
  onNavigateHome: () => void;
  onNavigateAdmin: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigateHome, onNavigateAdmin }) => {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold transform group-hover:rotate-12 transition-transform">
            S
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">SnapVault</span>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={onNavigateHome}
            className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
          >
            Explore
          </button>
          {/* Admin link is subtle but accessible for those who know */}
          <button 
            onClick={onNavigateAdmin}
            className="w-1.5 h-1.5 bg-gray-300 rounded-full hover:bg-indigo-600 transition-colors"
            title="Internal"
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
