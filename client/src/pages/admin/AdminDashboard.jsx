import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Loader2, ChevronDown, CheckCircle2, Sparkles, FileText, BellRing, X, User, Users, GraduationCap, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '@/utils/api';
import toast from 'react-hot-toast';

// ─── Mock Data ─────────────────────────────────────────────────────────────
// Risk data is now dynamically calculated inside the component

const recentAtRisk = [
  { id: 1, name: 'Karthik R', dept: 'CSE', attendance: '76%', risk: 'High', color: 'text-rose-500', bg: 'bg-rose-100', pillText: 'text-rose-600' },
  { id: 2, name: 'Priya Dharshini', dept: 'CSE', attendance: '78%', risk: 'High', color: 'text-rose-500', bg: 'bg-rose-100', pillText: 'text-rose-600' },
  { id: 3, name: 'Vignesh A', dept: 'ECE', attendance: '79%', risk: 'High', color: 'text-rose-500', bg: 'bg-rose-100', pillText: 'text-rose-600' },
  { id: 4, name: 'Deepa M', dept: 'EEE', attendance: '74%', risk: 'Critical', color: 'text-rose-500', bg: 'bg-rose-600', pillText: 'text-white' },
  { id: 5, name: 'Arun Kumar', dept: 'Mech', attendance: '76%', risk: 'High', color: 'text-rose-500', bg: 'bg-rose-100', pillText: 'text-rose-600' },
];

// Recent activities are now dynamically fetched from the ActivityLog in the backend

