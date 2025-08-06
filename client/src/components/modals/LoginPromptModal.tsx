import { Button } from '@/components/ui/button';
import { Lock, User, Mail, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

const LoginPromptModal = ({ 
  isOpen, 
  onClose, 
  title = "Login Required",
  description = "Please log in to access this feature. Create an account or sign in to continue."
}: LoginPromptModalProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    onClose();
    navigate('/resume/login', { 
      state: { from: location.pathname }
    });
  };

  const handleSignup = () => {
    onClose();
    navigate('/resume/signup', { 
      state: { from: location.pathname }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {title}
          </h2>
          <p className="text-gray-600 mb-6">
            {description}
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            
            <Button 
              onClick={handleSignup}
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              <Mail className="w-4 h-4 mr-2" />
              Create Account
            </Button>
            
            <Button 
              onClick={onClose}
              variant="ghost"
              className="w-full text-gray-500 hover:text-gray-700"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal; 