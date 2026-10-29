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
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex font-sans relative z-0 selection:bg-[var(--navy)] selection:text-[var(--gold)]">
      
      {/* Sidebar - Fixed 240px Dark Navy */}
      <motion.aside 
        animate={{ width: open ? 240 : 72 }} 
        className="fixed md:sticky top-0 left-0 h-screen z-50 flex flex-col bg-[var(--navy)] text-white border-r border-[var(--navy-soft)] transition-all duration-300 ease-in-out overflow-hidden shrink-0"
      >
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-[var(--navy-soft)]">
          {open ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[var(--gold)] flex items-center justify-center flex-shrink-0 shadow-xs">
                <GraduationCap size={16} className="text-[var(--navy)]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-white text-base leading-tight">SmartERP</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--gold)]">Faculty Register</span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[var(--gold)] flex items-center justify-center flex-shrink-0 mx-auto">
              <GraduationCap size={16} className="text-[var(--navy)]" />
            </div>
          )}
          <button 
            onClick={() => setOpen(!open)} 
            className="p-1.5 rounded-lg hover:bg-[var(--navy-soft)] text-white/70 hover:text-white ml-auto"
            title={open ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1 scrollbar-hide">
          {MENU.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/faculty' && item.path !== '#' && location.pathname.startsWith(item.path));
            
            const itemContent = (
              <div className={`flex items-center px-3 py-2.5 rounded-[8px] transition-all group relative ${
                isActive 
                  ? 'bg-[var(--navy-soft)] text-white font-medium border-l-[3px] border-[var(--gold)] shadow-xs' 
                  : 'text-white/70 hover:bg-[var(--navy-soft)] hover:text-white'
              }`}>
                <div className={`${isActive ? 'text-[var(--gold)]' : 'text-white/60 group-hover:text-white'} transition-colors`}>
                  {item.icon}
                </div>
                {open && <span className="ml-3 text-[14px] font-medium truncate flex-1">{item.title}</span>}
                {open && item.badge && (
                  <span className="ml-auto bg-[var(--crit-bg)] text-[var(--crit)] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[var(--crit)]/30">
                    {item.badge}
                  </span>
                )}
                {!open && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-[var(--navy-soft)] border border-[var(--rule)]/20 text-white text-xs rounded-[6px] opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-md z-50">
                    {item.title}
                  </div>
                )}
              </div>
            );

            if (item.isLogout) {
              return (
                <button key={item.title} onClick={handleLogout} className="w-full text-left mt-3 pt-3 border-t border-[var(--navy-soft)]">
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

        {/* Institutional signature stamp in sidebar footer */}
        {open && (
          <div className="p-3 border-t border-[var(--navy-soft)] bg-black/10 flex items-center justify-between">
            <span className="stamp text-[9px] text-[var(--gold)] border-[var(--gold)] opacity-85">
              OFFICIAL RECORD
            </span>
            <span className="font-mono text-[10px] text-white/40">FAC-ROLL</span>
          </div>
        )}
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[var(--paper)]">
        <header className="h-16 sticky top-0 z-40 bg-[var(--paper-raised)] border-b border-[var(--rule)] flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-lg font-semibold text-[var(--navy)] tracking-tight">Faculty Portal & Register</h1>
            <span className="text-[var(--rule)] hidden sm:inline">|</span>
            <span className="font-mono text-xs text-[var(--ink-soft)] hidden sm:inline">Academic Session {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-3 pl-3 border-l border-[var(--rule)]">
            <div className="w-8 h-8 rounded-full bg-[var(--navy)] text-[var(--gold)] font-mono text-xs font-bold flex items-center justify-center border border-[var(--rule)]">
              {user?.name ? user.name.split(' ').map(n=>n[0]).slice(0,2).join('') : 'FC'}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-semibold text-[var(--ink)] leading-tight">{user?.name || 'Faculty Member'}</span>
              <span className="text-[10px] font-mono text-[var(--ink-soft)] uppercase tracking-wider leading-tight">{user?.department?.code || 'ACADEMIC STAFF'}</span>
            </div>
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
