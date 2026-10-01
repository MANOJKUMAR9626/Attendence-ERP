import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data generator for a 12-week semester (5 days a week)
const generateHeatmapData = () => {
  const data = [];
  for (let week = 0; week < 12; week++) {
    const days = [];
    for (let day = 0; day < 5; day++) {
      // 0 = No Class, 1 = Absent, 2 = Present, 3 = Medical/Duty
      const status = Math.random() > 0.8 ? 1 : Math.random() > 0.9 ? 3 : 2;
      days.push(status);
    }
    data.push(days);
  }
  return data;
};

const HeatmapData = generateHeatmapData();

const getColor = (status) => {
  switch (status) {
    case 0: return 'bg-slate-100 dark:bg-slate-800'; // No Class/Future
    case 1: return 'bg-rose-500'; // Absent
    case 2: return 'bg-emerald-500'; // Present
    case 3: return 'bg-amber-400'; // Leave
    default: return 'bg-slate-100 dark:bg-slate-800';
  }
};

const AttendanceHeatmap = () => {
  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-500" />
            Semester Attendance Heatmap
          </CardTitle>
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <Info className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-6 overflow-x-auto scrollbar-hide">
        <div className="min-w-[500px]">
          <div className="flex gap-2">
            {/* Y Axis Labels (Days) */}
            <div className="flex flex-col gap-2 pt-[22px] pr-2 text-[10px] font-medium text-slate-400">
              <span className="h-4 flex items-center">Mon</span>
              <span className="h-4 flex items-center">Tue</span>
              <span className="h-4 flex items-center">Wed</span>
              <span className="h-4 flex items-center">Thu</span>
              <span className="h-4 flex items-center">Fri</span>
            </div>

            {/* Matrix */}
            <div className="flex-1">
              <div className="flex gap-2 mb-1.5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex-1 text-[10px] font-medium text-slate-400 text-center">
                    W{i + 1}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                {HeatmapData.map((week, wIndex) => (
                  <div key={wIndex} className="flex flex-col gap-2 flex-1">
                    {week.map((dayStatus, dIndex) => (
                      <motion.div
                        key={dIndex}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (wIndex * 5 + dIndex) * 0.01 }}
                        className={`h-4 rounded-sm ${getColor(dayStatus)} cursor-pointer hover:ring-2 hover:ring-indigo-500/50 hover:scale-125 transition-all`}
                        title={dayStatus === 1 ? 'Absent' : dayStatus === 2 ? 'Present' : 'Leave'}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800" /> No Class
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-500" /> Present
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-rose-500" /> Absent
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-amber-400" /> Leave
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceHeatmap;
