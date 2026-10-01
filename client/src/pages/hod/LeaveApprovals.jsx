import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, FileText, Clock, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

const MOCK_LEAVES = [
  { id: 1, name: 'Rahul Sharma', roll: '7376221CS101', type: 'Medical', from: '2026-10-12', to: '2026-10-17', days: 6, reason: 'Viral Fever', docUrl: '#', status: 'pending', advisorStatus: 'Approved by Dr. R. Sharma' },
  { id: 2, name: 'Arjun Kumar', roll: '7376221CS103', type: 'On Duty', from: '2026-10-18', to: '2026-10-22', days: 5, reason: 'National Level Hackathon', docUrl: '#', status: 'pending', advisorStatus: 'Approved by Prof. K. Priya' },
];

const getStatusBadge = (status) => {
  switch(status) {
    case 'approved': return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50">Approved</span>;
    case 'rejected': return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50">Rejected</span>;
    default: return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50">Pending</span>;
  }
};

export default function HODLeaveApprovals() {
  const [filter, setFilter] = useState('pending');
  const [leaves, setLeaves] = useState(MOCK_LEAVES);

  const handleAction = (id, action) => {
    setLeaves(leaves.map(l => l.id === id ? { ...l, status: action } : l));
    toast.success(`Leave request ${action === 'approved' ? 'approved' : 'rejected'} successfully.`);
  };

  const filteredLeaves = filter === 'all' ? leaves : leaves.filter(l => l.status === filter);

  return (
    <div className="space-y-6 max-w-7xl mx-auto page-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-500" />
            HOD Leave Approvals
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review leave requests &gt; 3 days requiring final department approval.</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-white dark:bg-slate-900 border-slate-800 dark:border-slate-800">
              Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)} <ChevronDown className="w-4 h-4 ml-2 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilter('pending')}>Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('approved')}>Approved</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('rejected')}>Rejected</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('all')}>All Requests</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="glass-panel border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full erp-table">
            <thead>
              <tr>
                <th className="text-left">Student Info</th>
                <th className="text-left">Leave Type</th>
                <th className="text-left">Duration</th>
                <th className="text-left">Details</th>
                <th className="text-center">Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-200 dark:text-emerald-900 mb-3" />
                    <p>No {filter} leave requests require HOD approval.</p>
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave, i) => (
                  <motion.tr key={leave.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.05}}>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white">{leave.name}</span>
                        <span className="text-xs text-slate-500">{leave.roll}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{leave.type}</span>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{leave.from} <span className="text-slate-400 text-xs mx-1">to</span> {leave.to}</span>
                        <span className="text-xs text-rose-500 font-semibold">{leave.days} day(s)</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="text-sm truncate max-w-[200px]" title={leave.reason}>{leave.reason}</span>
                        <span className="text-[10px] text-emerald-600 font-medium px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 rounded">{leave.advisorStatus}</span>
                        {leave.docUrl && (
                          <a href={leave.docUrl} className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 px-2 py-0.5 rounded">
                            <FileText className="w-3 h-3" /> View Doc
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="text-center">
                      {getStatusBadge(leave.status)}
                    </td>
                    <td className="text-right">
                      {leave.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                            onClick={() => handleAction(leave.id, 'approved')}
                          >
                            <Check className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
                            onClick={() => handleAction(leave.id, 'rejected')}
                          >
                            <X className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Action taken</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
