import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, AlertCircle, FileText, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const MOCK_LEAVES = [
  { id: 1, type: 'Medical', from: '2026-10-12', to: '2026-10-14', days: 3, status: 'approved', reason: 'Viral Fever', docUrl: '#' },
  { id: 2, type: 'Casual', from: '2026-09-15', to: '2026-09-15', days: 1, status: 'rejected', reason: 'Family Function', docUrl: null },
  { id: 3, type: 'On Duty', from: '2026-08-20', to: '2026-08-22', days: 3, status: 'approved', reason: 'Tech Fest Participant', docUrl: '#' },
];

const LeaveRequest = () => {
  const [leaves, setLeaves] = useState(MOCK_LEAVES);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Form State
  const [leaveType, setLeaveType] = useState('Medical');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API
    await new Promise(r => setTimeout(r, 1000));
    
    const newLeave = {
      id: Date.now(),
      type: leaveType,
      from: fromDate,
      to: toDate,
      days: Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1 || 1,
      status: 'pending',
      reason,
      docUrl: file ? '#' : null
    };
    
    setLeaves([newLeave, ...leaves]);
    setIsAddOpen(false);
    setIsSubmitting(false);
    
    // Reset form
    setLeaveType('Medical');
    setFromDate('');
    setToDate('');
    setReason('');
    setFile(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-rose-500" />;
      default: return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto page-enter">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-500" />
            Leave Requests
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Apply for leave and track approval status.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20">
          <Plus className="w-4 h-4 mr-2" /> Apply Leave
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-200/60 bg-emerald-50/50 dark:bg-emerald-500/5 dark:border-emerald-500/20 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Approved Leaves</p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {leaves.filter(l => l.status === 'approved').length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-amber-200/60 bg-amber-50/50 dark:bg-amber-500/5 dark:border-amber-500/20 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Pending Approval</p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                {leaves.filter(l => l.status === 'pending').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Remaining Balance</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">12 days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-none shadow-sm">
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
          <CardDescription>Your past and present leave applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full erp-table">
              <thead>
                <tr>
                  <th className="text-left">Leave Type</th>
                  <th className="text-left">Duration</th>
                  <th className="text-left">Reason</th>
                  <th className="text-left">Document</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">No leave requests found.</td>
                  </tr>
                ) : (
                  leaves.map(leave => (
                    <tr key={leave.id}>
                      <td className="font-medium text-slate-900 dark:text-slate-100">{leave.type}</td>
                      <td>
                        <div className="flex flex-col">
                          <span className="text-sm">{leave.from} <span className="text-slate-400">to</span> {leave.to}</span>
                          <span className="text-xs text-slate-500">{leave.days} day(s)</span>
                        </div>
                      </td>
                      <td className="max-w-[200px] truncate" title={leave.reason}>{leave.reason}</td>
                      <td>
                        {leave.docUrl ? (
                          <a href={leave.docUrl} className="inline-flex items-center text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 px-2 py-1 rounded hover:underline">
                            <FileText className="w-3 h-3 mr-1" /> View
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {getStatusIcon(leave.status)}
                          <span className="text-sm font-medium capitalize">{leave.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Apply Leave Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
              <DialogDescription>Submit a new leave application. Medical leaves require a valid doctor's certificate.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Leave Type</Label>
                <select 
                  id="type"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-800 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:focus-visible:ring-indigo-500"
                >
                  <option value="Medical">Medical Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="On Duty">On Duty (OD)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="from">From Date</Label>
                  <Input type="date" id="from" required value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="to">To Date</Label>
                  <Input type="date" id="to" required value={toDate} onChange={(e) => setToDate(e.target.value)} min={fromDate} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea id="reason" required placeholder="Brief reason for the leave..." value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="doc">Supporting Document (Optional)</Label>
                <Input type="file" id="doc" onChange={(e) => setFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" />
                <p className="text-xs text-slate-500">Max 5MB. PDF or Image.</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveRequest;
