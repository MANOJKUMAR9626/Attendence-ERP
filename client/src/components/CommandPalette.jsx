import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, Calendar, Users, BookOpen, AlertTriangle, X } from 'lucide-react';
import { useSelector } from 'react-redux';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  // Base items available to all
  let allItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  ];

  // Role-specific items
  if (user?.role === 'admin') {
    allItems.push(
      { name: 'Manage Users', path: '/admin/users', icon: Users },
      { name: 'Manage Departments', path: '/admin/departments', icon: BookOpen },
    );
  } else if (user?.role === 'student') {
    allItems.push(
      { name: 'My Timetable', path: '/student/timetable', icon: Calendar },
      { name: 'Leave Requests', path: '/student/leaves', icon: AlertTriangle },
      { name: 'Internal Marks', path: '/student/marks', icon: BookOpen },
    );
  } else if (user?.role === 'faculty') {
    allItems.push(
      { name: 'Mark Attendance', path: '/faculty/attendance', icon: Users },
      { name: 'My Timetable', path: '/faculty/timetable', icon: Calendar },
    );
  }

  const filteredItems = query === '' 
    ? allItems 
    : allItems.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (path) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
        
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-950 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mx-4"
        >
          {/* Search Input */}
          <div className="flex items-center px-4 py-4 border-b border-slate-100 dark:border-slate-800/60">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input
              autoFocus
              className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none text-lg font-medium"
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              ESC
            </kbd>
            <button onClick={() => setIsOpen(false)} className="sm:hidden p-1 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[300px] overflow-y-auto p-2">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p className="text-sm">No results found for "{query}"</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(item.path)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-colors group text-left"
                    >
                      <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-sm">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="flex gap-1"><kbd className="px-1.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">↑</kbd><kbd className="px-1.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">↓</kbd></span> to navigate
            </span>
            <span className="flex items-center gap-2">
              <kbd className="px-1.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-sans">Enter</kbd> to select
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
