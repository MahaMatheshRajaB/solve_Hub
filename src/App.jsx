import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

import TopBar from './components/layout/TopBar';
import LeftSidebar from './components/layout/LeftSidebar';
import RightSidebar from './components/layout/RightSidebar';
import MobileBottomNav from './components/layout/MobileBottomNav';
import FeedContainer from './components/feed/FeedContainer';
import SolveAiChat from './components/ai/SolveAiChat';
import AuthModal from './components/auth/AuthModal';

export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Set dark theme class on document element
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = '#050505';
  }, []);

  return (
    <AuthProvider>
      <div className="bg-[#050505] min-h-screen text-[#f2f2f2] font-sans">
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#131314',
              color: '#f2f2f2',
              border: '1px solid #2a2a2d',
              borderRadius: '12px',
              fontSize: '13px',
            },
            success: {
              iconTheme: {
                primary: '#f4ef5a',
                secondary: '#000000',
              },
            },
          }}
        />

        {/* Outer wrapper matching .wrap from screenshot */}
        <div className="max-w-[1290px] mx-auto bg-[#0a0a0b] min-h-screen relative shadow-2xl pb-16 lg:pb-6">
          {/* Top Bar matching .bar */}
          <TopBar onOpenAuth={() => setIsAuthModalOpen(true)} />

          {/* 3-Column Grid matching .grid: 240px minmax(0,1fr) 330px */}
          <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_330px] gap-4 px-3 md:px-4 pt-4 pb-12">
            {/* Left Sidebar (Hidden on mobile/tablet) */}
            <div className="hidden lg:block">
              <LeftSidebar />
            </div>

            {/* Center Feed */}
            <main className="min-w-0">
              <FeedContainer />
            </main>

            {/* Right Sidebar (Hidden on mobile/tablet) */}
            <div className="hidden lg:block">
              <RightSidebar />
            </div>
          </div>
        </div>

        {/* Solve AI Chat Drawer / Widget */}
        <SolveAiChat />

        {/* Mobile Bottom Navigation (Shown only on < lg) */}
        <MobileBottomNav />

        {/* Optional Account / Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    </AuthProvider>
  );
}
