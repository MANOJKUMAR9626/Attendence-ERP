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
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 min-h-screen text-[var(--ink)]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--paper-raised)] p-6 rounded-[10px] border border-[var(--rule)] shadow-none">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--navy)] tracking-tight">Faculty Ledger & Dashboard</h1>
          </div>
          <p className="text-[var(--ink-soft)] text-sm mt-1.5">Welcome back, <span className="font-semibold text-[var(--navy)]">{user?.name || 'Faculty Member'}</span></p>
          <p className="text-xs font-mono text-[var(--ink-soft)] mt-0.5">Instructional rosters, period schedules, and student attendance logs.</p>
        </div>
        
        <div className="flex flex-col items-start md:items-end bg-[var(--paper)] px-5 py-3 rounded-[10px] border border-[var(--rule)] shrink-0">
          <p className="font-serif text-base font-bold text-[var(--navy)]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          </p>
          <p className="font-mono text-xs text-[var(--ink-soft)] mt-0.5">
            {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: Today's Classes */}
        <div className="bg-[var(--paper-raised)] p-5 rounded-none border border-[var(--rule)] shadow-none flex flex-col justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-none bg-[var(--paper)] border border-[var(--rule)] flex items-center justify-center flex-shrink-0 text-[var(--navy)]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-[var(--ink-soft)]">Today's Classes</p>
              <h3 className="font-mono text-2xl font-black text-[var(--navy)] leading-tight mt-0.5">
                {stats?.todaysClasses < 10 ? `0${stats?.todaysClasses || 0}` : stats?.todaysClasses}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-xs font-semibold px-[8px] py-[2px] rounded-none bg-[var(--safe-bg)] text-[var(--safe)] border border-[var(--safe)]/40">
              {stats?.todaysClasses - (stats?.pendingAttendance || 0)} Completed
            </span>
            <Calendar className="w-4 h-4 text-[var(--ink-soft)]" />
          </div>
          <div className="w-full bg-[var(--track)] h-[6px] rounded-none overflow-hidden mt-3 border border-[var(--rule)]/30">
            <div 
              className="bg-[var(--navy)] h-full rounded-none" 
              style={{ width: `${stats?.todaysClasses > 0 ? ((stats?.todaysClasses - (stats?.pendingAttendance || 0)) / stats?.todaysClasses) * 100 : 0}%` }} 
            />
          </div>
        </div>

        {/* Card 2: Classes Completed */}
        <div className="bg-[var(--paper-raised)] p-5 rounded-none border border-[var(--rule)] shadow-none flex flex-col justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-none bg-[var(--safe-bg)] border border-[var(--safe)]/20 flex items-center justify-center flex-shrink-0 text-[var(--safe)]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-[var(--ink-soft)]">Classes Done</p>
              <h3 className="font-mono text-2xl font-black text-[var(--navy)] leading-tight mt-0.5">
                {stats?.classesCompleted < 10 ? `0${stats?.classesCompleted || 0}` : stats?.classesCompleted}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-xs font-semibold px-[8px] py-[2px] rounded-none bg-[var(--safe-bg)] text-[var(--safe)] border border-[var(--safe)]/40">
              {stats?.todaysClasses > 0 ? Math.round(((stats?.classesCompleted || 0) / stats?.todaysClasses) * 100) : 0}% Completed
            </span>
            <Sparkline color="#2F7D5C" path="M0,15 Q15,15 20,10 T40,10 T60,5" />
          </div>
          <div className="w-full bg-[var(--track)] h-[6px] rounded-none overflow-hidden mt-3 border border-[var(--rule)]/30">
            <div 
              className="bg-[var(--safe)] h-full rounded-none" 
              style={{ width: `${stats?.todaysClasses > 0 ? Math.round(((stats?.classesCompleted || 0) / stats?.todaysClasses) * 100) : 0}%` }} 
            />
          </div>
        </div>

        {/* Card 3: Pending Attendance */}
        <div className="bg-[var(--paper-raised)] p-5 rounded-none border border-[var(--rule)] shadow-none flex flex-col justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-none bg-[var(--warn-bg)] border border-[var(--warn)]/20 flex items-center justify-center flex-shrink-0 text-[var(--warn)]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-[var(--ink-soft)]">Pending Roll</p>
              <h3 className="font-mono text-2xl font-black text-[var(--navy)] leading-tight mt-0.5">
                {stats?.pendingAttendance < 10 ? `0${stats?.pendingAttendance || 0}` : stats?.pendingAttendance}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-xs font-semibold px-[8px] py-[2px] rounded-none bg-[var(--warn-bg)] text-[var(--warn)] border border-[var(--warn)]/40">
              Need to Mark
            </span>
            <Sparkline color="#C2872B" path="M0,15 Q15,10 20,15 T40,5 T60,10" />
          </div>
          <div className="w-full bg-[var(--track)] h-[6px] rounded-none overflow-hidden mt-3 border border-[var(--rule)]/30">
            <div 
              className="bg-[var(--warn)] h-full rounded-none" 
              style={{ width: `${stats?.todaysClasses > 0 ? Math.round(((stats?.pendingAttendance || 0) / stats?.todaysClasses) * 100) : 0}%` }} 
            />
          </div>
        </div>

        {/* Card 4: Total Students */}
        <div className="bg-[var(--paper-raised)] p-5 rounded-none border border-[var(--rule)] shadow-none flex flex-col justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-none bg-[var(--paper)] border border-[var(--rule)] flex items-center justify-center flex-shrink-0 text-[var(--navy)]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-[var(--ink-soft)]">Total Students</p>
              <h3 className="font-mono text-2xl font-black text-[var(--navy)] leading-tight mt-0.5">
                {stats?.totalStudents || 0}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-xs text-[var(--ink-soft)]">Across sections</span>
            <Sparkline color="#1B2A4A" path="M0,15 L20,12 L40,14 L60,8" />
          </div>
          <div className="w-full bg-[var(--track)] h-[6px] rounded-none overflow-hidden mt-3 border border-[var(--rule)]/30">
            <div className="bg-[var(--navy)] h-full rounded-none" style={{ width: '85%' }} />
          </div>
        </div>

        {/* Card 5: At-Risk Students */}
        <div className="bg-[var(--paper-raised)] p-5 rounded-none border border-[var(--rule)] shadow-none flex flex-col justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-none bg-[var(--crit-bg)] border border-[var(--crit)]/20 flex items-center justify-center flex-shrink-0 text-[var(--crit)]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-[var(--ink-soft)]">At-Risk Count</p>
              <h3 className="font-mono text-2xl font-black text-[var(--crit)] leading-tight mt-0.5">
                {stats?.atRiskCount || 0}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-xs font-semibold px-[8px] py-[2px] rounded-none bg-[var(--crit-bg)] text-[var(--crit)] border border-[var(--crit)]/40">
              Need Attention
            </span>
            <Sparkline color="#B0483C" path="M0,15 L20,10 L40,15 L60,5" />
          </div>
          <div className="w-full bg-[var(--track)] h-[6px] rounded-none overflow-hidden mt-3 border border-[var(--rule)]/30">
            <div 
              className="bg-[var(--crit)] h-full rounded-none" 
              style={{ width: `${Math.min(100, (stats?.atRiskCount || 0) * 15)}%` }} 
            />
          </div>
        </div>
      </div>

      {/* MIDDLE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Today's Timetable */}
        <div className="lg:col-span-4 bg-[var(--paper-raised)] rounded-none border border-[var(--rule)] shadow-none p-5 flex flex-col">
          <div className="flex items-center justify-between mb-5 border-b border-[var(--rule)] pb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-base font-bold text-[var(--navy)]">Class Timetable</h2>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-mono text-[var(--ink)] bg-[var(--paper)] px-2.5 py-1 rounded-none border border-[var(--rule)] outline-none"
              />
              <Link to="/faculty/timetable" className="text-xs font-mono font-medium text-[var(--navy)] hover:underline flex items-center ml-1">
                Full <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px]">
            {(stats?.timetableData || []).map((slot, i) => (
              <div key={i} className="flex gap-3.5 p-3.5 rounded-none border border-[var(--rule)] bg-[var(--paper)]/50 relative overflow-hidden group">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${slot.status === 'Completed' ? 'bg-[var(--safe)]' : slot.status === 'Ongoing' ? 'bg-[var(--gold)]' : 'bg-[var(--navy)]'}`}></div>
                <div className="w-16 flex flex-col justify-center items-center flex-shrink-0 border-r border-[var(--rule)] pr-3">
                  <span className="font-mono text-xs font-bold text-[var(--navy)] text-center whitespace-pre-line">{slot.time}</span>
                </div>
                <div className="flex-1 flex flex-col justify-center pl-1">
                  <h4 className="font-serif text-sm font-bold text-[var(--navy)] leading-tight mb-1">{slot.subject}</h4>
                  <p className="font-mono text-xs text-[var(--ink-soft)] whitespace-pre-line">{slot.classInfo}</p>
                </div>
                <div className="flex flex-col items-end justify-center pl-1">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-[8px] py-[2px] rounded-none ${
                    slot.status === 'Completed' ? 'bg-[var(--safe-bg)] text-[var(--safe)] border border-[var(--safe)]/40' :
                    slot.status === 'Ongoing' ? 'bg-[var(--warn-bg)] text-[var(--warn)] border border-[var(--warn)]/40 animate-pulse' :
                    'bg-[var(--paper)] text-[var(--ink-soft)] border border-[var(--rule)]'
                  }`}>
                    {slot.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Overview Chart */}
        <div className="lg:col-span-5 bg-[var(--paper-raised)] rounded-none border border-[var(--rule)] shadow-none p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-[var(--rule)] pb-3">
            <div>
              <h2 className="font-serif text-base font-bold text-[var(--navy)]">Attendance Trendline</h2>
              <p className="text-xs font-mono text-[var(--ink-soft)]">Weekly aggregate participation index</p>
            </div>
            <button className="text-xs font-mono font-medium text-[var(--navy)] bg-[var(--paper)] px-2.5 py-1 rounded-none flex items-center border border-[var(--rule)]">
              This Week <ChevronDown className="w-3 h-3 ml-1" />
            </button>
          </div>
          <div className="flex-1 w-full mt-2 overflow-x-auto overflow-y-hidden" style={{ minHeight: '230px' }}>
            <div style={{ minWidth: '550px', height: '230px' }}>
              <AreaChart width={550} height={230} data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="facultyTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B2A4A" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#1B2A4A" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222631" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#5B6376', fontFamily: 'IBM Plex Mono', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#5B6376', fontFamily: 'IBM Plex Mono' }} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(val) => `${val}%`} />
                <RechartsTooltip contentStyle={{ borderRadius: '0px', border: '1px solid #222631', backgroundColor: '#FFFFFF', color: '#1D2333', fontFamily: 'IBM Plex Mono', fontSize: '12px' }} />
                <Area type="monotone" dataKey="value" stroke="#1B2A4A" strokeWidth={2.5} fillOpacity={1} fill="url(#facultyTrend)" />
              </AreaChart>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-[var(--paper)] border border-[var(--rule)] rounded-none p-3 shadow-none flex flex-col justify-center">
              <p className="text-[11px] font-mono text-[var(--ink-soft)] uppercase tracking-tight">Average Rate</p>
              <p className="text-xl font-mono font-bold text-[var(--navy)] mt-1">
                {stats?.classesCompleted === 0 ? '00%' : `${stats?.averageClassAttendance || 0}%`}
              </p>
            </div>
            <div className="bg-[var(--paper)] border border-[var(--rule)] rounded-none p-3 shadow-none flex flex-col justify-center">
              <p className="text-[11px] font-mono text-[var(--ink-soft)] uppercase tracking-tight">Peak ({[...attendanceData].sort((a,b) => b.value - a.value)[0]?.name || 'N/A'})</p>
              <p className="text-xl font-mono font-bold text-[var(--safe)] mt-1">{[...attendanceData].sort((a,b) => b.value - a.value)[0]?.value || 0}%</p>
            </div>
            <div className="bg-[var(--paper)] border border-[var(--rule)] rounded-none p-3 shadow-none flex flex-col justify-center">
              <p className="text-[11px] font-mono text-[var(--ink-soft)] uppercase tracking-tight">Low ({[...attendanceData].sort((a,b) => a.value - b.value)[0]?.name || 'N/A'})</p>
              <p className="text-xl font-mono font-bold text-[var(--crit)] mt-1">{[...attendanceData].sort((a,b) => a.value - b.value)[0]?.value || 0}%</p>
            </div>
          </div>
        </div>

        {/* At-Risk Students */}
        <div className="lg:col-span-3 bg-[var(--paper-raised)] border border-[var(--rule)] rounded-none shadow-none p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-base font-semibold text-[var(--navy)]">At-Risk Students</h2>
            <Link to="/faculty/students?filter=at-risk" className="text-xs font-mono text-[var(--navy)] hover:underline">View All</Link>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 min-h-[200px]">
                {stats?.atRiskStudents && stats.atRiskStudents.length > 0 ? (
                  stats.atRiskStudents.map((student, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-none bg-[var(--paper)] border border-[var(--rule)] hover:border-[var(--navy-soft)] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-none flex items-center justify-center text-xs font-mono font-bold bg-[var(--navy)] text-white">
                          {student.initials}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[var(--ink)]">{student.name}</h4>
                          <p className="text-xs font-mono text-[var(--ink-soft)]">{student.classInfo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-[var(--ink)]">{student.attendance}</div>
                        <div className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-none mt-1 uppercase tracking-wider ${
                          student.risk?.toLowerCase().includes('high') || student.risk?.toLowerCase().includes('crit')
                            ? 'text-[var(--crit)] bg-[var(--crit-bg)] border border-[var(--crit)]/30'
                            : student.risk?.toLowerCase().includes('med') || student.risk?.toLowerCase().includes('warn')
                            ? 'text-[var(--warn)] bg-[var(--warn-bg)] border border-[var(--warn)]/30'
                            : 'text-[var(--safe)] bg-[var(--safe-bg)] border border-[var(--safe)]/30'
                        }`}>
                          {student.risk} Risk
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-70 pt-8 pb-4">
                     <CheckCircle2 className="w-10 h-10 text-[var(--safe)] mb-3" />
                     <p className="text-sm font-medium text-[var(--ink)]">No At-Risk Students</p>
                     <p className="text-xs font-mono text-[var(--ink-soft)] mt-1">Everyone is maintaining good attendance!</p>
                  </div>
                )}
              </div>
        </div>

      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Subject-wise Attendance */}
        <div className="xl:col-span-6 bg-[var(--paper-raised)] border border-[var(--rule)] rounded-none shadow-none p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-base font-semibold text-[var(--navy)]">Subject-wise Attendance</h2>
            <button className="text-xs font-mono font-medium text-[var(--navy)] bg-[var(--paper)] px-2.5 py-1 rounded-none flex items-center border border-[var(--rule)]">
              Selected Date <ChevronDown className="w-3 h-3 ml-1" />
            </button>
          </div>
          <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--rule)]">
                      <th className="pb-3 text-[11px] font-mono font-semibold text-[var(--ink-soft)] uppercase tracking-wider">Subject</th>
                      <th className="pb-3 text-[11px] font-mono font-semibold text-[var(--ink-soft)] uppercase tracking-wider text-center">Classes Held</th>
                      <th className="pb-3 text-[11px] font-mono font-semibold text-[var(--ink-soft)] uppercase tracking-wider text-center">Avg Attended</th>
                      <th className="pb-3 text-[11px] font-mono font-semibold text-[var(--ink-soft)] uppercase tracking-wider text-center">Percentage</th>
                      <th className="pb-3 text-[11px] font-mono font-semibold text-[var(--ink-soft)] uppercase tracking-wider text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.subjectAttendance || []).map((sub, i) => (
                      <tr key={i} className="border-b border-[var(--rule)]/60 hover:bg-[var(--paper)] transition-colors">
                        <td className="py-3.5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-none flex items-center justify-center text-[var(--navy)] bg-[var(--paper)] border border-[var(--rule)]">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-semibold text-[var(--ink)]">{sub.subject}</span>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className="text-sm font-mono text-[var(--ink)]">{sub.held}</span>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className="text-sm font-mono text-[var(--ink)]">{sub.attended}</span>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className="text-sm font-mono font-bold text-[var(--ink)]">{sub.percent}</span>
                        </td>
                        <td className="py-3.5 text-right">
                          <span className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-none uppercase tracking-wider ${
                              sub.status === 'Good' ? 'text-[var(--safe)] bg-[var(--safe-bg)] border border-[var(--safe)]/40' : 
                              sub.status === 'Warning' ? 'text-[var(--warn)] bg-[var(--warn-bg)] border border-[var(--warn)]/40' : 
                              sub.status === 'Critical' ? 'text-[var(--crit)] bg-[var(--crit-bg)] border border-[var(--crit)]/40' :
                              'text-[var(--ink-soft)] bg-[var(--paper)] border border-[var(--rule)]'
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
        <div className="xl:col-span-4 bg-[var(--paper-raised)] border border-[var(--rule)] rounded-none shadow-none p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-base font-semibold text-[var(--navy)]">Recent Attendance Activity</h2>
            <Link to="/faculty/history" className="text-xs font-mono text-[var(--navy)] hover:underline">View All</Link>
          </div>
          <div className="space-y-6">
            {activities.map((activity, idx) => (
              <div key={idx} className="flex gap-3 relative">
                {idx !== activities.length - 1 && (
                  <div className="absolute left-2 top-5 bottom-[-20px] w-px bg-[var(--rule)]"></div>
                )}
                <div className="mt-0.5 shrink-0 w-4 h-4 rounded-none flex items-center justify-center bg-[var(--paper-raised)] border border-[var(--rule)] z-10 text-[var(--navy)]">
                  {(() => {
                    const Icon = activity.icon;
                    return <Icon className="w-3.5 h-3.5" />;
                  })()}
                </div>
                <div className="flex-1 -mt-1">
                  <h4 className="text-[13px] font-semibold text-[var(--ink)]">{activity.title}</h4>
                  <p className="text-[11px] font-mono text-[var(--ink-soft)] mt-0.5">{activity.subtitle}</p>
                </div>
                <div className="text-[10px] font-mono text-[var(--ink-soft)] whitespace-nowrap -mt-0.5">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="xl:col-span-2 bg-[var(--paper-raised)] border border-[var(--rule)] rounded-none shadow-none p-5 flex flex-col">
          <h2 className="font-serif text-base font-semibold text-[var(--navy)] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3 flex-1">
            <Link to="/faculty/attendance" className="p-3 rounded-none border border-[var(--rule)] hover:border-[var(--navy)] bg-[var(--paper)] hover:bg-[var(--paper-raised)] transition-all flex items-start gap-3 group">
              <div className="p-2 bg-[var(--paper-raised)] rounded-none border border-[var(--rule)] text-[var(--navy)] group-hover:bg-[var(--navy)] group-hover:text-white transition-colors"><CheckSquare className="w-4 h-4" /></div>
              <div>
                <p className="text-[13px] font-semibold text-[var(--ink)] group-hover:text-[var(--navy)] transition-colors">Take Attendance</p>
                <p className="text-[10px] text-[var(--ink-soft)] mt-0.5 leading-tight">Mark attendance for a class</p>
              </div>
            </Link>
            <Link to="/faculty/students" className="p-3 rounded-none border border-[var(--rule)] hover:border-[var(--navy)] bg-[var(--paper)] hover:bg-[var(--paper-raised)] transition-all flex items-start gap-3 group">
              <div className="p-2 bg-[var(--paper-raised)] rounded-none border border-[var(--rule)] text-[var(--navy)] group-hover:bg-[var(--navy)] group-hover:text-white transition-colors"><Users className="w-4 h-4" /></div>
              <div>
                <p className="text-[13px] font-semibold text-[var(--ink)] group-hover:text-[var(--navy)] transition-colors">View Students</p>
                <p className="text-[10px] text-[var(--ink-soft)] mt-0.5 leading-tight">View all class students</p>
              </div>
            </Link>
            <Link to="/faculty/reports" className="p-3 rounded-none border border-[var(--rule)] hover:border-[var(--navy)] bg-[var(--paper)] hover:bg-[var(--paper-raised)] transition-all flex items-start gap-3 group">
              <div className="p-2 bg-[var(--paper-raised)] rounded-none border border-[var(--rule)] text-[var(--navy)] group-hover:bg-[var(--navy)] group-hover:text-white transition-colors"><BarChart2 className="w-4 h-4" /></div>
              <div>
                <p className="text-[13px] font-semibold text-[var(--ink)] group-hover:text-[var(--navy)] transition-colors">Reports</p>
                <p className="text-[10px] text-[var(--ink-soft)] mt-0.5 leading-tight">Generate attendance reports</p>
              </div>
            </Link>
            <Link to="/faculty/analytics" className="p-3 rounded-none border border-[var(--rule)] hover:border-[var(--navy)] bg-[var(--paper)] hover:bg-[var(--paper-raised)] transition-all flex items-start gap-3 group">
              <div className="p-2 bg-[var(--paper-raised)] rounded-none border border-[var(--rule)] text-[var(--navy)] group-hover:bg-[var(--navy)] group-hover:text-white transition-colors"><MessageSquare className="w-4 h-4" /></div>
              <div>
                <p className="text-[13px] font-semibold text-[var(--ink)] group-hover:text-[var(--navy)] transition-colors">AI Insights</p>
                <p className="text-[10px] text-[var(--ink-soft)] mt-0.5 leading-tight">AI suggestions & alerts</p>
              </div>
            </Link>
          </div>
        </div>

      </div>

      {/* AI ALERT BANNER */}
      {stats?.atRiskStudents && stats.atRiskStudents.length > 0 && (
        <div className="bg-[var(--crit-bg)] border border-[var(--crit)]/30 rounded-none p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[var(--crit)] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-serif font-bold text-[var(--crit)]">AI Attendance Alert</h4>
              <p className="text-[13px] text-[var(--crit)]/90 mt-0.5 font-sans">
                {stats.atRiskStudents.length} {stats.atRiskStudents.length === 1 ? 'student is' : 'students are'} at high risk of attendance deficiency. Please take necessary actions to improve their attendance.
              </p>
            </div>
          </div>
          <Link to="/faculty/analytics" className="btn-navy text-xs font-mono uppercase tracking-wider py-2 px-4 rounded-none shrink-0 text-white">
            View AI Suggestions
          </Link>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
