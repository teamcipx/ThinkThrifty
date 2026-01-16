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
    if (!window.confirm('Delete this asset? This cannot be undone.')) return;
    try {
      await storageService.delete(id);
      setImages(prev => prev.filter(img => img.id !== id));
    } catch (err) {
      alert('Failed to delete asset');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.[0]) {
      alert('Please select an image');
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
      <div className="max-w-md mx-auto py-32 animate-in fade-in zoom-in duration-700 px-6">
        <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-zinc-100">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-6">P</div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tighter">System Access</h1>
            <p className="text-zinc-400 font-medium text-sm mt-2">Internal Curator Authentication</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-6 py-4 rounded-2xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all text-center text-lg tracking-[0.3em] font-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            <button className="w-full bg-zinc-900 hover:bg-indigo-600 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-zinc-200 active:scale-[0.98] uppercase tracking-[0.2em] text-xs">
              Open Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in slide-in-from-bottom-6 duration-700 py-10 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">Studio Management</h1>
          <p className="text-zinc-400 font-medium">Picghor Repository Control Center</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200">
             <button 
               onClick={() => setActiveTab('upload')}
               className={`px-8 py-2.5 rounded-xl text-xs font-black tracking-[0.1em] uppercase transition-all ${activeTab === 'upload' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
             >
               Ingest
             </button>
             <button 
               onClick={() => setActiveTab('library')}
               className={`px-8 py-2.5 rounded-xl text-xs font-black tracking-[0.1em] uppercase transition-all ${activeTab === 'library' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
             >
               Inventory
             </button>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('snapvault_admin_token'); window.location.reload(); }}
            className="w-12 h-12 rounded-2xl border border-zinc-200 flex items-center justify-center text-zinc-300 hover:text-red-500 hover:border-red-100 transition-all"
            title="Secure Logout"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Assets', val: images.length, color: 'text-zinc-900' },
          { label: 'Aggregate Downloads', val: totalDownloads, color: 'text-indigo-600' },
          { label: 'AI Integrity', val: '100%', color: 'text-zinc-900' },
          { label: 'Active Service', val: 'ImgBB/G3', color: 'text-zinc-900' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm space-y-2">
            <h4 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.25em]">{stat.label}</h4>
            <p className={`text-4xl font-black tracking-tighter ${stat.color}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      {activeTab === 'upload' ? (
        <div className="bg-white rounded-[3rem] shadow-2xl border border-zinc-100 overflow-hidden animate-in fade-in duration-500">
          <form onSubmit={handleUpload} className="divide-y divide-zinc-50">
            <div className="p-12 space-y-8">
               <div className="flex flex-col md:flex-row gap-12">
                 <div className="w-full md:w-80 aspect-square bg-zinc-50 rounded-[2.5rem] border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden relative group transition-all hover:border-indigo-400">
                   {previewUrl ? (
                     <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                   ) : (
                     <div className="text-center p-8 space-y-4">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-zinc-100 mx-auto flex items-center justify-center text-zinc-300 group-hover:text-indigo-500 transition-colors">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Select Source File</p>
                     </div>
                   )}
                   <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    accept="image/*"
                   />
                 </div>
                 
                 <div className="flex-grow space-y-6 flex flex-col justify-center">
                   <div className={`p-8 rounded-[2rem] transition-all border ${isAnalyzing ? 'bg-indigo-50 border-indigo-100' : 'bg-zinc-50 border-zinc-100'}`}>
                     <div className="flex items-center gap-4 mb-4">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAnalyzing ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-white'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                       </div>
                       <h3 className="font-black text-zinc-900 text-sm tracking-widest uppercase">Gemini Auto-Curation</h3>
                     </div>
                     <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                       Our vision model will automatically generate professional-grade metadata, optimizing your asset for global discoverability.
                     </p>
                     {isAnalyzing && (
                       <div className="flex items-center gap-4 mt-6">
                         <div className="flex gap-1.5">
                           <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                           <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                           <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                         </div>
                         <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Cognitive Processing...</span>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
            </div>

            <div className="p-12 bg-zinc-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {[
                  { label: 'Asset Title', id: 'title' },
                  { label: 'Creator Signature', id: 'author' },
                  { label: 'Category Tag', id: 'category', type: 'select' },
                  { label: 'SEO Path (Slug)', id: 'slug' }
                ].map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{field.label}</label>
                    {field.type === 'select' ? (
                      <select
                        className="w-full px-6 py-4 rounded-2xl border border-zinc-100 bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all appearance-none font-bold text-sm"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (
                      <input
                        required
                        type="text"
                        className="w-full px-6 py-4 rounded-2xl border border-zinc-100 bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all font-bold text-sm"
                        value={formData[field.id as keyof typeof formData]}
                        onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                      />
                    )}
                  </div>
                ))}
                <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Contextual Description</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-6 py-4 rounded-2xl border border-zinc-100 bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all font-medium text-sm"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Keywords Cluster</label>
                  <input
                    required
                    type="text"
                    className="w-full px-6 py-4 rounded-2xl border border-zinc-100 bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all font-medium text-sm"
                    value={formData.keywords}
                    onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                    placeholder="Nature, Minimal, High Quality, etc."
                  />
                </div>
              </div>
            </div>

            <div className="p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-zinc-400 text-xs font-medium max-w-sm">
                By publishing, you agree to make this asset available under the studio's digital licensing agreement.
              </div>
              <button 
                disabled={isUploading || isAnalyzing}
                className={`w-full md:w-auto px-16 py-6 rounded-[1.5rem] font-black text-white shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs ${
                  isUploading || isAnalyzing ? 'bg-zinc-200 cursor-not-allowed' : 'bg-zinc-900 hover:bg-indigo-600 shadow-zinc-200'
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Finalizing Upload...
                  </>
                ) : 'Publish to Repository'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] shadow-2xl border border-zinc-100 overflow-hidden animate-in fade-in duration-500">
          <div className="p-10 border-b border-zinc-50 flex items-center justify-between">
            <h3 className="font-black text-zinc-900 uppercase tracking-[0.2em] text-xs">Repository Inventory</h3>
            <button 
              onClick={loadLibrary}
              className="text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors"
            >
              Refresh View
            </button>
          </div>
          
          {loadingLibrary ? (
            <div className="p-40 text-center space-y-4">
               <div className="w-10 h-10 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin mx-auto"></div>
               <p className="text-zinc-400 text-xs font-black tracking-widest uppercase">Querying Database...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50/50">
                    <th className="px-10 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Master Asset</th>
                    <th className="px-6 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Metadata</th>
                    <th className="px-6 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Engagement</th>
                    <th className="px-10 py-5 text-right text-[10px] font-black text-zinc-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {images.map((img) => (
                    <tr key={img.id} className="hover:bg-zinc-50/30 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-50 shadow-sm">
                            <img src={img.thumbnailUrl} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-black text-zinc-900 text-sm tracking-tight">{img.title}</p>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{img.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                         <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 uppercase tracking-wider">
                           {img.category}
                         </span>
                         <p className="text-[10px] text-zinc-400 font-bold mt-2 uppercase tracking-widest italic opacity-70">{img.author}</p>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-zinc-900">
                           <svg className="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                           <span className="text-sm font-black tracking-tight">{img.downloadCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                         <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                            <button 
                              onClick={() => handleDelete(img.id)}
                              className="w-10 h-10 rounded-xl bg-red-50 text-red-400 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center border border-red-100"
                              title="Expunge Asset"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                  {images.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-40 text-center text-zinc-300 text-sm font-black uppercase tracking-widest italic">
                        Empty Archive.
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