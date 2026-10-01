import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Send, PhoneCall, Download, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import RiskBadge from '@/components/attendance/RiskBadge';
import { toast } from 'sonner';

const MOCK_DEFAULTERS = [
  { id:1, roll:'7376221CS102', name:'Priya Devi',   dept:'CSE', year:'III', sec:'A', pct:62, risk:'Critical', needed:18, parentPhone:'9876540001', parentEmail:'parent1@mail.com' },
  { id:2, roll:'7376221CS105', name:'Mohammed Ali', dept:'CSE', year:'III', sec:'B', pct:67, risk:'High',     needed:11, parentPhone:'9876540002', parentEmail:'parent2@mail.com' },
  { id:3, roll:'7376221CS107', name:'Vikram Singh', dept:'CSE', year:'IV',  sec:'A', pct:71, risk:'High',     needed:6,  parentPhone:'9876540003', parentEmail:'parent3@mail.com' },
  { id:4, roll:'7376221CS110', name:'Ravi Teja',    dept:'CSE', year:'II',  sec:'A', pct:58, risk:'Critical', needed:24, parentPhone:'9876540004', parentEmail:'parent4@mail.com' },
  { id:5, roll:'7376221CS113', name:'Meera Pillai', dept:'CSE', year:'IV',  sec:'B', pct:73, risk:'Medium',   needed:3,  parentPhone:'9876540005', parentEmail:'parent5@mail.com' },
];

export default function AtRiskStudents() {
  const [search, setSearch] = useState('');
  const [alertSent, setAlertSent] = useState(new Set());

  const filtered = MOCK_DEFAULTERS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.includes(search)
  );

  const sendAlert = (id, name) => {
    setAlertSent(prev => new Set([...prev, id]));
    toast.success(`📩 Alert dispatched to parent of ${name}`);
  };

  const sendAllAlerts = () => {
    const ids = new Set(filtered.map(s => s.id));
    setAlertSent(ids);
    toast.success(`📩 Alerts dispatched to ${filtered.length} parents`);
  };

  const critical = filtered.filter(s => s.risk === 'Critical').length;
  const high = filtered.filter(s => s.risk === 'High').length;

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <AlertTriangle className="w-6 h-6 text-rose-500" />At-Risk Students
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Students below 75% attendance threshold identified by the AI risk prediction engine.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />Export
          </Button>
          <Button onClick={sendAllAlerts} className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2">
            <Send className="w-4 h-4" />Alert All Parents
          </Button>
        </div>
      </div>

      {/* Banner */}
      {critical > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
          <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <p className="text-sm font-medium text-rose-700 dark:text-rose-400">
            ⚠️ <strong>{critical} student{critical>1?'s':''}</strong> are in CRITICAL risk zone (below 65%). Immediate action required.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-rose-200/60 bg-rose-50/50 dark:bg-rose-500/5 dark:border-rose-500/20 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Critical Risk</p>
            <p className="text-3xl font-black text-rose-600 mt-1">{critical}</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200/60 bg-orange-50/50 dark:bg-orange-500/5 dark:border-orange-500/20 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-xs font-medium text-orange-600 dark:text-orange-400">High Risk</p>
            <p className="text-3xl font-black text-orange-600 mt-1">{high}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200/60 bg-amber-50/50 dark:bg-amber-500/5 dark:border-amber-500/20 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Total At-Risk</p>
            <p className="text-3xl font-black text-amber-600 mt-1">{filtered.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <Input placeholder="Search student…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((s, i) => (
          <motion.div key={s.id} initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{delay:i*0.07}}>
            <Card className={`border shadow-sm overflow-hidden ${s.risk==='Critical'?'border-rose-200 dark:border-rose-500/30':s.risk==='High'?'border-orange-200 dark:border-orange-500/30':'border-amber-200 dark:border-amber-500/30'}`}>
              <div className={`h-1 w-full ${s.risk==='Critical'?'bg-rose-500':s.risk==='High'?'bg-orange-500':'bg-amber-500'}`} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-800 dark:text-slate-100">{s.name}</p>
                      <RiskBadge level={s.risk} />
                    </div>
                    <p className="text-xs text-slate-500 font-mono">{s.roll} · {s.dept} {s.year}-{s.sec}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-2xl font-black ${s.pct<65?'text-rose-600':s.pct<75?'text-orange-600':'text-amber-600'}`}>{s.pct}%</p>
                    <p className="text-xs text-slate-500">Current</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="my-3">
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${s.pct<65?'bg-rose-500':s.pct<75?'bg-orange-500':'bg-amber-500'}`} style={{width:`${s.pct}%`}} />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>0%</span>
                    <span className="text-rose-500 font-medium">75% min</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Needs <strong className="text-slate-800 dark:text-slate-200">{s.needed} more classes</strong> to reach 75%
                  </p>
                  <div className="flex gap-2">
                    <a href={`tel:${s.parentPhone}`}
                      className="p-1.5 rounded-lg border border-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600 transition-colors">
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>
                    <Button size="sm" onClick={() => sendAlert(s.id, s.name)}
                      disabled={alertSent.has(s.id)}
                      className={`text-xs h-7 px-3 ${alertSent.has(s.id) ? 'bg-emerald-600 hover:bg-emerald-600' : 'bg-rose-600 hover:bg-rose-700'} text-white`}>
                      <Send className="w-3 h-3 mr-1" />
                      {alertSent.has(s.id) ? 'Sent ✓' : 'Alert Parent'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
