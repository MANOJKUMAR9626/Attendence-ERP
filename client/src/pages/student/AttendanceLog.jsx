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
        <span className="badge-safe text-xs font-mono">
          <CheckCircle2 size={12} className="stroke-[2.5] mr-1" />
          {status}
        </span>
      );
    case 'Absent':
      return (
        <span className="badge-danger text-xs font-mono">
          <XCircle size={12} className="stroke-[2.5] mr-1" />
          Absent
        </span>
      );
    case 'Half Day':
      return (
        <span className="badge-warning text-xs font-mono">
          <Clock size={12} className="stroke-[2.5] mr-1" />
          Half Day
        </span>
      );
    case 'On Duty':
    case 'Sports':
    case 'Placement':
      return (
        <span className="badge-info text-xs font-mono">
          <FileText size={12} className="stroke-[2.5] mr-1" />
          {status}
        </span>
      );
    case 'Medical Leave':
      return (
        <span className="badge-danger text-xs font-mono">
          <FileText size={12} className="stroke-[2.5] mr-1" />
          Medical Leave
        </span>
      );
    default:
      return (
        <span className="badge-info text-xs font-mono">
          {status}
        </span>
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
    <div className="space-y-6 pb-10 max-w-6xl mx-auto page-enter">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--navy)] tracking-[-0.01em]">
              Daily Attendance Register
            </h1>
          </div>
          <p className="text-sm font-sans text-[var(--ink-soft)] mt-1">
            Period-wise attendance verification for recorded academic sessions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 rounded-[8px] border border-[var(--rule)] bg-[var(--paper-raised)] text-[var(--ink)] font-mono text-xs focus:ring-1 focus:ring-[var(--navy)] focus:border-[var(--navy)] outline-none shadow-none cursor-pointer"
          />
        </div>
      </div>

      <Card className="rounded-[10px] border border-[var(--rule)] bg-[var(--paper-raised)] shadow-none">
        <div className="p-5 border-b border-[var(--rule)] bg-[var(--paper)] flex items-center justify-between">
          <h3 className="text-base font-serif font-semibold text-[var(--navy)]">
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
          <span className="text-xs font-mono text-[var(--ink-soft)]">
            {displayPeriods.length} PERIODS LOGGED
          </span>
        </div>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="py-12 flex justify-center text-[var(--ink-soft)] font-mono text-xs">Loading ledger entries...</div>
          ) : displayPeriods.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayPeriods.map((period, i) => (
                <div key={i} className="p-4 rounded-[10px] bg-[var(--paper)] border border-[var(--rule)] hover:border-[var(--navy)] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono font-semibold text-[var(--ink-soft)] uppercase tracking-wider">{period.period}</span>
                    {getStatusBadge(period.status)}
                  </div>
                  <h4 className="text-base font-serif font-semibold text-[var(--ink)]">
                    {period.subject || 'Unspecified Subject'}
                  </h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 pt-2 border-t border-[var(--rule)]/60">
                    {period.time && (
                      <p className="text-xs font-mono text-[var(--ink-soft)] flex items-center gap-1.5">
                        <Clock size={13} className="text-[var(--navy)]" /> {period.time}
                      </p>
                    )}
                    {period.faculty && (
                      <p className="text-xs font-sans text-[var(--ink-soft)] flex items-center gap-1.5 truncate">
                        <FileText size={13} className="text-[var(--ink-soft)]" /> {period.faculty}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-[var(--ink-soft)] flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-[var(--paper)] border border-[var(--rule)] flex items-center justify-center mb-3 text-[var(--navy)]">
                <CalendarIcon size={26} />
              </div>
              <p className="font-serif font-semibold text-base text-[var(--navy)]">No periods recorded for this date.</p>
              <p className="text-xs font-sans mt-1">Select a preceding working date to inspect logged attendance.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
    </div>
  );
}
