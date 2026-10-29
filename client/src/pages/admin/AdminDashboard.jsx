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
    { name: 'Low Risk', value: lowRisk, pct: getPct(lowRisk), color: '#2F7D5C' },
    { name: 'Medium Risk', value: mediumRisk, pct: getPct(mediumRisk), color: '#1B2A4A' },
    { name: 'High Risk', value: highRisk, pct: getPct(highRisk), color: '#C2872B' },
    { name: 'Critical', value: critical, pct: getPct(critical), color: '#B0483C' },
  ];

  return (
    <div className="space-y-6 pb-10">
      
      {/* Welcome Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--navy)] tracking-tight">
              Institutional Ledger & Administration
            </h1>
          </div>
          <p className="text-sm text-[var(--ink-soft)] mt-1.5">
            Executive oversight, campus attendance records, and student risk management.
          </p>
        </div>
        <div className="text-right bg-[var(--paper-raised)] px-4 py-2.5 rounded-none border border-[var(--rule)] shadow-none flex flex-col items-center justify-center shrink-0">
          <span className="font-serif text-sm font-bold text-[var(--navy)]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          </span>
          <span className="font-mono text-xs text-[var(--ink-soft)] mt-0.5">
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </motion.div>

      {/* KPI Cards - Flat paper cards with 1px --rule border */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        
        {/* Total Students */}
        <Card className="bg-[var(--paper-raised)] border border-[var(--rule)] shadow-none rounded-none">
          <CardContent className="p-5 flex flex-col h-full justify-between gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono uppercase tracking-wider text-[var(--ink-soft)]">Total Students</p>
              <Users className="w-4 h-4 text-[var(--navy)]" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-3xl font-bold text-[var(--navy)]">{stats?.totalStudents?.toLocaleString() || 0}</span>
              <span className="font-mono text-xs font-semibold px-[8px] py-[2px] rounded-none bg-[var(--safe-bg)] text-[var(--safe)] border border-[var(--safe)]/40 flex items-center">
                <TrendingUp size={12} className="mr-1" /> +12.5%
              </span>
            </div>
            <div className="w-full bg-[var(--track)] h-[6px] rounded-none overflow-hidden mt-2 border border-[var(--rule)]/30">
              <div className="bg-[var(--navy)] h-full rounded-none" style={{ width: '85%' }} />
            </div>
          </CardContent>
        </Card>

        {/* Total Faculty */}
        <Card className="bg-[var(--paper-raised)] border border-[var(--rule)] shadow-none rounded-none">
          <CardContent className="p-5 flex flex-col h-full justify-between gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono uppercase tracking-wider text-[var(--ink-soft)]">Total Faculty</p>
              <GraduationCap className="w-4 h-4 text-[var(--navy)]" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-3xl font-bold text-[var(--navy)]">{stats?.totalFaculty?.toLocaleString() || 0}</span>
              <span className="font-mono text-xs font-semibold px-[8px] py-[2px] rounded-none bg-[var(--safe-bg)] text-[var(--safe)] border border-[var(--safe)]/40 flex items-center">
                <TrendingUp size={12} className="mr-1" /> +8.4%
              </span>
            </div>
            <div className="w-full bg-[var(--track)] h-[6px] rounded-none overflow-hidden mt-2 border border-[var(--rule)]/30">
              <div className="bg-[var(--gold)] h-full rounded-none" style={{ width: '92%' }} />
            </div>
          </CardContent>
        </Card>

        {/* Attendance Today */}
        <Card className="bg-[var(--paper-raised)] border border-[var(--rule)] shadow-none rounded-none">
          <CardContent className="p-5 flex flex-col h-full justify-between gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono uppercase tracking-wider text-[var(--ink-soft)]">Attendance Today</p>
              <CheckCircle2 className="w-4 h-4 text-[var(--safe)]" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-3xl font-bold text-[var(--navy)]">{stats?.todaysAttendance || 0}%</span>
              <span className="font-mono text-xs font-semibold px-[8px] py-[2px] rounded-none bg-[var(--safe-bg)] text-[var(--safe)] border border-[var(--safe)]/40 flex items-center">
                <TrendingUp size={12} className="mr-1" /> +4.3%
              </span>
            </div>
            <div className="w-full bg-[var(--track)] h-[6px] rounded-none overflow-hidden mt-2 border border-[var(--rule)]/30">
              <div className="bg-[var(--safe)] h-full rounded-none" style={{ width: `${stats?.todaysAttendance || 0}%` }} />
            </div>
          </CardContent>
        </Card>

        {/* At Risk Students */}
        <Card className="bg-[var(--paper-raised)] border border-[var(--rule)] shadow-none rounded-none">
          <CardContent className="p-5 flex flex-col h-full justify-between gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono uppercase tracking-wider text-[var(--ink-soft)]">At Risk Students</p>
              <span className="w-2.5 h-2.5 rounded-none bg-[var(--crit)] animate-pulse" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-3xl font-bold text-[var(--crit)]">{stats?.atRiskStudents?.toLocaleString() || 0}</span>
              <span className="font-mono text-xs font-semibold px-[8px] py-[2px] rounded-none bg-[var(--crit-bg)] text-[var(--crit)] border border-[var(--crit)]/40 flex items-center">
                Attention Req.
              </span>
            </div>
            <div className="w-full bg-[var(--track)] h-[6px] rounded-none overflow-hidden mt-2 border border-[var(--rule)]/30">
              <div className="bg-[var(--crit)] h-full rounded-none" style={{ width: `${Math.min(100, ((stats?.atRiskStudents || 0) / (stats?.totalStudents || 1)) * 100 * 3)}%` }} />
            </div>
          </CardContent>
        </Card>

      </motion.div>

      {/* Middle Row (Charts & Activities) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
        
        {/* Attendance Overview Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="xl:col-span-6">
          <Card className="bg-[var(--paper-raised)] border border-[var(--rule)] shadow-none rounded-none h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-[var(--rule)]">
              <div>
                <CardTitle className="font-serif text-base font-bold text-[var(--navy)]">Attendance Overview</CardTitle>
                <CardDescription className="text-xs text-[var(--ink-soft)] font-mono">Daily aggregate for the active academic cycle</CardDescription>
              </div>
              <button className="flex items-center text-xs font-mono font-medium text-[var(--navy)] bg-[var(--paper)] border border-[var(--rule)] px-3 py-1.5 rounded-none hover:bg-[var(--paper-raised)] transition-colors">
                Current Week <ChevronDown size={14} className="ml-1" />
              </button>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="relative flex h-[250px] items-end justify-between px-2 pb-4 pt-6 gap-3">
                  {stats?.attendanceTrend?.length > 0 ? stats.attendanceTrend.map((data, index) => {
                    // Match Academic Ledger palette for Mon-Fri
                    const colors = ['#DEDACD', '#1B2A4A', '#2F7D5C', '#2E3F63', '#C2872B', '#1B2A4A', '#DEDACD'];
                    const bgColor = colors[index % colors.length];
                    
                    if (data.value === 0) return (
                       <div key={index} className="flex flex-col items-center justify-end w-full h-full z-10">
                         <span className="font-mono text-[11px] font-medium text-[var(--ink-soft)] mt-3">{data.day}</span>
                       </div>
                    );

                    return (
                      <div key={index} className="flex flex-col items-center justify-end w-full h-full z-10">
                        <span className="font-mono text-xs font-bold text-[var(--navy)] mb-1.5">
                          {data.value}%
                        </span>
                        <div className="w-full relative flex flex-col justify-end items-center" style={{ height: '100%' }}>
                          <div 
                            className="w-full max-w-[34px] rounded-none transition-all hover:opacity-90"
                            style={{ height: `${data.value}%`, backgroundColor: bgColor }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-medium text-[var(--ink-soft)] mt-2">{data.day}</span>
                      </div>
                    );
                  }) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[var(--ink-soft)]">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--navy)] mb-3"></div>
                      <p className="text-sm font-mono">Loading register records...</p>
                    </div>
                  )}
                </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Distribution Donut Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="xl:col-span-3">
          <Card className="bg-[var(--paper-raised)] border border-[var(--rule)] shadow-none rounded-none h-full flex flex-col">
            <CardHeader className="pb-2 pt-4 px-5 border-b border-[var(--rule)]">
              <CardTitle className="font-serif text-base font-bold text-[var(--navy)]">Risk Distribution</CardTitle>
              <CardDescription className="text-xs text-[var(--ink-soft)] font-mono">Institutional classification</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-row items-center justify-between flex-1 pt-4 pb-4 px-4">
              
              <div className="relative w-[130px] h-[130px] flex items-center justify-center shrink-0">
                <svg width="130" height="130" viewBox="0 0 130 130" className="transform -rotate-90">
                  {/* Background Track */}
                  <circle cx="65" cy="65" r="50" stroke="#DEDACD" strokeWidth="16" fill="none" />
                  
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
                  <span className="font-mono text-xl font-black tracking-tight text-[var(--navy)] leading-none mb-1">
                    {stats?.totalStudents?.toLocaleString() || 0}
                  </span>
                  <span className="font-mono text-[10px] uppercase text-[var(--ink-soft)]">Total Roll</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pr-1">
                {dynamicRiskData.map((d, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: d.color }} />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium text-[var(--ink-soft)] leading-none mb-1">{d.name}</span>
                      <span className="font-mono text-[12px] font-bold text-[var(--ink)] leading-none">{d.pct}</span>
                    </div>
                  </div>
                ))}
              </div>

            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activities */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="xl:col-span-3">
          <Card className="bg-[var(--paper-raised)] border border-[var(--rule)] shadow-none rounded-none h-full flex flex-col">
            <CardHeader className="pb-2 pt-4 border-b border-[var(--rule)]">
              <CardTitle className="font-serif text-base font-bold text-[var(--navy)]">Recent Ledger Activities</CardTitle>
              <CardDescription className="text-xs text-[var(--ink-soft)] font-mono">System audit log</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between pt-4">
              <div className="space-y-4">
                {stats?.recentActivities?.length > 0 ? (
                  stats.recentActivities.slice(0, 4).map((act, i) => {
                    let Icon = CheckCircle2;
                    let color = 'text-[var(--navy)] bg-[var(--paper)] border border-[var(--rule)]';
                    
                    if (act.activityType?.includes('LOGIN') || act.activityType?.includes('ATTENDANCE')) {
                      Icon = CheckCircle2; color = 'text-[var(--safe)] bg-[var(--safe-bg)] border border-[var(--safe)]/20';
                    } else if (act.activityType?.includes('REPORT')) {
                      Icon = FileText; color = 'text-[var(--warn)] bg-[var(--warn-bg)] border border-[var(--warn)]/20';
                    } else if (act.activityType?.includes('AI')) {
                      Icon = Sparkles; color = 'text-[var(--navy)] bg-[var(--paper)] border border-[var(--navy)]/20';
                    } else if (act.activityType?.includes('NOTIFICATION')) {
                      Icon = BellRing; color = 'text-[var(--crit)] bg-[var(--crit-bg)] border border-[var(--crit)]/20';
                    }

                    const diff = Math.floor((new Date() - new Date(act.createdAt)) / 1000);
                    let time = 'Just now';
                    if (diff > 60) time = `${Math.floor(diff / 60)}m ago`;
                    if (diff > 3600) time = `${Math.floor(diff / 3600)}h ago`;
                    if (diff > 86400) time = `${Math.floor(diff / 86400)}d ago`;

                    return (
                      <div key={act._id || i} className="flex items-start justify-between gap-3 pb-2 border-b border-[var(--rule)]/40 last:border-0 last:pb-0">
                        <div className="flex items-start gap-2.5 overflow-hidden">
                          <div className={`w-7 h-7 rounded-none flex items-center justify-center shrink-0 ${color}`}>
                            <Icon size={13} />
                          </div>
                          <div className="flex flex-col">
                             <p className="text-[12px] font-medium text-[var(--ink)] leading-snug pr-1">{act.description}</p>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] text-[var(--ink-soft)] shrink-0 mt-0.5">{time}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-[var(--ink-soft)]">
                    <p className="text-xs font-mono">No recent activity logs recorded.</p>
                  </div>
                )}
              </div>
              <div className="text-left mt-4 pt-3 border-t border-[var(--rule)]">
                <button onClick={openActivitiesModal} className="btn-navy-outline text-xs px-3 py-1.5 rounded-none w-full text-center">
                  View Full Audit Log
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row - At Risk Table */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Recent At Risk Students */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="col-span-1">
          <Card className="bg-[var(--paper-raised)] border border-[var(--rule)] shadow-none rounded-none">
            <CardHeader className="pb-3 border-b border-[var(--rule)] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-serif text-base font-bold text-[var(--navy)]">Critical & High Risk Roster</CardTitle>
                <CardDescription className="text-xs text-[var(--ink-soft)] font-mono">Students below statutory attendance thresholds</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[var(--paper)] text-[var(--navy)] font-mono text-xs uppercase tracking-wider border-b border-[var(--rule)]">
                    <tr>
                      <th className="px-5 py-3">#</th>
                      <th className="px-5 py-3">Student Name</th>
                      <th className="px-5 py-3">Register No</th>
                      <th className="px-5 py-3">Dept</th>
                      <th className="px-5 py-3">Attendance</th>
                      <th className="px-5 py-3">Status Badge</th>
                      <th className="px-5 py-3 text-right">Intervention</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--rule)]/60">
                    {(stats?.recentAtRiskStudents || []).map((s, i) => {
                      const riskLevel = s.aiRiskLevel || 'High';
                      const isCritical = riskLevel === 'Critical';
                      const bg = isCritical ? 'bg-[var(--crit-bg)] text-[var(--crit)] border border-[var(--crit)]/30' : 'bg-[var(--warn-bg)] text-[var(--warn)] border border-[var(--warn)]/30';
                      
                      return (
                        <tr key={s._id || i} className="hover:bg-[var(--paper)]/50 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-xs text-[var(--ink-soft)]">{i + 1}</td>
                          <td className="px-5 py-3.5 font-semibold text-[var(--ink)]">{s.user?.name || 'Unknown'}</td>
                          <td className="px-5 py-3.5 font-mono text-xs font-semibold text-[var(--navy)]">{s.registerNumber || 'N/A'}</td>
                          <td className="px-5 py-3.5 font-mono text-xs text-[var(--ink-soft)]">{s.department?.code || 'UNK'}</td>
                          <td className="px-5 py-3.5 font-mono text-xs font-bold text-[var(--crit)]">
                            {Math.round(s.attendanceSummary?.overallPercentage || 0)}%
                          </td>
                          <td className="px-5 py-3.5">
                             <span className={`px-[10px] py-[3px] rounded-[20px] font-mono text-xs font-semibold ${bg}`}>
                               {riskLevel}
                             </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                             <button 
                               onClick={() => setSelectedStudentForAI(s)} 
                               className="btn-navy-outline text-xs px-3 py-1 rounded-[7px] hover:bg-[var(--navy)] hover:text-white transition-colors"
                             >
                               Review Action
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/50 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--paper-raised)] w-full max-w-3xl rounded-[10px] shadow-2xl overflow-hidden border border-[var(--rule)]"
            >
              <div className="flex items-center justify-between p-5 border-b border-[var(--rule)] bg-[var(--paper)]">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[var(--navy)] flex items-center justify-center text-[var(--gold)]">
                    <Brain size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-lg font-bold text-[var(--navy)]">Intervention & Advisory Directives</h2>
                    </div>
                    <p className="text-xs font-mono text-[var(--ink-soft)] mt-0.5">
                      Statutory guidance for candidate: <span className="font-bold text-[var(--ink)]">{selectedStudentForAI.user?.name || 'Student'}</span> ({selectedStudentForAI.registerNumber || 'REG'})
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedStudentForAI(null)} className="p-1.5 text-[var(--ink-soft)] hover:bg-[var(--rule)]/40 rounded-none transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Staff Recommendation */}
                    <div className="p-5 bg-[var(--paper)] rounded-none border border-[var(--rule)] border-t-[3px] border-t-[var(--navy)] flex flex-col h-full shadow-none">
                       <div className="flex items-center gap-2.5 mb-3">
                         <div className="w-7 h-7 rounded-none bg-[var(--navy)] text-white flex items-center justify-center">
                           <GraduationCap size={14} />
                         </div>
                         <h3 className="font-serif font-bold text-sm text-[var(--navy)]">Academic Staff</h3>
                       </div>
                       <p className="text-xs text-[var(--ink)] leading-relaxed flex-1 font-sans">
                         {selectedStudentForAI.aiRiskLevel === 'Critical' 
                           ? "Issue an institutional notice of attendance shortage immediately. Convene a mandatory counseling session with department records."
                           : "Monitor roll call attendance records over the forthcoming 14 calendar days. Solicit medical or leave documentation for discrepancies."}
                       </p>
                       <span className="font-mono text-[10px] text-[var(--ink-soft)] mt-3 pt-2 border-t border-[var(--rule)]/60">ACTION: DEPT HEAD</span>
                    </div>

                    {/* Student Recommendation */}
                    <div className="p-5 bg-[var(--safe-bg)] rounded-none border border-[var(--safe)]/30 border-t-[3px] border-t-[var(--safe)] flex flex-col h-full shadow-none">
                       <div className="flex items-center gap-2.5 mb-3">
                         <div className="w-7 h-7 rounded-none bg-[var(--safe)] text-white flex items-center justify-center">
                           <User size={14} />
                         </div>
                         <h3 className="font-serif font-bold text-sm text-[var(--safe)]">Candidate Directive</h3>
                       </div>
                       <p className="text-xs text-[var(--ink)] leading-relaxed flex-1 font-sans">
                         {selectedStudentForAI.aiRiskLevel === 'Critical' 
                           ? "Critical shortfall detected. 100% attendance required in all scheduled lecture sessions to prevent statutory debarment."
                           : "Maintain unblemished attendance for current modular cycles. Ensure valid documentation is presented for excused absences."}
                       </p>
                       <span className="font-mono text-[10px] text-[var(--safe)] mt-3 pt-2 border-t border-[var(--safe)]/30">MANDATORY RECOVERY</span>
                    </div>

                    {/* Parent Recommendation */}
                    <div className="p-5 bg-[var(--crit-bg)] rounded-none border border-[var(--crit)]/30 border-t-[3px] border-t-[var(--crit)] flex flex-col h-full shadow-none">
                       <div className="flex items-center gap-2.5 mb-3">
                         <div className="w-7 h-7 rounded-none bg-[var(--crit)] text-white flex items-center justify-center">
                           <Users size={14} />
                         </div>
                         <h3 className="font-serif font-bold text-sm text-[var(--crit)]">Guardian Notice</h3>
                       </div>
                       <p className="text-xs text-[var(--ink)] leading-relaxed flex-1 font-sans">
                         {selectedStudentForAI.aiRiskLevel === 'Critical' 
                           ? "Ward has breached minimum safe threshold. Direct interview requested with the Academic Counselor to sign recovery plan."
                           : "Please review the weekly attendance ledger. Discuss regular lecture attendance with your ward."}
                       </p>
                       <span className="font-mono text-[10px] text-[var(--crit)] mt-3 pt-2 border-t border-[var(--crit)]/30">DISPATCH: SMS / CALL</span>
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/50 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--paper-raised)] w-full max-w-2xl rounded-none shadow-2xl overflow-hidden border border-[var(--rule)] flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-[var(--rule)] bg-[var(--paper)] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-none bg-[var(--navy)] flex items-center justify-center text-[var(--gold)]">
                    <BellRing size={18} />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-[var(--navy)]">Comprehensive Audit Ledger</h2>
                    <p className="text-xs font-mono text-[var(--ink-soft)]">Institutional log of actions and authorizations</p>
                  </div>
                </div>
                <button onClick={() => setShowActivitiesModal(false)} className="p-1.5 text-[var(--ink-soft)] hover:bg-[var(--rule)]/40 rounded-none transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-1">
                {loadingActivities ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--navy)]" />
                  </div>
                ) : allActivities.length > 0 ? (
                  <div className="space-y-3">
                    {allActivities.map((act, i) => {
                      let Icon = CheckCircle2;
                      let color = 'text-[var(--navy)] bg-[var(--paper)] border border-[var(--rule)]';
                      
                      if (act.activityType?.includes('LOGIN') || act.activityType?.includes('ATTENDANCE')) {
                        Icon = CheckCircle2; color = 'text-[var(--safe)] bg-[var(--safe-bg)] border border-[var(--safe)]/20';
                      } else if (act.activityType?.includes('REPORT')) {
                        Icon = FileText; color = 'text-[var(--warn)] bg-[var(--warn-bg)] border border-[var(--warn)]/20';
                      } else if (act.activityType?.includes('AI')) {
                        Icon = Sparkles; color = 'text-[var(--navy)] bg-[var(--paper)] border border-[var(--navy)]/20';
                      } else if (act.activityType?.includes('NOTIFICATION')) {
                        Icon = BellRing; color = 'text-[var(--crit)] bg-[var(--crit-bg)] border border-[var(--crit)]/20';
                      }

                      const diff = Math.floor((new Date() - new Date(act.createdAt)) / 1000);
                      let time = 'Just now';
                      if (diff > 60) time = `${Math.floor(diff / 60)}m ago`;
                      if (diff > 3600) time = `${Math.floor(diff / 3600)}h ago`;
                      if (diff > 86400) time = `${Math.floor(diff / 86400)}d ago`;

                      return (
                        <div key={act._id || i} className="flex items-start justify-between gap-3 p-2.5 rounded-none border border-[var(--rule)]/60 bg-[var(--paper)]/40">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-none flex items-center justify-center shrink-0 ${color}`}>
                              <Icon size={14} />
                            </div>
                            <div className="flex flex-col mt-0.5">
                               <p className="text-xs font-medium text-[var(--ink)] leading-snug">{act.description}</p>
                            </div>
                          </div>
                          <span className="font-mono text-[11px] text-[var(--ink-soft)] shrink-0 mt-0.5 whitespace-nowrap">{time}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-[var(--ink-soft)]">
                    <p className="font-mono text-xs">No ledger records cataloged.</p>
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
