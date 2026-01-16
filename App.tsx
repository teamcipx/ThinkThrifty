
import React, { useState, useEffect } from 'react';
import { View, ImageMetadata } from './types';
import { ADMIN_SECRET_PATH } from './constants';
import { storageService } from './services/storageService';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ImageDetail from './pages/ImageDetail';
import Admin from './pages/Admin';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('snapvault_admin_token') === 'authenticated';
  });

  // Handle Hash Routing
  useEffect(() => {
    const handleHashChange = async () => {
      const hash = window.location.hash.replace('#', '');
      
      if (hash === ADMIN_SECRET_PATH) {
        setView('admin');
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
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (newView: View, slug: string | null = null) => {
    if (newView === 'home') {
      window.location.hash = '';
    } else if (newView === 'admin') {
      window.location.hash = ADMIN_SECRET_PATH;
    } else if (newView === 'detail' && slug) {
      window.location.hash = `p/${slug}`;
    }
  };

  const handleAdminAuth = (success: boolean) => {
    if (success) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('snapvault_admin_token', 'authenticated');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar 
        onNavigateHome={() => navigateTo('home')} 
        onNavigateAdmin={() => navigateTo('admin')}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {view === 'home' && (
          <Home onSelectImage={(id, slug) => navigateTo('detail', slug)} />
        )}
        
        {view === 'detail' && selectedImageId && (
          <ImageDetail 
            id={selectedImageId} 
            onBack={() => navigateTo('home')} 
          />
        )}
        
        {view === 'admin' && (
          <Admin 
            isAuthenticated={isAdminAuthenticated} 
            onAuthenticate={handleAdminAuth} 
          />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} SnapVault. Minimalist Image Hosting.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
