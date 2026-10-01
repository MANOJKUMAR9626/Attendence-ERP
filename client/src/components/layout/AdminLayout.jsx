import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Users, CalendarCheck, Sparkles, LineChart, FileText, 
  Settings, LogOut, Menu, Bell, Search, GraduationCap, X, ChevronRight, Sun, Moon, User,
  BookOpen, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const MENU_ITEMS = [
  { title: 'Dashboard', path: '/admin', icon: <Home size={20} /> },
  { title: 'Students', path: '/admin/students', icon: <Users size={20} /> },
  { title: 'Faculty', path: '/admin/faculty', icon: <Users size={20} /> },
  { title: 'Allocations', path: '/admin/allocations', icon: <BookOpen size={20} /> },
  { title: 'Attendance', path: '/admin/attendance', icon: <CalendarCheck size={20} /> },
  { title: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
];

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex flex-col md:flex-row font-sans selection:bg-indigo-500/30 relative z-0">
      
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 80, x: isSidebarOpen ? 0 : -240 }}
        className="fixed md:sticky top-0 left-0 h-screen z-50 flex flex-col bg-[var(--navy)] text-white border-r border-[var(--navy-soft)] transition-all duration-300 ease-in-out"
        style={{ transform: !isSidebarOpen ? 'translateX(0)' : undefined }} // For desktop collapse
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          {isSidebarOpen ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white truncate">SmartERP</span>
            </motion.div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
          )}
          
          <Button variant="ghost" size="icon" className="md:hidden text-slate-500 hover:bg-slate-200" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <X size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
          {MENU_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link key={item.path} to={item.path}>
                <div className={`flex items-center px-4 py-3 mb-1 rounded-xl transition-all duration-200 group relative ${isActive ? 'bg-[var(--navy-soft)] text-white font-medium border-l-[3px] border-[var(--gold)]' : 'text-white/70 hover:bg-[var(--navy-soft)] hover:text-white'}`}>
                  <div className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'} transition-colors`}>
                    {item.icon}
                  </div>
                  
                  {isSidebarOpen && (
                    <span className="ml-4 text-[15px] truncate flex-1">{item.title}</span>
                  )}

                  {item.badge && isSidebarOpen && (
                    <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}

                  {!isSidebarOpen && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap transition-opacity flex items-center gap-2">
                      {item.title}
                      {item.badge && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
          
          {/* Logout Button in Sidebar */}
          <button onClick={handleLogout} className="flex items-center px-4 py-3 mb-1 rounded-xl transition-all duration-200 group relative text-white/70 hover:bg-[var(--navy-soft)] hover:text-white w-full text-left mt-2">
            <div className="text-slate-500 group-hover:text-rose-500 transition-colors">
              <LogOut size={20} />
            </div>
            {isSidebarOpen && (
              <span className="ml-4 text-[15px] truncate">Logout</span>
            )}
            {!isSidebarOpen && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap transition-opacity">
                Logout
              </div>
            )}
          </button>
        </div>


      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        
        {/* Sticky Header */}
        <header className="h-16 sticky top-0 z-40 bg-[var(--paper)] border-b border-[var(--rule)] flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 w-full max-w-2xl">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-500 hover:bg-slate-100">
              <Menu size={20} />
            </Button>
            

          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <Avatar className="w-8 h-8 cursor-pointer">
                <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name}`} />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-bold text-[var(--ink)] leading-tight">{user?.name}</span>
                <span className="text-[11px] text-slate-500 capitalize leading-tight">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </div>
        
      </main>
    </div>
  );
};

export default AdminLayout;
