import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, CheckCircle2, XCircle, Users, BookOpen, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function AttendanceHistory() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return sessionStorage.getItem('facultySelectedDate') || new Date().toLocaleDateString('en-CA');
  });

  useEffect(() => {
    sessionStorage.setItem('facultySelectedDate', selectedDate);
  }, [selectedDate]);

  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    sessionsConducted: 0,
    avgClassAttendance: 0,
    totalStudentsMarked: 0,
    totalAbsences: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const url = selectedDate ? `/faculty/attendance-history?date=${selectedDate}` : '/faculty/attendance-history';
        const res = await api.get(url);
        if (res.data.success) {
          setHistory(res.data.data);
          setStats(res.data.stats);
        }
      } catch (err) {
        toast.error('Failed to load attendance history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [selectedDate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <History className="w-6 h-6 text-indigo-500" />Attendance History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            All attendance sessions you have conducted, with class-level summary.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-800 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-xs text-rose-500 hover:text-rose-600 font-medium px-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Sessions Conducted', value: stats.sessionsConducted, icon: BookOpen, color:'indigo' },
          { label:'Avg Class Attendance', value: stats.sessionsConducted === 0 ? '00%' : `${stats.avgClassAttendance}%`, icon: Users, color:'emerald' },
          { label:'Total Students Marked', value: stats.totalStudentsMarked, icon: CheckCircle2, color:'purple' },
          { label:'Total Absences', value: stats.totalAbsences, icon: XCircle, color:'rose' },
        ].map(stat => (
          <Card key={stat.label} className="glass-panel border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-500/10 flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="glass-panel border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-800 dark:border-slate-800">
          <CardTitle className="text-base">Session Log</CardTitle>
          <CardDescription>Latest {history.length} sessions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              You haven't conducted any attendance sessions yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full erp-table">
                <thead>
                  <tr>
                    <th className="text-left">Date</th>
                    <th className="text-left">Subject</th>
                    <th>Section</th>
                    <th className="text-center">Present</th>
                    <th className="text-center">Absent</th>
                    <th className="text-center">OD</th>
                    <th className="text-center">Half Day</th>
                    <th className="text-center">Total</th>
                    <th className="text-right">Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row, i) => (
                    <motion.tr key={row.id} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}>
                      <td className="text-slate-600 dark:text-slate-400 font-mono text-sm">{row.date}</td>
                      <td>
                        <span className="px-2 py-0.5 text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-100 dark:border-indigo-500/20 font-medium">
                          {row.subject}
                        </span>
                      </td>
                      <td className="text-center text-slate-600 dark:text-slate-400">{row.section}</td>
                      <td className="text-center">
                        <span className="flex items-center justify-center gap-1 text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />{row.present}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="flex items-center justify-center gap-1 text-rose-500 font-semibold">
                          <XCircle className="w-3.5 h-3.5" />{row.absent}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="flex items-center justify-center gap-1 text-indigo-600 font-semibold">
                          {row.od}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="flex items-center justify-center gap-1 text-amber-500 font-semibold">
                          {row.hd}
                        </span>
                      </td>
                      <td className="text-center text-slate-600 dark:text-slate-400 font-medium">{row.total}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div className={`h-full rounded-full ${row.pct>=85?'bg-emerald-500':row.pct>=75?'bg-amber-500':'bg-rose-500'}`} style={{width:`${row.pct}%`}} />
                          </div>
                          <span className={`font-bold text-sm ${row.pct>=85?'text-emerald-600':row.pct>=75?'text-amber-600':'text-rose-600'}`}>
                            {row.pct}%
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
