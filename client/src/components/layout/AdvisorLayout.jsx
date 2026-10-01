import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { motion } from 'framer-motion';
import { LayoutDashboard, CalendarCheck2, Users, CheckSquare, Bell, Menu, LogOut, ChevronRight, GraduationCap } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ThemeToggle from '../ThemeToggle';

const MENU = [
  { title: 'Dashboard', path: '/advisor', icon: <LayoutDashboard size={18} /> },
  { title: 'Class Attendance', path: '/advisor/attendance', icon: <CalendarCheck2 size={18} /> },
  { title: 'Student List', path: '/advisor/students', icon: <Users size={18} /> },
  { title: 'Leave Approvals', path: '/advisor/leaves', icon: <CheckSquare size={18} /> },
  { title: 'Defaulters', path: '/advisor/defaulters', icon: <Bell size={18} /> },
];

export default function AdvisorLayout() {
  const [open, setOpen] = useState(true);
  const location = useLocation(); const navigate = useNavigate(); const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const handleLogout = () => { dispatch(logoutUser()); navigate('/login'); };
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex font-sans relative z-0">
      
      <motion.aside animate={{ width: open ? 260 : 72 }} className="fixed md:sticky top-0 left-0 h-screen z-50 flex flex-col bg-[var(--navy)] text-white border-r border-[var(--navy-soft)] transition-all duration-300 overflow-hidden">
        <div className="h-14 flex items-center justify-between px-3 border-b border-slate-200 dark:border-slate-800">
          {open && <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center"><GraduationCap size={14} className="text-white" /></div><span className="font-bold text-white text-sm">SmartERP</span></div>}
          <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 ml-auto"><Menu size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {MENU.map(item => { const a = location.pathname === item.path || (item.path !== '/advisor' && location.pathname.startsWith(item.path)); return (
            <Link key={item.path} to={item.path}><div className={`flex items-center px-3 py-2.5 rounded-lg transition-all group relative ${a ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{item.icon}{open && <span className="ml-3 text-sm">{item.title}</span>}{!open && <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">{item.title}</div>}</div></Link>
          );})}
        </div>
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className={`flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${!open && 'justify-center'}`}>
            <Avatar className="w-8 h-8 flex-shrink-0"><AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">CA</AvatarFallback></Avatar>
            {open && (<><div className="flex-1 min-w-0"><p className="text-xs font-semibold text-white truncate">{user?.name}</p><p className="text-[10px] text-slate-500">Class Advisor</p></div>
            <DropdownMenu><DropdownMenuTrigger asChild><button className="p-1 rounded text-slate-400"><ChevronRight size={14}/></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Account</DropdownMenuLabel><DropdownMenuSeparator/><DropdownMenuItem onClick={handleLogout} className="text-rose-600 cursor-pointer"><LogOut size={14} className="mr-2"/>Sign Out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></>)}
          </div>
        </div>
      </motion.aside>
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 sticky top-0 z-40 bg-[var(--paper)] border-b border-[var(--rule)] flex items-center justify-between px-4 sm:px-6">
          <h1 className="text-sm font-semibold text-[var(--navy)]">Class Advisor Portal</h1>
          <div className="flex items-center gap-1"></div>
        </header>
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto"><Outlet /></div>
      </main>
    </div>
  );
}
