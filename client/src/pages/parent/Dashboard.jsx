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
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12 bg-[#F8FAFC] dark:bg-slate-950 p-6 min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Ward's Attendance</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor your child's attendance and academic progress</p>
        </div>
        <div className="text-right bg-white dark:bg-[#0F172A] px-4 py-2 rounded-xl border border-slate-800 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          </span>
          <span className="text-xs text-slate-500 font-medium mt-0.5">
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Top Row: Profile & Alert */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Profile Card */}
        <div className="md:col-span-4 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 overflow-hidden border-2 border-blue-50 shrink-0">
             <img src="/images/student_male.png" alt="Student Avatar" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"; }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{activeChild.childName}</h2>
            <p className="text-xs text-slate-500 font-medium">{activeChild.registerNumber} | {activeChild.courseInfo}</p>
          </div>
        </div>

        {/* Alert Banner */}
        {isSafe ? (
          <div className="md:col-span-8 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm p-4 flex items-center gap-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 shrink-0" strokeWidth={1.5} />
            <div>
              <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Great Attendance!</h3>
              <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">
                Your ward's attendance is {pct}%. Keep up the good work!
              </p>
            </div>
          </div>
        ) : (
          <div className="md:col-span-8 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm p-4 flex items-center gap-4">
            <AlertTriangle className="w-10 h-10 text-red-500 shrink-0" strokeWidth={1.5} />
            <div>
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Attendance Below 80%</h3>
              <p className="text-sm text-red-500/80 dark:text-red-400/80">
                Your ward's attendance is {pct}%. Please encourage regular attendance.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm p-4 flex flex-col justify-center relative overflow-hidden">
          <h4 className="text-xs font-semibold text-slate-500 mb-2">Overall Attendance</h4>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{pct}%</span>
            {!isSafe && <span className="text-[10px] font-bold text-red-500 border border-red-200 bg-red-50 px-2 py-0.5 rounded-full">At Risk</span>}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm p-4 flex flex-col justify-center">
          <h4 className="text-xs font-semibold text-slate-500 mb-2">Total Days</h4>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{activeChild.totalDays || 0}</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm p-4 flex flex-col justify-center relative">
          <h4 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
             <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Present
          </h4>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{activeChild.presentCount || 0}</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm p-4 flex flex-col justify-center relative">
          <h4 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
             <XCircle className="w-3.5 h-3.5 text-red-500" /> Absent
          </h4>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{activeChild.absentCount || 0}</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm p-4 flex flex-col justify-center relative">
          <h4 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
             <Home className="w-3.5 h-3.5 text-amber-500" /> OD
          </h4>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{activeChild.odCount || 0}</span>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* AI Recommendation */}
        <div className="lg:col-span-6 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm p-5 flex flex-col">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">AI Recommendation</h3>
          
          <div className="flex-1 flex flex-col justify-center items-center bg-indigo-50/50 dark:bg-indigo-500/5 rounded-xl p-4 border border-slate-800 dark:border-slate-800">
            <div className="flex gap-4 items-center">
               <div className="w-16 h-16 shrink-0 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl overflow-hidden">
                 <img src="https://api.dicebear.com/7.x/bottts/svg?seed=attendance" alt="AI Bot" className="w-full h-full object-cover scale-110" />
               </div>
               <div className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                 {isSafe ? (
                   <>Your ward is at <span className="font-bold text-emerald-500">Low Risk</span>.<br/>They are maintaining excellent attendance. Keep it up!</>
                 ) : (
                   <>Your ward is at <span className="font-bold text-red-500">{activeChild.aiRiskScore || 'High Risk'}</span>.<br/>Please encourage regular class attendance to avoid attendance shortage.</>
                 )}
               </div>
            </div>
            <Link to="/parent/prediction" className="w-full mt-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-500/20 text-center block">
              View Full Report
            </Link>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="lg:col-span-6 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm p-5 flex flex-col">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Recent Notifications</h3>
          
          <div className="flex-1 space-y-4">
            
            {pct >= 85 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center opacity-80">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">You're all caught up!</p>
                <p className="text-xs text-slate-500 mt-1">No recent alerts or warnings.</p>
              </div>
            ) : (
              <>
                <div className="flex gap-3 relative">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-red-100 text-red-500 flex items-center justify-center z-10 border-2 border-white dark:border-[#0F172A]">
                     <AlertTriangle size={12} strokeWidth={3} />
                  </div>
                  <div className="flex-1 flex justify-between items-start">
                     <div>
                       <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Recommendation</h4>
                       <p className="text-xs font-medium text-rose-600 mt-1">
                          {pct < 65 ? 'Mandatory counseling required' : pct < 75 ? 'Attend more classes immediately' : 'Improve attendance'}. Please consult your child's class advisor{activeChild.advisorName && activeChild.advisorName !== 'Class Advisor' ? `, ${activeChild.advisorName}` : ''}.
                       </p>
                     </div>
                     <span className="text-[10px] text-slate-400 font-medium shrink-0">Just now</span>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default ParentDashboard;
