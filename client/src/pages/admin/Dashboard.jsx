import { useState, useEffect } from 'react';
import { Users, Building2, GraduationCap, BarChart4, TrendingUp, AlertCircle, ArrowUpRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../../utils/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StatCard = ({ title, value, icon, color, trend, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative p-6 rounded-2xl bg-[#111827] border border-white/5 hover:border-white/10 overflow-hidden group card-hover shadow-lg shadow-black/20"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150`} style={{ backgroundColor: color }} />
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-[Poppins] font-bold text-white tracking-tight">{value}</h3>
          
          {trend && (
            <div className="flex items-center gap-1 mt-3 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full w-fit border border-emerald-500/20">
              <TrendingUp className="w-3 h-3" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 shadow-inner" style={{ backgroundColor: `${color}15` }}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/admin');
        setStats(response.data.data);
      } catch (err) {
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Loading intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <span className="font-medium">{error}</span>
      </div>
    );
  }

  // Premium Dark Chart Options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9CA3AF', font: { family: 'Inter', size: 12 } }
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#F3F4F6',
        bodyColor: '#D1D5DB',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' }, beginAtZero: true }
    }
  };

  const doughnutOptions = {
    ...chartOptions,
    scales: undefined, // Remove scales for doughnut
    cutout: '75%',
  };

  const barData = {
    labels: ['CSE', 'ECE', 'MECH', 'CIVIL', 'IT', 'EEE'],
    datasets: [
      {
        label: 'Average Attendance %',
        data: [85, 78, 82, 75, 88, 79],
        backgroundColor: '#3B82F6',
        borderRadius: 6,
        barThickness: 24,
      },
    ],
  };

  const doughnutData = {
    labels: ['Present', 'Absent', 'On Leave'],
    datasets: [
      {
        data: [75, 15, 10],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-[Poppins] font-bold text-white tracking-tight">Enterprise Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time metrics across all departments</p>
        </div>
        
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all flex items-center gap-2">
          Generate Report <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats ? stats.totalUsers.toLocaleString() : "1,248"} 
          icon={<Users className="w-6 h-6 text-blue-500" />} 
          color="#3B82F6" 
          trend="+12% this month"
          delay={0.1} 
        />
        <StatCard 
          title="Departments" 
          value={stats?.totalDepartments || "8"} 
          icon={<Building2 className="w-6 h-6 text-purple-500" />} 
          color="#8B5CF6"
          delay={0.2} 
        />
        <StatCard 
          title="High Risk Students" 
          value={stats?.highRiskStudents !== undefined ? stats.highRiskStudents : "42"} 
          icon={<AlertCircle className="w-6 h-6 text-rose-500" />} 
          color="#F43F5E" 
          trend="Needs Attention"
          delay={0.3} 
        />
        <StatCard 
          title="Avg. Attendance" 
          value={stats ? `${stats.todaysPercentage}%` : '86.4%'} 
          icon={<BarChart4 className="w-6 h-6 text-yellow-500" />} 
          color="#F59E0B" 
          trend="-2.1% today"
          delay={0.4} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-[#111827] border border-white/5 shadow-xl shadow-black/20 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-[Poppins] font-semibold text-white">Department Performance</h3>
            <select className="bg-[#0B1120] border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-blue-500">
              <option>This Week</option>
              <option>This Month</option>
              <option>Semester</option>
            </select>
          </div>
          <div className="h-[300px] w-full mt-auto">
            <Bar data={barData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.6 }}
          className="lg:col-span-1 p-6 rounded-2xl bg-[#111827] border border-white/5 shadow-xl shadow-black/20 flex flex-col"
        >
          <h3 className="font-[Poppins] font-semibold text-white mb-6">Today's Distribution</h3>
          <div className="h-[250px] w-full relative flex items-center justify-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-[Poppins] font-bold text-white">86%</span>
              <span className="text-xs text-slate-400">Present</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            {[
              { label: 'Present', value: '75%', color: 'bg-emerald-500' },
              { label: 'Absent', value: '15%', color: 'bg-rose-500' },
              { label: 'On Leave', value: '10%', color: 'bg-yellow-500' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-slate-400">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AdminDashboard;
