import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/utils/api';
import { toast } from 'react-hot-toast';
import { Users, TrendingUp, AlertTriangle, BookOpen, ChevronRight, Loader2, BarChart4 } from 'lucide-react';
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';

const KPICard = ({ title, value, change, subtitle, icon: Icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="relative p-6 rounded-2xl glass-panel overflow-hidden group card-hover shadow-xl"
  >
    <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" style={{ backgroundColor: color }} />
    
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-[Poppins] font-bold text-white tracking-tight">{value}</h3>
        
        <div className="flex items-center gap-2 mt-3">
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${
            change.startsWith('+') || change === 'Active' 
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
              : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
          }`}>
            <span>{change}</span>
          </div>
          <span className="text-xs text-slate-500">{subtitle}</span>
        </div>
      </div>
      
      <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 shadow-inner" style={{ backgroundColor: `${color}15` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
    </div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel rounded-xl p-3 shadow-xl">
        <p className="text-xs font-semibold text-slate-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
            {p.name}: {p.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/hod');
        setStats(response.data.data);
      } catch (error) {
        toast.error('Failed to load HOD dashboard stats');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Loading department data...</p>
      </div>
    );
  }

  const riskDistribution = stats?.riskDistribution || [];
  const semesterTrend = stats?.semesterTrend || [];
  const facultyPerformance = stats?.facultyPerformance || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 shadow-xl shadow-indigo-500/20"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-[Poppins] font-bold text-white tracking-tight">Department Overview</h1>
            <p className="text-blue-300/80 text-sm mt-1">{stats?.departmentName || 'Computer Science Engineering'}</p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              Generate Report
            </button>
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Students" value={stats?.totalStudents || "1,248"} change="+12" subtitle="from last year" icon={Users} color="#8B5CF6" delay={0.1} />
        <KPICard title="Avg Attendance" value={`${stats?.todaysPercentage || "85.2"}%`} change="-1.2%" subtitle="vs last month" icon={TrendingUp} color="#3B82F6" delay={0.2} />
        <KPICard title="At-Risk Students" value={stats?.defaultersCount || "42"} change="+3" subtitle="new alerts" icon={AlertTriangle} color="#EF4444" delay={0.3} />
        <KPICard title="Total Faculty" value={stats?.totalFaculty || "32"} change="Active" subtitle="members" icon={BookOpen} color="#10B981" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2">
          <div className="h-full p-6 rounded-2xl glass-panel flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-[Poppins] font-semibold text-white">Semester-wise Trend</h3>
                <p className="text-xs text-slate-400 mt-1">Average attendance percentage across all current semesters</p>
              </div>
            </div>
            
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={semesterTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="semester" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }} />
                  <Bar dataKey="attendance" name="Avg Attendance" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                    {semesterTrend.map((entry, index) => (
                      <Cell key={index} fill={entry.attendance >= 80 ? '#3B82F6' : entry.attendance >= 75 ? '#8B5CF6' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Risk Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="h-full p-6 rounded-2xl glass-panel flex flex-col">
            <div>
              <h3 className="font-[Poppins] font-semibold text-white">Risk Distribution</h3>
              <p className="text-xs text-slate-400 mt-1">AI categorized risk levels</p>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center mt-6">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-3 mt-6">
                {riskDistribution.map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: d.color }} />
                      <span className="text-slate-300 font-medium">{d.name}</span>
                    </div>
                    <span className="font-bold text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Faculty Performance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <div className="p-6 rounded-2xl glass-panel">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-[Poppins] font-semibold text-white">Faculty Class Performance</h3>
              <p className="text-xs text-slate-400 mt-1">Based on subject attendance rates</p>
            </div>
            <button className="text-sm text-blue-400 font-medium hover:text-blue-300 flex items-center gap-1 transition-colors">
              View All <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {facultyPerformance.map((fac, i) => (
              <div key={i} className="p-5 rounded-xl border border-white/5 bg-[#0B1120]/50 hover:bg-white/5 transition-colors flex flex-col gap-4">
                <div>
                  <h4 className="font-semibold text-white text-sm">{fac.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{fac.subject}</p>
                </div>
                <div className="flex items-end justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-500 mb-1">Avg Rate</span>
                    <span className={`text-2xl font-[Poppins] font-bold tracking-tight ${
                      fac.status === 'excellent' ? 'text-emerald-400' :
                      fac.status === 'good' ? 'text-blue-400' :
                      'text-rose-400'
                    }`}>
                      {fac.rate}%
                    </span>
                  </div>
                  {fac.status === 'poor' && (
                    <span className="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded uppercase tracking-wider">
                      Review
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default Dashboard;
