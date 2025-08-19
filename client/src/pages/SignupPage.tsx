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
import { Eye, EyeOff, ArrowLeft, User, Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const agreeToTerms = watch('agreeToTerms');

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5006/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstname: data.firstName,
          lastname: data.lastName,
          email: data.email,
          phoneNumber: '', // You might want to add phone number field to the form
          password: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Account created successfully!",
          description: "Welcome to ResumeAI! Please sign in with your new account.",
        } as any);
        
        // Redirect to login page
        window.location.href = '/signin';
      } else {
        toast({
          title: "Registration failed",
          description: result.message || "Failed to create account",
          variant: "destructive",
        } as any);
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = "Network error. Please try again.";
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = "Cannot connect to server. Please make sure the server is running on port 5000.";
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      } as any);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration (Same Blue Colors as Login) */}
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

              {/* Person 1 */}
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

              {/* Person 2 */}
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

              {/* Person 3 - New person for signup */}
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="absolute -top-4 left-1/2 transform -translate-x-1/2"
              >
                {/* Head */}
                <div className="w-8 h-8 bg-indigo-300 rounded-full mb-1 relative">
                  <div className="w-5 h-3 bg-indigo-400 rounded-full absolute top-0.5 left-1.5"></div>
                </div>
                {/* Body */}
                <div className="w-10 h-14 bg-teal-400 rounded-t-full"></div>
              </motion.div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-6 h-6 bg-yellow-400 rounded-full"></div>
              <div className="absolute bottom-4 left-4 w-4 h-4 bg-green-400 rounded-full"></div>
              <div className="absolute bottom-4 right-4 w-3 h-3 bg-purple-400 rounded-full"></div>
            </div>
          </motion.div>

          {/* Welcome Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Join Our Team!</h2>
                          <p className="text-gray-600 text-base leading-relaxed max-w-md">
              Create your account and start building professional resumes with our AI-powered platform.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Slightly Larger Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8 bg-white overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md my-auto"
        >
          {/* Header */}
          <div className="mb-5">
            <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-5 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            
            <h1 className="text-xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join us today! Please fill in your details.</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Fields Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* First Name */}
              <div>
                <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    className="w-full h-11 pl-9 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    {...register('firstName')}
                  />
                </div>
                {errors.firstName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 mt-1"
                  >
                    {errors.firstName.message}
                  </motion.p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 mt-1"
                  >
                    {errors.lastName.message}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-11 pl-9 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  {...register('email')}
                />
              </div>
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
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create password"
                  className="w-full h-11 pl-9 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
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

            {/* Confirm Password Field */}
            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  className="w-full h-11 pl-9 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 mt-1"
                >
                  {errors.confirmPassword.message}
                </motion.p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start pt-1">
              <Checkbox
                id="agreeToTerms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setValue('agreeToTerms', checked as boolean)}
                className="mr-2 mt-0.5"
              />
              <Label htmlFor="agreeToTerms" className="text-sm text-gray-600 leading-relaxed">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.agreeToTerms && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600"
              >
                {errors.agreeToTerms.message}
              </motion.p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Google Sign Up */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </Button>

            {/* Sign In Link */}
            <div className="text-center pt-2">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link
                  to="/signin"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
