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

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      const data = await storageService.getById(id);
      if (data) {
        setImage(data);
        const related = await storageService.getRelated(data);
        setRelatedImages(related);
      }
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    loadImage();
  }, [id]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showAdPopup && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [showAdPopup, countdown]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!image) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnFB = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 font-sans selection:bg-indigo-100">
      
      {/* ডাউনলোড পপআপ (Aesthetic Glassmorphism) */}
      {showAdPopup && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white/60 backdrop-blur-2xl">
          <div className="bg-white border border-zinc-100 rounded-[3rem] p-12 max-w-md w-full text-center shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)]">
            <h2 className="text-2xl font-black text-zinc-900 mb-2">ফাইলটি প্রস্তুত হচ্ছে</h2>
            <p className="text-zinc-400 text-sm mb-8">অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন...</p>
            
            <div className="relative inline-flex items-center justify-center mb-8">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="45" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-zinc-100" />
                <circle cx="48" cy="48" r="45" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-indigo-600 transition-all duration-1000" strokeDasharray={282} strokeDashoffset={282 - (282 * (5-countdown)) / 5} />
              </svg>
              <span className="absolute text-xl font-black">{countdown}</span>
            </div>

            {countdown === 0 ? (
              <button onClick={() => window.open(image.url)} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-bold hover:bg-black transition-all shadow-lg shadow-indigo-200">এখনই ডাউনলোড করুন</button>
            ) : (
              <div className="w-full bg-zinc-50 text-zinc-400 py-5 rounded-3xl font-bold">লিংক জেনারেট হচ্ছে...</div>
            )}
            <button onClick={() => setShowAdPopup(false)} className="mt-6 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-red-500">বাতিল করুন</button>
          </div>
        </div>
      )}

      {/* ব্যাক বাটন */}
      <button onClick={onBack} className="mb-10 flex items-center gap-3 text-zinc-400 hover:text-black transition-all group">
        <div className="w-10 h-10 rounded-full border border-zinc-100 flex items-center justify-center group-hover:bg-zinc-50">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">গ্যালারিতে ফিরে যান</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* মেইন ইমেজ সেকশন */}
        <div className="lg:col-span-8">
          <div className="bg-[#F9F9FB] rounded-[3.5rem] p-6 md:p-12 flex items-center justify-center overflow-hidden shadow-inner">
            <img src={image.url} alt={image.title} className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:scale-[1.02] transition-transform duration-700" />
          </div>
          
          {/* ইমেজ ফিড অ্যাড (নিচে) */}
          <div className="mt-12 p-8 bg-zinc-50 rounded-[2.5rem] border border-dashed border-zinc-200 text-center">
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Sponsored Content</p>
            <div id="container-9bdaa56042780cf3290ef9004bb9bf72"></div>
            <script async src="https://pl28514147.effectivegatecpm.com/9bdaa56042780cf3290ef9004bb9bf72/invoke.js"></script>
          </div>
        </div>

        {/* সাইডবার সেকশন */}
        <div className="lg:col-span-4 space-y-12">
          <div className="space-y-6">
            <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
              {image.category || 'Premium Asset'}
            </div>
            <h1 className="text-4xl font-black text-zinc-900 leading-[1.1] tracking-tight">
              {image.title}
            </h1>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed">
              {image.description || 'এই ছবিটির কোনো বর্ণনা দেওয়া হয়নি। এটি পিকঘোর লাইব্রেরির একটি প্রিমিয়াম সম্পদ।'}
            </p>
          </div>

          {/* অ্যাকশন বাটন */}
          <div className="space-y-4">
            <button onClick={() => setShowAdPopup(true)} className="w-full bg-zinc-900 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl shadow-zinc-200">
              ফ্রি ডাউনলোড করুন
            </button>
            
            <div className="grid grid-cols-2 gap-4">
              <button onClick={shareOnFB} className="flex items-center justify-center gap-2 py-4 bg-white border border-zinc-100 rounded-2xl hover:border-indigo-600 transition-all">
                <span className="text-xs font-bold text-zinc-900">ফেসবুক শেয়ার</span>
              </button>
              <button onClick={handleCopyLink} className={`flex items-center justify-center gap-2 py-4 border rounded-2xl transition-all ${copied ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-zinc-100 text-zinc-900'}`}>
                <span className="text-xs font-bold">{copied ? 'লিংক কপি হয়েছে' : 'লিংক কপি করুন'}</span>
              </button>
            </div>
          </div>

          {/* ইনফো কার্ড */}
          <div className="p-8 bg-zinc-50 rounded-[2.5rem] space-y-4">
             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <span>আর্টিস্ট</span>
                <span className="text-zinc-900">{image.author || 'Anonymous'}</span>
             </div>
             <div className="h-px bg-zinc-200/50 w-full" />
             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <span>ডাউনলোড</span>
                <span className="text-indigo-600">{image.downloadCount || 0} বার</span>
             </div>
          </div>

          {/* সাইডবার ব্যানার অ্যাড */}
          <div className="rounded-[2.5rem] overflow-hidden min-h-[300px] bg-zinc-100 flex items-center justify-center relative">
             <span className="absolute top-4 left-4 text-[8px] font-bold text-zinc-300 uppercase">বিজ্ঞাপন</span>
             <script src="https://pl28514144.effectivegatecpm.com/6b/2d/ea/6b2dea7b79eb338e53962e31b8e635f8.js"></script>
          </div>
        </div>
      </div>

      {/* রিলেটেড সেকশন */}
      {relatedImages.length > 0 && (
        <section className="mt-32 space-y-12">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-black tracking-tighter">আরও কিছু দারুণ ছবি</h2>
            <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 border-b-2 border-indigo-600 pb-1">সবগুলো দেখুন</button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {relatedImages.map((rel) => (
              <div key={rel.id} onClick={() => window.location.hash = `p/${rel.slug}`} className="group cursor-pointer">
                <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-zinc-100 mb-4 shadow-sm group-hover:shadow-2xl group-hover:shadow-indigo-100 transition-all duration-500">
                  <img src={rel.thumbnailUrl || rel.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{rel.title}</h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">BY {rel.author}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ImageDetail;
