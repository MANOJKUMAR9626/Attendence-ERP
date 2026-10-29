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
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--navy)] tracking-[-0.01em]">
                Weekly Class Schedule
              </h1>
              <span className="stamp hidden sm:inline-flex">TIMETABLE LEDGER</span>
            </div>
            <p className="text-sm font-sans text-[var(--ink-soft)] mt-1">
              Official institutional timetable and lecture allocations
            </p>
          </div>
        </div>
        
        <Card className="rounded-[10px] border border-[var(--rule)] bg-[var(--paper-raised)] shadow-none overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full erp-table whitespace-nowrap">
                <thead>
                  <tr>
                    <th className="font-mono">Day</th>
                    <th className="font-mono">Time</th>
                    <th>Subject</th>
                    <th>Faculty</th>
                    <th className="font-mono">Room</th>
                  </tr>
                </thead>
                <tbody>
                  {TIMETABLE_DATA.map((row) => (
                    <tr key={row.id}>
                      <td className="font-mono font-semibold text-xs text-[var(--navy)]">{row.day}</td>
                      <td className="font-mono text-xs text-[var(--ink-soft)]">{row.time}</td>
                      <td className="font-serif font-semibold text-sm text-[var(--ink)]">{row.subject}</td>
                      <td className="font-sans text-xs text-[var(--ink-soft)]">{row.faculty}</td>
                      <td className="font-mono text-xs text-[var(--ink-soft)]">{row.room}</td>
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
