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
      case 'approved': return <span className="badge-safe text-xs font-mono"><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Approved</span>;
      case 'rejected': return <span className="badge-danger text-xs font-mono"><XCircle className="w-3.5 h-3.5 mr-1" />Rejected</span>;
      default: return <span className="badge-warning text-xs font-mono"><Clock className="w-3.5 h-3.5 mr-1" />Pending</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto page-enter">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--navy)] tracking-[-0.01em]">
              Student Leave Registry
            </h1>
            <span className="stamp hidden sm:inline-flex">LEAVE REGISTRY</span>
          </div>
          <p className="text-[var(--ink-soft)] font-sans text-sm mt-1">Official leave submission, institutional approval tracking, and medical documentation.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="btn-navy text-xs font-mono">
          <Plus className="w-4 h-4 mr-1.5" /> Apply for Leave
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-[10px] border border-[var(--rule)] bg-[var(--paper-raised)] shadow-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-[8px] bg-[var(--safe-bg)] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[var(--safe)]" />
            </div>
            <div>
              <p className="text-xs font-sans font-medium text-[var(--ink-soft)]">Approved Applications</p>
              <p className="text-2xl font-mono font-semibold text-[var(--safe)]">
                {leaves.filter(l => l.status === 'approved').length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-[10px] border border-[var(--rule)] bg-[var(--paper-raised)] shadow-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-[8px] bg-[var(--warn-bg)] flex items-center justify-center">
              <Clock className="w-5 h-5 text-[var(--warn)]" />
            </div>
            <div>
              <p className="text-xs font-sans font-medium text-[var(--ink-soft)]">Pending Approval</p>
              <p className="text-2xl font-mono font-semibold text-[var(--warn)]">
                {leaves.filter(l => l.status === 'pending').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[10px] border border-[var(--rule)] bg-[var(--paper-raised)] shadow-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-[8px] bg-[var(--paper)] border border-[var(--rule)] flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-[var(--navy)]" />
            </div>
            <div>
              <p className="text-xs font-sans font-medium text-[var(--ink-soft)]">Remaining Balance</p>
              <p className="text-2xl font-mono font-semibold text-[var(--ink)]">12 days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[10px] border border-[var(--rule)] bg-[var(--paper-raised)] shadow-none overflow-hidden">
        <CardHeader className="pb-3 border-b border-[var(--rule)] bg-[var(--paper)]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-serif font-semibold text-[var(--navy)]">Leave Application Log</CardTitle>
            <span className="text-xs font-mono text-[var(--ink-soft)]">{leaves.length} APPLICATIONS FILED</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full erp-table">
              <thead>
                <tr>
                  <th className="text-left font-mono">Leave Type</th>
                  <th className="text-left font-mono">Duration</th>
                  <th className="text-left">Reason</th>
                  <th className="text-left">Document</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-[var(--ink-soft)] font-sans text-sm">No leave requests found on ledger.</td>
                  </tr>
                ) : (
                  leaves.map(leave => (
                    <tr key={leave.id}>
                      <td className="font-serif font-semibold text-sm text-[var(--navy)]">{leave.type}</td>
                      <td>
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-[var(--ink)]">{leave.from} <span className="text-[var(--ink-soft)]">to</span> {leave.to}</span>
                          <span className="text-[10px] font-mono text-[var(--ink-soft)]">{leave.days} day(s)</span>
                        </div>
                      </td>
                      <td className="max-w-[200px] truncate text-xs font-sans text-[var(--ink)]" title={leave.reason}>{leave.reason}</td>
                      <td>
                        {leave.docUrl ? (
                          <a href={leave.docUrl} className="inline-flex items-center text-xs font-mono text-[var(--navy)] bg-[var(--paper)] border border-[var(--rule)] px-2 py-0.5 rounded-[4px] hover:underline">
                            <FileText className="w-3 h-3 mr-1" /> View
                          </a>
                        ) : (
                          <span className="text-xs font-mono text-[var(--ink-soft)]">-</span>
                        )}
                      </td>
                      <td className="text-right">
                        {getStatusIcon(leave.status)}
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
