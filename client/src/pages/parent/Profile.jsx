import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Briefcase, IndianRupee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/utils/api';

export default function ParentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/parent/profile');
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

  const { user, relation, occupation, annualIncome, address, students } = profile;

  const isFemale = relation === 'Mother' || (user?.gender && user.gender === 'Female');
  const avatarImage = isFemale ? '/images/parent_female.png' : '/images/parent_male.png';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 page-enter">
      {/* Breadcrumb / Title area */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <span className="font-medium text-slate-700 dark:text-slate-300">Dashboard</span>
        <span className="text-slate-400">›</span>
        <span className="text-slate-500">Parent Profile</span>
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
                    src={avatarImage} 
                    alt={user?.name || "Profile"} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = isFemale 
                        ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane&style=circle" 
                        : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&style=circle";
                    }}
                  />
                </div>
              </div>

              {/* Personal Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">{user?.name || 'Unknown Parent'}</h1>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 text-xs font-bold rounded-full">
                      Parent / {relation || 'Guardian'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <User size={16} className="text-blue-500 shrink-0" />
                    <span>Parent ID : <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.identifier || (user?.email ? user.email.split('@')[0].toUpperCase() : 'N/A')}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Mail size={16} className="text-blue-500 shrink-0" />
                    <span>Email : <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.email || 'N/A'}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Phone size={16} className="text-blue-500 shrink-0" />
                    <span>Contact : <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.phone || '+91 98765 43210'}</span></span>
                  </div>
                  <div className="flex items-start sm:items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <User size={16} className="text-blue-500 shrink-0 mt-0.5 sm:mt-0" />
                    <span className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span>Wards Enrolled :</span>
                      <span className="flex flex-col">
                        {students && students.length > 0 ? (
                          students.map((student, idx) => (
                            <span key={idx} className="font-semibold text-slate-800 dark:text-slate-200">
                              {student.user?.name || 'Unknown'} <span className="text-xs text-slate-500 font-normal">({student.course?.name || ''})</span>
                            </span>
                          ))
                        ) : (
                          <span className="font-semibold text-slate-800 dark:text-slate-200">None</span>
                        )}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
