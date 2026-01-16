import React, { useState, useMemo, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { CATEGORIES } from '../constants';
import { ImageMetadata } from '../types';

interface HomeProps {
  onSelectImage: (id: string, slug: string) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectImage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadImages = async () => {
      const data = await storageService.getAll();
      setImages(data);
      setLoading(false);
    };
    loadImages();
  }, []);
  
  const filteredImages = useMemo(() => {
    return images.filter(img => {
      const matchesSearch = 
        img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (img.author && img.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        img.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || img.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [images, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
        </div>
        <p className="text-zinc-400 font-medium text-sm tracking-widest uppercase">Initializing Gallery</p>
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative text-center space-y-8 max-w-4xl mx-auto pt-16">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter leading-[1.1]">
            Curated <span className="text-indigo-600">Visual</span> Intelligence.
          </h1>
          <p className="text-xl text-zinc-500 font-medium max-w-2xl mx-auto leading-relaxed">
            High-performance imagery cataloged with Gemini AI for professional creators.
          </p>
        </div>
        
        <div className="relative max-w-2xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-10 group-focus-within:opacity-25 transition-opacity duration-500"></div>
          <input
            type="text"
            placeholder="Search our studio repository..."
            className="relative w-full pl-14 pr-6 py-5 rounded-2xl bg-white border border-zinc-200 shadow-xl focus:ring-0 focus:border-indigo-500 text-lg outline-none transition-all placeholder:text-zinc-400 font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-5 top-1/2 -translate-y-1/2">
            <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </section>
{/* Category Navigation - Fixed at Bottom */}
      <div className="fixed bottom-8 left-0 w-full z-50 flex flex-wrap justify-center gap-2 py-4 pointer-events-none">
        
        <div className="glass-nav p-1.5 rounded-full border border-zinc-200/50 flex flex-wrap justify-center gap-1 shadow-2xl pointer-events-auto bg-white/80 backdrop-blur-xl transition-transform duration-300 hover:scale-105">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all ${
              selectedCategory === 'All' 
                ? 'bg-zinc-900 text-white shadow-lg' 
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all ${
                selectedCategory === cat 
                  ? 'bg-zinc-900 text-white shadow-lg' 
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
        {filteredImages.length > 0 ? (
          filteredImages.map((img) => (
            <div 
              key={img.id}
              onClick={() => onSelectImage(img.id, img.slug)}
              className="group cursor-pointer bg-white rounded-[2rem] overflow-hidden border border-zinc-100 image-card-shadow transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
            >
              <div className="aspect-[4/5] overflow-hidden bg-zinc-100 relative">
                <img 
                  src={img.thumbnailUrl || img.url} 
                  alt={img.title}
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-6 left-6 right-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                   <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-white/20">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-1">{img.category}</p>
                     <h3 className="font-bold text-zinc-900 line-clamp-1">{img.title}</h3>
                   </div>
                </div>
                <div className="absolute top-6 right-6 bg-zinc-900/40 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-500">
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                   </svg>
                   {img.downloadCount || 0}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-40 text-center space-y-6">
            <div className="w-24 h-24 bg-zinc-50 rounded-[2.5rem] flex items-center justify-center mx-auto border border-zinc-100">
              <svg className="w-10 h-10 text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-zinc-900 font-bold text-lg">No matching artifacts found</p>
              <p className="text-zinc-400 text-sm">Try broadening your search parameters or category.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
