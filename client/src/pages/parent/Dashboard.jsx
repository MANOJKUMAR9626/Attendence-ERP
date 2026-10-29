import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, CheckCircle2, XCircle, Home, PlusCircle, 
  ChevronRight, Calendar, User, Activity, Bell, FileText,
  Bot
} from 'lucide-react';

import api from '@/utils/api';
import { toast } from 'react-hot-toast';



const ParentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({ name: "Parent" });
  const [activeChildIdx, setActiveChildIdx] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/parent');
        setStats(response.data.data);
      } catch (error) {
        // Handle error silently or toast
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.data) {
          setUser(response.data.data);
        }
      } catch (error) {}
    };
    
    fetchStats();
    fetchUser();
  }, []);

  const children = stats?.children || [];
  const activeChild = children[activeChildIdx] || {
     childName: 'Vignesh A', registerNumber: '21CS003', courseInfo: 'III Year - CSE', overallPercentage: 79, aiRiskScore: 'High Risk',
     academicData: [], subjectData: []
  };

  const pct = activeChild.overallPercentage !== undefined ? Math.round(activeChild.overallPercentage) : 79;
  const isSafe = pct >= 80;

  // Use actual trendData from the backend, fallback to empty if unavailable
  const trendData = activeChild.trendData || [];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--navy)] tracking-[-0.01em]">
              My Ward's Attendance Ledger
            </h1>
          </div>
          <p className="text-[var(--ink-soft)] font-sans text-sm mt-1">
            Official monitoring of academic progress & institutional attendance record
          </p>
        </div>
        <div className="bg-[var(--paper-raised)] px-4 py-2 rounded-none border border-[var(--rule)] shadow-none flex flex-col items-center justify-center">
          <span className="text-xs font-mono font-semibold text-[var(--navy)] uppercase">
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          </span>
          <span className="text-xs font-mono text-[var(--ink-soft)] mt-0.5">
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Top Row: Profile & Alert */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Profile Card */}
        <div className="md:col-span-4 bg-[var(--paper-raised)] rounded-none border border-[var(--rule)] shadow-none p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[var(--paper)] overflow-hidden border border-[var(--rule)] shrink-0">
             <img src="/images/student_male.png" alt="Student Avatar" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"; }} />
          </div>
          <div>
            <h2 className="text-lg font-serif font-semibold text-[var(--navy)]">{activeChild.childName}</h2>
            <p className="text-xs font-mono text-[var(--ink-soft)] mt-0.5">{activeChild.registerNumber} | {activeChild.courseInfo}</p>
          </div>
        </div>

        {/* Alert Banner */}
        {isSafe ? (
          <div className="md:col-span-8 bg-[var(--safe-bg)] rounded-none border border-[var(--safe)]/20 shadow-none p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <CheckCircle2 className="w-9 h-9 text-[var(--safe)] shrink-0" strokeWidth={1.8} />
              <div>
                <h3 className="text-base sm:text-lg font-serif font-semibold text-[var(--safe)]">Satisfactory Academic Attendance</h3>
                <p className="text-xs sm:text-sm text-[var(--ink)] font-sans mt-0.5">
                  Your ward's attendance is <strong className="font-mono font-semibold">{pct}%</strong>. In full compliance with institutional requirements.
                </p>
              </div>
            </div>
            <span className="badge-safe text-xs shrink-0 hidden sm:inline-flex">GOOD STANDING</span>
          </div>
        ) : (
          <div className="md:col-span-8 bg-[var(--crit-bg)] rounded-none border border-[var(--crit)]/20 shadow-none p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <AlertTriangle className="w-9 h-9 text-[var(--crit)] shrink-0" strokeWidth={1.8} />
              <div>
                <h3 className="text-base sm:text-lg font-serif font-semibold text-[var(--crit)]">Attendance Deficiency Alert</h3>
                <p className="text-xs sm:text-sm text-[var(--ink)] font-sans mt-0.5">
                  Your ward's attendance is <strong className="font-mono font-semibold">{pct}%</strong>. Below the mandatory 80% institutional threshold.
                </p>
              </div>
            </div>
            <span className="badge-danger text-xs shrink-0 hidden sm:inline-flex">DEFICIENT</span>
          </div>
        )}

      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Overall Attendance */}
        <div className="bg-[var(--paper-raised)] rounded-none border border-[var(--rule)] shadow-none p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-sans font-medium text-[var(--ink-soft)]">Overall Attendance</h4>
            <span className={isSafe ? 'badge-safe text-[10px]' : 'badge-danger text-[10px]'}>
              {isSafe ? 'Compliant' : 'At Risk'}
            </span>
          </div>
          <div>
            <span className="text-2xl font-mono font-semibold text-[var(--ink)]">{pct}%</span>
            {/* 6px Progress Bar */}
            <div className="progress-track-6px mt-2.5">
              <div 
                className="h-full rounded-none transition-all duration-700" 
                style={{ 
                  width: `${Math.min(pct, 100)}%`, 
                  backgroundColor: isSafe ? 'var(--safe)' : 'var(--crit)' 
                }} 
              />
            </div>
          </div>
        </div>

        {/* Total Days */}
        <div className="bg-[var(--paper-raised)] rounded-none border border-[var(--rule)] shadow-none p-4 flex flex-col justify-between">
          <h4 className="text-xs font-sans font-medium text-[var(--ink-soft)] mb-2">Total Working Days</h4>
          <div>
            <span className="text-2xl font-mono font-semibold text-[var(--ink)]">{activeChild.totalDays || 0}</span>
            <p className="text-[10px] font-mono text-[var(--ink-soft)] uppercase mt-2">Term Logged</p>
          </div>
        </div>

        {/* Present */}
        <div className="bg-[var(--paper-raised)] rounded-none border border-[var(--rule)] shadow-none p-4 flex flex-col justify-between">
          <h4 className="text-xs font-sans font-medium text-[var(--ink-soft)] mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--safe)]" /> Present
          </h4>
          <div>
            <span className="text-2xl font-mono font-semibold text-[var(--ink)]">{activeChild.presentCount || 0}</span>
          </div>
        </div>

        {/* Absent */}
        <div className="bg-[var(--paper-raised)] rounded-none border border-[var(--rule)] shadow-none p-4 flex flex-col justify-between">
          <h4 className="text-xs font-sans font-medium text-[var(--ink-soft)] mb-2 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-[var(--crit)]" /> Absent
          </h4>
          <div>
            <span className="text-2xl font-mono font-semibold text-[var(--ink)]">{activeChild.absentCount || 0}</span>
          </div>
        </div>

        {/* OD */}
        <div className="bg-[var(--paper-raised)] rounded-none border border-[var(--rule)] shadow-none p-4 flex flex-col justify-between">
          <h4 className="text-xs font-sans font-medium text-[var(--ink-soft)] mb-2 flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-[var(--warn)]" /> On Duty (OD)
          </h4>
          <div>
            <span className="text-2xl font-mono font-semibold text-[var(--ink)]">{activeChild.odCount || 0}</span>
          </div>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* AI Recommendation */}
        <div className="lg:col-span-6 bg-[var(--paper-raised)] rounded-none border border-[var(--rule)] shadow-none p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-semibold text-lg text-[var(--navy)]">AI Academic Advisory</h3>
            </div>
            
            <div className="bg-[var(--paper)] rounded-none p-4 border border-[var(--rule)] flex gap-4 items-center">
              <div className="w-14 h-14 shrink-0 bg-[var(--paper-raised)] rounded-none border border-[var(--rule)] flex items-center justify-center p-1.5">
                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=attendance" alt="AI Bot" className="w-full h-full object-contain" />
              </div>
              <div className="text-xs sm:text-sm text-[var(--ink)] font-sans leading-relaxed">
                {isSafe ? (
                  <>
                    Your ward maintains <span className="badge-safe text-xs">Low Risk</span> status.<br/>
                    Consistent attendance meets all requirements for semester examination endorsement.
                  </>
                ) : (
                  <>
                    Your ward is currently flagged at <span className="badge-danger text-xs">{activeChild.aiRiskScore || 'High Risk'}</span>.<br/>
                    Prompt class attendance is required to avoid disciplinary counseling and detention.
                  </>
                )}
              </div>
            </div>
          </div>

          <Link to="/parent/prediction" className="btn-navy w-full mt-5 text-center block">
            View Complete Predictive Audit Report
          </Link>
        </div>

        {/* Recent Notifications */}
        <div className="lg:col-span-6 bg-[var(--paper-raised)] rounded-none border border-[var(--rule)] shadow-none p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-semibold text-lg text-[var(--navy)]">Recent Dispatches</h3>
              <span className="text-[11px] font-mono text-[var(--ink-soft)]">OFFICIAL LOG</span>
            </div>
            
            <div className="space-y-3">
              {pct >= 85 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-10 h-10 bg-[var(--safe-bg)] rounded-none flex items-center justify-center mb-2 border border-[var(--safe)]/30">
                    <CheckCircle2 className="w-5 h-5 text-[var(--safe)]" />
                  </div>
                  <p className="text-sm font-serif font-semibold text-[var(--navy)]">Ledger Fully Reconciled</p>
                  <p className="text-xs text-[var(--ink-soft)] font-sans mt-0.5">No attendance deficit notices or disciplinary alerts.</p>
                </div>
              ) : (
                <div className="p-3.5 bg-[var(--paper)] rounded-none border border-[var(--rule)] flex gap-3.5 items-start">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-[var(--crit-bg)] text-[var(--crit)] flex items-center justify-center mt-0.5 border border-[var(--crit)]/30">
                    <AlertTriangle size={13} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-[var(--navy)]">Official Deficiency Warning</h4>
                      <span className="text-[10px] font-mono text-[var(--ink-soft)]">LATEST</span>
                    </div>
                    <p className="text-xs text-[var(--ink)] font-sans mt-1 leading-relaxed">
                      {pct < 65 ? 'Mandatory counseling session required' : pct < 75 ? 'Attendance remediation required immediately' : 'Improve regular attendance'}. Please liaise with class advisor{activeChild.advisorName && activeChild.advisorName !== 'Class Advisor' ? ` (${activeChild.advisorName})` : ''}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--rule)] flex items-center justify-between text-xs text-[var(--ink-soft)] font-mono">
            <span>REGISTRY: VERIFIED</span>
            <Link to="/parent/notifications" className="text-[var(--navy)] hover:underline font-sans font-medium text-xs">
              View All Dispatches →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ParentDashboard;
