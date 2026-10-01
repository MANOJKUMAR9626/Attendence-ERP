import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const PERIODS = ['Period 1\n8:30–9:20','Period 2\n9:20–10:10','Period 3\n10:10–11:00','Break','Period 4\n11:15–12:05','Period 5\n12:05–12:55','Lunch','Period 6\n1:45–2:35','Period 7\n2:35–3:25'];

const INITIAL = {
  'Monday':    ['OS (III-A / R.S)',  'OS (III-B / R.S)',  'DBMS (III-A / K.P)', null, 'CN (III-A / K.P)',  'AI (IV-A / M.K)',   null, '', '' ],
  'Tuesday':   ['DBMS (III-B / K.P)','AI (IV-A / M.K)',   'OS (III-A / R.S)',   null, 'SE (III-B / M.K)',  'ML (IV-B / S.D)',   null, '', '' ],
  'Wednesday': ['CN (III-A / K.P)', 'DS (II-A / S.D)',   'OS (III-B / R.S)',   null, 'DBMS (III-A / K.P)','OS (III-A / R.S)',  null, '', '' ],
  'Thursday':  ['AI (IV-B / M.K)',  'OS (III-A / R.S)',  'ML (IV-A / M.K)',   null, 'DS (II-B / S.D)',   'DBMS (III-B / K.P)',null, '', '' ],
  'Friday':    ['OS (III-B / R.S)', 'SE (III-A / M.K)',  'CN (III-B / K.P)',  null, 'DBMS (III-A / K.P)','DS (II-A / S.D)',   null, '', '' ],
};

export default function Timetables() {
  const [grid, setGrid] = useState(INITIAL);
  const [editCell, setEditCell] = useState(null); // { day, period }
  const [editValue, setEditValue] = useState('');

  const openEdit = (day, pi) => {
    const val = grid[day][pi] || '';
    setEditCell({ day, pi });
    setEditValue(val);
  };

  const saveEdit = () => {
    const { day, pi } = editCell;
    setGrid(prev => ({ ...prev, [day]: prev[day].map((v, i) => i === pi ? editValue : v) }));
    setEditCell(null);
    toast.success('Timetable slot updated');
  };

  const clearCell = (day, pi) => {
    setGrid(prev => ({ ...prev, [day]: prev[day].map((v, i) => i === pi ? '' : v) }));
    toast.info('Slot cleared');
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Calendar className="w-6 h-6 text-emerald-500" />Timetable Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Click any cell to edit. Changes are reflected immediately for all users.
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-2" />Generate AI Timetable
        </Button>
      </div>

      <Card className="glass-panel border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-800 dark:border-slate-800">
          <CardTitle className="text-base">Academic Year 2026–27 — Even Semester Timetable</CardTitle>
          <CardDescription>Click a slot to edit · Greyed slots are break/lunch periods</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900">
                  <th className="p-3 text-left text-xs font-semibold text-slate-500 border-b border-r border-slate-800 dark:border-slate-800 w-24">Period</th>
                  {DAYS.map(d => (
                    <th key={d} className="p-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-800 dark:border-slate-800">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period, pi) => {
                  const isBreak = period.includes('Break') || period.includes('Lunch');
                  return (
                    <tr key={pi} className={`border-b border-slate-800 dark:border-slate-800 ${isBreak?'bg-slate-50/80 dark:bg-slate-900/50':''}`}>
                      <td className="p-2 border-r border-slate-800 dark:border-slate-800">
                        <p className="text-[10px] font-semibold text-slate-500 whitespace-pre-line leading-tight">{period}</p>
                      </td>
                      {DAYS.map(day => {
                        const val = grid[day]?.[pi];
                        return (
                          <td key={day} className="p-1.5 text-center">
                            {isBreak ? (
                              <span className="text-xs text-slate-300 dark:text-slate-700 font-medium">{period}</span>
                            ) : (
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                onClick={() => openEdit(day, pi)}
                                className={`group relative min-h-[52px] rounded-lg p-2 text-xs cursor-pointer transition-all border ${val ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-800 dark:text-indigo-300 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-500/20' : 'bg-slate-50 dark:bg-slate-900/50 border-dashed border-slate-800 dark:border-slate-700 text-slate-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 hover:border-indigo-200 dark:hover:border-indigo-500/30'}`}
                              >
                                <span className="block text-center">{val || <span className="text-slate-300 dark:text-slate-600">+ Add</span>}</span>
                                {val && (
                                  <button onClick={(e) => { e.stopPropagation(); clearCell(day, pi); }}
                                    className="absolute top-0.5 right-0.5 p-0.5 rounded hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-400 transition-all">
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </motion.div>
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

      {/* Edit Dialog */}
      <Dialog open={!!editCell} onOpenChange={() => setEditCell(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Timetable Slot</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <Label>Subject, Section & Faculty</Label>
            <Input value={editValue} onChange={e => setEditValue(e.target.value)}
              placeholder="e.g. OS (III-A / Dr. R. Sharma)" className="mt-1.5" autoFocus />
            <p className="text-xs text-slate-400 mt-2">Leave blank to clear the slot.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCell(null)}>Cancel</Button>
            <Button onClick={saveEdit} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
