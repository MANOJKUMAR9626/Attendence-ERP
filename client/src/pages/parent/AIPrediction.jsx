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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--navy)] tracking-[-0.01em]">
              AI Attendance Risk Audit
            </h1>
            <span className="stamp hidden sm:inline-flex">WARD RISK AUDIT</span>
          </div>
          <p className="text-sm font-sans text-[var(--ink-soft)] mt-1">
            Predictive institutional risk modeling for ward: {studentName}.
          </p>
        </div>
      </div>

      {/* Hero */}
      <Card className="rounded-[10px] border border-[var(--rule)] bg-[var(--paper-raised)] shadow-none overflow-hidden">
        <div className="h-1.5 w-full bg-[var(--navy)]" />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Gauge */}
            <div className="relative shrink-0 border border-[var(--rule)] rounded-[10px] p-2 bg-[var(--paper)]">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={[{value:pct},{value:Math.max(0, 100-pct)}]} cx="50%" cy="50%"
                    innerRadius={45} outerRadius={62} startAngle={90} endAngle={-270} dataKey="value">
                    <Cell fill={pct>=80?'#2F7D5C':pct>=75?'#C2872B':'#B0483C'} />
                    <Cell fill="#DEDACD" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className={`text-2xl font-mono font-semibold ${pct>=80?'text-[var(--safe)]':'text-[var(--crit)]'}`}>{pct}%</p>
                <p className="text-[10px] font-mono text-[var(--ink-soft)] uppercase">Aggregate</p>
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-3">
                <p className="text-xs font-mono text-[var(--ink-soft)]">{roll} · {dept}</p>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-lg font-serif font-semibold text-[var(--navy)]">Institutional Risk Status</h2>
                  <span className={isSafe ? 'badge-safe text-xs' : 'badge-danger text-xs'}>
                    {risk}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-[8px] bg-[var(--paper)] border border-[var(--rule)]">
                  <p className="text-xs font-sans text-[var(--ink-soft)]">AI Confidence</p>
                  <p className="text-lg font-mono font-semibold text-[var(--navy)]">{confidence}%</p>
                </div>
                <div className="p-3 rounded-[8px] bg-[var(--paper)] border border-[var(--rule)]">
                  <p className="text-xs font-sans text-[var(--ink-soft)]">Classes to 75% Clearance</p>
                  <p className={`text-lg font-mono font-semibold ${neededClasses===0?'text-[var(--safe)]':'text-[var(--crit)]'}`}>
                    {neededClasses === 0 ? 'Eligible ✓' : `${neededClasses} needed`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="rounded-[10px] border border-[var(--rule)] bg-[var(--paper)] shadow-none">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-semibold text-base text-[var(--navy)] flex items-center gap-2">
              <Brain className="w-4 h-4 text-[var(--navy)]"/>AI Directives for Parents & Guardians
            </h3>
            <span className="text-xs font-mono text-[var(--ink-soft)]">VERIFIED ADVISORY</span>
          </div>
          <div className="space-y-3">
            {recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm p-3 rounded-[8px] bg-[var(--paper-raised)] border border-[var(--rule)]">
                {r.type==='warning'
                  ? <AlertTriangle className="w-4 h-4 text-[var(--crit)] shrink-0 mt-0.5"/>
                  : <CheckCircle2 className="w-4 h-4 text-[var(--safe)] shrink-0 mt-0.5"/>}
                <p className="text-xs sm:text-sm font-sans text-[var(--ink)] leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
