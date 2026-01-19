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
  const [showAdPopup, setShowAdPopup] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [canDownload, setCanDownload] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      const data = await storageService.getById(id);
      if (data) {
        setImage(data);
        document.title = `${data.title} | Picghor`;
        const related = await storageService.getRelated(data);
        setRelatedImages(related);
      }
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    loadImage();
  }, [id]);

  // ডাউনলোড পপআপের জন্য স্ক্রিপ্ট ও টাইমার
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showAdPopup) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanDownload(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showAdPopup]);

  if (loading) return <div className="flex justify-center py-40 animate-pulse text-zinc-300 font-bold tracking-widest uppercase text-xs">Loading Asset...</div>;
  if (!image) return <div className="text-center py-40">Asset not found.</div>;

  const handleFinalDownload = async () => {
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
      setShowAdPopup(false);
    } catch (err) {
      window.open(image.url, '_blank');
      setShowAdPopup(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-32 pt-8 px-4">
      
      {/* Download Modal */}
      {showAdPopup && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white/90 backdrop-blur-xl p-4">
          <div className="bg-zinc-900 text-white rounded-[3rem] max-w-sm w-full p-10 text-center space-y-8 shadow-2xl">
             <div className="space-y-2">
                <h2 className="text-xl font-black uppercase tracking-tighter">Secure Link</h2>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Verifying Request...</p>
             </div>
             <div className="flex justify-center">
                {!canDownload ? (
                  <div className="w-20 h-20 rounded-full border-2 border-zinc-800 border-t-indigo-500 flex items-center justify-center text-xl font-black animate-spin">
                    {countdown}
                  </div>
                ) : (
                  <button onClick={handleFinalDownload} className="w-full bg-indigo-600 py-5 rounded-2xl font-black uppercase text-xs tracking-widest animate-bounce">Get File</button>
                )}
             </div>
             <button onClick={() => setShowAdPopup(false)} className="text-zinc-600 text-[10px] font-bold uppercase">Cancel</button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
           <button onClick={onBack} className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest hover:text-black transition-colors flex items-center gap-2">
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/></svg>
             Collection
           </button>
           
           <div className="bg-zinc-100 rounded-[2rem] overflow-hidden flex items-center justify-center p-4 min-h-[400px]">
              <img src={image.url} alt={image.title} className="max-w-full max-h-[80vh] rounded-xl shadow-lg object-contain" />
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-zinc-900 tracking-tighter">{image.title}</h1>
            <p className="text-zinc-500 text-sm leading-relaxed">{image.description}</p>
            <button onClick={() => setShowAdPopup(true)} className="w-full bg-zinc-900 text-white font-black py-5 rounded-2xl uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100">
              Download Asset
            </button>
          </div>

          {/* --- Sidebar Banner Ad --- */}
          <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-4 flex flex-col items-center justify-center min-h-[250px] relative">
            <span className="absolute top-2 left-4 text-[8px] font-bold text-zinc-300 uppercase tracking-widest">Sponsored</span>
            {/* Banner Script 1 Container */}
            <div id="container-9bdaa56042780cf3290ef9004bb9bf72" className="w-full"></div>
            <script async src="https://pl28514147.effectivegatecpm.com/9bdaa56042780cf3290ef9004bb9bf72/invoke.js"></script>
          </div>
        </div>
      </div>

      {/* Related Feed with Native Banner Ad */}
      {relatedImages.length > 0 && (
        <section className="space-y-8">
          <h2 className="text-lg font-black uppercase tracking-widest text-zinc-400">Related Exploration</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            
            {/* Displaying first 4 related images */}
            {relatedImages.slice(0, 4).map((rel) => (
              <div key={rel.id} onClick={() => window.location.hash = `p/${rel.slug}`} className="group cursor-pointer space-y-3">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-100">
                  <img src={rel.thumbnailUrl || rel.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <p className="text-xs font-bold text-zinc-900 line-clamp-1">{rel.title}</p>
              </div>
            ))}

            {/* --- Feed / Grid Banner Ad --- */}
            <div className="aspect-[4/5] bg-zinc-50 rounded-3xl border border-zinc-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
               <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Ad Recommendation</span>
               <div className="w-full h-full flex items-center justify-center text-center">
                  {/* Banner Ad Script 2 */}
                  <script src="https://pl28514144.effectivegatecpm.com/6b/2d/ea/6b2dea7b79eb338e53962e31b8e635f8.js"></script>
                  <p className="text-[10px] text-zinc-400 font-medium">Continue to support us by viewing ads</p>
               </div>
            </div>

          </div>
        </section>
      )}
    </div>
  );
};

export default ImageDetail;
