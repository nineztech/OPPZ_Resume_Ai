import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X, User, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { tokenUtils } from '@/lib/utils';

interface HeaderProps {
  onShowLogin?: () => void;
  user?: any;
}

const Header = ({ onShowLogin, user: propUser }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Templates', href: '/resume/templates', requiresAuth: true },
    { name: 'Features', href: '/resume/features', requiresAuth: false },
    { name: 'Pricing', href: '#pricing', requiresAuth: false },
    { name: 'Help', href: '#help', requiresAuth: false },
  ];

  const handleNavClick = (item: any) => {
    if (item.requiresAuth && !user) {
      // Show login prompt modal for protected routes
      onShowLogin?.();
      return;
    }
    
    if (item.href.startsWith('/')) {
      navigate(item.href);
    } else {
      // Handle anchor links
      const element = document.querySelector(item.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use prop user if provided, otherwise get from tokenUtils
  useEffect(() => {
    if (propUser) {
      setUser(propUser);
    } else {
      const currentUser = tokenUtils.getUser();
      setUser(currentUser);
    }
  }, [propUser]);

  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-sm border-b border-gray-100' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="ml-2 text-lg font-bold text-gray-900 transition-colors duration-300">OPPZ ResumeAI</span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <motion.div key={item.name}>
                <motion.button
                  onClick={() => handleNavClick(item)}
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-300 font-medium bg-transparent border-none cursor-pointer"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.name}
                </motion.button>
              </motion.div>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
                        <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => {
                if (!user) {
                  onShowLogin?.();
                } else {
                  navigate('/resume/templates');
                }
              }}
            >
              Create CV
            </Button>
            {user ? (
              // Logged in user - show avatar dropdown
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/01.png" alt={user.firstname} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold">
                        {user.firstname?.charAt(0).toUpperCase()}{user.lastname?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.firstname} {user.lastname}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      tokenUtils.clearToken();
                      setUser(null);
                      window.location.href = '/';
                    }}
                    className="text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Not logged in - show sign in button
              <Link to="/resume/login">
                <Button variant="ghost" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">
                  Sign In
                </Button>
              </Link>
            )}
        
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-900 transition-colors duration-300" />
            ) : (
              <Menu className="h-6 w-6 text-gray-900 transition-colors duration-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
              {navItems.map((item) => (
                <div key={item.name}>
                  <button
                    onClick={() => {
                      handleNavClick(item);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 bg-transparent border-none cursor-pointer"
                  >
                    {item.name}
                  </button>
                </div>
              ))}
              <div className="pt-4 space-y-2">
                {user ? (
                  // Logged in user - show user info and logout
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatars/01.png" alt={user.firstname} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold">
                          {user.firstname?.charAt(0).toUpperCase()}{user.lastname?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.firstname} {user.lastname}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-700"
                      onClick={() => {
                        tokenUtils.clearToken();
                        setUser(null);
                        window.location.href = '/';
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                            ) : (
              // Not logged in - show sign in button
              <Link to="/resume/login">
                <Button variant="ghost" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">
                  Sign In
                </Button>
              </Link>
            )}
                                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                    onClick={() => {
                      if (!user) {
                        onShowLogin?.();
                        setIsMenuOpen(false);
                      } else {
                        navigate('/resume/templates');
                        setIsMenuOpen(false);
                      }
                    }}
                  >
                    Create CV
                  </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header; 