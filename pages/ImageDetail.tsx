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
      text: `Check out this amazing photo by ${image.author || 'Anonymous'} on Picghor`,
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
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium"
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {image.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    Uploaded {new Date(image.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                   </svg>
                   {image.downloadCount || 0} Downloads
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                {image.title}
              </h1>
              <p className="text-indigo-600 font-semibold text-lg italic">
                By {image.author || 'Anonymous'}
              </p>
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

            <div className="pt-8 border-t border-gray-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={handleDownload}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download HD
                </button>
                <div className="flex gap-4">
                  <button 
                    onClick={handleShare}
                    className="flex-grow bg-white border-2 border-indigo-100 hover:border-indigo-600 hover:bg-indigo-50 text-indigo-600 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                  <button 
                    onClick={handleCopyLink}
                    className="w-16 bg-white border-2 border-indigo-100 hover:border-indigo-600 hover:bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center transition-all relative"
                    title="Copy Link"
                  >
                    {copied ? (
                      <span className="text-[10px] font-bold text-indigo-700 animate-bounce">Copied!</span>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedImages.length > 0 && (
        <section className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Related Assets</h2>
            <div className="h-px flex-grow mx-8 bg-gray-100 hidden md:block"></div>
            <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Recommended for you</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {relatedImages.map((rel) => (
              <div 
                key={rel.id}
                onClick={() => navigateToRelated(rel.slug)}
                className="group cursor-pointer space-y-3"
              >
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 relative shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
                  <img 
                    src={rel.thumbnailUrl || rel.url} 
                    alt={rel.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors" />
                  <div className="absolute bottom-2 left-2">
                     <span className="text-[8px] font-bold uppercase tracking-tighter bg-white/90 backdrop-blur-sm text-indigo-600 px-2 py-0.5 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        {rel.category}
                     </span>
                  </div>
                </div>
                <div className="px-1">
                  <h4 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{rel.title}</h4>
                  <p className="text-[10px] text-gray-400 font-medium">By {rel.author}</p>
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