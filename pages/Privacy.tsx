import React from 'react';

interface PrivacyProps {
  onNavigateHome: () => void;
}

const Privacy: React.FC<PrivacyProps> = ({ onNavigateHome }) => {
  return (
    <div className="max-w-3xl mx-auto py-12 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 space-y-10">
        <header className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-400 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
        </header>

        <section className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">1. Data Collection</h2>
            <p className="text-gray-600 leading-relaxed">
              Picghor is designed to be a "privacy-first" repository. For general visitors, we do not track your IP address or use cookies for profiling. We only collect aggregate download counts to help curators understand which assets are most valuable.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">2. AI Processing</h2>
            <p className="text-gray-600 leading-relaxed">
              During the upload process, administrators submit images to the Gemini Vision API. This processing is used strictly for metadata generation (titles, keywords, descriptions). The data processed by the AI is governed by Google’s Enterprise Privacy standards.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">3. Storage & Infrastructure</h2>
            <p className="text-gray-600 leading-relaxed">
              Visual assets are stored on ImgBB servers, while metadata is managed via Google Firestore. Your interaction with these third-party providers is subject to their respective privacy policies. We do not sell any data to advertisers.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">4. Local Storage</h2>
            <p className="text-gray-600 leading-relaxed">
              We use the browser's Local Storage to save administrator session tokens and preferences (like the last used author name). This data stays on your device and is never sent to our servers except for authentication purposes.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">5. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              For any questions regarding your data or to request the removal of an asset you own the rights to, please contact our administrative team via the internal portal.
            </p>
          </div>
        </section>

        <div className="pt-8 border-t border-gray-100">
           <button 
             onClick={onNavigateHome}
             className="text-indigo-600 font-bold hover:underline flex items-center gap-2"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
             </svg>
             Return to Gallery
           </button>
        </div>
      </div>
    </div>
  );
};

export default Privacy;