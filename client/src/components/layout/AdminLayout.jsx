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
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex flex-col md:flex-row font-sans selection:bg-[var(--navy)] selection:text-[var(--gold)] relative z-0">
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
            onClick={() => setSidebarOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Fixed 240px Navy with Gold Accents */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 80, x: isSidebarOpen ? 0 : -240 }}
        className="fixed md:sticky top-0 left-0 h-screen z-50 flex flex-col bg-[var(--navy)] text-white border-r border-[var(--navy-soft)] transition-all duration-300 ease-in-out shrink-0"
        style={{ transform: !isSidebarOpen ? 'translateX(0)' : undefined }}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--navy-soft)]">
          {isSidebarOpen ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[var(--gold)] flex items-center justify-center flex-shrink-0 shadow-xs">
                <GraduationCap className="w-5 h-5 text-[var(--navy)]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg tracking-tight text-white leading-tight">SmartERP</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--gold)]">Academic Ledger</span>
              </div>
            </motion.div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-lg bg-[var(--gold)] flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-[var(--navy)]" />
            </div>
          )}
          
          <Button variant="ghost" size="icon" className="md:hidden text-white/70 hover:bg-[var(--navy-soft)]" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <X size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1 scrollbar-hide">
          {MENU_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link key={item.path} to={item.path}>
                <div className={`flex items-center px-3.5 py-2.5 mb-1 rounded-[8px] transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-[var(--navy-soft)] text-white font-medium border-l-[3px] border-[var(--gold)] shadow-xs' 
                    : 'text-white/70 hover:bg-[var(--navy-soft)] hover:text-white'
                }`}>
                  <div className={`${isActive ? 'text-[var(--gold)]' : 'text-white/60 group-hover:text-white'} transition-colors`}>
                    {item.icon}
                  </div>
                  
                  {isSidebarOpen && (
                    <span className="ml-3 text-[14px] truncate flex-1">{item.title}</span>
                  )}

                  {item.badge && isSidebarOpen && (
                    <span className="bg-[var(--crit-bg)] text-[var(--crit)] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[var(--crit)]/30">
                      {item.badge}
                    </span>
                  )}

                  {!isSidebarOpen && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-[var(--navy-soft)] border border-[var(--rule)]/20 text-xs text-white rounded-[6px] opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap transition-opacity flex items-center gap-2 shadow-md">
                      {item.title}
                      {item.badge && <span className="bg-[var(--crit)] text-white text-[10px] px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
          
          {/* Logout Button in Sidebar */}
          <button onClick={handleLogout} className="flex items-center px-3.5 py-2.5 mb-1 rounded-[8px] transition-all duration-200 group relative text-white/70 hover:bg-[var(--navy-soft)] hover:text-[var(--crit-bg)] w-full text-left mt-3 pt-3 border-t border-[var(--navy-soft)]">
            <div className="text-white/60 group-hover:text-[var(--crit-bg)] transition-colors">
              <LogOut size={18} />
            </div>
            {isSidebarOpen && (
              <span className="ml-3 text-[14px] truncate">Sign Out</span>
            )}
            {!isSidebarOpen && (
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-[var(--navy-soft)] border border-[var(--rule)]/20 text-xs text-white rounded-[6px] opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap transition-opacity shadow-md">
                Sign Out
              </div>
            )}
          </button>
        </div>

        {/* Institutional signature stamp in sidebar footer */}
        {isSidebarOpen && (
          <div className="p-3 border-t border-[var(--navy-soft)] bg-black/10 flex items-center justify-between">
            <span className="stamp text-[9px] text-[var(--gold)] border-[var(--gold)] opacity-85">
              OFFICIAL LEDGER
            </span>
            <span className="font-mono text-[10px] text-white/40">v2.4-ADM</span>
          </div>
        )}
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        
        {/* Sticky Header */}
        <header className="h-16 sticky top-0 z-40 bg-[var(--paper-raised)] border-b border-[var(--rule)] flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 w-full max-w-2xl">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-[var(--ink-soft)] hover:bg-[var(--paper)] hover:text-[var(--ink)]">
              <Menu size={20} />
            </Button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-serif font-semibold text-[var(--navy)] text-base">Office of the Administrator</span>
              <span className="text-[var(--rule)]">|</span>
              <span className="font-mono text-xs text-[var(--ink-soft)]">Institutional Console</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-3 pl-4 border-l border-[var(--rule)]">
              <Avatar className="w-8 h-8 border border-[var(--rule)]">
                <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name}`} />
                <AvatarFallback className="bg-[var(--navy)] text-[var(--gold)] font-mono text-xs">AD</AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-semibold text-[var(--ink)] leading-tight">{user?.name || 'Administrator'}</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-soft)] leading-tight">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[var(--paper)]">
          <Outlet />
        </div>
        
      </main>
    </div>
  );
};

export default AdminLayout;
