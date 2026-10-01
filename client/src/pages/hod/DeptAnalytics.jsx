import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, TrendingDown, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AttendanceChart from '@/components/attendance/AttendanceChart';
import RiskBadge from '@/components/attendance/RiskBadge';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip as RechartTooltip
} from 'recharts';

const monthlyTrend = [
  { label:'Jun', value:88 }, { label:'Jul', value:83 }, { label:'Aug', value:79 },
  { label:'Sep', value:85 }, { label:'Oct', value:81 }, { label:'Nov', value:76 },
];

const subjectData = [
  { label:'OS', value:82 }, { label:'DBMS', value:74 }, { label:'CN', value:88 },
  { label:'SE', value:91 }, { label:'AI', value:68 }, { label:'ML', value:77 },
];

const riskPie = [
  { name:'Low Risk',    value:12, color:'#10b981' },
  { name:'Medium Risk', value:8,  color:'#f59e0b' },
  { name:'High Risk',   value:5,  color:'#f97316' },
  { name:'Critical',    value:3,  color:'#ef4444' },
];

const STATS = [
  { label:'Dept Avg Attendance', value:'81.2%', trend:'+2.3%', up:true },
  { label:'Below 75% Threshold', value:'8 students', trend:'-3 vs last month', up:true },
  { label:'Best Subject',        value:'SE – 91%', trend:'Software Engineering', up:true },
  { label:'Weakest Subject',     value:'AI – 68%', trend:'Needs attention', up:false },
];

export default function DeptAnalytics() {
  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <BarChart2 className="w-6 h-6 text-indigo-500" />Department Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Comprehensive attendance analytics for your department. All data refreshes every 30 minutes.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:i*0.08}}>
            <Card className="glass-panel border-none shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="text-xl font-bold mt-1 text-slate-800 dark:text-slate-100">{s.value}</p>
                <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${s.up ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {s.trend}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <Card className="lg:col-span-2 glass-panel border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4 text-indigo-500"/>Monthly Attendance Trend</CardTitle>
            <CardDescription>Department overall attendance % by month</CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceChart data={monthlyTrend} type="line" dataKey="value" xKey="label"
              name="Dept Avg %" color="#6366f1" height={240} />
          </CardContent>
        </Card>

        {/* AI Risk Distribution Pie */}
        <Card className="glass-panel border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">AI Risk Distribution</CardTitle>
            <CardDescription>Students by AI predicted risk level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={riskPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={3}>
                  {riskPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <RechartTooltip formatter={(v, name) => [`${v} students`, name]} />
                <Legend wrapperStyle={{ fontSize:'11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subject-wise Bar */}
      <Card className="glass-panel border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-4 h-4 text-emerald-500"/>Subject-wise Attendance (%)</CardTitle>
          <CardDescription>Average attendance per subject across all sections</CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceChart data={subjectData} type="bar" dataKey="value" xKey="label"
            name="Avg Attendance %" color="#6366f1" height={240} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {subjectData.map(s => (
              <div key={s.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-800 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{s.label}</span>
                <span className={`text-sm font-bold ${s.value>=75?'text-emerald-600':'text-rose-500'}`}>{s.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
