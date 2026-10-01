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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex font-sans relative z-0">
      
      <motion.aside 
        animate={{ width: open ? 260 : 72 }} 
        className="fixed md:sticky top-0 left-0 h-screen z-50 flex flex-col bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 transition-all duration-300 overflow-hidden shadow-sm"
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          {open && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center shadow-md shadow-indigo-500/20">
                <GraduationCap size={20} className="text-white" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">SmartERP</span>
            </div>
          )}
          <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 ml-auto transition-colors">
            <Menu size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
          {MENU.map((item, idx) => {
            const isActive = location.pathname === item.path || (item.path !== '/parent' && item.path !== '#' && location.pathname.startsWith(item.path));
            
            const itemContent = (
              <div className={`flex items-center px-4 py-3 rounded-xl transition-all group relative ${
                isActive 
                  ? 'bg-[#4F46E5] text-white font-bold shadow-lg shadow-indigo-500/30' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-semibold'
              }`}>
                {item.icon}
                {open && <span className="ml-3.5 text-[13px]">{item.title}</span>}
                {open && item.title === 'Notifications' && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {unreadCount}
                  </span>
                )}
                
                {open && item.hasSubmenu && (
                  <ChevronDown size={16} className={`ml-auto ${isActive ? 'text-indigo-200' : 'text-slate-400'}`} />
                )}

                {!open && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                    {item.title}
                  </div>
                )}
              </div>
            );

            if (item.isLogout) {
              return (
                <button key={idx} onClick={handleLogout} className="w-full text-left mt-4 block">
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

        {/* Bottom Graphic Widget */}
        {open && (
          <div className="p-4 mx-4 mb-6 rounded-2xl bg-[#EEF2FF] dark:bg-indigo-950/30 border border-indigo-50 dark:border-indigo-900/50 relative overflow-hidden flex flex-col items-center text-center mt-2">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-3 text-indigo-500">
               <Heart size={32} fill="currentColor" />
            </div>
            <h4 className="text-[#312E81] dark:text-indigo-300 font-bold text-[13px] mb-1">Every Step Together</h4>
            <p className="text-[10px] font-medium text-indigo-900/60 dark:text-indigo-400/60 leading-relaxed px-2">
              We're here to support your child's growth, learning and success every step of the way.
            </p>
          </div>
        )}
      </motion.aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-8 shadow-sm">
          

          
          <div className="flex items-center gap-5 ml-auto">
            <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <Avatar className="w-11 h-11 border-2 border-white shadow-md bg-slate-100">
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
              <div className="hidden sm:block">
                <p className="text-[13px] font-bold text-[var(--ink)] leading-tight">{displayName}</p>
                <p className="text-[11px] font-semibold text-slate-500 leading-tight">Parent</p>
              </div>
              <ChevronDown size={14} className="text-slate-400 ml-1 hidden sm:block" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-[#F4F7FE] dark:bg-slate-950">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
