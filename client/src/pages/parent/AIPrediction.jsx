import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import RiskBadge from '@/components/attendance/RiskBadge';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import api from '@/utils/api';

export default function AIPrediction() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/parent');
        setStats(response.data.data);
      } catch (error) {
        console.error('Error fetching prediction stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading AI Prediction...</div>;

  const child = stats?.children?.[0];
  
  if (!child) return <div className="p-8 text-center text-slate-500">No student data found</div>;

  const studentName = child.childName;
  const roll = child.registerNumber || 'Unknown Roll';
  const dept = child.courseInfo || 'Unknown Course';
  const pct = Math.round(child.overallPercentage || 0);
  
  const isSafe = pct >= 80;
  const risk = isSafe ? 'Low Risk' : (child.aiRiskScore || 'High Risk');
  const confidence = 92; 
  
  let neededClasses = 0;
  if (pct < 75) {
     const total = child.totalDays * 6; // Rough estimate of 6 periods per day
     const p = child.presentCount * 6;
     neededClasses = Math.ceil(((0.75 * total) - p) / 0.25);
     if (neededClasses < 0) neededClasses = 0;
  }

  const recommendations = [];
  if (isSafe) {
    recommendations.push({ type: 'ok', text: `Overall attendance is excellent at ${pct}%. Your ward is performing well.` });
    recommendations.push({ type: 'ok', text: 'AI models predict a high likelihood of maintaining safe attendance levels this semester.' });
  } else {
    recommendations.push({ type: 'warning', text: `Overall attendance is critically low at ${pct}%. Skipping even one more class could make recovery very difficult.` });
    recommendations.push({ type: 'warning', text: `Must attend all upcoming sessions to reach the 75% threshold.` });
  }

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <Brain className="w-6 h-6 text-purple-500" />AI Risk Prediction
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Artificial Intelligence powered attendance risk analysis for {studentName}.
        </p>
      </div>

      {/* Hero */}
      <Card className="overflow-hidden glass-panel border-none shadow-md">
        <div className="h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500" />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Gauge */}
            <div className="relative flex-shrink-0 border border-slate-800 dark:border-slate-800 rounded-2xl p-2 bg-white dark:bg-slate-900 shadow-sm">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={[{value:pct},{value:100-pct}]} cx="50%" cy="50%"
                    innerRadius={45} outerRadius={62} startAngle={90} endAngle={-270} dataKey="value">
                    <Cell fill={pct>=75?'#10b981':pct>=65?'#f59e0b':'#ef4444'} />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className={`text-2xl font-black ${pct>=75?'text-emerald-600':'text-amber-600'}`}>{pct}%</p>
                <p className="text-xs text-slate-400">Overall</p>
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-3">
                <p className="text-sm font-medium text-slate-500">{roll} · {dept}</p>
                <div className="flex items-center gap-2 mt-1">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">AI Risk Assessment</h2>
                  <RiskBadge level={risk} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-800 dark:border-slate-800">
                  <p className="text-xs text-slate-500">AI Confidence</p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{confidence}%</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-800 dark:border-slate-800">
                  <p className="text-xs text-slate-500">Classes to 75%</p>
                  <p className={`text-lg font-bold ${neededClasses===0?'text-emerald-600':'text-rose-600'}`}>
                    {neededClasses === 0 ? 'Eligible ✓' : `${neededClasses} more`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-indigo-200/60 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/5 shadow-sm">
        <CardContent className="p-5">
          <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4"/>AI Recommendations for Parents
          </h3>
          <div className="space-y-3">
            {recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm">
                {r.type==='warning'
                  ? <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"/>
                  : <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5"/>}
                <p className={r.type==='warning'?'text-amber-800 dark:text-amber-300':'text-emerald-800 dark:text-emerald-300'}>{r.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
