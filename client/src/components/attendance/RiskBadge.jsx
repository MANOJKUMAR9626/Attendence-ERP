// Reusable Risk Badge Component
import { cn } from '@/lib/utils';
import { ShieldAlert, ShieldCheck, ShieldX, Shield } from 'lucide-react';

const CONFIG = {
  Low:      { label: 'Low Risk',      icon: ShieldCheck,  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' },
  Medium:   { label: 'Medium Risk',   icon: Shield,       cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' },
  High:     { label: 'High Risk',     icon: ShieldAlert,  cls: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20' },
  Critical: { label: 'Critical Risk', icon: ShieldX,      cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' },
};

const RiskBadge = ({ level = 'Low', showIcon = true, className }) => {
  const { label, icon: Icon, cls } = CONFIG[level] || CONFIG.Low;
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border',
      cls, className
    )}>
      {showIcon && <Icon className="w-3 h-3" />}
      {label}
    </span>
  );
};

export default RiskBadge;
