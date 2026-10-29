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
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--navy)] tracking-[-0.01em]">
              Student Academic Dossier
            </h1>
            <span className="stamp hidden sm:inline-flex">ENROLLED STUDENT</span>
          </div>
          <p className="text-sm font-sans text-[var(--ink-soft)] mt-1">Official institutional student record and registration details</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-[10px] border border-[var(--rule)] bg-[var(--paper-raised)] shadow-none overflow-hidden relative">
          <CardContent className="p-8 sm:p-10 flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            
            {/* Left Column: Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row gap-8 items-start flex-1 w-full">
              
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[var(--rule)] bg-[var(--paper)] flex items-center justify-center relative">
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
                  <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--navy)] mb-2">{user?.name || 'Unknown Student'}</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge-info text-xs font-mono">
                      Student
                    </span>
                    {isEligibleForExam ? (
                      <span className="badge-safe text-xs font-mono">
                        Exam Clearance Granted
                      </span>
                    ) : (
                      <span className="badge-danger text-xs font-mono">
                        Clearance Review Required
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t border-[var(--rule)]">
                  <div className="flex items-center gap-3 text-sm text-[var(--ink)]">
                    <User size={15} className="text-[var(--navy)] shrink-0" />
                    <span>Roll No : <span className="font-mono font-semibold text-[var(--navy)]">{rollNumber || 'N/A'}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--ink)]">
                    <Fingerprint size={15} className="text-[var(--navy)] shrink-0" />
                    <span>Register No : <span className="font-mono font-semibold text-[var(--navy)]">{registerNumber || 'N/A'}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--ink)]">
                    <Mail size={15} className="text-[var(--navy)] shrink-0" />
                    <span>Email : <span className="font-mono font-medium text-[var(--ink)]">{user?.email || 'N/A'}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--ink)]">
                    <Phone size={15} className="text-[var(--navy)] shrink-0" />
                    <span>Contact : <span className="font-mono font-medium text-[var(--ink)]">{user?.phone || 'N/A'}</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Divider (Hidden on mobile) */}
            <div className="hidden lg:block w-px self-stretch bg-[var(--rule)] mx-2"></div>

            {/* Right Column: Organization Info */}
            <div className="flex-1 w-full space-y-6 lg:pt-2">
              
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-[8px] bg-[var(--paper)] border border-[var(--rule)] flex items-center justify-center shrink-0">
                  <Building2 size={18} className="text-[var(--navy)]" />
                </div>
                <div>
                  <p className="text-xs font-sans font-medium text-[var(--ink-soft)] mb-1">Department & Course</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-serif font-semibold text-[var(--navy)]">{course?.name || 'N/A'}</h3>
                    {department?.code && (
                      <span className="px-2 py-0.5 bg-[var(--paper)] border border-[var(--rule)] text-[var(--navy)] text-[10px] font-mono font-bold rounded-[4px] uppercase">
                        {department.code}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-[8px] bg-[var(--paper)] border border-[var(--rule)] flex items-center justify-center shrink-0">
                  <BookOpen size={18} className="text-[var(--navy)]" />
                </div>
                <div>
                  <p className="text-xs font-sans font-medium text-[var(--ink-soft)] mb-1">Academic Cohort</p>
                  <h3 className="text-base font-serif font-semibold text-[var(--navy)]">
                    {currentSemester?.name || 'N/A'} • Section {section?.name || 'N/A'}
                  </h3>
                  <p className="text-xs font-mono text-[var(--ink-soft)] mt-1">Admitted in {admissionYear || 'N/A'}</p>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
