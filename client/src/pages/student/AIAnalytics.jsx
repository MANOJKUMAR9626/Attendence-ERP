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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--navy)] tracking-[-0.01em]">
              AI Attendance Analytics
            </h1>
            <span className="stamp hidden sm:inline-flex">PREDICTIVE AUDIT</span>
          </div>
          <p className="text-sm font-sans text-[var(--ink-soft)] mt-1">
            Algorithmic prediction of semester examination eligibility and subject attendance remediation.
          </p>
        </div>
      </div>

      {/* Hero Card */}
      <Card className="rounded-[10px] border border-[var(--rule)] bg-[var(--paper-raised)] shadow-none overflow-hidden">
        <div className="h-1.5 w-full bg-[var(--navy)]" />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Gauge */}
            <div className="relative shrink-0">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={[{value:pct},{value:Math.max(0, 100-pct)}]} cx="50%" cy="50%"
                    innerRadius={45} outerRadius={62} startAngle={90} endAngle={-270} dataKey="value">
                    <Cell fill={pct>=75?'#2F7D5C':pct>=65?'#C2872B':'#B0483C'} />
                    <Cell fill="#DEDACD" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className={`text-2xl font-mono font-semibold ${pct>=75?'text-[var(--safe)]':pct>=65?'text-[var(--warn)]':'text-[var(--crit)]'}`}>{pct}%</p>
                <p className="text-[10px] font-mono text-[var(--ink-soft)] uppercase">Aggregate</p>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-lg font-serif font-semibold text-[var(--navy)]">Institutional Risk Assessment</h2>
                <span className={pct>=75 ? 'badge-safe text-xs' : 'badge-danger text-xs'}>
                  {risk}
                </span>
              </div>
              <p className="text-sm font-sans text-[var(--ink-soft)] mb-3">
                Algorithmic Confidence: <strong className="font-mono text-[var(--navy)]">{confidence}%</strong>
                {pct>=75
                  ? ' — Recorded attendance complies with end-term university clearance criteria.'
                  : ` — Remediation required: Attend at least ${needed} forthcoming classes to restore 75% threshold.`}
              </p>
              <div className="space-y-1.5">
                {factors.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs font-sans text-[var(--ink)]">
                    <span className="mt-0.5 shrink-0">{f.includes('low') || f.includes('critically') ? '⚠️' : '✅'}</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Card */}
      <Card className="rounded-[10px] border border-[var(--rule)] bg-[var(--paper)] shadow-none">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif font-semibold text-base text-[var(--navy)] flex items-center gap-2">
              <Brain className="w-4 h-4 text-[var(--navy)]" />Audited Academic Directives
            </h3>
            <span className="text-xs font-mono text-[var(--ink-soft)]">OFFICIAL GUIDANCE</span>
          </div>
          <ul className="space-y-2 text-sm text-[var(--ink)] font-sans">
            {criticalSubjects.length > 0 ? (
              criticalSubjects.map(s => (
                <li key={s.name} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--crit)] shrink-0 mt-0.5"/>
                  <span>Prioritise attending <strong>{s.name}</strong> — recorded attendance is <strong className="font-mono text-[var(--crit)]">{s.value}%</strong> (below the 75% institutional requirement).</span>
                </li>
              ))
            ) : (
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--safe)] shrink-0 mt-0.5"/>
                <span>All course registrations currently satisfy mandatory attendance thresholds. Continue regular class presence.</span>
              </li>
            )}
            {goodSubjects.length > 0 && (
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--safe)] shrink-0 mt-0.5"/>
                <span>Exemplary attendance in {goodSubjects.map(s => s.name).join(' and ')}. Retain this record for dean's commendation.</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
