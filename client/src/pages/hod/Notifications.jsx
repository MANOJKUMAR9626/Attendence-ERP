import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const NOTIFICATIONS = [
  { id: 1, title: 'Attendance below 80%', time: '10:30 AM', color: 'bg-rose-500', inner: 'bg-rose-500' },
  { id: 2, title: 'Leave Approved', time: 'Yesterday', color: 'bg-amber-500', inner: 'bg-amber-500' },
  { id: 3, title: 'AI Suggestion', time: 'Yesterday', color: 'bg-rose-500', inner: 'bg-rose-500' },
  { id: 4, title: 'New Timetable', time: '2 days ago', color: 'bg-blue-500', inner: 'bg-blue-500', isTriangle: true },
  { id: 5, title: 'Report Generated', time: '2 days ago', color: 'bg-emerald-500', inner: 'bg-emerald-500' },
];

export default function Notifications() {
  return (
    <div className="space-y-6 pb-10 max-w-3xl mx-auto page-enter">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-panel border-none shadow-xl rounded-3xl overflow-hidden bg-slate-900 text-white dark:bg-slate-950">
          <CardContent className="p-6 sm:p-8">
            
            <h1 className="text-[13px] font-bold tracking-widest uppercase mb-8 text-white">
              11. NOTIFICATIONS
            </h1>

            {/* Tabs */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button className="px-6 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg shadow-blue-500/20">All</button>
              <button className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors">Attendance</button>
              <button className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors">AI Alerts</button>
              <button className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors">System</button>
            </div>

            {/* List */}
            <div className="space-y-3">
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center p-1.5 shadow-inner">
                      {n.isTriangle ? (
                        <div className={`w-full h-full rounded-sm ${n.color}`} style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                      ) : (
                        <div className={`w-3.5 h-3.5 rounded-full ${n.color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                      )}
                    </div>
                    <span className="font-semibold text-sm text-slate-200">{n.title}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{n.time}</span>
                </div>
              ))}
            </div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
