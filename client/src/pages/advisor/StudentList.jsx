import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import RiskBadge from '@/components/attendance/RiskBadge';

const STUDENTS = [
  { roll:'7376221CS101', name:'Rahul Sharma',   pct:88, risk:'Low',      present:37, absent:5  },
  { roll:'7376221CS102', name:'Priya Devi',     pct:62, risk:'Critical', present:26, absent:16 },
  { roll:'7376221CS103', name:'Arjun Kumar',    pct:82, risk:'Low',      present:34, absent:8  },
  { roll:'7376221CS104', name:'Sneha Reddy',    pct:78, risk:'Medium',   present:33, absent:9  },
  { roll:'7376221CS105', name:'Mohammed Ali',   pct:67, risk:'High',     present:28, absent:14 },
  { roll:'7376221CS106', name:'Lakshmi Nair',   pct:91, risk:'Low',      present:38, absent:4  },
  { roll:'7376221CS107', name:'Vikram Singh',   pct:71, risk:'High',     present:30, absent:12 },
  { roll:'7376221CS108', name:'Ananya Roy',     pct:85, risk:'Low',      present:36, absent:6  },
  { roll:'7376221CS109', name:'Kiran Patel',    pct:76, risk:'Medium',   present:32, absent:10 },
  { roll:'7376221CS110', name:'Ravi Teja',      pct:58, risk:'Critical', present:24, absent:18 },
];

export default function StudentList() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('roll');

  const filtered = STUDENTS
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.includes(search))
    .sort((a, b) => sortKey === 'pct' ? a.pct - b.pct : a.roll.localeCompare(b.roll));

  const avgPct = Math.round(STUDENTS.reduce((a, s) => a + s.pct, 0) / STUDENTS.length);

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Users className="w-6 h-6 text-indigo-500" />Student List
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Full roster of students in III-A with attendance overview and AI risk status.
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
          <div className="text-center">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Class Average</p>
            <p className={`text-2xl font-black ${avgPct>=75?'text-emerald-600':'text-rose-600'}`}>{avgPct}%</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input placeholder="Search student…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={sortKey} onChange={e => setSortKey(e.target.value)}
          className="h-9 rounded-md border border-slate-800 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="roll">Sort by Register No</option>
          <option value="pct">Sort by Attendance (Asc)</option>
        </select>
      </div>

      {/* Table */}
      <Card className="glass-panel border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-800 dark:border-slate-800">
          <CardTitle className="text-base">Class III-A — Student Directory</CardTitle>
          <CardDescription>{filtered.length} of {STUDENTS.length} students</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full erp-table">
            <thead>
              <tr>
                <th className="text-left">#</th>
                <th className="text-left">Register No</th>
                <th className="text-left">Name</th>
                <th className="text-center">Present</th>
                <th className="text-center">Absent</th>
                <th className="text-center">Attendance</th>
                <th className="text-right">AI Risk</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <motion.tr key={s.roll} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
                  <td className="text-slate-400 text-sm">{i+1}</td>
                  <td className="font-mono text-xs text-slate-600 dark:text-slate-400">{s.roll}</td>
                  <td className="font-medium text-slate-900 dark:text-slate-100">{s.name}</td>
                  <td className="text-center text-emerald-600 font-semibold">{s.present}</td>
                  <td className="text-center text-rose-500 font-semibold">{s.absent}</td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className={`h-full rounded-full ${s.pct>=75?'bg-emerald-500':s.pct>=65?'bg-amber-500':'bg-rose-500'}`} style={{width:`${s.pct}%`}} />
                      </div>
                      <span className={`font-bold text-sm ${s.pct>=75?'text-emerald-600':s.pct>=65?'text-amber-600':'text-rose-600'}`}>{s.pct}%</span>
                    </div>
                  </td>
                  <td className="text-right"><RiskBadge level={s.risk} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
