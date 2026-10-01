import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const TIME_SLOTS = ['8:30–9:20','9:20–10:10','10:10–11:00','11:15–12:05','12:05–12:55','1:45–2:35','2:35–3:25'];

const TIMETABLE = {
  'Monday':    ['OS (III-A)',    'OS (III-B)',    '—',           'DBMS (III-A)', '—',            '—',           '—'],
  'Tuesday':   ['—',            'DBMS (III-B)',  'OS (III-A)',  '—',            'OS (III-B)',    '—',           '—'],
  'Wednesday': ['DBMS (III-A)', '—',             '—',           'OS (III-A)',   'DBMS (III-B)', '—',           '—'],
  'Thursday':  ['—',            'OS (III-A)',    '—',           '—',            '—',            'OS (III-B)',  'DBMS (III-A)'],
  'Friday':    ['OS (III-B)',   'DBMS (III-A)', 'OS (III-A)',  '—',            '—',            '—',           '—'],
};

const TODAY = new Date().toLocaleString('en-US',{weekday:'long'});

export default function FacultyTimetable() {
  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <Calendar className="w-6 h-6 text-emerald-500" />My Timetable
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Weekly class schedule. Today's classes are highlighted in blue.
        </p>
      </div>

      {/* Today's classes highlight */}
      {TIMETABLE[TODAY] && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {TIMETABLE[TODAY].map((cls, i) => cls !== '—' && (
            <motion.div key={i} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:i*0.1}}
              className="flex-shrink-0 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 min-w-[150px]">
              <p className="text-xs font-medium text-indigo-500 dark:text-indigo-400">{TIME_SLOTS[i]}</p>
              <p className="font-semibold text-indigo-900 dark:text-indigo-100 mt-0.5">{cls}</p>
            </motion.div>
          ))}
          {TIMETABLE[TODAY]?.every(c => c === '—') && (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-3">No classes scheduled for today.</p>
          )}
        </div>
      )}

      {/* Full grid */}
      <Card className="glass-panel border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-800 dark:border-slate-800">
          <CardTitle className="text-base">Weekly Schedule</CardTitle>
          <CardDescription>Academic Year 2026–27 — Even Semester</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900">
                  <th className="p-3 text-left font-semibold text-slate-600 dark:text-slate-400 border-b border-r border-slate-800 dark:border-slate-800 w-32">Time</th>
                  {DAYS.map(d => (
                    <th key={d} className={`p-3 text-center font-semibold border-b border-slate-800 dark:border-slate-800 ${d===TODAY?'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/5':'text-slate-600 dark:text-slate-400'}`}>
                      {d.slice(0,3)}
                      {d===TODAY && <span className="ml-1 text-xs">(Today)</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot, si) => {
                  const isBreak = si === 3;
                  return (
                    <tr key={slot} className="border-b border-slate-800 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 text-xs text-slate-500 dark:text-slate-400 font-mono border-r border-slate-800 dark:border-slate-800 whitespace-nowrap">{slot}</td>
                      {DAYS.map(d => {
                        const cls = TIMETABLE[d]?.[si] ?? '—';
                        const isToday = d === TODAY;
                        const hasClass = cls !== '—';
                        return (
                          <td key={d} className={`p-2 text-center ${isToday?'bg-indigo-50/30 dark:bg-indigo-500/5':''}`}>
                            {hasClass ? (
                              <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium
                                ${isToday?'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300':'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                {cls}
                              </span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-700 text-xs">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
