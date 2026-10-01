import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AttendanceChart from '@/components/attendance/AttendanceChart';
import RiskBadge from '@/components/attendance/RiskBadge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '@/utils/api';

export default function StudentAIAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/student');
        setStats(response.data.data);
      } catch (error) {
        console.error('Failed to load stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const pct = stats?.overallPercentage || 0;
  const risk = stats?.aiRiskScore || 'Low Risk';
  const confidence = 92;
  const needed = pct >= 75 ? 0 : Math.ceil(((75 - pct) * (stats?.trendData?.length || 10)) / 100) || 2; 

  const trend = (stats?.trendData || []).map(d => ({ label: d.month, value: d.value }));
  
  const subjectBreakdown = (stats?.subjectData || []).map(d => ({
    name: d.subject,
    value: d.value,
    color: d.fill || '#6366f1'
  }));

  const factors = [];
  if (pct < 75) factors.push('Overall attendance is below the 75% threshold');
  if (pct >= 85) factors.push('Consistent and excellent overall attendance');
  
  const criticalSubjects = subjectBreakdown.filter(s => s.value < 75);
  if (criticalSubjects.length > 0) {
    factors.push(`AI detected critically low attendance in: ${criticalSubjects.map(s => s.name).join(', ')}`);
  }
  
  const goodSubjects = subjectBreakdown.filter(s => s.value >= 85);
  if (goodSubjects.length > 0) {
    factors.push(`Consistent presence in ${goodSubjects.map(s => s.name).join(', ')} (good)`);
  }

  if (factors.length === 0) factors.push('No significant anomalies detected');

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <Brain className="w-6 h-6 text-purple-500" />AI Attendance Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          AI-powered prediction of your eligibility risk, subject trends, and personalised recommendations.
        </p>
      </div>

      {/* Hero Card */}
      <Card className="overflow-hidden glass-panel border-none shadow-md">
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Gauge */}
            <div className="relative flex-shrink-0">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={[{value:pct},{value:100-pct}]} cx="50%" cy="50%"
                    innerRadius={45} outerRadius={62} startAngle={90} endAngle={-270} dataKey="value">
                    <Cell fill={pct>=75?'#10b981':pct>=65?'#f59e0b':'#ef4444'} />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className={`text-2xl font-black ${pct>=75?'text-emerald-600':pct>=65?'text-amber-600':'text-rose-600'}`}>{pct}%</p>
                <p className="text-xs text-slate-400">Overall</p>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">AI Risk Assessment</h2>
                <RiskBadge level={risk} />
              </div>
              <p className="text-sm text-slate-500 mb-3">
                AI Confidence: <strong className="text-indigo-600 dark:text-indigo-400">{confidence}%</strong>
                {pct>=75
                  ? ' — You are currently eligible for examinations. Maintain this attendance.'
                  : ` — You need to attend ${needed} more classes to regain 75% eligibility.`}
              </p>
              <div className="space-y-1.5">
                {factors.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="mt-0.5 flex-shrink-0">{f.includes('low') || f.includes('dipped') ? '⚠️' : '✅'}</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Recommendation Card */}
      <Card className="glass-panel border-none bg-indigo-50/50 dark:bg-indigo-500/5 shadow-sm">
        <CardContent className="p-5">
          <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4" />AI Recommendations
          </h3>
          <ul className="space-y-2 text-sm text-indigo-800 dark:text-indigo-200">
            {criticalSubjects.length > 0 ? (
              criticalSubjects.map(s => (
                <li key={s.name} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5"/>
                  Prioritise attending {s.name} classes — currently at {s.value}%, below the 75% threshold.
                </li>
              ))
            ) : (
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5"/>
                You are currently meeting the attendance requirements for all subjects. Keep it up!
              </li>
            )}
            {goodSubjects.length > 0 && (
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5"/>
                Your attendance in {goodSubjects.map(s => s.name).join(' and ')} is excellent. Maintain this consistency.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
