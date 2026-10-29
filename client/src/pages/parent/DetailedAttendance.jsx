import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Search, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/utils/api';
import { toast } from 'react-hot-toast';

const STATUS = {
  Present:   { icon: CheckCircle2, pill: 'badge-safe text-xs font-mono' },
  Absent:    { icon: XCircle,      pill: 'badge-danger text-xs font-mono' },
  'On Duty': { icon: Clock,        pill: 'badge-warning text-xs font-mono' },
  'Half Day':{ icon: Clock,        pill: 'badge-warning text-xs font-mono' },
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
  const isSafe = pct >= 80;

  if (isLoading) return <div className="p-8 text-center text-[var(--ink-soft)] font-mono text-xs">Loading attendance ledger...</div>;

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--navy)] tracking-[-0.01em]">
              Detailed Attendance Ledger
            </h1>
            <span className="stamp hidden sm:inline-flex">AUDIT REGISTER</span>
          </div>
          <p className="text-sm font-sans text-[var(--ink-soft)] mt-1">
            Date-wise attendance ledger verification for {stats?.childName || 'Ward'}.
          </p>
        </div>
      </div>

      {/* Summary */}
      <Card className="rounded-[10px] border border-[var(--rule)] bg-[var(--paper-raised)] shadow-none">
        <CardContent className="p-5 flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs font-sans font-medium text-[var(--ink-soft)]">Overall Attendance</p>
            <p className={`text-3xl font-mono font-semibold ${isSafe ? 'text-[var(--safe)]' : 'text-[var(--crit)]'}`}>{pct}%</p>
          </div>
          <div className="flex-1 min-w-[180px]">
            {/* 6px track */}
            <div className="progress-track-6px">
              <div className={`h-full rounded-full ${isSafe ? 'bg-[var(--safe)]' : 'bg-[var(--crit)]'}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-xs font-mono text-[var(--ink-soft)] mt-1.5">
              <span>0%</span>
              <span className="text-[var(--warn)] font-semibold">80% Target</span>
              <span>100%</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs font-sans font-medium text-[var(--ink-soft)]">Present</p>
            <p className="text-xl font-mono font-semibold text-[var(--safe)]">{present}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-sans font-medium text-[var(--ink-soft)]">Absent</p>
            <p className="text-xl font-mono font-semibold text-[var(--crit)]">{stats?.absentCount || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-sans font-medium text-[var(--ink-soft)]">Total Days</p>
            <p className="text-xl font-mono font-semibold text-[var(--ink)]">{stats?.totalDays || 0}</p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[180px] max-w-[220px]">
          <input 
            type="date" 
            value={searchDate} 
            onChange={e => setSearchDate(e.target.value)} 
            className="w-full px-3.5 py-2 rounded-[8px] border border-[var(--rule)] bg-[var(--paper-raised)] text-[var(--ink)] font-mono text-xs focus:ring-1 focus:ring-[var(--navy)] focus:border-[var(--navy)] outline-none shadow-none cursor-pointer"
          />
        </div>
        {searchDate && (
          <button 
            onClick={() => setSearchDate('')}
            className="text-xs font-mono font-semibold text-[var(--navy)] hover:underline px-2 py-1"
          >
            Show All Dates
          </button>
        )}
      </div>

      <Card className="rounded-[10px] border border-[var(--rule)] bg-[var(--paper-raised)] shadow-none overflow-hidden">
        <CardHeader className="pb-3 border-b border-[var(--rule)] bg-[var(--paper)]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-serif font-semibold text-[var(--navy)]">Session Ledger Records</CardTitle>
            <span className="text-xs font-mono text-[var(--ink-soft)]">{filtered.length} RECORDS DISPLAYED</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full erp-table">
            <thead>
              <tr>
                <th className="text-left font-mono">Date</th>
                <th className="text-left">Subject</th>
                <th className="text-left">Staff</th>
                <th className="text-left font-mono">Period</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const S = STATUS[r.status] || STATUS['Present'];
                return (
                  <motion.tr key={i} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.02}}>
                    <td className="font-mono text-xs text-[var(--ink-soft)]">{r.date}</td>
                    <td className="font-serif font-semibold text-sm text-[var(--ink)]">{r.subject}</td>
                    <td className="text-xs font-sans text-[var(--ink-soft)]">{r.faculty || '-'}</td>
                    <td className="text-xs font-mono text-[var(--ink-soft)]">{r.period || '-'}</td>
                    <td className="text-right">
                      <span className={S.pill}>
                        <S.icon className="w-3 h-3 inline mr-1" />{r.status}
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
