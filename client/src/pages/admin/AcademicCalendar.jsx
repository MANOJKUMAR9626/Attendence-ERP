import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, AlertCircle, FileText, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const EVENTS = [
  { date: 15, title: 'Mid Semester Exams Begin', type: 'exam', color: 'bg-rose-500' },
  { date: 22, title: 'Tech Symposium 2026', type: 'event', color: 'bg-indigo-500' },
  { date: 28, title: 'Diwali Holiday', type: 'holiday', color: 'bg-amber-500' }
];

const AcademicCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 9)); // October 2026

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  return (
    <div className="space-y-6 max-w-6xl mx-auto page-enter">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-500" />
            Academic Calendar
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage institutional events, holidays, and exams.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white dark:bg-slate-950">Export PDF</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white"><Plus className="w-4 h-4 mr-2" /> Add Event</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar View */}
        <Card className="col-span-1 lg:col-span-2 glass-panel border-none shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-800 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{monthName}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-b border-slate-800 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center text-xs font-semibold text-slate-500 py-3">
              <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
            </div>
            <div className="grid grid-cols-7 auto-rows-fr">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px] border-r border-b border-slate-800 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/20" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const event = EVENTS.find(e => e.date === day);
                const isToday = day === 12; // Mocking today as Oct 12
                
                return (
                  <div key={day} className={`min-h-[100px] border-r border-b border-slate-800 dark:border-slate-800/50 p-2 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group relative ${isToday ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : ''}`}>
                    <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300'}`}>
                      {day}
                    </span>
                    {event && (
                      <div className={`mt-1 text-[10px] p-1 rounded font-medium text-white ${event.color} truncate shadow-sm`} title={event.title}>
                        {event.title}
                      </div>
                    )}
                    <button className="absolute top-2 right-2 w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center hover:text-indigo-600 transition-all">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events Sidebar */}
        <div className="space-y-6">
          <Card className="glass-panel border-none shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-100 dark:border-indigo-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-indigo-900 dark:text-indigo-300 flex items-center gap-2 text-base">
                <AlertCircle className="w-5 h-5 text-indigo-500" /> Upcoming This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {EVENTS.map((event, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm border border-white dark:border-slate-800">
                    <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 text-white ${event.color} shadow-sm`}>
                      <span className="text-xs font-bold leading-none">{event.date}</span>
                      <span className="text-[10px] uppercase font-semibold leading-none mt-0.5">Oct</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{event.title}</p>
                      <p className="text-xs text-slate-500 mt-1 capitalize flex items-center gap-1">
                        {event.type === 'holiday' ? <Gift className="w-3 h-3" /> : event.type === 'exam' ? <FileText className="w-3 h-3" /> : <CalendarIcon className="w-3 h-3" />}
                        {event.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default AcademicCalendar;
