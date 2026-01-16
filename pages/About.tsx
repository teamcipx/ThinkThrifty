import React from 'react';

interface AboutProps {
  onNavigateHome: () => void;
}

const About: React.FC<AboutProps> = ({ onNavigateHome }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 animate-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-12">
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Visual Discovery <span className="text-indigo-600">Reimagined</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Picghor is a high-performance image repository built for creators who value speed, aesthetics, and intelligence.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Curation</h3>
            <p className="text-gray-500 leading-relaxed">
              Every image uploaded to Picghor is analyzed by Gemini AI to generate precise metadata, SEO keywords, and category tagging, ensuring our library is easy to search.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Freedom to Create</h3>
            <p className="text-gray-500 leading-relaxed">
              We advocate for the CC0 license. Our platform allows creators to download and use visuals for personal or commercial projects without worrying about complex licensing.
            </p>
          </div>
        </div>

        <section className="bg-indigo-600 rounded-[2.5rem] p-12 text-center text-white space-y-6 shadow-xl shadow-indigo-100">
          <h2 className="text-3xl font-bold">Ready to explore?</h2>
          <p className="text-indigo-100 text-lg opacity-80">
            Our library is constantly growing with new AI-curated assets every day.
          </p>
          <button 
            onClick={onNavigateHome}
            className="bg-white text-indigo-600 font-bold px-10 py-4 rounded-2xl hover:bg-gray-50 transition-all active:scale-95 inline-block"
          >
            Go to Gallery
          </button>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">Our Story</h3>
          <p className="text-gray-600 leading-relaxed">
            Picghor started as a minimalist experiment in cloud architecture. We wanted to build a repository that felt light as air but powerful enough to handle professional curation. By combining Firebase's real-time capabilities with ImgBB's global CDN and Gemini's vision intelligence, we've created a home for visuals that serves both administrators and visitors seamlessly.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;