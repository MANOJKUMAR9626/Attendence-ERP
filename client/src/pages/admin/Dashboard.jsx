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
      className="p-5 rounded-none bg-[var(--paper-raised)] border border-[var(--rule)] shadow-none flex flex-col justify-between"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--ink-soft)] mb-1">{title}</p>
          <h3 className="text-3xl font-mono font-bold text-[var(--navy)] tracking-tight">{value}</h3>
          
          {trend && (
            <div className="flex items-center gap-1 mt-3 text-xs font-mono font-semibold text-[var(--safe)] bg-[var(--safe-bg)] px-2.5 py-0.5 rounded-none w-fit border border-[var(--safe)]/20">
              <TrendingUp className="w-3 h-3" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        
        <div className="w-10 h-10 rounded-none flex items-center justify-center border border-[var(--rule)] bg-[var(--paper)] text-[var(--navy)]">
          {icon}
        </div>
      </div>
      <div className="w-full bg-[var(--track)] h-[6px] rounded-none border border-[var(--rule)]/20 overflow-hidden mt-4">
        <div className="bg-[var(--navy)] h-full rounded-none" style={{ width: '80%' }} />
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
        <Loader2 className="w-8 h-8 text-[var(--navy)] animate-spin" />
        <p className="text-[var(--ink-soft)] font-mono text-sm animate-pulse">Loading institutional records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-[10px] bg-[var(--crit-bg)] border border-[var(--crit)]/20 text-[var(--crit)] flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <span className="font-mono text-xs font-semibold">{error}</span>
      </div>
    );
  }

  // Academic Ledger Chart Options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#5B6376', font: { family: 'IBM Plex Mono', size: 12 } }
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#1B2A4A',
        bodyColor: '#1D2333',
        borderColor: '#DEDACD',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
      }
    },
    scales: {
      x: { grid: { color: 'rgba(222, 218, 205, 0.5)' }, ticks: { color: '#5B6376', font: { family: 'IBM Plex Mono' } } },
      y: { grid: { color: 'rgba(222, 218, 205, 0.5)' }, ticks: { color: '#5B6376', font: { family: 'IBM Plex Mono' } }, beginAtZero: true }
    }
  };

  const doughnutOptions = {
    ...chartOptions,
    scales: undefined,
    cutout: '75%',
  };

  const barData = {
    labels: ['CSE', 'ECE', 'MECH', 'CIVIL', 'IT', 'EEE'],
    datasets: [
      {
        label: 'Average Attendance %',
        data: [85, 78, 82, 75, 88, 79],
        backgroundColor: '#1B2A4A',
        borderRadius: 4,
        barThickness: 24,
      },
    ],
  };

  const doughnutData = {
    labels: ['Present', 'Absent', 'On Leave'],
    datasets: [
      {
        data: [75, 15, 10],
        backgroundColor: ['#2F7D5C', '#B0483C', '#C2872B'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--navy)] tracking-tight">Enterprise Overview</h1>
          </div>
          <p className="text-[var(--ink-soft)] text-sm mt-1">Real-time attendance ledgers across academic departments</p>
        </div>
        
        <button className="btn-navy text-sm px-4 py-2 flex items-center gap-2">
          Generate Ledger Report <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Total Users" 
          value={stats ? stats.totalUsers.toLocaleString() : "1,248"} 
          icon={<Users className="w-5 h-5 text-[var(--navy)]" />} 
          color="#1B2A4A" 
          trend="+12% this month"
          delay={0.1} 
        />
        <StatCard 
          title="Departments" 
          value={stats?.totalDepartments || "8"} 
          icon={<Building2 className="w-5 h-5 text-[var(--navy)]" />} 
          color="#1B2A4A"
          delay={0.2} 
        />
        <StatCard 
          title="High Risk Students" 
          value={stats?.highRiskStudents !== undefined ? stats.highRiskStudents : "42"} 
          icon={<AlertCircle className="w-5 h-5 text-[var(--crit)]" />} 
          color="#B0483C" 
          trend="Needs Attention"
          delay={0.3} 
        />
        <StatCard 
          title="Avg. Attendance" 
          value={stats ? `${stats.todaysPercentage}%` : '86.4%'} 
          icon={<BarChart4 className="w-5 h-5 text-[var(--warn)]" />} 
          color="#C2872B" 
          trend="-2.1% today"
          delay={0.4} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2 p-6 rounded-[10px] bg-[var(--paper-raised)] border border-[var(--rule)] shadow-none flex flex-col"
        >
          <div className="flex justify-between items-center mb-6 border-b border-[var(--rule)] pb-3">
            <h3 className="font-serif font-bold text-base text-[var(--navy)]">Department Performance</h3>
            <select className="bg-[var(--paper)] border border-[var(--rule)] text-[var(--ink)] font-mono text-xs rounded-[7px] px-3 py-1.5 outline-none">
              <option>Current Week</option>
              <option>Current Month</option>
              <option>Full Semester</option>
            </select>
          </div>
          <div className="h-[280px] w-full mt-auto">
            <Bar data={barData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.6 }}
          className="lg:col-span-1 p-6 rounded-[10px] bg-[var(--paper-raised)] border border-[var(--rule)] shadow-none flex flex-col"
        >
          <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3 mb-4">
            <h3 className="font-serif font-bold text-base text-[var(--navy)]">Today's Distribution</h3>
          </div>
          <div className="h-[220px] w-full relative flex items-center justify-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-mono font-bold text-[var(--navy)]">86%</span>
              <span className="text-xs font-mono uppercase text-[var(--ink-soft)]">Present</span>
            </div>
          </div>
          
          <div className="mt-5 space-y-2.5">
            {[
              { label: 'Present', value: '75%', color: 'bg-[var(--safe)]' },
              { label: 'Absent', value: '15%', color: 'bg-[var(--crit)]' },
              { label: 'On Leave', value: '10%', color: 'bg-[var(--warn)]' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-[6px] bg-[var(--paper)]">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-xs font-medium text-[var(--ink)]">{item.label}</span>
                </div>
                <span className="text-xs font-mono font-bold text-[var(--navy)]">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AdminDashboard;
