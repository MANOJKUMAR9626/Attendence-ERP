import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const TIMETABLE_DATA = [
  { id: 1, day: 'Mon', time: '10:30 AM - 11:30 AM', subject: 'DBMS', faculty: 'Ramesh S', room: 'Room 30' },
  { id: 2, day: 'Mon', time: '11:45 AM - 12:45 PM', subject: 'Computer Networks', faculty: 'Anitha', room: 'Room 30' },
  { id: 3, day: 'Tue', time: '10:30 AM - 11:30 AM', subject: 'Operating Systems', faculty: 'Ramesh S', room: 'Room 40' },
  { id: 4, day: 'Tue', time: '02:00 PM - 03:00 PM', subject: 'Data Structures', faculty: 'Anitha', room: 'Room 30' },
  { id: 5, day: 'Wed', time: '10:30 AM - 11:30 AM', subject: 'DBMS', faculty: 'Ramesh S', room: 'Room 30' },
];

export default function Timetable() {
  return (
    <div className="space-y-6 pb-10 max-w-5xl mx-auto page-enter">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        
        <div className="p-2 sm:p-4 mb-4">
          <h1 className="text-xl font-bold tracking-wide uppercase text-indigo-700 dark:text-indigo-400 mb-6">
            9. Timetable
          </h1>
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            My Timetable
          </h2>
        </div>
        
        <Card className="glass-panel border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-[12px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4">Day</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Faculty</th>
                    <th className="px-6 py-4">Room</th>
                  </tr>
                </thead>
                <tbody>
                  {TIMETABLE_DATA.map((row) => (
                    <tr key={row.id} className="border-b border-slate-800 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{row.day}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.time}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.subject}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.faculty}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </motion.div>
    </div>
  );
}
