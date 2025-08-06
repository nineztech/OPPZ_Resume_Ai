import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { tokenUtils } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Store token and user data using utility function
        tokenUtils.setToken(result.token, result.user);

        toast({
          title: "Login successful!",
          description: "Welcome back!",
        } as any);
        
        // Redirect to the page they were trying to access, or home
        const from = location.state?.from || '/';
        navigate(from);
      } else {
        toast({
          title: "Login failed",
          description: result.message || "Invalid email or password",
          variant: "destructive",
        } as any);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      } as any);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration (Original Size) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full"></div>
          <div className="absolute top-32 right-20 w-20 h-20 bg-purple-400 rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-pink-400 rounded-full"></div>
          <div className="absolute bottom-32 right-32 w-16 h-16 bg-yellow-400 rounded-full"></div>
        </div>

        {/* Main Illustration */}
        <div className="flex flex-col justify-center items-center w-full p-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Desk/Table */}
            <div className="w-80 h-40 bg-blue-200 rounded-2xl relative mb-8 shadow-lg">
              {/* Computer Screen */}
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                <div className="w-32 h-20 bg-white rounded-lg shadow-md border-4 border-gray-300">
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-md flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                {/* Screen Stand */}
                <div className="w-2 h-8 bg-gray-400 mx-auto"></div>
                <div className="w-12 h-2 bg-gray-400 rounded-full mx-auto"></div>
              </div>

              {/* Person */}
              <motion.div
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute -top-8 left-8"
              >
                {/* Head */}
                <div className="w-12 h-12 bg-orange-300 rounded-full mb-2 relative">
                  <div className="w-8 h-6 bg-orange-400 rounded-full absolute top-0 left-2"></div>
                </div>
                {/* Body */}
                <div className="w-16 h-24 bg-purple-400 rounded-t-full"></div>
              </motion.div>

              {/* Second Person */}
              <motion.div
                initial={{ x: 20 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute -top-6 right-12"
              >
                {/* Head */}
                <div className="w-10 h-10 bg-pink-300 rounded-full mb-2 relative">
                  <div className="w-6 h-4 bg-pink-400 rounded-full absolute top-1 left-2"></div>
                </div>
                {/* Body */}
                <div className="w-14 h-20 bg-blue-400 rounded-t-full"></div>
              </motion.div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-6 h-6 bg-yellow-400 rounded-full"></div>
              <div className="absolute bottom-4 left-4 w-4 h-4 bg-green-400 rounded-full"></div>
            </div>
          </motion.div>

          {/* Welcome Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome Back!</h2>
            <p className="text-gray-600 text-base leading-relaxed max-w-md">
              Access your account and continue building amazing resumes with our AI-powered platform.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Medium Size Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          {/* Header */}
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            
            <h1 className="text-xl font-bold text-gray-900 mb-2">Sign In</h1>
            <p className="text-gray-600">Welcome back! Please enter your details.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                {...register('email')}
              />
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 mt-1"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 mt-1"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setValue('rememberMe', checked as boolean)}
                  className="mr-2"
                />
                <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                  Remember for 30 days
                </Label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                'Sign in'
              )}
            </Button>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <Link
                  to="/resume/signup"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
