import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowLeft, Loader2, ShieldCheck, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loginSuccess } from '../../store/slices/authSlice';
import api from '../../utils/api';

const ROLES = [
  { value: 'admin', label: 'Admin', color: 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400', icon: ShieldCheck },
  { value: 'hod', label: 'HOD', color: 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400', icon: Users },
  { value: 'faculty', label: 'Faculty', color: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400', icon: BookOpen },
  { value: 'student', label: 'Student', color: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400', icon: GraduationCap },
  { value: 'parent', label: 'Parent', color: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400', icon: Users },
];

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/register', formData);
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
      setError(err.response?.data?.message || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-[#0B1120] transition-colors">
      
      {/* Left: Branding & Graphic (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-indigo-700 to-purple-900 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0di00aC0ydi00aC0yVjEwaC0ydjE0aC0ydjRoLTJ2NGgtMnYyaDI0di0ydi00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-indigo-500/30 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-fuchsia-500/30 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="font-[Poppins] font-bold text-2xl tracking-tight">SmartERP</span>
        </div>

        <div className="relative z-10 max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-4xl font-bold font-[Poppins] leading-tight mb-4">
              Join the future of education.
            </h1>
            <p className="text-indigo-200 text-lg">
              Create your account to access personalized dashboards, smart attendance tracking, and predictive analytics.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-indigo-200 text-sm">
          <span>&copy; {new Date().getFullYear()} SmartERP Systems Inc.</span>
          <span className="w-1 h-1 bg-indigo-200 rounded-full" />
          <span>Secured by TLS 1.3</span>
        </div>
      </div>

      {/* Right: Register Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-hidden overflow-y-auto">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] lg:hidden pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-[420px] z-10 my-8"
        >
          <div className="flex lg:hidden justify-center items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-[Poppins] font-bold text-2xl tracking-tight text-slate-900 dark:text-white">SmartERP</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-[Poppins] font-bold tracking-tight text-slate-900 dark:text-white">
              Create an Account
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Register to access the ERP platform.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-sm text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 group">
              <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-medium group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">Full Name</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe" 
                required 
                className="h-11 bg-slate-50 dark:bg-[#0B1120]/50 border-slate-800 dark:border-white/10 focus-visible:ring-1 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 text-slate-900 dark:text-white rounded-xl transition-all"
              />
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">Email Address</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="name@institution.edu" 
                required 
                className="h-11 bg-slate-50 dark:bg-[#0B1120]/50 border-slate-800 dark:border-white/10 focus-visible:ring-1 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 text-slate-900 dark:text-white rounded-xl transition-all"
              />
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••" 
                required 
                minLength={8}
                className="h-11 bg-slate-50 dark:bg-[#0B1120]/50 border-slate-800 dark:border-white/10 focus-visible:ring-1 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 text-slate-900 dark:text-white rounded-xl transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300 font-medium">Select Role</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {ROLES.map(({ value, label, color, icon: Icon }) => (
                  <div 
                    key={value}
                    onClick={() => setFormData({...formData, role: value})}
                    className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${
                      formData.role === value 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 ring-1 ring-indigo-500' 
                        : 'border-slate-800 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-white/5 bg-slate-50 dark:bg-[#0B1120]/50'
                    }`}
                  >
                    <div className={`p-1.5 rounded-full ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? 'Creating account...' : 'Complete Registration'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 dark:border-white/10 flex justify-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Register;
