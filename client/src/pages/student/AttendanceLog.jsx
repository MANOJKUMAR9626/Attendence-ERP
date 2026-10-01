import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, X, Clock, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import api from '@/utils/api';
import { toast } from 'react-hot-toast';

const getStatusBadge = (status) => {
  switch (status) {
    case 'Present':
    case 'Late Entry':
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
          <CheckCircle2 size={12} className="stroke-[3]" />
          {status}
        </div>
      );
    case 'Absent':
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-100 dark:border-rose-500/20 shadow-sm">
          <XCircle size={12} className="stroke-[3]" />
          Absent
        </div>
      );
    case 'Half Day':
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-100 dark:border-amber-500/20 shadow-sm">
          <Clock size={12} className="stroke-[3]" />
          Half Day
        </div>
      );
    case 'On Duty':
    case 'Sports':
    case 'Placement':
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-500/20 shadow-sm">
          <FileText size={12} className="stroke-[3]" />
          {status}
        </div>
      );
    case 'Medical Leave':
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-100 dark:border-purple-500/20 shadow-sm">
          <FileText size={12} className="stroke-[3]" />
          Medical Leave
        </div>
      );
    default:
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 text-xs font-bold border border-slate-800 dark:border-slate-500/20 shadow-sm">
          {status}
        </div>
      );
  }
};

export default function AttendanceLog() {
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedDate, setSelectedDate] = useState(() => sessionStorage.getItem('studentSelectedDate') || new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
    sessionStorage.setItem('studentSelectedDate', selectedDate);
  }, [selectedDate]);

  const [isLoading, setIsLoading] = useState(true);
  const [dailyTimetable, setDailyTimetable] = useState([]);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.get(`/student/timetable/today?date=${selectedDate}`);
        if (res.data.success) {
          setDailyTimetable(res.data.data);
        }
      } catch (error) {
        setDailyTimetable([]);
      }
    };
    fetchTimetable();
  }, [selectedDate]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/student/attendance-history');
        if (res.data.success) {
          setAttendanceData(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch attendance history', error);
        toast.error('Failed to load attendance data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const currentPeriods = attendanceData[selectedDate] || [];
  
  let displayPeriods = [];
  if (dailyTimetable.length > 0) {
      displayPeriods = dailyTimetable.map(t => {
          const attendanceRec = currentPeriods.find(p => p.period === `Period ${t.periodNumber}`);
          if (attendanceRec) return attendanceRec;
          return {
              period: `Period ${t.periodNumber}`,
              subject: t.subject?.name,
              faculty: t.faculty?.user?.name,
              time: `${t.startTime} - ${t.endTime}`,
              status: 'Not Marked'
          };
      });
      // Append any attendance records that weren't in the timetable (e.g. extra classes)
      currentPeriods.forEach(p => {
          if (!displayPeriods.find(dp => dp.period === p.period)) {
              displayPeriods.push(p);
          }
      });
      displayPeriods.sort((a, b) => {
          const numA = parseInt(a.period.replace('Period ', '')) || 0;
          const numB = parseInt(b.period.replace('Period ', '')) || 0;
          return numA - numB;
      });
  } else {
      displayPeriods = currentPeriods;
  }

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto page-enter">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <FileText className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            Daily Attendance Log
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2 ml-1">View your period-wise attendance for a specific date</p>
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-700 font-medium text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm cursor-pointer hover:border-slate-300"
          />
        </div>
      </div>

      <Card className="rounded-3xl border border-slate-800 shadow-xl shadow-slate-200/40 bg-white">
        <div className="p-6 border-b border-slate-800 bg-indigo-50/50 rounded-t-3xl">
          <h3 className="text-xl font-bold text-indigo-900">
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
        </div>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="py-12 flex justify-center text-slate-400">Loading records...</div>
          ) : displayPeriods.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayPeriods.map((period, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-800 hover:border-indigo-100 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{period.period}</span>
                    {getStatusBadge(period.status)}
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {period.subject}
                  </h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2">
                    {period.time && (
                      <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" /> {period.time}
                      </p>
                    )}
                    {period.faculty && (
                      <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                        <FileText size={14} className="text-slate-400" /> {period.faculty}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <CalendarIcon className="text-indigo-300" size={32} />
              </div>
              <p className="font-medium text-lg text-slate-600">No classes recorded for this date.</p>
              <p className="text-sm mt-1">Try selecting a different date from the top right corner.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
    </div>
  );
}
