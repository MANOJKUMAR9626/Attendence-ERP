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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex font-sans relative z-0">
      
      <motion.aside 
        animate={{ width: open ? 240 : 72 }} 
        className="fixed md:sticky top-0 left-0 h-screen z-50 flex flex-col bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 transition-all duration-300 overflow-hidden shadow-sm"
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          {open && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center">
                <GraduationCap size={16} className="text-white" />
              </div>
              <span className="font-bold text-white text-[15px]">SmartERP</span>
            </div>
          )}
          <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 ml-auto transition-colors">
            <Menu size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {MENU.map((item, idx) => {
            const isActive = location.pathname === item.path || (item.path !== '/student' && item.path !== '#' && location.pathname.startsWith(item.path));
            
            const itemContent = (
              <div className={`flex items-center px-3 py-2.5 rounded-xl transition-all group relative ${
                isActive 
                  ? 'bg-[#4F46E5] text-white font-semibold shadow-md shadow-indigo-500/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium'
              }`}>
                {item.icon}
                {open && <span className="ml-3 text-[13px]">{item.title}</span>}
                {open && item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
                {!open && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
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
      </motion.aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 sm:px-8 shadow-sm">
          

          
          <div className="flex items-center gap-4 ml-auto">
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9 border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100">
                <img src={profileImage} alt={displayName} className="w-full h-full object-cover" />
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-[var(--ink)] leading-tight">{displayName}</p>
                <p className="text-[10px] font-medium text-slate-500 leading-tight">Student</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
