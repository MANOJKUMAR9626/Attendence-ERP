import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, BookOpen, CalendarCheck2, Sparkles, 
  BarChart3, FileBarChart, Bell, Settings, User, LogOut, 
  Menu, Search, GraduationCap 
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ThemeToggle from '../ThemeToggle';
import api from '@/utils/api';

export default function StudentLayout() {
  const [open, setOpen] = useState(true);
  const location = useLocation(); 
  const navigate = useNavigate(); 
  const dispatch = useDispatch();

  // Notification badge logic
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/notifications/unread');
        if (res.data.success) {
          setUnreadCount(res.data.data.count);
        }
      } catch (error) {
        console.error('Failed to fetch unread notifications:', error);
      }
    };
    
    fetchUnreadCount();
  }, [location.pathname]);

  // Listen for manual 'Mark all as read' event from the Notifications page
  useEffect(() => {
    const handleNotificationsRead = () => {
      setUnreadCount(0);
    };
    window.addEventListener('notificationsRead', handleNotificationsRead);
    return () => window.removeEventListener('notificationsRead', handleNotificationsRead);
  }, []);

  // Removed auto mark-all-read so the badge persists until manually cleared

  const MENU = [
    { title: 'Profile', path: '/student/profile', icon: <User size={18} /> },
    { title: 'Dashboard', path: '/student', icon: <LayoutDashboard size={18} /> },
    { title: 'Attendance', path: '/student/attendance', icon: <CalendarCheck2 size={18} /> },
    { title: 'Notifications', path: '/student/notifications', icon: <Bell size={18} />, badge: unreadCount > 0 ? unreadCount : null },
    { title: 'AI Prediction', path: '/student/ai-prediction', icon: <Sparkles size={18} /> },
    { title: 'Logout', path: '#', icon: <LogOut size={18} />, isLogout: true },
  ];

  const handleLogout = () => { 
    dispatch(logoutUser()); 
    navigate('/login'); 
  };

  const { user } = useSelector(state => state.auth);
  const userName = (user?.name || '').toLowerCase();
  const isFemale = user?.gender === 'Female' || userName.includes('vidhya') || userName.includes('priya') || userName.includes('deepa') || userName.includes('nisha');
  const profileImage = isFemale ? '/images/student_female.png' : '/images/student_male.png';
  const displayName = user?.name || 'Student';

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex font-sans relative z-0">
      
      <motion.aside 
        animate={{ width: open ? 240 : 72 }} 
        className="fixed md:sticky top-0 left-0 h-screen z-50 flex flex-col bg-[var(--navy)] text-white border-r border-[var(--navy-soft)] transition-all duration-300 overflow-hidden shadow-none"
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--navy-soft)] shrink-0">
          {open ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-[7px] bg-[var(--gold)] flex items-center justify-center text-[var(--navy)] shrink-0 shadow-sm">
                <GraduationCap size={18} strokeWidth={2.2} />
              </div>
              <div className="truncate">
                <span className="font-serif font-bold text-white text-[16px] tracking-tight block leading-tight">SmartERP</span>
                <span className="font-mono text-[9px] text-[var(--gold)] tracking-wider uppercase block leading-none">Student Portal</span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-[7px] bg-[var(--gold)] flex items-center justify-center text-[var(--navy)] shrink-0">
              <GraduationCap size={18} strokeWidth={2.2} />
            </div>
          )}
          <button 
            onClick={() => setOpen(!open)} 
            className="p-1.5 rounded-[7px] hover:bg-[var(--navy-soft)] text-white/70 hover:text-white ml-auto transition-colors"
            title={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {MENU.map((item, idx) => {
            const isActive = location.pathname === item.path || (item.path !== '/student' && item.path !== '#' && location.pathname.startsWith(item.path));
            
            const itemContent = (
              <div className={`flex items-center px-3 py-2.5 rounded-[8px] transition-all group relative ${
                isActive 
                  ? 'bg-[var(--navy-soft)] text-white font-medium border-l-[3px] border-[var(--gold)] pl-[9px]' 
                  : 'text-white/75 hover:bg-[var(--navy-soft)]/60 hover:text-white font-normal'
              }`}>
                <span className={`${isActive ? 'text-[var(--gold)]' : 'text-white/75 group-hover:text-white'} transition-colors`}>
                  {item.icon}
                </span>
                {open && <span className="ml-3 text-[13px]">{item.title}</span>}
                {open && item.badge && (
                  <span className="ml-auto bg-[var(--crit-bg)] text-[var(--crit)] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center border border-[var(--crit)]/20">
                    {item.badge}
                  </span>
                )}
                {!open && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-[var(--navy)] text-white text-xs rounded-[6px] border border-[var(--rule)]/20 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 font-sans shadow-lg">
                    {item.title}
                  </div>
                )}
              </div>
            );

            if (item.isLogout) {
              return (
                <button key={idx} onClick={handleLogout} className="w-full text-left mt-2 block">
                  {itemContent}
                </button>
              );
            }

            return (
              <Link key={idx} to={item.path} className="block">
                {itemContent}
              </Link>
            );
          })}
        </div>

        {open && (
          <div className="p-3 mx-3 mb-4 rounded-[8px] bg-[var(--navy-soft)]/50 border border-[var(--navy-soft)] text-white/80 text-[11px] font-mono flex items-center justify-between shrink-0">
            <span className="text-[var(--gold)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]"></span>
              TERM LEDGER
            </span>
            <span className="text-white/60">2026-27</span>
          </div>
        )}
      </motion.aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 sticky top-0 z-40 bg-[var(--paper-raised)] border-b border-[var(--rule)] flex items-center justify-between px-6 sm:px-8 shadow-none">
          <div className="flex items-center gap-2.5">
            <span className="font-serif font-semibold text-[var(--navy)] text-base">Academic Ledger</span>
            <span className="text-[var(--rule)] hidden sm:inline-block">/</span>
            <span className="font-sans text-xs text-[var(--ink-soft)] hidden sm:inline-block">Student Portal</span>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="h-8 w-px bg-[var(--rule)] mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9 border border-[var(--rule)] overflow-hidden bg-[var(--paper)]">
                <img src={profileImage} alt={displayName} className="w-full h-full object-cover" />
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-[var(--ink)] leading-tight">{displayName}</p>
                <p className="text-[10px] font-mono font-medium text-[var(--ink-soft)] leading-tight">Student</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-[var(--paper)] text-[var(--ink)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
