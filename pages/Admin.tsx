
import React, { useState, useRef, useEffect } from 'react';
import { ADMIN_PASSWORD, CATEGORIES, DEFAULT_IMGBB_API_KEY } from '../constants';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { ImageMetadata } from '../types';

interface AdminProps {
  isAuthenticated: boolean;
  onAuthenticate: (success: boolean) => void;
}

const Admin: React.FC<AdminProps> = ({ isAuthenticated, onAuthenticate }) => {
  const [password, setPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [totalAssets, setTotalAssets] = useState(0);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    keywords: '',
    slug: '',
    imgbbApiKey: localStorage.getItem('imgbb_key') || DEFAULT_IMGBB_API_KEY
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      storageService.getAll().then(data => setTotalAssets(data.length));
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onAuthenticate(true);
    } else {
      alert('Invalid Password');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreviewUrl(base64);
      autoAnalyze(base64);
    };
    reader.readAsDataURL(file);
  };

  const autoAnalyze = async (base64: string) => {
    setIsAnalyzing(true);
    try {
      const base64Content = base64.split(',')[1];
      const result = await geminiService.analyzeImage(base64Content);
      setFormData(prev => ({
        ...prev,
        title: result.title,
        description: result.description,
        keywords: result.keywords.join(', '),
        slug: result.suggestedSlug.toLowerCase().replace(/ /g, '-')
      }));
    } catch (err) {
      console.error("AI Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.[0]) {
      alert('Please select an image first');
      return;
    }
    
    const apiKeyToUse = formData.imgbbApiKey.trim() || DEFAULT_IMGBB_API_KEY;

    localStorage.setItem('imgbb_key', apiKeyToUse);
    setIsUploading(true);

    try {
      const file = fileInputRef.current.files[0];
      const body = new FormData();
      body.append('image', file);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKeyToUse}`, {
        method: 'POST',
        body: body
      });

      const data = await response.json();
      
      if (data.success) {
        const metadata: Omit<ImageMetadata, 'id'> = {
          url: data.data.url,
          thumbnailUrl: data.data.thumb.url,
          deleteUrl: data.data.delete_url,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          keywords: formData.keywords.split(',').map(k => k.trim()),
          slug: formData.slug || `img-${Date.now()}`,
          createdAt: Date.now()
        };

        await storageService.save(metadata);
        alert('Image published successfully to Cloud Repository!');
        
        setFormData(prev => ({ ...prev, title: '', description: '', keywords: '', slug: '' }));
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        const updatedImages = await storageService.getAll();
        setTotalAssets(updatedImages.length);
      } else {
        throw new Error(data.error.message);
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
            <p className="text-gray-500 text-sm">Enter password to access dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all">
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Upload Center</h1>
          <p className="text-gray-500">Add new visual assets to your Firebase Repository</p>
        </div>
        <button 
          onClick={() => { localStorage.removeItem('snapvault_admin_token'); window.location.reload(); }}
          className="text-sm font-semibold text-red-500 hover:text-red-600"
        >
          Logout
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <form onSubmit={handleUpload} className="divide-y divide-gray-100">
          <div className="p-8 space-y-4">
             <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider">Select Image</label>
             <div className="flex gap-8">
               <div className="w-48 aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative">
                 {previewUrl ? (
                   <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                 ) : (
                   <div className="text-center p-4">
                      <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs text-gray-400">Add Photo</span>
                   </div>
                 )}
                 <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*"
                 />
               </div>
               
               <div className="flex-grow space-y-4">
                 <div className="p-4 bg-blue-50 rounded-xl text-blue-700 text-sm">
                   <p className="font-bold mb-1">💡 Pro-Tip: AI-Powered Tagging</p>
                   SnapVault uses Gemini Vision to auto-generate metadata.
                   {isAnalyzing && (
                     <div className="flex items-center gap-2 mt-2 font-semibold">
                       <div className="w-3 h-3 bg-blue-600 rounded-full animate-ping" />
                       AI is analyzing your image...
                     </div>
                   )}
                 </div>
               </div>
             </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Image Title</label>
              <input
                required
                type="text"
                placeholder="Ex: Misty Mountains in Autumn"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Category</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-full space-y-2">
              <label className="text-sm font-bold text-gray-700">Description</label>
              <textarea
                required
                rows={3}
                placeholder="Detailed description for SEO and users..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Custom Slug (URL)</label>
              <input
                required
                type="text"
                placeholder="misty-mountains-autumn"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Keywords (Comma separated)</label>
              <input
                required
                type="text"
                placeholder="nature, travel, fog, mountain"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.keywords}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
              />
            </div>
          </div>

          <div className="p-8 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full md:w-1/2 space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ImgBB API Key (Optional Override)</label>
              <input
                type="password"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs outline-none"
                placeholder="Using system default key..."
                value={formData.imgbbApiKey}
                onChange={(e) => setFormData({...formData, imgbbApiKey: e.target.value})}
              />
            </div>
            <button 
              disabled={isUploading || isAnalyzing}
              className={`w-full md:w-auto px-10 py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 ${
                isUploading || isAnalyzing ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {isUploading ? 'Syncing to Cloud...' : 'Publish to Repository'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100">
          <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Cloud Assets</h4>
          <p className="text-3xl font-extrabold text-gray-900">{totalAssets}</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
