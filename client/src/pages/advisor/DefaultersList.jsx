import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Send, PhoneCall } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RiskBadge from '@/components/attendance/RiskBadge';
import { toast } from 'sonner';
import api from '@/utils/api';

const DEFAULTERS = [
  { id:1, roll:'7376221CS102', name:'Priya Devi',   pct:62, risk:'Critical', needed:18, parent:'Mrs. Rupa Devi',    phone:'9876540001' },
  { id:2, roll:'7376221CS105', name:'Mohammed Ali', pct:67, risk:'High',     needed:11, parent:'Mr. Rashid Ali',    phone:'9876540002' },
  { id:3, roll:'7376221CS107', name:'Vikram Singh', pct:71, risk:'High',     needed:6,  parent:'Mr. Rajesh Singh',  phone:'9876540003' },
  { id:4, roll:'7376221CS110', name:'Ravi Teja',    pct:58, risk:'Critical', needed:24, parent:'Mr. Srikanth Teja', phone:'9876540004' },
];

export default function DefaultersList() {
  const [alerted, setAlerted] = useState(new Set());
  const [isAlerting, setIsAlerting] = useState(false);

  const sendAlert = async (id, name) => {
    try {
      const res = await api.post('/attendance/alert-defaulters', { threshold: 80 });
      setAlerted(prev => new Set([...prev, id]));
      toast.success(res.data.message || `📩 SMS Alert sent to parent of ${name}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send alert');
    }
  };

  const sendAllAlerts = async () => {
    setIsAlerting(true);
    try {
      const res = await api.post('/attendance/alert-defaulters', { threshold: 80 });
      DEFAULTERS.forEach(d => setAlerted(prev => new Set([...prev, d.id])));
      toast.success(res.data.message || `📩 SMS Alerts dispatched to parents`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch alerts');
    } finally {
      setIsAlerting(false);
    }
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <AlertTriangle className="w-6 h-6 text-rose-500" />Defaulters List
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Students in your advised class with attendance below the 75% eligibility threshold.
          </p>
        </div>
        <Button onClick={sendAllAlerts} disabled={isAlerting}
          className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2">
          <Send className="w-4 h-4" />{isAlerting ? 'Sending...' : 'Alert All Parents'}
        </Button>
      </div>

      {/* Warning Banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
        <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
        <p className="text-sm text-rose-700 dark:text-rose-400">
          <strong>{DEFAULTERS.filter(d=>d.risk==='Critical').length} students</strong> are in CRITICAL zone (&lt;65%). Hall-ticket detention is imminent without immediate intervention.
        </p>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {DEFAULTERS.map((d, i) => (
          <motion.div key={d.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}>
            <Card className={`border shadow-sm overflow-hidden ${d.risk==='Critical'?'border-rose-200 dark:border-rose-500/30':'border-orange-200 dark:border-orange-500/30'}`}>
              <div className={`h-1 ${d.risk==='Critical'?'bg-rose-500':'bg-orange-500'}`} />
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Student info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100">{d.name}</h3>
                      <RiskBadge level={d.risk} />
                    </div>
                    <p className="text-xs text-slate-400 font-mono mb-3">{d.roll}</p>

                    {/* Progress */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Current: <strong className="text-slate-700 dark:text-slate-300">{d.pct}%</strong></span>
                        <span className="text-slate-500">Target: <strong className="text-rose-500">75%</strong></span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                        <div className={`h-full rounded-full ${d.pct<65?'bg-rose-500':'bg-orange-500'}`} style={{width:`${d.pct}%`}} />
                        <div className="absolute inset-y-0 border-l-2 border-dashed border-rose-400/60" style={{left:'75%'}} />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      Must attend <strong className="text-slate-800 dark:text-slate-200">{d.needed} consecutive classes</strong> to reach eligibility.
                    </p>
                  </div>

                  {/* Parent info + actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="text-xs text-slate-500">Parent: <strong className="text-slate-700 dark:text-slate-300">{d.parent}</strong></p>
                    <p className="text-xs font-mono text-slate-400">{d.phone}</p>
                    <div className="flex gap-2 mt-1">
                      <a href={`tel:${d.phone}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
                        <PhoneCall className="w-3 h-3" />Call
                      </a>
                      <Button size="sm" onClick={() => sendAlert(d.id, d.name)}
                        disabled={alerted.has(d.id)}
                        className={`text-xs h-7 px-3 ${alerted.has(d.id)?'bg-emerald-600 hover:bg-emerald-600':'bg-rose-600 hover:bg-rose-700'} text-white`}>
                        <Send className="w-3 h-3 mr-1" />
                        {alerted.has(d.id) ? 'Alerted ✓' : 'Alert Parent'}
                      </Button>
                    </div>
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
