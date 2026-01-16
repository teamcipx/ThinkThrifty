import React, { useState } from 'react';
import { View } from '../types';

interface NavbarProps {
  onNavigate: (view: View) => void;
  currentView: View;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (view: View) => {
    onNavigate(view);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold transform group-hover:rotate-12 transition-transform">
            P
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Picghor</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => handleNavClick('home')}
            className={`font-medium transition-colors ${currentView === 'home' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
          >
            Explore
          </button>
          <button 
            onClick={() => handleNavClick('about')}
            className={`font-medium transition-colors ${currentView === 'about' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
          >
            About
          </button>
          <button 
            onClick={() => handleNavClick('privacy')}
            className={`font-medium transition-colors ${currentView === 'privacy' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
          >
            Privacy
          </button>
          <button 
            onClick={() => handleNavClick('admin')}
            className="w-1.5 h-1.5 bg-gray-300 rounded-full hover:bg-indigo-600 transition-colors"
            title="Internal Access"
          />
        </div>

        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col p-4 gap-4">
            <button 
              onClick={() => handleNavClick('home')}
              className={`text-left px-4 py-3 rounded-xl font-bold ${currentView === 'home' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'}`}
            >
              Explore Gallery
            </button>
            <button 
              onClick={() => handleNavClick('about')}
              className={`text-left px-4 py-3 rounded-xl font-bold ${currentView === 'about' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'}`}
            >
              Our Mission
            </button>
            <button 
              onClick={() => handleNavClick('privacy')}
              className={`text-left px-4 py-3 rounded-xl font-bold ${currentView === 'privacy' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'}`}
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => handleNavClick('admin')}
              className="text-left px-4 py-3 rounded-xl font-bold text-gray-400 text-xs"
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;