import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckSquare, CheckCircle2, XCircle, Home, PlusCircle, Sparkles, Clock, MapPin, User,
  Bell, AlertTriangle, Info
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList
} from 'recharts';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { toast } from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

// Custom label for the bar chart
const CustomBarLabel = (props) => {
  const { x, y, width, value } = props;
  return (
    <text x={x + width / 2} y={y - 8} fill="#334155" fontSize="12" fontWeight="bold" textAnchor="middle">
      {value}%
    </text>
  );
};

// Custom dot for line chart to highlight the last point
const CustomLineDot = (props) => {
  const { cx, cy, index, dataLength, value } = props;
  if (cx === undefined || cy === undefined || isNaN(cx) || isNaN(cy)) return null;
  
  if (index === dataLength - 1) {
    return (
      <g transform={`translate(${cx - 16}, ${cy - 12})`}>
        <rect width="32" height="24" rx="4" fill="#EF4444" />
        <text x="16" y="16" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">{value}%</text>
      </g>
    );
  }
  return <circle cx={cx} cy={cy} r={4} fill="#2962FF" stroke="white" strokeWidth={2} />;
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState({ name: 'Student' });
  const [timetable, setTimetable] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => sessionStorage.getItem('studentSelectedDate') || new Date().toISOString().split('T')[0]);

  useEffect(() => {
    sessionStorage.setItem('studentSelectedDate', selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get(`/dashboard/student?date=${selectedDate}`);
        setStats(response.data.data);
      } catch (error) {
        toast.error('Failed to load dashboard stats');
      }
    };
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.data) setUser(response.data.data);
      } catch (error) {}
    };
    const fetchTimetable = async () => {
      try {
        const response = await api.get('/student/timetable/today');
        if (response.data.success) {
          setTimetable(response.data.data);
        }
      } catch (error) {
        console.error('Failed to load timetable', error);
      }
    };
    fetchStats();
    fetchUser();
    fetchTimetable();
  }, [selectedDate]);

  const overall = stats ? stats.overallPercentage : 100;
  const isSafe = overall >= 75;
  const remaining = isSafe ? 0 : 75 - overall;
  const absent = 100 - overall;

  const pieData = [
    { name: 'Attended', value: overall, color: isSafe ? '#10B981' : '#FF3B30' },
    { name: 'Remaining', value: remaining, color: '#FF9500' },
    { name: 'Absent', value: absent > remaining ? absent - remaining : 0, color: '#E5E7EB' }
  ].filter(d => d.value > 0);

  // If entirely empty (shouldn't happen with our logic, but just in case), provide a blank gray track
  if (pieData.length === 0) {
    pieData.push({ name: 'Empty', value: 100, color: '#E5E7EB' });
  }

  const barChartData = {
    labels: stats?.subjectData?.map(d => d.subject) || [],
    datasets: [{
      data: stats?.subjectData?.map(d => d.value) || [],
      backgroundColor: stats?.subjectData?.map(d => d.fill || '#4F46E5') || [],
      borderRadius: 6,
      barThickness: 45,
    }]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#334155',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context) => ` Attendance: ${context.parsed.y}%`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { size: 12, weight: 'bold' }, color: '#64748B' }
      },
      y: {
        grid: { color: '#E2E8F0' },
        border: { display: false },
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          font: { size: 11, weight: '600' },
          color: '#64748B',
          callback: (value) => `${value}%`
        }
      }
    }
  };

  const topLabelsPlugin = {
    id: 'topLabels',
    afterDatasetsDraw(chart, args, pluginOptions) {
      const { ctx } = chart;
      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        if (!meta.hidden) {
          meta.data.forEach((element, index) => {
            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 13px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            const dataString = dataset.data[index] + '%';
            ctx.fillText(dataString, element.x, element.y - 8);
          });
        }
      });
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[32px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Good Morning, {user.name.split(' ')[0]}! <span className="text-2xl animate-wave">👋</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-[15px]">Here's your attendance overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700 bg-white border border-slate-800 px-4 py-2.5 rounded-xl shadow-sm hidden sm:inline-block">
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}
          </span>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-700 font-medium text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm cursor-pointer hover:border-slate-300"
          />
        </div>
      </div>

      {/* Top Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Donut Chart Card */}
        <Card className="lg:col-span-4 rounded-3xl border border-slate-800 shadow-sm overflow-hidden bg-white">
          <CardContent className="p-8 flex flex-col items-center justify-center h-full">
            <div className="relative w-48 h-48">
              <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                {/* Background track (Empty) */}
                <circle cx="100" cy="100" r="75" fill="none" stroke="#E5E7EB" strokeWidth="20" />
                
                {/* Segments */}
                {(() => {
                  const circumference = 2 * Math.PI * 75;
                  let currentOffset = 0;
                  
                  return pieData.map((entry, index) => {
                    const strokeDasharray = `${(entry.value / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -currentOffset;
                    currentOffset += (entry.value / 100) * circumference;
                    
                    return (
                      <circle
                        key={index}
                        cx="100"
                        cy="100"
                        r="75"
                        fill="none"
                        stroke={entry.color}
                        strokeWidth="20"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap={entry.value > 0 ? "round" : "butt"}
                        className="transition-all duration-1000 ease-in-out"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-900 tracking-tight">{overall}%</span>
                <span className={`text-sm font-bold mt-1 ${isSafe ? 'text-emerald-500' : 'text-[#FF3B30]'}`}>
                  {stats?.aiRiskScore || 'Evaluating...'}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-6">
              {isSafe ? (
                 <>You are <span className="text-emerald-500 font-bold">Safe</span> this semester</>
              ) : (
                 <>You need <span className="text-[#FF3B30] font-bold">{remaining}%</span> more to be safe</>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Stacked Stat Cards */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {[
            { label: 'Total Classes', value: stats?.totalClasses || 0, icon: CheckSquare, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-slate-500' },
            { label: 'Present', value: stats?.presentCount || 0, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-slate-500' },
            { label: 'Absent', value: stats?.absentCount || 0, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-slate-500' },
            { label: 'OD', value: stats?.odCount || 0, icon: Home, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-slate-500' },
            { label: 'Medical Leave', value: stats?.medicalLeaveCount || 0, icon: PlusCircle, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-slate-500' },
          ].map((stat, i) => (
            <div key={i} className={`flex-1 flex items-center p-3 rounded-2xl border ${stat.border} bg-white shadow-sm gap-4`}>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} strokeWidth={2.5} />
              </div>
              <div className="flex-1 flex flex-col">
                <span className="text-xs font-bold text-slate-500">{stat.label}</span>
                <span className="text-lg font-black text-slate-800 leading-tight">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Line Chart Card */}
        <Card className="lg:col-span-5 rounded-3xl border border-slate-800 shadow-sm bg-white">
          <CardContent className="p-6 h-full flex flex-col">
            <h3 className="text-base font-bold text-slate-900 mb-6">Attendance Trend (Live)</h3>
            <div className="flex-1 w-full mt-4">
              {stats?.trendData?.length > 0 ? (
                  <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '10px' }}>
                    <AreaChart width={700} height={260} data={stats.trendData} margin={{ top: 30, right: 20, left: -20, bottom: 30 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontWeight: 600 }} dy={5} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tickFormatter={(val) => `${val}%`} />
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotoneX" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" activeDot={{ r: 6 }} dot={<CustomLineDot dataLength={stats.trendData.length} />} />
                    </AreaChart>
                  </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400 font-medium">
                  Loading trend data...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Today's Schedule</h3>
        {timetable.length === 0 ? (
           <Card className="rounded-2xl border border-slate-800 shadow-sm bg-white p-8 text-center">
             <p className="text-slate-500 font-medium">No classes scheduled for today! Enjoy your day off.</p>
           </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {timetable.map((period, i) => (
              <Card key={i} className="rounded-2xl border border-slate-800 shadow-sm bg-white hover:border-indigo-200 hover:shadow-md transition-all">
                <CardContent className="p-5 flex flex-col h-full justify-between">
                   <div>
                     <div className="flex justify-between items-start mb-2">
                       <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                         Period {period.periodNumber}
                       </span>
                     </div>
                     <h4 className="text-[15px] font-bold text-slate-900 leading-tight mb-2 line-clamp-2" title={period.subject?.name}>
                       {period.subject?.name || 'Unknown Subject'}
                     </h4>
                     <p className="text-xs text-slate-500 font-semibold mb-3">{period.subject?.code}</p>
                   </div>
                   
                   <div className="space-y-2 mt-2 pt-3 border-t border-slate-50">
                     <div className="flex items-center gap-2 text-xs text-slate-600">
                       <Clock className="w-3.5 h-3.5 text-indigo-400" />
                       <span className="font-medium">{period.startTime} - {period.endTime}</span>
                     </div>
                     <div className="flex items-center gap-2 text-xs text-slate-600">
                       <MapPin className="w-3.5 h-3.5 text-rose-400" />
                       <span className="font-medium">{period.room || 'TBD'}</span>
                     </div>
                     <div className="flex items-center gap-2 text-xs text-slate-600">
                       <User className="w-3.5 h-3.5 text-emerald-400" />
                       <span className="font-medium line-clamp-1" title={period.faculty?.user?.name}>{period.faculty?.user?.name || 'TBA'}</span>
                     </div>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* AI Insight Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-8 relative overflow-hidden bg-gradient-to-br from-[#E0E7FF] via-[#E8E4FF] to-[#DCE6FF] shadow-sm border border-indigo-100"
        >
          <div className="absolute right-0 bottom-0 opacity-40 pointer-events-none mix-blend-multiply w-[200px] h-[200px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="absolute right-[-20px] bottom-[-20px] w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                AI Attendance Insight
              </h3>
              <p className="text-slate-700 font-semibold leading-relaxed max-w-[85%] text-sm">
                Your attendance is {overall}%. <br/>
                You are at <span className={`${isSafe ? 'text-emerald-600' : 'text-red-600'} font-bold`}>{stats?.aiRiskScore || 'Low Risk'}</span> of attendance deficiency. <br/>
                {isSafe ? 'Keep up the good work!' : 'Please attend upcoming classes regularly to improve your attendance.'}
              </p>
            </div>
            <div className="mt-8">
              <button 
                onClick={() => navigate('/student/ai-prediction')}
                className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
              >
                View Suggestions
              </button>
            </div>
            
            <div className="absolute bottom-4 right-4 w-20 h-20 rounded-full border border-indigo-200/50 flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-inner">
               <span className="text-2xl font-black text-indigo-400/60 mix-blend-overlay">AI</span>
               <div className="absolute inset-0 rounded-full border border-dashed border-indigo-300 animate-[spin_10s_linear_infinite]"></div>
               <div className="absolute inset-2 rounded-full border border-dotted border-indigo-400 animate-[spin_8s_linear_infinite_reverse]"></div>
            </div>
          </div>
        </motion.div>

        {/* Subject-wise Bar Chart */}
        <Card className="rounded-3xl border border-slate-800 shadow-sm bg-white">
          <CardContent className="p-8 h-full flex flex-col">
            <h3 className="text-base font-bold text-slate-900 mb-6">Subject-wise Attendance</h3>
            <div className="flex-1 w-full mt-4 overflow-x-auto overflow-y-hidden" style={{ minHeight: '220px' }}>
              {stats?.subjectData?.length > 0 ? (
                <div style={{ minWidth: '500px', height: '220px' }}>
                  <Bar data={barChartData} options={barChartOptions} plugins={[topLabelsPlugin]} />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400 font-medium">
                  Loading attendance data...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
