import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, BarChart3, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import api from '@/utils/api';
import toast from 'react-hot-toast';

const yearData = [
  {
    id: 1,
    year: '1st Year',
    percentage: 0,
    present: 0,
    absent: 0,
    total: 0,
    color: '#3B82F6', // Blue
    bgHeader: 'bg-blue-50/50',
    badge: 'bg-blue-600',
    text: 'text-blue-600'
  },
  {
    id: 2,
    year: '2nd Year',
    percentage: 0,
    present: 0,
    absent: 0,
    total: 0,
    color: '#10B981', // Emerald
    bgHeader: 'bg-emerald-50/50',
    badge: 'bg-emerald-600',
    text: 'text-emerald-600'
  },
  {
    id: 3,
    year: '3rd Year',
    percentage: 0,
    present: 0,
    absent: 0,
    total: 0,
    color: '#8B5CF6', // Violet
    bgHeader: 'bg-violet-50/50',
    badge: 'bg-violet-600',
    text: 'text-violet-600'
  },
  {
    id: 4,
    year: '4th Year',
    percentage: 0,
    present: 0,
    absent: 0,
    total: 0,
    color: '#F97316', // Orange
    bgHeader: 'bg-orange-50/50',
    badge: 'bg-orange-500',
    text: 'text-orange-500'
  }
];

const overallData = {
  percentage: 0,
  present: "0",
  absent: "0",
  total: "0",
  color: '#3B82F6' // Main Blue
};

const barData = [
  { name: '1st Year', value: 0, fill: '#3B82F6' },
  { name: '2nd Year', value: 0, fill: '#10B981' },
  { name: '3rd Year', value: 0, fill: '#8B5CF6' },
  { name: '4th Year', value: 0, fill: '#F97316' },
];

const CircularProgress = ({ percentage, color, size = 100, strokeWidth = 14, textClassName = "text-[18px]", trackClassName = "text-slate-200 dark:text-slate-800" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className={trackClassName}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="butt"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`font-black text-slate-800 dark:text-white tracking-tight ${textClassName}`}>{percentage}%</span>
      </div>
    </div>
  );
};

