import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import api from '../../utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@erp.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const response = await api.post('/auth/login', { email, password });
      dispatch(loginSuccess(response.data));
      
      const role = response.data.user.role;
      switch (role) {
        case 'admin': navigate('/admin'); break;
        case 'hod': navigate('/hod'); break;
        case 'class_advisor': navigate('/advisor'); break;
        case 'faculty': navigate('/faculty'); break;
        case 'student': navigate('/student'); break;
        case 'parent': navigate('/parent'); break;
        default: navigate('/');
      }
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || 'Login failed'));
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white font-sans">
      
      {/* Left: Illustration (Hidden on small screens) */}
      <div className="hidden md:flex flex-col items-center justify-center p-12 relative overflow-hidden bg-slate-50">
        <div className="absolute w-[120%] h-[120%] bg-indigo-50/50 rounded-full -left-[20%] -top-[10%]"></div>
        <div className="absolute w-[80%] h-[80%] bg-indigo-100/50 rounded-full"></div>
        <div className="relative z-10 w-full max-w-md h-full flex flex-col items-center justify-center">
          <svg className="w-full h-auto text-indigo-500" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
            <rect width="800" height="600" fill="transparent"/>
            <path d="M400,100 C565.685425,100 700,234.314575 700,400 C700,565.685425 565.685425,700 400,700 C234.314575,700 100,565.685425 100,400 C100,234.314575 234.314575,100 400,100 Z" fill="#E0E7FF" />
            <rect x="250" y="300" width="300" height="200" rx="20" fill="#1E1B4B" />
            <polygon points="200,500 600,500 620,530 180,530" fill="#312E81" />
            <circle cx="400" cy="200" r="60" fill="#FCA5A5" />
            <rect x="360" y="260" width="80" height="100" fill="#6366F1" />
            <path d="M280,360 L360,300 L440,360 Z" fill="#4F46E5" />
            <path d="M150,250 C180,220 250,220 250,250 C250,280 180,280 150,250 Z" fill="#FEE2E2" />
            <circle cx="180" cy="250" r="20" fill="#EF4444" />
          </svg>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 md:p-24 bg-white relative">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px]"
        >
          <div className="mb-10">
            <h1 className="text-[32px] font-bold text-slate-900 tracking-tight mb-2">
              Welcome Back!
            </h1>
            <p className="text-slate-500 font-medium">
              Sign in to your account
            </p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-600 font-medium">
              {error}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-bold text-slate-700">Email or Username</Label>
              <Input 
                id="email"
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or username"
                required
                className="h-[52px] bg-slate-50 border-slate-800 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 text-slate-900 rounded-xl px-4 text-[15px] font-medium transition-all shadow-sm"
              />
            </div>
            
            <div className="space-y-2.5">
              <Label htmlFor="password" className="text-sm font-bold text-slate-700">Password</Label>
              <div className="relative">
                <Input 
                  id="password"
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-[52px] bg-slate-50 border-slate-800 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 text-slate-900 rounded-xl px-4 pr-12 text-[15px] font-medium transition-all shadow-sm"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all"></div>
                  <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
              </label>
              
              <a href="#forgot" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                Forgot password?
              </a>
            </div>

            <div className="flex gap-2 mt-2">
              <Button type="button" variant="outline" onClick={() => { setEmail('admin@erp.com'); setPassword('password123'); }} className="flex-1 text-xs h-8 border-slate-800">Admin</Button>
              <Button type="button" variant="outline" onClick={() => { setEmail('fac001@erp.com'); setPassword('password123'); }} className="flex-1 text-xs h-8 border-slate-800">Faculty</Button>
              <Button type="button" variant="outline" onClick={() => { setEmail('stu001@erp.com'); setPassword('password123'); }} className="flex-1 text-xs h-8 border-slate-800">Student</Button>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-[52px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-base mt-4"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-[15px] font-medium text-slate-500 mt-10">
            Don't have an account?{" "}
            <a href="#signup" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              Sign up
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
