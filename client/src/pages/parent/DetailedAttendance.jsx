import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Search, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/utils/api';
import { toast } from 'react-hot-toast';

const STATUS = {
  Present:  { icon: CheckCircle2, pill:'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' },
  Absent:   { icon: XCircle,      pill:'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' },
  'On Duty':{ icon: Clock,        pill:'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' },
  'Half Day':{ icon: Clock,       pill:'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' },
};

export default function DetailedAttendance() {
  const [searchDate, setSearchDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [log, setLog] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard/parent');
        const childData = response.data.data.children[0]; // Currently assuming 1st child
        if (childData && childData.detailedLog) {
            setLog(childData.detailedLog);
            setStats(childData);
        }
      } catch (error) {
        toast.error('Failed to load detailed attendance');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = log.filter(r => {
    if (searchDate && r.date !== searchDate) return false;
    return true;
  });

  const present = stats?.presentCount || 0;
  const pct = stats?.overallPercentage !== undefined ? Math.round(stats.overallPercentage) : 0;

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading attendance...</div>;

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <ClipboardList className="w-6 h-6 text-indigo-500" />Detailed Attendance
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Date-based attendance record for your ward, {stats?.childName || 'Student'}.
        </p>
      </div>

      {/* Summary */}
      <Card className="glass-panel border-none shadow-sm">
        <CardContent className="p-5 flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs text-slate-500">Overall Attendance</p>
            <p className={`text-3xl font-black ${pct>=75?'text-emerald-600':'text-rose-600'}`}>{pct}%</p>
          </div>
          <div className="flex-1 min-w-[180px]">
            <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
              <div className={`h-full rounded-full ${pct>=75?'bg-emerald-500':'bg-rose-500'}`} style={{width:`${pct}%`}} />
              <div className="absolute inset-y-0 border-l-2 border-dashed border-rose-400/60" style={{left:'75%'}} />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>0%</span><span className="text-rose-400">75%</span><span>100%</span></div>
          </div>
          <div className="text-center"><p className="text-xs text-slate-500">Present</p><p className="text-xl font-bold text-emerald-600">{present}</p></div>
          <div className="text-center"><p className="text-xs text-slate-500">Absent</p><p className="text-xl font-bold text-rose-600">{stats?.absentCount || 0}</p></div>
          <div className="text-center"><p className="text-xs text-slate-500">Total</p><p className="text-xl font-bold text-slate-700 dark:text-slate-300">{stats?.totalDays || 0}</p></div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[180px] max-w-[220px]">
          <input 
            type="date" 
            value={searchDate} 
            onChange={e => setSearchDate(e.target.value)} 
            className="w-full px-4 py-2.5 rounded-xl border border-slate-800 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm cursor-pointer hover:border-slate-300 dark:hover:border-slate-700"
          />
        </div>
        {searchDate && (
          <button 
            onClick={() => setSearchDate('')}
            className="text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-2"
          >
            Clear Date
          </button>
        )}
      </div>

      <Card className="glass-panel border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-800 dark:border-slate-800">
          <CardTitle className="text-base">Session Records</CardTitle>
          <CardDescription>{filtered.length} records shown</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full erp-table">
            <thead>
              <tr>
                <th className="text-left">Date</th>
                <th className="text-left">Subject</th>
                <th className="text-left">Staff</th>
                <th className="text-left">Period</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const S = STATUS[r.status] || STATUS['Present'];
                return (
                  <motion.tr key={i} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}}>
                    <td className="font-mono text-sm text-slate-500">{r.date}</td>
                    <td className="font-medium text-slate-900 dark:text-slate-100">{r.subject}</td>
                    <td className="text-sm text-slate-600 dark:text-slate-400">{r.faculty || '-'}</td>
                    <td className="text-sm text-slate-600 dark:text-slate-400">{r.period || '-'}</td>
                    <td className="text-right">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${S.pill}`}>
                        <S.icon className="w-3 h-3" />{r.status}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
