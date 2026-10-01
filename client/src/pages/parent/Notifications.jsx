import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, AlertTriangle, Info, Check, ShieldAlert, AlertOctagon } from 'lucide-react';
import api from '@/utils/api';

const ParentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/dashboard/parent');
        if (res.data.success) {
          const stats = res.data.data;
          const children = stats?.children || [];
          const activeChild = children[0] || {}; // Simplification to first child
          
          const pct = activeChild.overallPercentage !== undefined ? Math.round(activeChild.overallPercentage) : 100;
          
          // Map real notifications from database
          const backendNotifs = (stats.notifications || []).map(n => {
            const isAlert = n.type === 'Attendance Alert';
            const isUrgent = n.priority === 'Urgent';
            return {
              id: n._id,
              title: n.title,
              desc: n.message,
              time: new Date(n.createdAt).toLocaleString(),
              icon: isAlert ? AlertOctagon : Info,
              color: isAlert || isUrgent ? 'text-rose-600' : 'text-indigo-600',
              bg: isAlert || isUrgent ? 'bg-rose-100' : 'bg-indigo-50',
              border: isAlert || isUrgent ? 'border-rose-200' : 'border-indigo-100',
              read: n.isRead
            };
          });

          setNotifications(backendNotifs);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      // Dispatch event for sidebar to sync its count
      window.dispatchEvent(new Event('notificationsRead'));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
            Notifications
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Stay updated with latest alerts and academic notices for your ward.
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-4 py-2 rounded-xl transition-all"
          >
            <Check className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 mt-6">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-8 text-slate-500 font-medium">No notifications right now.</div>
        ) : (
          notifications.map((notif, idx) => (
            <motion.div 
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`rounded-2xl border transition-all hover:shadow-md ${notif.read ? 'bg-white dark:bg-slate-900 border-slate-800 dark:border-slate-800' : 'bg-indigo-50/30 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-500/20 shadow-sm'}`}>
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full ${notif.bg} dark:bg-opacity-10 flex items-center justify-center shrink-0`}>
                    <notif.icon className={`w-6 h-6 ${notif.color}`} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 mt-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-base font-bold ${notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-xs font-bold text-slate-400">{notif.time}</span>
                    </div>
                    <p className={`text-sm leading-relaxed ${notif.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-slate-300 font-medium'}`}>
                      {notif.desc}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="w-3 h-3 rounded-full bg-indigo-500 shrink-0 mt-3 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ParentNotifications;
