import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Search, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const MOCK_ATTENDANCE = [
  { roll:'7376221CS101', name:'Rahul Sharma',   dept:'CSE', year:'III', sec:'A', subject:'OS',    date:'2026-08-06', status:'Present' },
  { roll:'7376221CS102', name:'Priya Devi',     dept:'CSE', year:'III', sec:'A', subject:'OS',    date:'2026-08-06', status:'Absent'  },
  { roll:'7376221CS103', name:'Arjun Kumar',    dept:'CSE', year:'III', sec:'A', subject:'DBMS',  date:'2026-08-06', status:'Present' },
  { roll:'7376221CS104', name:'Sneha Reddy',    dept:'CSE', year:'III', sec:'B', subject:'CN',    date:'2026-08-05', status:'On Duty' },
  { roll:'7376221CS105', name:'Mohammed Ali',   dept:'CSE', year:'III', sec:'B', subject:'CN',    date:'2026-08-05', status:'Absent'  },
  { roll:'7376221CS106', name:'Lakshmi Nair',   dept:'CSE', year:'IV',  sec:'A', subject:'AI',    date:'2026-08-05', status:'Present' },
  { roll:'7376221CS107', name:'Vikram Singh',   dept:'CSE', year:'IV',  sec:'A', subject:'ML',    date:'2026-08-04', status:'Absent'  },
  { roll:'7376221CS108', name:'Ananya Roy',     dept:'CSE', year:'II',  sec:'A', subject:'DS',    date:'2026-08-04', status:'Present' },
];

const STATUS_STYLES = {
  Present:  'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  Absent:   'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
  'On Duty':'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
};

export default function AttendanceReview() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterYear, setFilterYear] = useState('All');

  const filtered = MOCK_ATTENDANCE.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.roll.includes(search);
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    const matchYear = filterYear === 'All' || r.year === filterYear;
    return matchSearch && matchStatus && matchYear;
  });

  const stats = {
    total: MOCK_ATTENDANCE.length,
    present: MOCK_ATTENDANCE.filter(r => r.status === 'Present').length,
    absent: MOCK_ATTENDANCE.filter(r => r.status === 'Absent').length,
    od: MOCK_ATTENDANCE.filter(r => r.status === 'On Duty').length,
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <ClipboardList className="w-6 h-6 text-emerald-500" />Attendance Review
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review all attendance records across your department with powerful filters.
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total Records', value:stats.total, color:'slate' },
          { label:'Present', value:stats.present, color:'emerald' },
          { label:'Absent', value:stats.absent, color:'rose' },
          { label:'On Duty', value:stats.od, color:'amber' },
        ].map(s => (
          <Card key={s.label} className="glass-panel border-none shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 text-${s.color}-600 dark:text-${s.color}-400`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="glass-panel border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input placeholder="Search by name or register no…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="h-9 rounded-md border border-slate-800 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="All">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="On Duty">On Duty</option>
            </select>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
              className="h-9 rounded-md border border-slate-800 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="All">All Years</option>
              <option value="I">I Year</option>
              <option value="II">II Year</option>
              <option value="III">III Year</option>
              <option value="IV">IV Year</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass-panel border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-800 dark:border-slate-800">
          <CardTitle className="text-base">Attendance Records</CardTitle>
          <CardDescription>Showing {filtered.length} of {MOCK_ATTENDANCE.length} records</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full erp-table">
              <thead>
                <tr>
                  <th className="text-left">Register No</th>
                  <th className="text-left">Student</th>
                  <th>Year / Sec</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <motion.tr key={i} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}}>
                    <td className="font-mono text-xs text-slate-600 dark:text-slate-400">{r.roll}</td>
                    <td className="font-medium text-slate-900 dark:text-slate-100">{r.name}</td>
                    <td className="text-center text-slate-600 dark:text-slate-400">{r.year}-{r.sec}</td>
                    <td className="text-center">
                      <span className="px-2 py-0.5 text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-100 dark:border-indigo-500/20 font-medium">{r.subject}</span>
                    </td>
                    <td className="text-center text-slate-500 dark:text-slate-400 text-sm">{r.date}</td>
                    <td className="text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[r.status] || ''}`}>{r.status}</span>
                    </td>
                  </motion.tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400">No records match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
