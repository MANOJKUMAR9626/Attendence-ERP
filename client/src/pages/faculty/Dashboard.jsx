import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, BookOpen, CheckCircle2, Clock, Users, AlertTriangle, 
  ChevronRight, ChevronDown, CheckSquare, MessageSquare, BarChart2, Calendar
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell, LabelList
} from 'recharts';
import api from '@/utils/api';
import { toast } from 'react-hot-toast';

// Simple SVG Sparkline Component
const Sparkline = ({ color, path }) => (
  <svg width="60" height="20" viewBox="0 0 60 20" className="ml-auto">
    <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({ name: "Dr. Ramesh S" });
  const [selectedDate, setSelectedDate] = useState(() => {
    return sessionStorage.getItem('facultySelectedDate') || new Date().toLocaleDateString('en-CA');
  });

  useEffect(() => {
    sessionStorage.setItem('facultySelectedDate', selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get(`/dashboard/faculty?date=${selectedDate}`);
        setStats(response.data.data);
      } catch (error) {
        // toast.error('Failed to load Faculty dashboard stats');
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.data) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    
    fetchStats();
    fetchUser();
  }, [selectedDate]);

  const attendanceData = stats?.attendanceData || [
    { name: 'Sun', value: 0 },
    { name: 'Mon', value: 0 },
    { name: 'Tue', value: 0 },
    { name: 'Wed', value: 0 },
    { name: 'Thu', value: 0 },
    { name: 'Fri', value: 0 },
    { name: 'Sat', value: 0 },
  ];

  const getIconData = (type) => {
    switch (type) {
      case 'Attendance Marked': return { icon: CheckSquare, iconColor: 'text-emerald-500' };
      case 'Leave Approved': return { icon: CheckCircle2, iconColor: 'text-blue-500' };
      default: return { icon: AlertTriangle, iconColor: 'text-amber-500' };
    }
  };

  const activities = (stats?.recentActivity?.length > 0) 
    ? stats.recentActivity.map(a => ({ ...a, ...getIconData(a.type) }))
    : [
        { title: 'No Recent Activity', subtitle: 'You haven\'t marked any attendance yet', time: '', icon: CheckSquare, iconColor: 'text-slate-400' }
      ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#07111F] p-6 rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Faculty Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Welcome back, <span className="font-semibold text-slate-900 dark:text-white">{user?.name || 'Faculty'}</span> 👋</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-0.5">Here's an overview of your classes and students.</p>
        </div>
        
        <div className="flex flex-col items-start md:items-end bg-slate-50 dark:bg-slate-800/50 px-5 py-3 rounded-xl border border-slate-800 dark:border-slate-800">
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          </p>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: Today's Classes */}
        <div className="bg-white dark:bg-[#07111F] p-5 rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Today's Classes</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                {stats?.todaysClasses < 10 ? `0${stats?.todaysClasses || 0}` : stats?.todaysClasses}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              {stats?.todaysClasses - (stats?.pendingAttendance || 0)} Completed
            </p>
            <Calendar className="w-4 h-4 text-indigo-200 dark:text-indigo-700" />
          </div>
        </div>

        {/* Card 2: Classes Completed */}
        <div className="bg-white dark:bg-[#07111F] p-5 rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Classes Completed</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                {stats?.classesCompleted < 10 ? `0${stats?.classesCompleted || 0}` : stats?.classesCompleted}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              {stats?.todaysClasses > 0 ? Math.round(((stats?.classesCompleted || 0) / stats?.todaysClasses) * 100) : 0}% Completed
            </p>
            <Sparkline color="#10B981" path="M0,15 Q15,15 20,10 T40,10 T60,5" />
          </div>
        </div>

        {/* Card 3: Pending Attendance */}
        <div className="bg-white dark:bg-[#07111F] p-5 rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-orange-500 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Pending Attendance</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                {stats?.pendingAttendance < 10 ? `0${stats?.pendingAttendance || 0}` : stats?.pendingAttendance}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] font-bold text-orange-500 dark:text-orange-400">Need to Mark</p>
            <Sparkline color="#F97316" path="M0,15 Q15,10 20,15 T40,5 T60,10" />
          </div>
        </div>

        {/* Card 4: Total Students */}
        <div className="bg-white dark:bg-[#07111F] p-5 rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Total Students</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                {stats?.totalStudents || 0}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Across all classes</p>
            <Sparkline color="#3B82F6" path="M0,15 L20,12 L40,14 L60,8" />
          </div>
        </div>

        {/* Card 5: At-Risk Students */}
        <div className="bg-white dark:bg-[#07111F] p-5 rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-700 dark:text-slate-300">At-Risk Students</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                {stats?.atRiskCount || 0}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] font-bold text-red-500 dark:text-red-400">Need Attention</p>
            <Sparkline color="#EF4444" path="M0,15 L20,10 L40,15 L60,5" />
          </div>
        </div>
      </div>

      {/* MIDDLE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Today's Timetable */}
        <div className="lg:col-span-4 bg-white dark:bg-[#07111F] rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Timetable</h2>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg flex items-center border border-slate-800 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <Link to="/faculty/timetable" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center ml-2">
                View Full <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            {(stats?.timetableData || []).map((slot, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-800 dark:border-slate-800 bg-slate-50 dark:bg-[#0F172A] relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-xl"></div>
                <div className="w-16 flex flex-col justify-center items-center flex-shrink-0 border-r border-slate-800 dark:border-slate-700 pr-4">
                  <span className="text-xs font-bold text-slate-900 dark:text-white text-center whitespace-pre-line">{slot.time}</span>
                </div>
                <div className="flex-1 flex flex-col justify-center pl-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-1">{slot.subject}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-line">{slot.classInfo}</p>
                </div>
                <div className="flex flex-col items-end justify-center pl-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                    slot.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                    slot.status === 'Ongoing' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 animate-pulse' :
                    'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {slot.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Overview Chart */}
        <div className="lg:col-span-5 bg-white dark:bg-[#07111F] rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Attendance Overview</h2>
            <button className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded flex items-center border border-slate-800 dark:border-slate-800">
              This Week <ChevronDown className="w-3 h-3 ml-1" />
            </button>
          </div>
          <div className="flex-1 w-full mt-4 overflow-x-auto overflow-y-hidden" style={{ minHeight: '250px' }}>
            <div style={{ minWidth: '600px', height: '250px' }}>
              <AreaChart width={600} height={250} data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.4} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(val) => `${val}%`} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white dark:bg-[#07111F] border border-slate-800 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-center">
              <p className="text-[12px] text-slate-500 font-medium tracking-tight">Average Attendance</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {stats?.classesCompleted === 0 ? '00%' : `${stats?.averageClassAttendance || 0}%`}
              </p>
            </div>
            <div className="bg-white dark:bg-[#07111F] border border-slate-800 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-center">
              <p className="text-[12px] text-slate-500 font-medium tracking-tight">Highest ({[...attendanceData].sort((a,b) => b.value - a.value)[0]?.name || 'N/A'})</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{[...attendanceData].sort((a,b) => b.value - a.value)[0]?.value || 0}%</p>
            </div>
            <div className="bg-white dark:bg-[#07111F] border border-slate-800 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-center">
              <p className="text-[12px] text-slate-500 font-medium tracking-tight">Lowest ({[...attendanceData].sort((a,b) => a.value - b.value)[0]?.name || 'N/A'})</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{[...attendanceData].sort((a,b) => a.value - b.value)[0]?.value || 0}%</p>
            </div>
          </div>
        </div>

        {/* At-Risk Students */}
        <div className="lg:col-span-3 bg-white dark:bg-[#07111F] rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">At-Risk Students</h2>
            <Link to="/faculty/students?filter=at-risk" className="text-xs font-medium text-blue-600 hover:text-blue-700">View All</Link>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 min-h-[200px]">
                {stats?.atRiskStudents && stats.atRiskStudents.length > 0 ? (
                  stats.atRiskStudents.map((student, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-800 dark:hover:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold bg-purple-100 text-purple-600`}>
                          {student.initials}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{student.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{student.classInfo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{student.attendance}</div>
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${student.riskColor}`}>
                          {student.risk} Risk
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-70 pt-8 pb-4">
                     <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
                     <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No At-Risk Students</p>
                     <p className="text-xs text-slate-500 mt-1">Everyone is maintaining good attendance!</p>
                  </div>
                )}
              </div>
        </div>

      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Subject-wise Attendance */}
        <div className="xl:col-span-6 bg-white dark:bg-[#07111F] rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Subject-wise Attendance</h2>
            <button className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded flex items-center border border-slate-800 dark:border-slate-800">
              Selected Date <ChevronDown className="w-3 h-3 ml-1" />
            </button>
          </div>
          <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 dark:border-slate-800">
                      <th className="pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subject</th>
                      <th className="pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Classes Held</th>
                      <th className="pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Avg Attended</th>
                      <th className="pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Percentage</th>
                      <th className="pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.subjectAttendance || []).map((sub, i) => (
                      <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                        <td className="py-4 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-blue-500 bg-blue-50`}>
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{sub.subject}</span>
                        </td>
                        <td className="py-4 text-center">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{sub.held}</span>
                        </td>
                        <td className="py-4 text-center">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{sub.attended}</span>
                        </td>
                        <td className="py-4 text-center">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{sub.percent}</span>
                        </td>
                        <td className="py-4 text-right">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                              sub.status === 'Good' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                              sub.status === 'Warning' ? 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400' : 
                              sub.status === 'Critical' ? 'text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400' :
                              'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
        </div>

        {/* Recent Attendance Activity */}
        <div className="xl:col-span-4 bg-white dark:bg-[#07111F] rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Attendance Activity</h2>
            <Link to="/faculty/history" className="text-xs font-medium text-blue-600 hover:text-blue-700">View All</Link>
          </div>
          <div className="space-y-6">
            {activities.map((activity, idx) => (
              <div key={idx} className="flex gap-3 relative">
                {idx !== activities.length - 1 && (
                  <div className="absolute left-2 top-5 bottom-[-20px] w-px bg-slate-100 dark:bg-slate-800"></div>
                )}
                <div className={`mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center bg-white dark:bg-[#07111F] z-10 ${activity.iconColor}`}>
                  {(() => {
                    const Icon = activity.icon;
                    return <Icon className="w-4 h-4" />;
                  })()}
                </div>
                <div className="flex-1 -mt-1">
                  <h4 className="text-[13px] font-semibold text-slate-900 dark:text-white">{activity.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{activity.subtitle}</p>
                </div>
                <div className="text-[10px] font-medium text-slate-400 whitespace-nowrap -mt-0.5">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="xl:col-span-2 bg-white dark:bg-[#07111F] rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm p-5 flex flex-col">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3 flex-1">
            <Link to="/faculty/attendance" className="p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/20 hover:border-indigo-300 bg-indigo-50/50 dark:bg-indigo-500/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors flex items-start gap-3">
              <div className="p-2 bg-white dark:bg-indigo-500/10 rounded-lg shadow-sm border border-indigo-100 dark:border-transparent text-indigo-600"><CheckSquare className="w-4 h-4" /></div>
              <div>
                <p className="text-[13px] font-bold text-slate-900 dark:text-indigo-100">Take Attendance</p>
                <p className="text-[10px] text-slate-500 dark:text-indigo-300 mt-0.5 leading-tight">Mark attendance for a class</p>
              </div>
            </Link>
            <Link to="/faculty/students" className="p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20 hover:border-emerald-300 bg-emerald-50/50 dark:bg-emerald-500/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors flex items-start gap-3">
              <div className="p-2 bg-white dark:bg-emerald-500/10 rounded-lg shadow-sm border border-emerald-100 dark:border-transparent text-emerald-600"><Users className="w-4 h-4" /></div>
              <div>
                <p className="text-[13px] font-bold text-slate-900 dark:text-emerald-100">View Students</p>
                <p className="text-[10px] text-slate-500 dark:text-emerald-300 mt-0.5 leading-tight">View all students in your classes</p>
              </div>
            </Link>
            <Link to="/faculty/reports" className="p-3 rounded-xl border border-orange-100 dark:border-orange-500/20 hover:border-orange-300 bg-orange-50/50 dark:bg-orange-500/5 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors flex items-start gap-3">
              <div className="p-2 bg-white dark:bg-orange-500/10 rounded-lg shadow-sm border border-orange-100 dark:border-transparent text-orange-500"><BarChart2 className="w-4 h-4" /></div>
              <div>
                <p className="text-[13px] font-bold text-slate-900 dark:text-orange-100">Attendance Report</p>
                <p className="text-[10px] text-slate-500 dark:text-orange-300 mt-0.5 leading-tight">Generate attendance reports</p>
              </div>
            </Link>
            <Link to="/faculty/analytics" className="p-3 rounded-xl border border-blue-100 dark:border-blue-500/20 hover:border-blue-300 bg-blue-50/50 dark:bg-blue-500/5 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-start gap-3">
              <div className="p-2 bg-white dark:bg-blue-500/10 rounded-lg shadow-sm border border-blue-100 dark:border-transparent text-blue-600"><MessageSquare className="w-4 h-4" /></div>
              <div>
                <p className="text-[13px] font-bold text-slate-900 dark:text-blue-100">AI Insights</p>
                <p className="text-[10px] text-slate-500 dark:text-blue-300 mt-0.5 leading-tight">Get AI suggestions & alerts</p>
              </div>
            </Link>
          </div>
        </div>

      </div>

      {/* AI ALERT BANNER */}
      {stats?.atRiskStudents && stats.atRiskStudents.length > 0 && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-700 dark:text-red-400">AI Attendance Alert</h4>
              <p className="text-[13px] text-red-600/80 dark:text-red-300/80 mt-0.5">
                {stats.atRiskStudents.length} {stats.atRiskStudents.length === 1 ? 'student is' : 'students are'} at high risk of attendance deficiency. Please take necessary actions to improve their attendance.
              </p>
            </div>
          </div>
          <Link to="/faculty/analytics" className="px-5 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-700 dark:text-red-400 text-xs font-bold rounded-lg transition-colors shrink-0 border border-red-200 dark:border-red-500/20">
            View AI Suggestions
          </Link>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
