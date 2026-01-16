
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { ImageMetadata } from '../types';

interface ImageDetailProps {
  id: string;
  onBack: () => void;
}

const ImageDetail: React.FC<ImageDetailProps> = ({ id, onBack }) => {
  const [image, setImage] = useState<ImageMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      const data = await storageService.getById(id);
      if (data) {
        setImage(data);
        document.title = `${data.title} | SnapVault`;
      }
      setLoading(false);
    };
    loadImage();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!image) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <p className="text-gray-500">Image not found.</p>
      <button onClick={onBack} className="text-indigo-600 font-bold">Return Home</button>
    </div>
  );

  const handleDownload = async () => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${image.slug}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download image', err);
      window.open(image.url, '_blank');
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Gallery
      </button>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="bg-gray-100 flex items-center justify-center p-4 lg:p-8 min-h-[400px]">
            <img 
              src={image.url} 
              alt={image.title} 
              className="max-w-full max-h-[70vh] rounded-xl shadow-lg object-contain"
            />
          </div>

          <div className="p-8 lg:p-12 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {image.category}
                </span>
                <span className="text-xs text-gray-400">
                  Uploaded {new Date(image.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                {image.title}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                {image.description}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {image.keywords.map((tag, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg text-sm font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <button 
                onClick={handleDownload}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download High Quality
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">
                License: Free for personal and commercial use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetail;
