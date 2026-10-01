import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Trophy, ChevronRight, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';

const MARKS_DATA = [
  { subject: 'Data Structures', code: 'CS301', ca1: 18, ca2: 19, assignment: 9, attendance: 5, total: 51, max: 60, status: 'excellent' },
  { subject: 'Algorithms', code: 'CS302', ca1: 15, ca2: 14, assignment: 8, attendance: 4, total: 41, max: 60, status: 'good' },
  { subject: 'Database Sys', code: 'CS303', ca1: 17, ca2: 18, assignment: 9, attendance: 5, total: 49, max: 60, status: 'excellent' },
  { subject: 'Computer Net', code: 'CS304', ca1: 12, ca2: 11, assignment: 7, attendance: 3, total: 33, max: 60, status: 'warning' },
  { subject: 'Web Tech Lab', code: 'CS305L', ca1: 19, ca2: 20, assignment: 10, attendance: 5, total: 54, max: 60, status: 'excellent' },
];

const OVERALL_STATS = {
  totalSecured: 228,
  totalMax: 300,
  percentage: 76,
  gpa: 8.2,
  rank: 12
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-800 dark:border-slate-700 rounded-xl p-3 shadow-xl min-w-[150px]">
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex justify-between items-center text-sm mb-1">
            <span className="text-slate-500 dark:text-slate-400 capitalize">{p.name}:</span>
            <span className="font-semibold" style={{ color: p.color }}>{p.value}</span>
          </div>
        ))}
        <div className="mt-2 pt-2 border-t border-slate-800 dark:border-slate-800 flex justify-between items-center text-sm font-bold">
          <span>Total:</span>
          <span className="text-slate-900 dark:text-white">
            {payload.reduce((sum, p) => sum + p.value, 0)} / 60
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const InternalMarks = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto page-enter">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-500" />
            Internal Marks Assessment
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Semester 5 - Continuous Evaluation Results.</p>
        </div>
        <Button variant="outline" className="bg-white dark:bg-slate-950">
          <Download className="w-4 h-4 mr-2" /> Download Scorecard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-indigo-600 border-none text-white shadow-lg shadow-indigo-500/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Overall Score</p>
                <p className="text-3xl font-bold mt-1 tracking-tight">{OVERALL_STATS.totalSecured} <span className="text-lg font-normal opacity-70">/ {OVERALL_STATS.totalMax}</span></p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span>{OVERALL_STATS.percentage}%</span>
                <span>Target: 80%</span>
              </div>
              <Progress value={OVERALL_STATS.percentage} className="h-1.5 bg-white/20" indicatorClassName="bg-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Predicted GPA</p>
            <p className="text-3xl font-bold mt-1 tracking-tight text-slate-900 dark:text-white">{OVERALL_STATS.gpa}</p>
            <p className="text-xs text-emerald-500 mt-2 font-semibold">+0.2 from last sem</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Class Rank</p>
            <p className="text-3xl font-bold mt-1 tracking-tight text-slate-900 dark:text-white">#{OVERALL_STATS.rank}</p>
            <p className="text-xs text-slate-500 mt-2 font-medium">Out of 60 students</p>
          </CardContent>
        </Card>
        
        <Card className="glass-panel border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Subjects Cleared</p>
            <p className="text-3xl font-bold mt-1 tracking-tight text-slate-900 dark:text-white">5 <span className="text-lg font-normal text-slate-400">/ 5</span></p>
            <p className="text-xs text-slate-500 mt-2 font-medium">All internals passed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart */}
        <Card className="col-span-1 lg:col-span-2 glass-panel border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Marks Distribution</CardTitle>
            <CardDescription>Subject-wise breakdown of CA1, CA2, Assignments, and Attendance marks.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={MARKS_DATA} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="subject" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 60]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />
                <ReferenceLine y={24} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Pass Min (24)', fill: '#ef4444', fontSize: 10 }} />
                
                <Bar dataKey="ca1" name="CA 1" stackId="a" fill="#818cf8" radius={[0, 0, 4, 4]} maxBarSize={40} />
                <Bar dataKey="ca2" name="CA 2" stackId="a" fill="#6366f1" maxBarSize={40} />
                <Bar dataKey="assignment" name="Assignment" stackId="a" fill="#4f46e5" maxBarSize={40} />
                <Bar dataKey="attendance" name="Attendance" stackId="a" fill="#3730a3" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Breakdown */}
        <Card className="col-span-1 glass-panel border-none shadow-sm flex flex-col h-[400px]">
          <CardHeader className="pb-2 shrink-0">
            <CardTitle className="text-lg">Detailed Breakdown</CardTitle>
            <CardDescription>Select a subject for full details.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
            <div className="space-y-3">
              {MARKS_DATA.map((subject, index) => (
                <div key={index} className="p-3 rounded-xl border border-slate-800 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{subject.subject}</h4>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{subject.code}</p>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-xs font-bold ${
                      subject.status === 'excellent' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                      subject.status === 'good' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                    }`}>
                      {subject.total}/60
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-white dark:bg-slate-950 border border-slate-800 dark:border-slate-800 rounded py-1">
                      <p className="text-slate-400 text-[10px] mb-0.5">CA1</p>
                      <p className="font-medium">{subject.ca1}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-950 border border-slate-800 dark:border-slate-800 rounded py-1">
                      <p className="text-slate-400 text-[10px] mb-0.5">CA2</p>
                      <p className="font-medium">{subject.ca2}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-950 border border-slate-800 dark:border-slate-800 rounded py-1">
                      <p className="text-slate-400 text-[10px] mb-0.5">ASSGN</p>
                      <p className="font-medium">{subject.assignment}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-950 border border-slate-800 dark:border-slate-800 rounded py-1">
                      <p className="text-slate-400 text-[10px] mb-0.5">ATTND</p>
                      <p className="font-medium">{subject.attendance}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default InternalMarks;
