import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowLeft, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // In production: await api.post('/auth/forgot-password', { email });
      await new Promise(r => setTimeout(r, 1200)); // simulate API
      setIsSent(true);
    } catch {
      setError('No account found with that email address.');
    } finally {
      setIsLoading(false);
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
              Secure Account Recovery.
            </h1>
            <p className="text-indigo-200 text-lg">
              Get back into your account securely to continue accessing personalized dashboards and intelligent analytics.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-indigo-200 text-sm">
          <span>&copy; {new Date().getFullYear()} SmartERP Systems Inc.</span>
          <span className="w-1 h-1 bg-indigo-200 rounded-full" />
          <span>Secured by TLS 1.3</span>
        </div>
      </div>

      {/* Right: Forgot Password Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-hidden">
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
            {isSent ? (
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-200 dark:border-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-3xl font-[Poppins] font-bold tracking-tight text-slate-900 dark:text-white mb-2">Check your email</h2>
                <p className="text-slate-500 dark:text-slate-400">
                  We've sent a password reset link to <strong className="text-slate-700 dark:text-slate-300">{email}</strong>
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-[Poppins] font-bold tracking-tight text-slate-900 dark:text-white">
                  Reset password
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Enter your email address and we'll send you a reset link
                </p>
              </>
            )}
          </div>

          {!isSent && error && (
            <div className="mb-6 p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-sm text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
              {error}
            </div>
          )}

          {isSent ? (
            <div className="space-y-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                Didn't receive it? Check your spam folder or{' '}
                <button onClick={() => setIsSent(false)} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline transition-all">
                  try again
                </button>
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2 group">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@institution.edu"
                    required
                    className="h-12 pl-10 bg-slate-50 dark:bg-[#0B1120]/50 border-slate-800 dark:border-white/10 focus-visible:ring-1 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 text-slate-900 dark:text-white rounded-xl transition-all"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full h-12 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
              >
                {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-800 dark:border-white/10 flex justify-center">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
