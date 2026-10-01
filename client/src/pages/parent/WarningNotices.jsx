import { useState } from 'react';
import { motion } from 'framer-motion';
import { BellRing, Download, CheckCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const WARNINGS = [
  { id:1, date:'2026-08-05', type:'Attendance Warning', level:'High', message:'Your ward Rahul Sharma has attendance below 75% in AI (CS401). Current: 62%. Immediate attendance improvement is required to avoid hall-ticket detention.', acknowledged:false },
  { id:2, date:'2026-07-28', type:'Advisory Notice',    level:'Medium', message:'Attendance in Computer Networks (CN) has dropped to 74%. Please advise your ward to attend all upcoming sessions.', acknowledged:false },
  { id:3, date:'2026-07-15', type:'Monthly Report',     level:'Info',   message:'July monthly attendance report: Overall 78%. Satisfactory performance. Please ensure continued attendance in all subjects.', acknowledged:true },
];

export default function WarningNotices() {
  const [warnings, setWarnings] = useState(WARNINGS);

  const acknowledge = (id) => {
    setWarnings(prev => prev.map(w => w.id === id ? {...w, acknowledged:true} : w));
    toast.success('Notice acknowledged');
  };

  const levelConfig = {
    High:   { cls:'bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30', badge:'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400', bar:'bg-rose-500', icon: AlertTriangle, iconCls:'text-rose-500' },
    Medium: { cls:'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30', badge:'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', bar:'bg-amber-500', icon: BellRing, iconCls:'text-amber-500' },
    Info:   { cls:'bg-slate-50 border-slate-800 dark:bg-slate-800/50 dark:border-slate-700', badge:'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', bar:'bg-slate-400', icon: BellRing, iconCls:'text-slate-400' },
  };

  const pending = warnings.filter(w => !w.acknowledged).length;

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <BellRing className="w-6 h-6 text-amber-500" />Warning Notices
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official attendance warnings and advisory notices issued for your ward.
          </p>
        </div>
        {pending > 0 && (
          <span className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 text-sm font-semibold border border-rose-200 dark:border-rose-500/30">
            {pending} unread notice{pending>1?'s':''}
          </span>
        )}
      </div>

      {pending === 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
          <CheckCheck className="w-5 h-5 text-emerald-500" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">All notices have been acknowledged. No pending action required.</p>
        </div>
      )}

      <div className="space-y-4">
        {warnings.map((w, i) => {
          const cfg = levelConfig[w.level] || levelConfig['Info'];
          const Icon = cfg.icon;
          return (
            <motion.div key={w.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}>
              <Card className={`border ${cfg.cls} shadow-sm overflow-hidden ${w.acknowledged?'opacity-60':''}`}>
                <div className={`h-1 ${cfg.bar}`} />
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${w.level==='High'?'bg-rose-100 dark:bg-rose-500/20':w.level==='Medium'?'bg-amber-100 dark:bg-amber-500/20':'bg-slate-100 dark:bg-slate-800'}`}>
                      <Icon className={`w-5 h-5 ${cfg.iconCls}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{w.type}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}>{w.level}</span>
                        {w.acknowledged && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Acknowledged</span>}
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{w.date}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{w.message}</p>
                    </div>
                  </div>

                  {!w.acknowledged && (
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5" />Download PDF
                      </Button>
                      <Button size="sm" onClick={() => acknowledge(w.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5">
                        <CheckCheck className="w-3.5 h-3.5" />Acknowledge
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
