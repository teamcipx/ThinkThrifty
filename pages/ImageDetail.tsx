import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { ImageMetadata } from '../types';

interface ImageDetailProps {
  id: string;
  onBack: () => void;
}

const ImageDetail: React.FC<ImageDetailProps> = ({ id, onBack }) => {
  const [image, setImage] = useState<ImageMetadata | null>(null);
  const [relatedImages, setRelatedImages] = useState<ImageMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      const data = await storageService.getById(id);
      if (data) {
        setImage(data);
        document.title = `${data.title} | Picghor`;
        
        // Load related images
        const related = await storageService.getRelated(data);
        setRelatedImages(related);
      }
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    loadImage();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="w-12 h-12 border-4 border-zinc-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!image) return (
    <div className="flex flex-col items-center justify-center py-40 gap-6">
      <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      </div>
      <p className="text-zinc-500 font-medium">Asset not found in repository.</p>
      <button onClick={onBack} className="text-indigo-600 font-black tracking-widest uppercase text-xs hover:underline">Return to Gallery</button>
    </div>
  );

  const getFullUrl = () => `${window.location.origin}${window.location.pathname}#p/${image.slug}`;

  const handleDownload = async () => {
    try {
      await storageService.incrementDownloadCount(image.id);
      setImage(prev => prev ? { ...prev, downloadCount: (prev.downloadCount || 0) + 1 } : null);

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

  const handleCopyLink = () => {
    const url = getFullUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: image.title,
      text: `Picghor Asset: ${image.title}`,
      url: getFullUrl()
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const navigateToRelated = (slug: string) => {
    window.location.hash = `p/${slug}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-700 pb-32 pt-8">
      <button 
        onClick={onBack}
        className="group flex items-center gap-3 text-zinc-400 hover:text-zinc-900 transition-all font-bold uppercase tracking-widest text-[10px]"
      >
        <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </div>
        Back to Exploration
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Main Image Stage */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-100 flex items-center justify-center p-4 min-h-[500px] relative group">
            <img 
              src={image.url} 
              alt={image.title} 
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain transition-transform duration-700 group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-10">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">
                  {image.category}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  REF: {image.slug.substring(0, 8)}
                </span>
              </div>
              <h1 className="text-4xl font-black text-zinc-900 leading-tight tracking-tighter">
                {image.title}
              </h1>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 font-black text-sm uppercase">
                   {image.author ? image.author.charAt(0) : 'A'}
                </div>
                <div>
                  <p className="text-zinc-900 font-bold text-sm tracking-tight">{image.author || 'Anonymous Artist'}</p>
                  <p className="text-zinc-400 text-xs">Curated {new Date(image.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <p className="text-zinc-500 text-lg leading-relaxed font-medium">
              {image.description}
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleDownload}
                className="w-full bg-zinc-900 hover:bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-4 active:scale-[0.98] uppercase tracking-[0.15em] text-xs"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Masterfile
              </button>
              
              <div className="flex gap-4">
                <button 
                  onClick={handleShare}
                  className="flex-grow bg-white border border-zinc-200 hover:border-zinc-900 text-zinc-900 font-bold py-5 rounded-[1.5rem] transition-all flex items-center justify-center gap-3 active:scale-[0.98] uppercase tracking-[0.1em] text-xs"
                >
                  Share Asset
                </button>
                <button 
                  onClick={handleCopyLink}
                  className={`w-16 flex items-center justify-center rounded-[1.5rem] border transition-all ${copied ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-900'}`}
                  title="Copy Link"
                >
                  {copied ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.3em]">AI Metadata Tags</h3>
              <div className="flex flex-wrap gap-2">
                {image.keywords.map((tag, idx) => (
                  <span key={idx} className="bg-zinc-50 text-zinc-500 border border-zinc-100 px-4 py-2 rounded-xl text-xs font-bold tracking-tight hover:bg-zinc-100 transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
               <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Repository Stats</span>
                 <span className="text-xs font-black text-indigo-600">{image.downloadCount || 0} USE CASES</span>
               </div>
               <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                 <div className="bg-indigo-600 h-full w-[45%]" />
               </div>
            </div>
          </div>
        </div>
      </div>

      {relatedImages.length > 0 && (
        <section className="space-y-10 animate-in slide-in-from-bottom-12 duration-1000">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-zinc-900 tracking-tighter">Related Discoveries</h2>
            <div className="h-px flex-grow mx-8 bg-zinc-100 hidden md:block"></div>
            <button 
              onClick={onBack}
              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
            >
              See All Assets
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {relatedImages.map((rel) => (
              <div 
                key={rel.id}
                onClick={() => navigateToRelated(rel.slug)}
                className="group cursor-pointer space-y-4"
              >
                <div className="aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-zinc-100 relative shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-indigo-100/50 group-hover:-translate-y-2">
                  <img 
                    src={rel.thumbnailUrl || rel.url} 
                    alt={rel.title}
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/20 transition-colors" />
                </div>
                <div className="px-1">
                  <h4 className="text-sm font-black text-zinc-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{rel.title}</h4>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">By {rel.author}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ImageDetail;