import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building2, BookOpen, Fingerprint } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/utils/api';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/student/profile');
        if (res.data.success) {
          setProfile(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-slate-500">
        Profile data not found.
      </div>
    );
  }

  const { user, department, course, currentSemester, section, registerNumber, rollNumber, admissionYear, isEligibleForExam } = profile;

  // Determine fallback image based on gender or name hint
  const userName = (user?.name || '').toLowerCase();
  const isFemale = user?.gender === 'Female' || userName.includes('vidhya') || userName.includes('priya') || userName.includes('deepa') || userName.includes('nisha');
  const defaultImage = isFemale ? '/images/student_female.png' : '/images/student_male.png';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 page-enter">
      {/* Breadcrumb / Title area */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <span className="font-medium text-slate-700 dark:text-slate-300">Dashboard</span>
        <span className="text-slate-400">›</span>
        <span className="text-slate-500">Student Profile</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-panel border-none shadow-sm rounded-3xl overflow-hidden relative">
          <CardContent className="p-8 sm:p-10 flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            
            {/* Left Column: Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row gap-8 items-start flex-1 w-full">
              
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-[#0F172A] shadow-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center relative">
                  <img 
                    src={defaultImage} 
                    alt={user?.name || "Profile"} 
                    className="w-full h-full object-cover bg-white" 
                  />
                </div>
              </div>

              {/* Personal Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">{user?.name || 'Unknown Student'}</h1>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 text-xs font-bold rounded-full">
                      Student
                    </span>
                    {isEligibleForExam ? (
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold rounded-full">
                        Exam Eligible
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 text-xs font-bold rounded-full">
                        Review Needed
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <User size={16} className="text-blue-500 shrink-0" />
                    <span>Roll No : <span className="font-semibold text-slate-800 dark:text-slate-200">{rollNumber || 'N/A'}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Mail size={16} className="text-blue-500 shrink-0" />
                    <span>Email : <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.email || 'N/A'}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Phone size={16} className="text-blue-500 shrink-0" />
                    <span>Contact : <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.phone || 'N/A'}</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Divider (Hidden on mobile) */}
            <div className="hidden lg:block w-px self-stretch bg-gradient-to-b from-transparent via-slate-200 dark:via-slate-800 to-transparent mx-4"></div>

            {/* Right Column: Organization Info */}
            <div className="flex-1 w-full space-y-8 lg:pt-4">
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Building2 size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Department & Course</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{course?.name || 'N/A'}</h3>
                    {department?.code && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 text-[10px] font-bold rounded-md uppercase">
                        {department.code}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                  <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Academic Batch</p>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {currentSemester?.name || 'N/A'} • Section {section?.name || 'N/A'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Admitted in {admissionYear || 'N/A'}</p>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
