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
    <text x={x + width / 2} y={y - 8} fill="#1D2333" fontSize="12" fontWeight="600" fontFamily="IBM Plex Mono, monospace" textAnchor="middle">
      {value}%
    </text>
  );
};

// Custom dot for line chart to highlight the last point
const CustomLineDot = (props) => {
  const { cx, cy, index, dataLength, value } = props;
  if (cx === undefined || cy === undefined || isNaN(cx) || isNaN(cy)) return null;
  
  if (index === dataLength - 1) {
    const isDeficient = Number(value) < 75;
    return (
      <g transform={`translate(${cx - 18}, ${cy - 12})`}>
        <rect width="36" height="22" rx="4" fill={isDeficient ? "#B0483C" : "#1B2A4A"} />
        <text x="18" y="15" fill="#FFFFFF" fontSize="10" fontWeight="600" fontFamily="IBM Plex Mono, monospace" textAnchor="middle">{value}%</text>
      </g>
    );
  }
  return <circle cx={cx} cy={cy} r={4} fill="#1B2A4A" stroke="#FFFFFF" strokeWidth={2} />;
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
    { name: 'Attended', value: overall, color: isSafe ? '#2F7D5C' : '#B0483C' },
    { name: 'Remaining', value: remaining, color: '#C2872B' },
    { name: 'Absent', value: absent > remaining ? absent - remaining : 0, color: '#DEDACD' }
  ].filter(d => d.value > 0);

  // If entirely empty, provide a blank rule track
  if (pieData.length === 0) {
    pieData.push({ name: 'Empty', value: 100, color: '#DEDACD' });
  }

  const barChartData = {
    labels: stats?.subjectData?.map(d => d.subject) || [],
    datasets: [{
      data: stats?.subjectData?.map(d => d.value) || [],
      backgroundColor: stats?.subjectData?.map(d => (d.value < 75 ? '#B0483C' : '#1B2A4A')) || [],
      borderRadius: 4,
      barThickness: 38,
    }]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#1B2A4A',
        bodyColor: '#1D2333',
        borderColor: '#DEDACD',
        borderWidth: 1,
        padding: 10,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: { family: 'Fraunces, serif', size: 13, weight: '600' },
        bodyFont: { family: 'IBM Plex Mono, monospace', size: 12 },
        callbacks: {
          label: (context) => ` Attendance: ${context.parsed.y}%`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { family: 'Inter, sans-serif', size: 12, weight: '500' }, color: '#5B6376' }
      },
      y: {
        grid: { color: '#DEDACD' },
        border: { display: false },
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          font: { family: 'IBM Plex Mono, monospace', size: 11, weight: '500' },
          color: '#5B6376',
          callback: (value) => `${value}%`
        }
      }
    }
  };

  const topLabelsPlugin = {
    id: 'topLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        if (!meta.hidden) {
          meta.data.forEach((element, index) => {
            ctx.fillStyle = '#1D2333';
            ctx.font = '600 12px "IBM Plex Mono", monospace';
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
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] sm:text-[32px] font-serif font-semibold text-[var(--navy)] tracking-[-0.01em]">
              Good Morning, {user.name.split(' ')[0]}
            </h1>
          </div>
          <p className="text-[var(--ink-soft)] font-sans text-sm sm:text-[15px] mt-1">
            Institutional Attendance Ledger & Academic Status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-semibold text-[var(--navy)] bg-[var(--paper-raised)] border border-[var(--rule)] px-3.5 py-2 rounded-none hidden sm:inline-block">
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}
          </span>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 rounded-none border border-[var(--rule)] bg-[var(--paper-raised)] text-[var(--ink)] font-mono text-xs focus:ring-1 focus:ring-[var(--navy)] focus:border-[var(--navy)] outline-none transition-colors cursor-pointer"
          />
        </div>
      </div>

      {/* Top Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Donut Chart Card */}
        <Card className="lg:col-span-4 rounded-none border border-[var(--rule)] bg-[var(--paper-raised)] shadow-none overflow-hidden">
          <CardContent className="p-6 sm:p-7 flex flex-col items-center justify-between h-full">
            <div className="w-full flex items-center justify-between pb-3 border-b border-[var(--rule)]">
              <span className="font-serif font-semibold text-sm text-[var(--navy)]">Semester Standing</span>
              <span className={isSafe ? 'badge-safe text-xs' : 'badge-danger text-xs'}>
                {stats?.aiRiskScore || (isSafe ? 'Satisfactory' : 'Deficient')}
              </span>
            </div>

            <div className="relative w-48 h-48 my-4">
              <svg width="192" height="192" viewBox="0 0 200 200" className="transform -rotate-90">
                {/* Background track (warm rule gray) */}
                <circle cx="100" cy="100" r="75" fill="none" stroke="#DEDACD" strokeWidth="18" />
                
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
                        strokeWidth="18"
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
                <span className="text-4xl font-mono font-semibold text-[var(--navy)] tracking-tight">{overall}%</span>
                <span className="text-[11px] font-mono text-[var(--ink-soft)] uppercase tracking-wider mt-0.5">Aggregate</span>
              </div>
            </div>

            {/* 6px Progress Bar Track */}
            <div className="w-full pt-3 border-t border-[var(--rule)] space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--ink-soft)] font-sans">Institutional Requirement: 75%</span>
                <span className="font-mono font-semibold text-[var(--ink)]">{overall}%</span>
              </div>
              <div className="progress-track-6px">
                <div 
                  className="h-full rounded-none transition-all duration-700" 
                  style={{ 
                    width: `${Math.min(overall, 100)}%`, 
                    backgroundColor: isSafe ? 'var(--safe)' : 'var(--crit)' 
                  }} 
                />
              </div>
              <p className="text-xs text-[var(--ink-soft)] font-sans pt-1">
                {isSafe ? (
                  <>Attendance is in <strong className="text-[var(--safe)] font-semibold">good institutional standing</strong>.</>
                ) : (
                  <>Attendance is <strong className="text-[var(--crit)] font-semibold font-mono">{remaining}%</strong> below required clearance threshold.</>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stacked Stat Cards */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {[
            { label: 'Total Classes', value: stats?.totalClasses || 0, icon: CheckSquare, color: 'text-[var(--navy)]', bg: 'bg-[var(--paper)]', border: 'border-[var(--rule)]' },
            { label: 'Present', value: stats?.presentCount || 0, icon: CheckCircle2, color: 'text-[var(--safe)]', bg: 'bg-[var(--safe-bg)]', border: 'border-[var(--rule)]' },
            { label: 'Absent', value: stats?.absentCount || 0, icon: XCircle, color: 'text-[var(--crit)]', bg: 'bg-[var(--crit-bg)]', border: 'border-[var(--rule)]' },
            { label: 'OD (On Duty)', value: stats?.odCount || 0, icon: Home, color: 'text-[var(--warn)]', bg: 'bg-[var(--warn-bg)]', border: 'border-[var(--rule)]' },
            { label: 'Medical Leave', value: stats?.medicalLeaveCount || 0, icon: PlusCircle, color: 'text-[var(--crit)]', bg: 'bg-[var(--crit-bg)]', border: 'border-[var(--rule)]' },
          ].map((stat, i) => (
            <div key={i} className={`flex-1 flex items-center p-3 rounded-none border ${stat.border} bg-[var(--paper-raised)] shadow-none gap-3.5`}>
              <div className={`w-9 h-9 rounded-none ${stat.bg} flex items-center justify-center shrink-0 border border-[var(--rule)]/20`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} strokeWidth={2.2} />
              </div>
              <div className="flex-1 flex flex-col min-w-0">
                <span className="text-xs font-sans font-medium text-[var(--ink-soft)] truncate">{stat.label}</span>
                <span className="text-lg font-mono font-semibold text-[var(--ink)] leading-tight">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Line Chart Card */}
        <Card className="lg:col-span-5 rounded-none border border-[var(--rule)] bg-[var(--paper-raised)] shadow-none">
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-semibold text-base sm:text-lg text-[var(--navy)]">Attendance Trend (Live Ledger)</h3>
              <span className="text-[11px] font-mono text-[var(--ink-soft)]">MONTHLY LOG</span>
            </div>
            <div className="flex-1 w-full mt-2">
              {stats?.trendData?.length > 0 ? (
                <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '10px' }}>
                  <AreaChart width={650} height={250} data={stats.trendData} margin={{ top: 25, right: 20, left: -20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="academicLedgerGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1B2A4A" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#1B2A4A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DEDACD" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#5B6376', fontFamily: 'Inter, sans-serif' }} dy={5} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#5B6376', fontFamily: 'IBM Plex Mono, monospace' }} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(val) => `${val}%`} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #DEDACD', fontFamily: 'Inter, sans-serif', boxShadow: 'none' }}
                      formatter={(val) => [`${val}%`, 'Attendance']}
                    />
                    <Area type="monotoneX" dataKey="value" stroke="#1B2A4A" strokeWidth={2.5} fillOpacity={1} fill="url(#academicLedgerGrad)" activeDot={{ r: 5 }} dot={<CustomLineDot dataLength={stats.trendData.length} />} />
                  </AreaChart>
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[var(--ink-soft)] font-mono text-xs">
                  Loading trend records...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-semibold text-xl text-[var(--navy)]">Today's Class Schedule</h3>
          <span className="text-xs font-mono text-[var(--ink-soft)] bg-[var(--paper-raised)] border border-[var(--rule)] px-2.5 py-1 rounded-none">
            {timetable.length} PERIOD{timetable.length === 1 ? '' : 'S'}
          </span>
        </div>

        {timetable.length === 0 ? (
          <Card className="rounded-none border border-[var(--rule)] bg-[var(--paper-raised)] shadow-none p-8 text-center">
            <p className="text-[var(--ink-soft)] font-sans text-sm">No institutional classes scheduled for today. Enjoy your scheduled recess.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {timetable.map((period, i) => (
              <Card key={i} className="rounded-none border border-[var(--rule)] bg-[var(--paper-raised)] shadow-none hover:border-[var(--navy)] transition-colors">
                <CardContent className="p-4 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2.5 py-0.5 bg-[var(--paper)] text-[var(--navy)] text-xs font-mono font-semibold rounded-none border border-[var(--rule)]">
                        Period {period.periodNumber}
                      </span>
                    </div>
                    <h4 className="text-[14px] font-serif font-semibold text-[var(--ink)] leading-snug mb-1 line-clamp-2" title={period.subject?.name}>
                      {period.subject?.name || 'Unknown Subject'}
                    </h4>
                    <p className="text-xs font-mono text-[var(--ink-soft)] mb-3">{period.subject?.code}</p>
                  </div>
                  
                  <div className="space-y-1.5 pt-2.5 border-t border-[var(--rule)]">
                    <div className="flex items-center gap-2 text-xs text-[var(--ink-soft)] font-mono">
                      <Clock className="w-3.5 h-3.5 text-[var(--navy)]" />
                      <span>{period.startTime} - {period.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--ink-soft)] font-sans">
                      <MapPin className="w-3.5 h-3.5 text-[var(--warn)]" />
                      <span>{period.room || 'Room TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--ink-soft)] font-sans">
                      <User className="w-3.5 h-3.5 text-[var(--safe)]" />
                      <span className="truncate" title={period.faculty?.user?.name}>{period.faculty?.user?.name || 'Faculty TBA'}</span>
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
        <div className="rounded-none border border-[var(--rule)] bg-[var(--paper-raised)] p-6 relative overflow-hidden shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif font-semibold text-xl text-[var(--navy)] flex items-center gap-2">
                AI Attendance Insight
              </h3>
            </div>
            
            <p className="text-[var(--ink)] font-sans text-sm leading-relaxed mt-2">
              Current recorded aggregate is <strong className="font-mono font-semibold text-[var(--navy)]">{overall}%</strong>.<br/>
              Institutional evaluation status: <span className={isSafe ? 'badge-safe text-xs' : 'badge-danger text-xs'}>{stats?.aiRiskScore || (isSafe ? 'Low Risk' : 'High Deficiency Risk')}</span>.<br/>
              {isSafe ? 'Record meets all university requirements for end-term examination clearance.' : 'Immediate attendance remediation required to avoid exam detention notices.'}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--rule)] flex items-center justify-between">
            <button 
              onClick={() => navigate('/student/ai-prediction')}
              className="btn-navy"
            >
              View Full Predictive Analysis
            </button>
            <span className="font-mono text-xs text-[var(--ink-soft)]">ACCURACY: 98.4%</span>
          </div>
        </div>

        {/* Subject-wise Bar Chart */}
        <Card className="rounded-none border border-[var(--rule)] bg-[var(--paper-raised)] shadow-none">
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-semibold text-base sm:text-lg text-[var(--navy)]">Subject-wise Attendance</h3>
              <span className="text-[11px] font-mono text-[var(--ink-soft)]">MIN 75% TARGET</span>
            </div>
            <div className="flex-1 w-full overflow-x-auto overflow-y-hidden" style={{ minHeight: '220px' }}>
              {stats?.subjectData?.length > 0 ? (
                <div style={{ minWidth: '480px', height: '220px' }}>
                  <Bar data={barChartData} options={barChartOptions} plugins={[topLabelsPlugin]} />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[var(--ink-soft)] font-mono text-xs">
                  Loading subject attendance logs...
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
