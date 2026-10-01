import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, AlertOctagon, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/utils/api';

export default function FacultyAIAnalytics() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/faculty/students');
        if (res.data.success) {
          setStudents(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const getRiskStats = (studentList) => {
    let low = 0, medium = 0, high = 0, critical = 0;
    const allPredictions = [];

    studentList.forEach(s => {
      const pct = s.attendanceSummary?.overallPercentage ?? 100;
      let risk = 'Low';
      let conf = Math.floor(Math.random() * (95 - 65 + 1) + 65) + '%';
      let rec = 'Good! Keep it up';
      let riskColor = 'text-emerald-500';

      if (pct < 65) {
        critical++;
        risk = 'Critical';
        rec = 'Mandatory counseling required';
        riskColor = 'text-rose-600';
      } else if (pct < 75) {
        high++;
        risk = 'High';
        rec = 'Attend more classes immediately';
        riskColor = 'text-rose-500';
      } else if (pct < 85) {
        medium++;
        risk = 'Medium';
        rec = 'Improve attendance';
        riskColor = 'text-amber-500';
      } else {
        low++;
      }

      if (risk !== 'Low') {
         allPredictions.push({
           id: s.registerNumber || '-',
           name: s.user?.name || s.registerNumber || 'Unknown',
           pct: `${Math.round(pct)}%`,
           risk,
           conf,
           rec,
           riskColor
         });
      }
    });

    allPredictions.sort((a, b) => parseInt(a.pct) - parseInt(b.pct));

    return {
      metrics: [
        { label: 'Low Risk', value: low.toString(), icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Medium Risk', value: medium.toString(), icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'High Risk', value: high.toString(), icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { label: 'Critical', value: critical.toString(), icon: AlertOctagon, color: 'text-rose-600', bg: 'bg-rose-600/10' },
      ],
      predictions: allPredictions
    };
  };

  const { metrics, predictions } = getRiskStats(students);

  return (
    <div className="space-y-6 pb-10 max-w-7xl mx-auto page-enter">
      
      {/* Header section matching mockup exactly */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          AI Attendance Risk Prediction
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          AI identifies students who may be at risk in the future.
        </p>
      </motion.div>

      {/* 4 Top Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-8">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : metrics.map((m, i) => (
          <Card key={i} className="glass-panel border-none shadow-sm rounded-2xl">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${m.bg} ${m.color}`}>
                <m.icon size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{m.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{m.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-panel border-none shadow-sm rounded-3xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-900/50">
                  <tr>
                    <th className="w-[20%] px-6 py-4 rounded-tl-xl border-b border-slate-800 dark:border-slate-800">Student</th>
                    <th className="w-[15%] px-6 py-4 border-b border-slate-800 dark:border-slate-800 text-left">Student ID</th>
                    <th className="w-[15%] px-6 py-4 text-center border-b border-slate-800 dark:border-slate-800">Attendance</th>
                    <th className="w-[50%] px-6 py-4 text-left rounded-tr-xl border-b border-slate-800 dark:border-slate-800">Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.length === 0 && !loading && (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                        No at-risk students found! Everyone is doing great.
                      </td>
                    </tr>
                  )}
                  {predictions.map((s, index) => (
                    <tr key={index} className="border-b border-slate-800 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{s.name}</td>
                      <td className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">{s.id}</td>
                      <td className="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-400">{s.pct}</td>
                      <td className="px-6 py-4 text-left text-[13px] font-bold text-slate-700 dark:text-slate-300">{s.rec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
}
