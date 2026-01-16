import React, { useState, useRef, useEffect } from 'react';
import { ADMIN_PASSWORD, CATEGORIES, DEFAULT_IMGBB_API_KEY } from '../constants';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { ImageMetadata } from '../types';

interface AdminProps {
  isAuthenticated: boolean;
  onAuthenticate: (success: boolean) => void;
}

type AdminTab = 'upload' | 'library';

const Admin: React.FC<AdminProps> = ({ isAuthenticated, onAuthenticate }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('upload');
  const [password, setPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    keywords: '',
    slug: '',
    author: localStorage.getItem('last_author') || '',
    imgbbApiKey: localStorage.getItem('imgbb_key') || DEFAULT_IMGBB_API_KEY
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadLibrary();
    }
  }, [isAuthenticated]);

  const loadLibrary = async () => {
    setLoadingLibrary(true);
    const data = await storageService.getAll();
    setImages(data);
    setLoadingLibrary(false);
  };

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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this asset from the repository?')) return;
    try {
      await storageService.delete(id);
      setImages(prev => prev.filter(img => img.id !== id));
    } catch (err) {
      alert('Failed to delete image');
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
    localStorage.setItem('last_author', formData.author);
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
          author: formData.author || 'Anonymous',
          createdAt: Date.now(),
          downloadCount: 0
        };

        await storageService.save(metadata);
        alert('Image published successfully!');
        
        setFormData(prev => ({ ...prev, title: '', description: '', keywords: '', slug: '' }));
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        loadLibrary();
      } else {
        throw new Error(data.error.message);
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const totalDownloads = images.reduce((acc, img) => acc + (img.downloadCount || 0), 0);

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
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Picghor Dashboard</h1>
          <p className="text-gray-500">Manage your assets and repository performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
             <button 
               onClick={() => setActiveTab('upload')}
               className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'upload' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
             >
               Upload Center
             </button>
             <button 
               onClick={() => setActiveTab('library')}
               className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'library' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
             >
               Asset Library
             </button>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('snapvault_admin_token'); window.location.reload(); }}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Assets</h4>
          <p className="text-3xl font-extrabold text-gray-900">{images.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Downloads</h4>
          <p className="text-3xl font-extrabold text-indigo-600">{totalDownloads}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">AI Status</h4>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2.5 h-2.5 rounded-full ${isAnalyzing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
            <span className="text-sm font-bold text-gray-700">{isAnalyzing ? 'Analyzing...' : 'Ready'}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Cloud Engine</h4>
          <p className="text-sm font-bold text-gray-700 mt-1">ImgBB + Gemini 3</p>
        </div>
      </div>

      {activeTab === 'upload' ? (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleUpload} className="divide-y divide-gray-100">
            <div className="p-8 space-y-4">
               <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider">Step 1: Select Visual Asset</label>
               <div className="flex flex-col md:flex-row gap-8">
                 <div className="w-full md:w-64 aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                   {previewUrl ? (
                     <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                   ) : (
                     <div className="text-center p-4">
                        <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Select Image</span>
                     </div>
                   )}
                   <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    accept="image/*"
                   />
                   <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors pointer-events-none"></div>
                 </div>
                 
                 <div className="flex-grow space-y-4">
                   <div className={`p-6 rounded-2xl transition-all ${isAnalyzing ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-50 text-gray-600'}`}>
                     <div className="flex items-center gap-3 mb-2">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                       </svg>
                       <p className="font-bold text-sm uppercase tracking-widest">Gemini Intelligent Analysis</p>
                     </div>
                     <p className="text-sm opacity-80 leading-relaxed">
                       Once you select an image, our AI will automatically generate SEO titles, descriptive slugs, and relevant keywords to save you time.
                     </p>
                     {isAnalyzing && (
                       <div className="flex items-center gap-3 mt-4">
                         <div className="flex gap-1">
                           <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                           <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                           <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                         </div>
                         <span className="text-xs font-bold uppercase tracking-widest">Processing Image Metadata...</span>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
            </div>

            <div className="p-8">
              <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Step 2: Refine Metadata</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Image Title</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Author / Artist</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Custom Slug</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-xs"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  />
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
                  <textarea
                    required
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Keywords (Comma Separated)</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.keywords}
                    onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="w-full md:w-1/2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Target Cloud Service Provider</label>
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                     <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                       <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V10H9v3H5.5z" />
                     </svg>
                   </div>
                   <span className="text-xs font-bold text-gray-600">ImgBB Secure Storage</span>
                </div>
              </div>
              <button 
                disabled={isUploading || isAnalyzing}
                className={`w-full md:w-auto px-12 py-4 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                  isUploading || isAnalyzing ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                }`}
              >
                {isUploading && (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isUploading ? 'Synchronizing...' : 'Publish to Picghor'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Asset Inventory</h3>
            <button 
              onClick={loadLibrary}
              className="text-indigo-600 text-xs font-bold hover:underline"
            >
              Refresh Library
            </button>
          </div>
          
          {loadingLibrary ? (
            <div className="p-20 text-center">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
               <p className="text-gray-400 text-sm">Loading inventory...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Asset</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Stats</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {images.map((img) => (
                    <tr key={img.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <img src={img.thumbnailUrl} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                          <div>
                            <p className="font-bold text-gray-900 text-sm line-clamp-1">{img.title}</p>
                            <p className="text-[10px] text-gray-400 font-mono uppercase">{img.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-wider">
                           {img.category}
                         </span>
                         <p className="text-[10px] text-gray-500 mt-1">By {img.author}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-600">
                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                           </svg>
                           <span className="text-xs font-bold">{img.downloadCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-400 font-medium">{new Date(img.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-4 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a 
                              href={`#p/${img.slug}`} 
                              target="_blank" 
                              className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                              title="View"
                            >
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                               </svg>
                            </a>
                            <button 
                              onClick={() => handleDelete(img.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                  {images.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-gray-400 text-sm italic">
                        No assets found in the repository.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;