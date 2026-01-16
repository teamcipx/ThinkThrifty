
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
        img.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || img.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [images, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          Discover Beautiful <span className="text-indigo-600">Free Images</span>
        </h1>
        <p className="text-lg text-gray-500">
          Curated collection of high-quality visuals for your creative projects.
        </p>
        
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search for images, categories, or keywords..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-xl focus:ring-2 focus:ring-indigo-500 text-lg outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
            selectedCategory === 'All' 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              selectedCategory === cat 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredImages.length > 0 ? (
          filteredImages.map((img) => (
            <div 
              key={img.id}
              onClick={() => onSelectImage(img.id, img.slug)}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                <img 
                  src={img.thumbnailUrl || img.url} 
                  alt={img.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {img.title}
                  </h3>
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {img.category}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{img.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-400 font-medium">No images found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
