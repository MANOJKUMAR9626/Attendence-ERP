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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--navy)] tracking-[-0.01em]">
              Ward Notifications & Alerts
            </h1>
            <span className="stamp hidden sm:inline-flex">WARD DISPATCHES</span>
          </div>
          <p className="text-sm font-sans text-[var(--ink-soft)] mt-1">
            Official institutional dispatches, attendance alerts, and academic notices for your ward.
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="btn-navy-outline text-xs font-mono flex items-center gap-2"
          >
            <Check className="w-3.5 h-3.5" /> Mark All as Acknowledged
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3.5 mt-6">
        {loading ? (
          <div className="flex justify-center p-8 text-[var(--ink-soft)] font-mono text-xs">
            Loading ward notifications...
          </div>
        ) : notifications.length === 0 ? (
          <Card className="rounded-[10px] border border-[var(--rule)] bg-[var(--paper-raised)] shadow-none p-8 text-center">
            <p className="text-[var(--ink-soft)] font-sans text-sm">No dispatches or notifications on record for your ward.</p>
          </Card>
        ) : (
          notifications.map((notif, idx) => (
            <motion.div 
              key={notif.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Card className={`rounded-[10px] border transition-all ${notif.read ? 'bg-[var(--paper-raised)] border-[var(--rule)] shadow-none' : 'bg-[var(--paper)] border-[var(--rule)] shadow-none'}`}>
                <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 ${notif.color?.includes('rose') ? 'bg-[var(--crit-bg)] text-[var(--crit)]' : 'bg-[var(--paper-raised)] border border-[var(--rule)] text-[var(--navy)]'}`}>
                    <notif.icon className="w-4 h-4" strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <h4 className={`text-base font-serif font-semibold ${notif.read ? 'text-[var(--ink)]' : 'text-[var(--navy)]'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-xs font-mono text-[var(--ink-soft)] shrink-0">{notif.time}</span>
                    </div>
                    <p className="text-sm font-sans text-[var(--ink)] leading-relaxed">
                      {notif.desc}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--navy)] shrink-0 mt-2" title="Unread Notice"></div>
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
