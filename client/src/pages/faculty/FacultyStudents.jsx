import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Users, GraduationCap, Mail } from 'lucide-react';
import api from '@/utils/api';

export default function FacultyStudents() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get('subjectId');
  const isAtRiskFilter = searchParams.get('filter') === 'at-risk';
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectionInfo, setSectionInfo] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        let url = '/faculty/students';
        const dateParam = searchParams.get('date');
        let queryParams = [];
        if (subjectId) queryParams.push(`subjectId=${subjectId}`);
        if (dateParam) queryParams.push(`date=${dateParam}`);
        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

        if (sectionId) {
          url = `/faculty/students/${sectionId}${queryString}`;
        }
        
        const res = await api.get(url);
        if (res.data.success) {
          setStudents(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [sectionId]);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch = (
      s.user?.name?.toLowerCase().includes(q) ||
      s.rollNumber?.toLowerCase().includes(q) ||
      s.registerNumber?.toLowerCase().includes(q)
    );

    if (!matchesSearch) return false;

    if (isAtRiskFilter) {
      const hasSubjectStats = !!subjectId;
      const pct = hasSubjectStats 
        ? (s.subjectPct ?? 100)
        : (s.attendanceSummary?.overallPercentage ?? 100);
      return pct < 80; // Only show students below 80%
    }

    return true;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white dark:bg-[#07111F] p-6 rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isAtRiskFilter ? 'At-Risk Students' : 'Students'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? 'Loading...' : `${filtered.length} students found`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#07111F] p-4 rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, register no..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white dark:bg-[#07111F] rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm border-t-4 border-t-indigo-500 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center p-16 text-slate-400">
            <Users className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 dark:border-slate-800">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Register No.</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Overall Percentage</th>
                  {searchParams.get('subjectId') && (
                    <th className="px-6 py-4 text-left text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Status</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filtered.map((student, idx) => {
                  const hasSubjectStats = !!searchParams.get('subjectId');
                  const pct = Math.round(hasSubjectStats 
                    ? (student.subjectPct ?? 0)
                    : (student.attendanceSummary?.overallPercentage ?? 0));
                  const isLow = pct < 80;
                  
                  return (
                    <tr key={student._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                              {student.user?.name?.charAt(0).toUpperCase() || 'S'}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {student.user?.name || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">{student.registerNumber || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{student.user?.email || '-'}</td>
                      

                      
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          isLow 
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' 
                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}>
                          {pct}%
                        </span>
                      </td>
                      {searchParams.get('subjectId') && (
                        <td className="px-6 py-4">
                          {student.todayStatus && student.todayStatus !== 'Not Marked' ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              student.todayStatus === 'Present' ? 'bg-emerald-50 text-emerald-700' :
                              student.todayStatus === 'Absent' ? 'bg-rose-50 text-rose-700' :
                              'bg-amber-50 text-amber-700'
                            }`}>
                              {student.todayStatus}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Not Marked</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
