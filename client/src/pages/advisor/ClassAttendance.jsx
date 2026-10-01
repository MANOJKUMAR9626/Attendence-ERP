import { motion } from 'framer-motion';
import { BarChart2, Users, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AttendanceChart from '@/components/attendance/AttendanceChart';

const SUBJECTS = [
  { name:'Operating Systems',    code:'CS301', faculty:'Dr. R. Sharma',  sessions:28, present:24, absent:4, pct:86 },
  { name:'DBMS',                  code:'CS302', faculty:'Prof. K. Priya', sessions:26, present:22, absent:4, pct:85 },
  { name:'Computer Networks',     code:'CS303', faculty:'Prof. K. Priya', sessions:24, present:17, absent:7, pct:71 },
  { name:'Software Engineering',  code:'CS304', faculty:'Dr. M. Kumar',   sessions:22, present:20, absent:2, pct:91 },
  { name:'Artificial Intelligence', code:'CS401', faculty:'Dr. M. Kumar', sessions:20, present:13, absent:7, pct:65 },
];

const trendData = [
  {label:'Week 1',value:89},{label:'Week 2',value:85},{label:'Week 3',value:82},
  {label:'Week 4',value:79},{label:'Week 5',value:81},{label:'Week 6',value:83},
];

export default function ClassAttendance() {
  const overallPct = Math.round(SUBJECTS.reduce((a, s) => a + s.pct, 0) / SUBJECTS.length);

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <BarChart2 className="w-6 h-6 text-indigo-500" />Class Attendance
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Subject-wise attendance summary for III Year – Section A (your advised class).
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Class Avg Attendance', value:`${overallPct}%`, color: overallPct>=75?'text-emerald-600':'text-rose-600' },
          { label:'Total Students', value:'42', color:'text-slate-800 dark:text-slate-100' },
          { label:'Subjects Monitored', value: SUBJECTS.length, color:'text-indigo-600' },
          { label:'Below 75% (Subjects)', value: SUBJECTS.filter(s=>s.pct<75).length, color:'text-rose-600' },
        ].map(kpi => (
          <Card key={kpi.label} className="glass-panel border-none shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{kpi.label}</p>
              <p className={`text-2xl font-black mt-1 ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trend Chart */}
      <Card className="glass-panel border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Class Attendance Trend (Weekly)</CardTitle>
          <CardDescription>III-A overall weekly attendance %</CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceChart data={trendData} type="line" dataKey="value" xKey="label" name="Class Avg %" color="#6366f1" height={220} />
        </CardContent>
      </Card>

      {/* Subject Table */}
      <Card className="glass-panel border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-800 dark:border-slate-800">
          <CardTitle className="text-base">Subject-wise Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full erp-table">
            <thead>
              <tr>
                <th className="text-left">Subject</th>
                <th className="text-left">Faculty</th>
                <th className="text-center">Sessions</th>
                <th className="text-center">Present</th>
                <th className="text-center">Absent</th>
                <th className="text-right">Avg %</th>
              </tr>
            </thead>
            <tbody>
              {SUBJECTS.map((s, i) => (
                <motion.tr key={s.code} initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} transition={{delay:i*0.07}}>
                  <td>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{s.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{s.code}</p>
                  </td>
                  <td className="text-slate-600 dark:text-slate-400">{s.faculty}</td>
                  <td className="text-center text-slate-600 dark:text-slate-400 font-medium">{s.sessions}</td>
                  <td className="text-center text-emerald-600 font-semibold">{s.present}</td>
                  <td className="text-center text-rose-500 font-semibold">{s.absent}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className={`h-full rounded-full ${s.pct>=75?'bg-emerald-500':'bg-rose-500'}`} style={{width:`${s.pct}%`}} />
                      </div>
                      <span className={`font-bold ${s.pct>=75?'text-emerald-600':'text-rose-600'}`}>{s.pct}%</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
