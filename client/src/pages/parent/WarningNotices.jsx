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
    High:   { cls: 'bg-[var(--crit-bg)]/40 border-[var(--crit)]/30', badge: 'badge-danger text-xs font-mono', bar: 'bg-[var(--crit)]', icon: AlertTriangle, iconCls: 'text-[var(--crit)]' },
    Medium: { cls: 'bg-[var(--warn-bg)]/40 border-[var(--warn)]/30', badge: 'badge-warning text-xs font-mono', bar: 'bg-[var(--warn)]', icon: BellRing, iconCls: 'text-[var(--warn)]' },
    Info:   { cls: 'bg-[var(--paper)] border-[var(--rule)]', badge: 'badge-info text-xs font-mono', bar: 'bg-[var(--navy)]', icon: BellRing, iconCls: 'text-[var(--navy)]' },
  };

  const pending = warnings.filter(w => !w.acknowledged).length;

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--navy)] tracking-[-0.01em]">
              Institutional Dispatches & Notices
            </h1>
            <span className="stamp hidden sm:inline-flex">OFFICIAL NOTICE</span>
          </div>
          <p className="text-sm font-sans text-[var(--ink-soft)] mt-1">
            Official attendance warnings, deficiency alerts and advisory communications.
          </p>
        </div>
        {pending > 0 && (
          <span className="badge-danger text-xs font-mono">
            {pending} UNACKNOWLEDGED NOTICE{pending>1?'S':''}
          </span>
        )}
      </div>

      {pending === 0 && (
        <div className="flex items-center gap-3 p-4 rounded-[10px] bg-[var(--safe-bg)] border border-[var(--safe)]/30 text-[var(--safe)]">
          <CheckCheck className="w-5 h-5 shrink-0" />
          <p className="text-sm font-sans font-medium">All official notices have been duly acknowledged. No pending institutional actions required.</p>
        </div>
      )}

      <div className="space-y-4">
        {warnings.map((w, i) => {
          const cfg = levelConfig[w.level] || levelConfig['Info'];
          const Icon = cfg.icon;
          return (
            <motion.div key={w.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}>
              <Card className={`rounded-[10px] border ${cfg.cls} shadow-none overflow-hidden ${w.acknowledged?'opacity-70':''}`}>
                <div className={`h-1 ${cfg.bar}`} />
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 bg-[var(--paper-raised)] border border-[var(--rule)]">
                      <Icon className={`w-4 h-4 ${cfg.iconCls}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1">
                        <h3 className="font-serif font-semibold text-base text-[var(--navy)]">{w.type}</h3>
                        <span className={cfg.badge}>{w.level}</span>
                        {w.acknowledged && <span className="text-[10px] font-mono text-[var(--ink-soft)] bg-[var(--paper)] border border-[var(--rule)] px-2 py-0.5 rounded-[20px]">ACKNOWLEDGED</span>}
                      </div>
                      <p className="text-xs font-mono text-[var(--ink-soft)] mb-2">{w.date}</p>
                      <p className="text-sm font-sans text-[var(--ink)] leading-relaxed">{w.message}</p>
                    </div>
                  </div>

                  {!w.acknowledged && (
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[var(--rule)]">
                      <Button variant="secondary" size="sm" className="flex items-center gap-1.5 font-mono text-xs">
                        <Download className="w-3.5 h-3.5" />Download PDF
                      </Button>
                      <Button size="sm" onClick={() => acknowledge(w.id)}
                        className="btn-navy text-xs flex items-center gap-1.5">
                        <CheckCheck className="w-3.5 h-3.5" />Acknowledge Dispatch
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
