import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Builder() {
  const router = useRouter();

  useEffect(() => {
    // Redirect ke halaman utama setelah 2 detik
    const timer = setTimeout(() => {
      router.push('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">C4</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Claude 4 Codespace</h1>
          <p className="text-slate-400">Redirecting to main workspace...</p>
        </div>
        
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        <a 
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Go to Main Workspace
        </a>
      </div>
    </div>
  );
}
