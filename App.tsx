import React, { useState, useEffect } from 'react';
import { View } from './types';
import { ADMIN_SECRET_PATH } from './constants';
import { storageService } from './services/storageService';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ImageDetail from './pages/ImageDetail';
import Admin from './pages/Admin';
import About from './pages/About';
import Privacy from './pages/Privacy';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('snapvault_admin_token') === 'authenticated';
  });

  useEffect(() => {
    const handleHashChange = async () => {
      const hash = window.location.hash.replace('#', '');
      
      if (hash === ADMIN_SECRET_PATH) {
        setView('admin');
      } else if (hash === 'about') {
        setView('about');
      } else if (hash === 'privacy') {
        setView('privacy');
      } else if (hash.startsWith('p/')) {
        const slug = hash.split('/')[1];
        const image = await storageService.getBySlug(slug);
        if (image) {
          setSelectedImageId(image.id);
          setView('detail');
        } else {
          setView('home');
        }
      } else {
        setView('home');
        setSelectedImageId(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (newView: View, slug: string | null = null) => {
    const hashMap: Record<string, string> = {
      home: '',
      admin: ADMIN_SECRET_PATH,
      about: 'about',
      privacy: 'privacy',
      detail: `p/${slug}`
    };

    window.location.hash = hashMap[newView] ?? '';
  };

  const handleAdminAuth = (success: boolean) => {
    if (success) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('snapvault_admin_token', 'authenticated');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onNavigate={(v) => navigateTo(v)} currentView={view} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {view === 'home' && (
          <Home onSelectImage={(id, slug) => navigateTo('detail', slug)} />
        )}
        
        {view === 'detail' && selectedImageId && (
          <ImageDetail id={selectedImageId} onBack={() => navigateTo('home')} />
        )}
        
        {view === 'admin' && (
          <Admin isAuthenticated={isAdminAuthenticated} onAuthenticate={handleAdminAuth} />
        )}

        {view === 'about' && <About onNavigateHome={() => navigateTo('home')} />}
        {view === 'privacy' && <Privacy onNavigateHome={() => navigateTo('home')} />}
      </main>

      <footer className="bg-white border-t border-gray-200 py-12 mt-12">
        {/* Advertisement Placeholder */}
        <div className="flex flex-col items-center justify-center gap-2 py-4 mb-8">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Advertisement
          </span>
          <div className="relative w-full max-w-[468px] h-[60px] bg-gray-100 border border-gray-200 overflow-hidden shadow-sm flex items-center justify-center text-xs text-gray-400">
            Ad Space
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-xs">P</div>
              <span className="font-bold text-gray-900">Picghor</span>
            </div>
            
            <div className="flex gap-8 text-sm font-medium text-gray-500">
              <button onClick={() => navigateTo('home')} className="hover:text-indigo-600 transition-colors">Explore</button>
              <button onClick={() => navigateTo('about')} className="hover:text-indigo-600 transition-colors">About</button>
              <button onClick={() => navigateTo('privacy')} className="hover:text-indigo-600 transition-colors">Privacy</button>
            </div>

            <p className="text-gray-400 text-xs">
              © {new Date().getFullYear()} Picghor
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
