import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CalendarCheck2, BarChart3, Clock, LogOut, Menu, Bell, X, ChevronRight, GraduationCap, BookOpen, FileText, Sparkles, Users, User, Settings as SettingsIcon, Link as LinkIcon, History } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ThemeToggle from '../ThemeToggle';

const MENU = [
  { title: 'Profile', path: '/faculty/profile', icon: <User size={18} /> },
  { title: 'Dashboard', path: '/faculty', icon: <LayoutDashboard size={18} /> },
  { title: 'My Classes', path: '/faculty/classes', icon: <BookOpen size={18} /> },
  { title: 'Attendance Log', path: '/faculty/history', icon: <History size={18} /> },
  { title: 'AI Insights', path: '/faculty/analytics', icon: <Sparkles size={18} /> },
  { title: 'Logout', path: '#', icon: <LogOut size={18} />, isLogout: true },
];

export default function FacultyLayout() {
  const [open, setOpen] = useState(true);
  const location = useLocation(); const navigate = useNavigate(); const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const handleLogout = () => { dispatch(logoutUser()); navigate('/login'); };
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex font-sans relative z-0">
      
      <motion.aside animate={{ width: open ? 260 : 72 }} className="fixed md:sticky top-0 left-0 h-screen z-50 flex flex-col bg-[var(--navy)] text-white border-r border-[var(--navy-soft)] transition-all duration-300 ease-in-out overflow-hidden">
        <div className="h-14 flex items-center justify-between px-3 border-b border-slate-200 dark:border-slate-800">
          {open && <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center"><GraduationCap size={14} className="text-white" /></div><span className="font-bold text-white text-sm">SmartERP</span></div>}
          <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 ml-auto"><Menu size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {MENU.map(item => {
            const a = location.pathname === item.path || (item.path !== '/faculty' && item.path !== '#' && location.pathname.startsWith(item.path));
            
            const itemContent = (
              <div className={`flex items-center px-3 py-2.5 rounded-lg transition-all group relative ${a ? 'bg-[var(--navy-soft)] text-white font-medium border-l-4 border-[var(--gold)] pl-2' : 'text-white/70 hover:bg-[var(--navy-soft)] hover:text-white pl-3'}`}>
                {item.icon}
                {open && <span className="ml-3 text-[14px] font-medium">{item.title}</span>}
                {open && item.badge && (
                  <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                )}
                {!open && <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">{item.title}</div>}
              </div>
            );

            if (item.isLogout) {
              return (
                <button key={item.title} onClick={handleLogout} className="w-full text-left mt-2">
                  {itemContent}
                </button>
              );
            }

            return (
              <Link key={item.title} to={item.path}>
                {itemContent}
              </Link>
            );
          })}
        </div>
      </motion.aside>
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 sticky top-0 z-40 bg-[var(--paper)] border-b border-[var(--rule)] flex items-center justify-between px-4 sm:px-6">
          <h1 className="text-sm font-semibold text-[var(--navy)]">Faculty Portal</h1>
          <div className="flex items-center gap-1"></div>
        </header>
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto"><Outlet /></div>
      </main>
    </div>
  );
}