// ─── Admin Dashboard ─────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudentForAI, setSelectedStudentForAI] = useState(null);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [allActivities, setAllActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const fetchAllActivities = async () => {
    try {
      setLoadingActivities(true);
      const res = await api.get('/admin/activities?limit=50');
      if (res.data.success) {
        setAllActivities(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch activities');
    } finally {
      setLoadingActivities(false);
    }
  };

  const openActivitiesModal = () => {
    setShowActivitiesModal(true);
    if (allActivities.length === 0) {
      fetchAllActivities();
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        if (response.data.success) {
          const { totalStudents, totalFaculty, todaysPercentage, highRiskStudents, recentAtRiskStudents, recentActivities, attendanceTrend, riskDistribution } = response.data.data;
          setStats({
            totalStudents: totalStudents || 0,
            studentChange: 0, // No historical data yet
            totalFaculty: totalFaculty || 0,
            facultyChange: 0,
            todaysAttendance: todaysPercentage || 0,
            attendanceChange: 0,
            atRiskStudents: highRiskStudents || 0,
            riskDistribution: riskDistribution || { Low: 0, Medium: 0, High: 0, Critical: 0 },
            riskChange: 0,
            recentAtRiskStudents: recentAtRiskStudents || [],
            recentActivities: recentActivities || [],
            attendanceTrend: attendanceTrend || []
          });
        }
      } catch (error) {
        toast.error('Failed to load dashboard statistics');
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const total = stats?.totalStudents || 0;
  
  const lowRisk = stats?.riskDistribution?.Low || 0;
  const mediumRisk = stats?.riskDistribution?.Medium || 0;
  const highRisk = stats?.riskDistribution?.High || 0;
  const critical = stats?.riskDistribution?.Critical || 0;

  const getPct = (val) => total > 0 ? Math.round((val / total) * 100) + '%' : '0%';

  const dynamicRiskData = [
    { name: 'Low Risk', value: lowRisk, pct: getPct(lowRisk), color: '#10B981' },
    { name: 'Medium Risk', value: mediumRisk, pct: getPct(mediumRisk), color: '#3B82F6' },
    { name: 'High Risk', value: highRisk, pct: getPct(highRisk), color: '#F59E0B' },
    { name: 'Critical', value: critical, pct: getPct(critical), color: '#EF4444' },
  ];

  return (
    <div className="space-y-6 pb-10">
      
      {/* Welcome Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Welcome back, Admin 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening in your institution today.
          </p>
        </div>
        <div className="text-right bg-white dark:bg-[#0F172A] px-4 py-2 rounded-xl border border-slate-800 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          </span>
          <span className="text-xs text-slate-500 font-medium mt-0.5">
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Total Students */}
        <Card className="bg-white border border-slate-800 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
            <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">Total Students</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-800 dark:text-white">{stats?.totalStudents?.toLocaleString() || 0}</span>
              <span className="flex items-center text-emerald-500 text-sm font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
                <TrendingUp size={14} className="mr-1" /> 12.5%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Faculty */}
        <Card className="bg-white border border-slate-800 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
            <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">Total Faculty</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-800 dark:text-white">{stats?.totalFaculty?.toLocaleString() || 0}</span>
              <span className="flex items-center text-emerald-500 text-sm font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
                <TrendingUp size={14} className="mr-1" /> 8.4%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Today */}
        <Card className="bg-white border border-slate-800 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
            <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">Attendance Today</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-800 dark:text-white">{stats?.todaysAttendance || 0}%</span>
              <span className="flex items-center text-emerald-500 text-sm font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
                <TrendingUp size={14} className="mr-1" /> 4.3%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* At Risk Students */}
        <Card className="bg-white border border-slate-800 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
            <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">At Risk Students</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-800 dark:text-white">{stats?.atRiskStudents?.toLocaleString() || 0}</span>
              <span className="flex items-center text-rose-500 text-sm font-bold bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded">
                <TrendingUp size={14} className="mr-1" /> 15.7%
              </span>
            </div>
          </CardContent>
        </Card>

      </motion.div>

      {/* Middle Row (Charts & Activities) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
        
        {/* Attendance Overview Line Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="xl:col-span-6">
          <Card className="bg-white border border-slate-800 shadow-sm rounded-2xl h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-[15px] font-bold text-slate-800 dark:text-white">Attendance Overview</CardTitle>
              <button className="flex items-center text-xs font-medium text-slate-500 border border-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                This Week <ChevronDown size={14} className="ml-1" />
              </button>
            </CardHeader>
            <CardContent>
                <div className="relative flex h-[250px] items-end justify-between px-2 pb-6 pt-6 gap-4">
                  {/* Grid Lines */}
                  <div className="absolute inset-x-0 bottom-6 top-6 flex flex-col justify-between pointer-events-none z-0">
                    <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
                    <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
                    <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
                    <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
                  </div>

                  {stats?.attendanceTrend?.length > 0 ? stats.attendanceTrend.map((data, index) => {
                    // Match image colors for Mon-Fri (indices 1-5). Sun and Sat get default gray.
                    const colors = ['#cbd5e1', '#ff5722', '#2563eb', '#38bdf8', '#f43f5e', '#10b981', '#cbd5e1'];
                    const bgColor = colors[index];
                    
                    // Do not show bars for 0% (e.g. Sunday/Saturday if no data) to match image
                    if (data.value === 0) return (
                       <div key={index} className="flex flex-col items-center justify-end w-full h-full z-10">
                         <span className="text-[11px] font-medium text-slate-800 mt-3">{data.day}</span>
                       </div>
                    );

                    return (
                      <div key={index} className="flex flex-col items-center justify-end w-full h-full z-10">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                          {data.value}%
                        </span>
                        <div className="w-full relative flex flex-col justify-end items-center" style={{ height: '100%' }}>
                          <div 
                            className="w-full max-w-[36px] rounded-t-sm"
                            style={{ height: `${data.value}%`, backgroundColor: bgColor }}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-slate-800 mt-2">{data.day}</span>
                      </div>
                    );
                  }) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mb-3"></div>
                      <p className="text-sm">Loading trend data...</p>
                    </div>
                  )}
                </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Distribution Doughnut Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="xl:col-span-3">
          <Card className="bg-white border border-slate-800 shadow-sm rounded-2xl h-full flex flex-col">
            <CardHeader className="pb-0 pt-5 px-5">
              <CardTitle className="text-[15px] font-bold text-slate-800 dark:text-white">Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-row items-center justify-between flex-1 pt-2 pb-5 px-3">
              
              <div className="relative w-[130px] h-[130px] flex items-center justify-center shrink-0">
                <svg width="130" height="130" viewBox="0 0 130 130" className="transform -rotate-90">
                  {/* Background Track */}
                  <circle cx="65" cy="65" r="50" stroke="rgba(241, 245, 249, 1)" strokeWidth="16" fill="none" />
                  
                  {/* Segments */}
                  {(() => {
                    const radius = 50;
                    const circumference = 2 * Math.PI * radius;
                    let currentOffset = 0;
                    const validData = dynamicRiskData.filter(d => d.value > 0);
                    const totalValue = validData.reduce((sum, d) => sum + d.value, 0);

                    if (totalValue === 0) return null;

                    return validData.map((entry, index) => {
                      const strokeLength = (entry.value / totalValue) * circumference;
                      // Add a small gap (2px) between segments if there's more than one
                      const gap = validData.length > 1 ? 2 : 0;
                      const actualStroke = Math.max(0, strokeLength - gap);
                      
                      const circle = (
                        <circle
                          key={index}
                          cx="65"
                          cy="65"
                          r={radius}
                          stroke={entry.color}
                          strokeWidth="16"
                          fill="none"
                          strokeDasharray={`${actualStroke} ${circumference - actualStroke}`}
                          strokeDashoffset={-currentOffset}
                          strokeLinecap="butt"
                          className="transition-all duration-500 ease-out"
                        />
                      );
                      currentOffset += strokeLength;
                      return circle;
                    });
                  })()}
                </svg>
                <div className="absolute flex flex-col items-center justify-center pointer-events-none mt-1">
                  <span className="text-[22px] font-black tracking-tight text-slate-800 dark:text-white leading-none mb-1">{stats?.totalStudents?.toLocaleString() || 0}</span>
                  <span className="text-[11px] font-semibold text-slate-500">Total</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pr-2">
                {dynamicRiskData.map((d, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: d.color }} />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 leading-none mb-1">{d.name}</span>
                      <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 leading-none">{d.pct}</span>
                    </div>
                  </div>
                ))}
              </div>

            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activities */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="xl:col-span-3">
          <Card className="bg-white border border-slate-800 shadow-sm rounded-2xl h-full flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-[15px] font-bold text-slate-800">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                {stats?.recentActivities?.length > 0 ? (
                  stats.recentActivities.map((act, i) => {
                    let Icon = CheckCircle2;
                    let color = 'text-slate-500 bg-slate-50';
                    
                    if (act.activityType?.includes('LOGIN') || act.activityType?.includes('ATTENDANCE')) {
                      Icon = CheckCircle2; color = 'text-emerald-500 bg-emerald-50';
                    } else if (act.activityType?.includes('REPORT')) {
                      Icon = FileText; color = 'text-amber-500 bg-amber-50';
                    } else if (act.activityType?.includes('AI')) {
                      Icon = Sparkles; color = 'text-blue-500 bg-blue-50';
                    } else if (act.activityType?.includes('NOTIFICATION')) {
                      Icon = BellRing; color = 'text-rose-500 bg-rose-50';
                    }

                    // Format relative time
                    const diff = Math.floor((new Date() - new Date(act.createdAt)) / 1000);
                    let time = 'Just now';
                    if (diff > 60) time = `${Math.floor(diff / 60)} min ago`;
                    if (diff > 3600) time = `${Math.floor(diff / 3600)} hr ago`;
                    if (diff > 86400) time = `${Math.floor(diff / 86400)} days ago`;

                    return (
                      <div key={act._id || i} className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 overflow-hidden">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                            <Icon size={14} />
                          </div>
                          <div className="flex flex-col">
                             <p className="text-[12px] font-medium text-slate-700 leading-tight pr-2">{act.description}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 mt-1">{time}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <p className="text-xs">No recent activities</p>
                  </div>
                )}
              </div>
              <div className="text-left mt-6">
                <button onClick={openActivitiesModal} className="text-xs font-bold text-blue-600 hover:underline">View All</button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Recent At Risk Students */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="col-span-1">
          <Card className="bg-white border border-slate-800 shadow-sm rounded-2xl h-full">
            <CardHeader className="pb-4 border-b border-slate-800">
              <CardTitle className="text-[15px] font-bold text-slate-800">Recent At Risk Students</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[12px] font-bold text-slate-700 bg-indigo-50/80">
                    <tr>
                      <th className="px-6 py-4 rounded-l-xl">#</th>
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4">Student ID</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Attendance</th>
                      <th className="px-6 py-4">Risk Level</th>
                      <th className="px-6 py-4 rounded-r-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.recentAtRiskStudents || []).map((s, i) => {
                      const riskLevel = s.aiRiskLevel || 'High';
                      const isCritical = riskLevel === 'Critical';
                      const bg = isCritical ? 'bg-rose-600' : 'bg-rose-100';
                      const pillText = isCritical ? 'text-white' : 'text-rose-600';
                      
                      return (
                        <tr key={s._id || i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-700">{i + 1}</td>
                          <td className="px-6 py-4 font-semibold text-slate-800">{s.user?.name || 'Unknown'}</td>
                          <td className="px-6 py-4 font-semibold text-slate-500">{s.registerNumber || 'N/A'}</td>
                          <td className="px-6 py-4 font-semibold text-slate-600">{s.department?.code || 'UNK'}</td>
                          <td className="px-6 py-4 font-bold text-rose-500">{Math.round(s.attendanceSummary?.overallPercentage || 0)}%</td>
                          <td className="px-6 py-4">
                             <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold ${bg} ${pillText}`}>
                               {riskLevel}
                             </span>
                          </td>
                          <td className="px-6 py-4">
                             <button 
                               onClick={() => setSelectedStudentForAI(s)} 
                               className="px-4 py-1.5 rounded-full border border-blue-200 text-blue-600 text-[11px] font-bold hover:bg-blue-50 transition-colors"
                             >
                               View
                             </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Recommendation Modal */}
      <AnimatePresence>
        {selectedStudentForAI && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-xl overflow-hidden border border-slate-800 dark:border-slate-800"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-800 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Brain size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">AI Recommendations</h2>
                    <p className="text-sm font-medium text-slate-500">Targeted interventions for <span className="font-bold text-slate-700 dark:text-slate-300">{selectedStudentForAI.user?.name || 'Student'}</span></p>
                  </div>
                </div>
                <button onClick={() => setSelectedStudentForAI(null)} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Staff Recommendation */}
                    <div className="p-6 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50 flex flex-col h-full relative overflow-hidden group hover:shadow-md transition-shadow">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                       <div className="flex items-center gap-3 mb-4">
                         <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                           <GraduationCap size={16} className="text-blue-600 dark:text-blue-400"/>
                         </div>
                         <h3 className="font-bold text-[15px] text-slate-800 dark:text-slate-200">For Staff</h3>
                       </div>
                       <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                         {selectedStudentForAI.aiRiskLevel === 'Critical' 
                           ? "Schedule an urgent 1-on-1 counseling session with the student. Issue a formal warning letter regarding the critical attendance shortage immediately."
                           : "Monitor the student closely for the next two weeks. Discuss their absence patterns and offer required academic support."}
                       </p>
                    </div>

                    {/* Student Recommendation */}
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex flex-col h-full relative overflow-hidden group hover:shadow-md transition-shadow">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                       <div className="flex items-center gap-3 mb-4">
                         <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                           <User size={16} className="text-emerald-600 dark:text-emerald-400"/>
                         </div>
                         <h3 className="font-bold text-[15px] text-slate-800 dark:text-slate-200">For Student</h3>
                       </div>
                       <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                         {selectedStudentForAI.aiRiskLevel === 'Critical' 
                           ? "You are in the critical zone. You must attend all remaining classes this month without fail. Submit valid medical proofs for recent absences."
                           : "Your attendance is dropping to unsafe levels. Avoid taking any casual leaves and ensure you attend all upcoming lab sessions."}
                       </p>
                    </div>

                    {/* Parent Recommendation */}
                    <div className="p-6 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-100 dark:border-rose-900/50 flex flex-col h-full relative overflow-hidden group hover:shadow-md transition-shadow">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                       <div className="flex items-center gap-3 mb-4">
                         <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                           <Users size={16} className="text-rose-600 dark:text-rose-400"/>
                         </div>
                         <h3 className="font-bold text-[15px] text-slate-800 dark:text-slate-200">For Parent</h3>
                       </div>
                       <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                         {selectedStudentForAI.aiRiskLevel === 'Critical' 
                           ? "Your ward's attendance is critically low. An immediate in-person meeting with the HOD is required to discuss recovery options and prevent exam debarment."
                           : "Please monitor your ward's daily attendance. Have a discussion with them about the importance of regular college attendance."}
                       </p>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* All Activities Modal */}
      <AnimatePresence>
        {showActivitiesModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden border border-slate-800 dark:border-slate-800 flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-800 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <BellRing size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">All Recent Activities</h2>
                    <p className="text-sm font-medium text-slate-500">History of actions across the institution</p>
                  </div>
                </div>
                <button onClick={() => setShowActivitiesModal(false)} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {loadingActivities ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : allActivities.length > 0 ? (
                  <div className="space-y-6">
                    {allActivities.map((act, i) => {
                      let Icon = CheckCircle2;
                      let color = 'text-slate-500 bg-slate-50';
                      
                      if (act.activityType?.includes('LOGIN') || act.activityType?.includes('ATTENDANCE')) {
                        Icon = CheckCircle2; color = 'text-emerald-500 bg-emerald-50';
                      } else if (act.activityType?.includes('REPORT')) {
                        Icon = FileText; color = 'text-amber-500 bg-amber-50';
                      } else if (act.activityType?.includes('AI')) {
                        Icon = Sparkles; color = 'text-blue-500 bg-blue-50';
                      } else if (act.activityType?.includes('NOTIFICATION')) {
                        Icon = BellRing; color = 'text-rose-500 bg-rose-50';
                      }

                      const diff = Math.floor((new Date() - new Date(act.createdAt)) / 1000);
                      let time = 'Just now';
                      if (diff > 60) time = `${Math.floor(diff / 60)} min ago`;
                      if (diff > 3600) time = `${Math.floor(diff / 3600)} hr ago`;
                      if (diff > 86400) time = `${Math.floor(diff / 86400)} days ago`;

                      return (
                        <div key={act._id || i} className="flex items-start justify-between gap-4 border-b border-slate-50 dark:border-slate-800/50 pb-4 last:border-0 last:pb-0">
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                              <Icon size={16} />
                            </div>
                            <div className="flex flex-col mt-1">
                               <p className="text-[14px] font-medium text-slate-700 dark:text-slate-300">{act.description}</p>
                            </div>
                          </div>
                          <span className="text-[12px] font-semibold text-slate-400 shrink-0 mt-2 whitespace-nowrap">{time}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <p>No activities found.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
