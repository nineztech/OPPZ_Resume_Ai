import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { tokenUtils } from '@/lib/utils';
import LoginPromptModal from '@/components/modals/LoginPromptModal';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const ProtectedRoute = ({ children, fallback }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
        
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = tokenUtils.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (!authenticated) {
        setShowLoginPrompt(true);
      }
    };

    checkAuth();
  }, []);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show fallback or children if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show login prompt modal
  return (
    <>
      {fallback && fallback}
      
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </>
  );
};

export default ProtectedRoute; 