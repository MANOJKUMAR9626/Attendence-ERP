import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CalendarCheck, FileWarning, AlertOctagon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/utils/api';
import { toast } from 'react-hot-toast';

// Mini Sparkline component to mock the "Trend" column
const Sparkline = ({ type }) => {
  const points = {
    high: "M0,10 L10,8 L20,12 L30,5 L40,6", // erratic but staying high-ish, colored red
    medium: "M0,15 L10,12 L20,14 L30,10 L40,11", // mid
    low: "M0,20 L10,22 L20,18 L30,20 L40,19" // low risk (good attendance)
  };
  
  const colors = {
    high: "#ef4444", // rose-500
    medium: "#f59e0b", // amber-500
    low: "#10b981" // emerald-500
  };

  return (
    <svg width="40" height="24" viewBox="0 0 40 24" className="overflow-visible">
      <path
        d={points[type]}
        fill="none"
        stroke={colors[type]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/advisor');
        setStats(response.data.data);
      } catch (error) {
        toast.error('Failed to load dashboard stats');
      }
    };
    fetchStats();
  }, []);

  const totalStudents = stats?.totalStudents || 0;
  const todaysPercentage = stats?.todaysPercentage || 0;
  const defaultersCount = stats?.defaultersCount || 0;
  const criticalStudents = stats?.criticalStudents || 0;
  const atRiskStudents = stats?.atRiskStudents || [];

  return (
    <div className="space-y-6 pb-10">
      
      {/* Top Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Students */}
        <Card className="glass-panel border-none shadow-sm rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold text-slate-500 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">{totalStudents}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-blue-100 dark:border-blue-500/20 text-blue-500">
              <Users size={20} />
            </div>
          </CardContent>
        </Card>

        {/* Average Attendance */}
        <Card className="glass-panel border-none shadow-sm rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold text-slate-500 mb-1">Average Attendance</p>
              <p className="text-3xl font-bold text-emerald-500">{todaysPercentage}%</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-emerald-100 dark:border-emerald-500/20 text-emerald-500">
              <CalendarCheck size={20} />
            </div>
          </CardContent>
        </Card>

        {/* At Risk Students */}
        <Card className="glass-panel border-none shadow-sm rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold text-slate-500 mb-1">At Risk Students</p>
              <p className="text-3xl font-bold text-rose-500">{defaultersCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-rose-100 dark:border-rose-500/20 text-rose-500">
              <FileWarning size={20} />
            </div>
          </CardContent>
        </Card>

        {/* Critical Students */}
        <Card className="glass-panel border-none shadow-sm rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold text-slate-500 mb-1">Critical Students</p>
              <p className="text-3xl font-bold text-rose-500">{criticalStudents}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-rose-100 dark:border-rose-500/20 text-rose-500">
              <AlertOctagon size={20} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-panel border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-slate-800 dark:border-slate-800/50">
            <CardTitle className="text-[15px] font-bold text-slate-800 dark:text-white">Students at Risk</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-xl">Student</th>
                    <th className="px-6 py-4 text-center">Attendance</th>
                    <th className="px-6 py-4 text-center">Risk</th>
                    <th className="px-6 py-4 text-center">Trend</th>
                    <th className="px-6 py-4 text-center">Recommendation</th>
                    <th className="px-6 py-4 text-center rounded-tr-xl">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {atRiskStudents.map((s, index) => (
                    <tr key={index} className="border-b border-slate-800 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{s.name}</td>
                      <td className="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-400">{s.pct}</td>
                      <td className={`px-6 py-4 text-center font-bold ${s.riskColor}`}>{s.risk}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <Sparkline type={s.trend} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-xs text-slate-500">{s.rec}</td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-xs font-bold text-blue-600 hover:underline">View</button>
                      </td>
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
};

export default Dashboard;
