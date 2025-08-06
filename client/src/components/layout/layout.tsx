import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { tokenUtils } from '@/lib/utils';
import LoginPromptModal from '@/components/modals/LoginPromptModal';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

const Layout = ({ children, showHeader = true, showFooter = true }: LayoutProps) => {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check if user is logged in
  useEffect(() => {
    const currentUser = tokenUtils.getUser();
    setUser(currentUser);
  }, []);

  // Scroll to top when layout mounts (for protected routes)
  useEffect(() => {
    // Immediately scroll to top without animation
    window.scrollTo(0, 0);
    // Also set scroll behavior to prevent any smooth scrolling
    document.documentElement.style.scrollBehavior = 'auto';
    // Reset after a short delay
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = '';
    }, 100);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header onShowLogin={() => setShowLoginPrompt(true)} user={user} />}
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
      
      {/* Login Prompt Modal - positioned relative to entire layout */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  );
};

export default Layout;
