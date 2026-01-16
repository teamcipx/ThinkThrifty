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
    <nav className="sticky top-0 z-50 glass-nav border-b border-zinc-100">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white font-black text-lg transition-all group-hover:bg-indigo-600 group-hover:rotate-6">
            P
          </div>
          <span className="text-xl font-extrabold text-zinc-900 tracking-tight hidden sm:block">Picghor</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          <button 
            onClick={() => handleNavClick('home')}
            className={`text-sm font-semibold tracking-wide transition-all ${currentView === 'home' ? 'text-indigo-600' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            EXPLORE
          </button>
          <button 
            onClick={() => handleNavClick('about')}
            className={`text-sm font-semibold tracking-wide transition-all ${currentView === 'about' ? 'text-indigo-600' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            ABOUT
          </button>
          <button 
            onClick={() => handleNavClick('privacy')}
            className={`text-sm font-semibold tracking-wide transition-all ${currentView === 'privacy' ? 'text-indigo-600' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            PRIVACY
          </button>
          <div className="h-4 w-px bg-zinc-200"></div>
          <button 
            onClick={() => handleNavClick('admin')}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-full hover:bg-indigo-600 transition-all shadow-lg shadow-zinc-200 active:scale-95"
          >
            DASHBOARD
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-zinc-100 animate-in slide-in-from-top duration-500">
          <div className="flex flex-col p-6 gap-2">
            <button 
              onClick={() => handleNavClick('home')}
              className={`text-left px-5 py-4 rounded-2xl font-bold text-lg ${currentView === 'home' ? 'bg-zinc-50 text-indigo-600' : 'text-zinc-900'}`}
            >
              Explore Gallery
            </button>
            <button 
              onClick={() => handleNavClick('about')}
              className={`text-left px-5 py-4 rounded-2xl font-bold text-lg ${currentView === 'about' ? 'bg-zinc-50 text-indigo-600' : 'text-zinc-900'}`}
            >
              Our Mission
            </button>
            <button 
              onClick={() => handleNavClick('privacy')}
              className={`text-left px-5 py-4 rounded-2xl font-bold text-lg ${currentView === 'privacy' ? 'bg-zinc-50 text-indigo-600' : 'text-zinc-900'}`}
            >
              Privacy Policy
            </button>
            <div className="h-px bg-zinc-100 my-2"></div>
            <button 
              onClick={() => handleNavClick('admin')}
              className="text-left px-5 py-4 rounded-2xl font-bold text-zinc-400 text-sm"
            >
              Internal Admin Dashboard
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;