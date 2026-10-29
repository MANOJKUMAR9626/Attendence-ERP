import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, BookOpen, CalendarCheck2, 
  BarChart3, FileBarChart, Bell, Settings, LogOut, 
  Menu, Search, GraduationCap, ChevronDown, 
  ClipboardList, FileText, CreditCard, MessageSquare, 
  AlertCircle, Calendar, Heart, User
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ThemeToggle from '../ThemeToggle';
import api from '@/utils/api';

const MENU = [
  { title: 'Profile', path: '/parent/profile', icon: <User size={18} /> },
  { title: 'Dashboard', path: '/parent', icon: <LayoutDashboard size={18} /> },
  { title: 'Attendance', path: '/parent/attendance', icon: <CalendarCheck2 size={18} />, hasSubmenu: true },
  { title: 'Notifications', path: '/parent/notifications', icon: <Bell size={18} /> },
  { title: 'Logout', path: '#', icon: <LogOut size={18} />, isLogout: true },
];

export default function ParentLayout() {
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

  const handleLogout = () => { 
    dispatch(logoutUser()); 
    navigate('/login'); 
  };

  const { user } = useSelector(state => state.auth);
  const displayName = user?.name || 'Parent';
  
  // Use a heuristic for gender if we don't have it explicitly yet
  const isFemale = user?.gender === 'Female' || (user?.name || '').toLowerCase().includes('mother');
  const avatarImage = isFemale ? '/images/parent_female.png' : '/images/parent_male.png';

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
                <span className="font-mono text-[9px] text-[var(--gold)] tracking-wider uppercase block leading-none">Parent Portal</span>
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
            const isActive = location.pathname === item.path || (item.path !== '/parent' && item.path !== '#' && location.pathname.startsWith(item.path));
            
            const itemContent = (
              <div className={`flex items-center px-3.5 py-2.5 rounded-[8px] transition-all group relative ${
                isActive 
                  ? 'bg-[var(--navy-soft)] text-white font-medium border-l-[3px] border-[var(--gold)] pl-[11px]' 
                  : 'text-white/75 hover:bg-[var(--navy-soft)]/60 hover:text-white font-normal'
              }`}>
                <span className={`${isActive ? 'text-[var(--gold)]' : 'text-white/75 group-hover:text-white'} transition-colors`}>
                  {item.icon}
                </span>
                {open && <span className="ml-3 text-[13px]">{item.title}</span>}
                {open && item.title === 'Notifications' && unreadCount > 0 && (
                  <span className="ml-auto bg-[var(--crit-bg)] text-[var(--crit)] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center border border-[var(--crit)]/20">
                    {unreadCount}
                  </span>
                )}
                
                {open && item.hasSubmenu && (
                  <ChevronDown size={14} className={`ml-auto ${isActive ? 'text-[var(--gold)]' : 'text-white/50'}`} />
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
                <button key={idx} onClick={handleLogout} className="w-full text-left mt-3 block">
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

        {/* Academic Ledger Institutional Badge */}
        {open && (
          <div className="p-3.5 mx-3 mb-4 rounded-[10px] bg-[var(--navy-soft)]/50 border border-[var(--gold)]/30 text-white relative">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]"></span>
              <h4 className="font-serif text-[11px] font-semibold text-[var(--gold)] tracking-wider uppercase">Guardian Ledger</h4>
            </div>
            <p className="text-[11px] text-white/75 font-sans leading-relaxed">
              Official institutional record and attendance tracking console.
            </p>
          </div>
        )}
      </motion.aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 sticky top-0 z-40 bg-[var(--paper-raised)] border-b border-[var(--rule)] flex items-center justify-between px-6 sm:px-8 shadow-none">
          <div className="flex items-center gap-2.5">
            <span className="font-serif font-semibold text-[var(--navy)] text-base">Academic Ledger</span>
            <span className="text-[var(--rule)] hidden sm:inline-block">/</span>
            <span className="font-sans text-xs text-[var(--ink-soft)] hidden sm:inline-block">Parent & Guardian Portal</span>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="h-8 w-px bg-[var(--rule)] mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9 border border-[var(--rule)] overflow-hidden bg-[var(--paper)]">
                <img 
                  src={avatarImage} 
                  alt={displayName} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = isFemale 
                      ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane&style=circle" 
                      : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&style=circle";
                  }}
                />
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-[var(--ink)] leading-tight">{displayName}</p>
                <p className="text-[10px] font-mono font-medium text-[var(--ink-soft)] leading-tight">Parent / Guardian</p>
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