const AdminAttendance = () => {
  const [yearDataState, setYearDataState] = useState(yearData);
  const [overallDataState, setOverallDataState] = useState(overallData);
  const [barDataState, setBarDataState] = useState(barData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/attendance-stats');
        if (response.data.success) {
          const { yearStats, overall } = response.data.data;
          
          const newYearData = yearData.map(y => {
            const stats = yearStats[y.id] || { present: 0, absent: 0, total: 0 };
            const pct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
            return {
              ...y,
              percentage: pct,
              present: stats.present,
              absent: stats.absent,
              total: stats.total
            };
          });

          const overallPct = overall.total > 0 ? Math.round((overall.present / overall.total) * 100) : 0;
          
          setYearDataState(newYearData);
          setOverallDataState({
            ...overallData,
            percentage: overallPct,
            present: overall.present.toString(),
            absent: overall.absent.toString(),
            total: overall.total.toString()
          });

          setBarDataState(newYearData.map(y => ({ name: y.year, value: y.percentage, fill: y.color })));
        }
      } catch (error) {
        console.error('Failed to fetch attendance stats:', error);
        toast.error('Failed to load attendance statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header section with icon */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-100/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0 mt-1">
          <Calendar size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Attendance Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Track and monitor student attendance across all years.
          </p>
        </div>
      </motion.div>

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Years Cards - takes up 8 columns */}
        <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {yearDataState.map((year, idx) => (
            <motion.div 
              key={year.id}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-white dark:bg-slate-900 border border-slate-800 dark:border-slate-800 shadow-sm rounded-[20px] overflow-hidden h-full flex flex-col relative">
                {/* Subtle top background */}
                <div className={`absolute top-0 left-0 right-0 h-16 ${year.bgHeader} dark:opacity-10 pointer-events-none`} />
                
                <div className="p-5 flex flex-col h-full relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[13px] font-bold shadow-sm ${year.badge}`}>
                      {year.id}
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-[15px] tracking-tight">{year.year}</span>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-between py-4">
                    {/* Donut Chart */}
                    <CircularProgress 
                      percentage={year.percentage} 
                      color={year.color} 
                      size={100} 
                      strokeWidth={14} 
                      textClassName="text-[18px]" 
                      trackClassName="text-slate-100 dark:text-slate-800"
                    />

                    {/* Stats */}
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[11px] font-medium text-slate-500">Present</span>
                        </div>
                        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 ml-3.5">{year.present}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <div className="w-2 h-2 rounded-full bg-rose-500" />
                          <span className="text-[11px] font-medium text-slate-500">Absent</span>
                        </div>
                        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 ml-3.5">{year.absent}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-slate-800 dark:border-slate-800 text-center">
                    <span className="text-[12px] font-medium text-slate-500">Total Classes</span>
                    <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 ml-2">{year.total}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Overall Attendance Card - takes up 4 columns */}
        <div className="lg:col-span-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="h-full">
            <Card className="bg-[#f4f7ff] dark:bg-blue-950/20 border border-slate-800 dark:border-slate-800 shadow-sm rounded-[20px] h-full flex flex-col">
              <div className="p-6 flex flex-col h-full items-center">
                <div className="flex items-center gap-2 mb-6 w-full justify-center">
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Star size={14} fill="currentColor" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-[16px] tracking-tight">Overall Attendance</span>
                </div>
                
                <div className="mb-8">
                  <CircularProgress 
                    percentage={overallDataState.percentage} 
                    color={overallDataState.color} 
                    size={150} 
                    strokeWidth={18} 
                    textClassName="text-[32px]" 
                    trackClassName="text-slate-200 dark:text-slate-800"
                  />
                </div>

                <div className="flex w-full items-center justify-center gap-6 mb-4">
                  <div className="flex flex-col items-center">
                    <span className="text-[12px] font-medium text-slate-500">Present</span>
                    <span className="text-[15px] font-bold text-slate-800 dark:text-slate-200">{overallDataState.present}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[12px] font-medium text-slate-500">Absent</span>
                    <span className="text-[15px] font-bold text-slate-800 dark:text-slate-200">{overallDataState.absent}</span>
                  </div>
                </div>
                
                <div className="mt-auto w-full pt-4 border-t border-blue-200/60 dark:border-blue-900/50 flex items-center justify-center gap-2">
                    <span className="text-[13px] font-medium text-slate-500">Total Classes</span>
                    <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200">{overallDataState.total}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Year-wise Attendance Summary Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-white dark:bg-slate-900 border border-slate-800 dark:border-slate-800 shadow-sm rounded-[20px] h-full">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-[15px] font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-blue-500" />
                Year-wise Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[12px] font-bold text-slate-700 dark:text-slate-300 border-b-2 border-slate-800 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-2">Year</th>
                      <th className="py-3 px-2 text-center">Present</th>
                      <th className="py-3 px-2 text-center">Absent</th>
                      <th className="py-3 px-2 text-center">Total Classes</th>
                      <th className="py-3 px-2 text-right">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearDataState.map((row) => (
                      <tr key={row.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-md text-[12px] font-bold text-white shadow-sm ${row.badge}`}>
                            {row.year}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[14px] font-semibold text-slate-700 dark:text-slate-300">
                          {row.present}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[14px] font-semibold text-slate-700 dark:text-slate-300">
                          {row.absent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[14px] font-semibold text-slate-700 dark:text-slate-300">
                          {row.total}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-[14px] font-bold ${row.text}`}>
                          {row.percentage}%
                        </td>
                      </tr>
                    ))}
                    
                    {/* Overall Summary Row */}
                    <tr className="bg-slate-50/80 dark:bg-slate-800/50">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-sm">
                            <Star size={12} fill="currentColor" />
                          </div>
                          <span className="font-bold text-[14px] text-slate-800 dark:text-slate-200">Overall</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-[15px] font-bold text-slate-800 dark:text-slate-200">
                        {overallDataState.present}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-[15px] font-bold text-slate-800 dark:text-slate-200">
                        {overallDataState.absent}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-[15px] font-bold text-slate-800 dark:text-slate-200">
                        {overallDataState.total}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-[15px] font-black text-blue-600 dark:text-blue-400">
                        {overallDataState.percentage}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance Percentage by Year Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="bg-white dark:bg-slate-900 border border-slate-800 dark:border-slate-800 shadow-sm rounded-[20px] h-full">
            <CardHeader className="pb-6 pt-6 px-6">
              <CardTitle className="text-[15px] font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-500" />
                Attendance Percentage by Year
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="h-[280px] w-full flex items-end justify-around pt-8 pb-2 border-b border-slate-800 dark:border-slate-800 relative">
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-8">
                  {[100, 75, 50, 25, 0].map(val => (
                    <div key={val} className="w-full flex items-center">
                      <span className="text-[10px] text-slate-400 w-8 text-right pr-2 shrink-0">{val}%</span>
                      <div className="flex-1 border-b border-dashed border-slate-800/60 dark:border-slate-700/50"></div>
                    </div>
                  ))}
                </div>

                {/* Bars */}
                <div className="w-full h-[100%] flex items-end justify-around pl-8 z-10">
                  {barDataState.map((entry, index) => (
                    <div key={index} className="flex flex-col items-center group relative h-[100%] justify-end w-full max-w-[60px]">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 bg-slate-800 text-white text-[11px] font-bold py-1 px-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                        {entry.name}: {entry.value}%
                      </div>
                      
                      {/* The Bar */}
                      <div className="w-full relative flex flex-col justify-end items-center transition-all duration-700 ease-out" style={{ height: '100%' }}>
                         {entry.value > 0 && (
                           <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             {entry.value}%
                           </span>
                         )}
                         <div 
                           className="w-full rounded-t-lg shadow-sm transition-all duration-1000 ease-out relative overflow-hidden group-hover:opacity-90"
                           style={{ height: `${entry.value}%`, backgroundColor: entry.fill }}
                         >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                         </div>
                      </div>
                      
                      {/* Label */}
                      <span className="text-[12px] font-bold text-slate-500 mt-3 absolute -bottom-7 whitespace-nowrap">
                        {entry.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
};

export default AdminAttendance;
