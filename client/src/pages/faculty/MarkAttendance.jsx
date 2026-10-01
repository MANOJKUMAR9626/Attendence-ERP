import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, Calendar, ChevronDown, Check, Loader2, ArrowLeft } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

// ─── Attendance button group ──────────────────────────────────────────────────
const ATTENDANCE_OPTIONS = [
  { key: 'Not Marked', type: 'text', label: '-' },
  { key: 'Present',  type: 'text', label: 'P' },
  { key: 'Absent',   type: 'text', label: 'A' },
  { key: 'On Duty',  type: 'text', label: 'OD' },
  { key: 'Half Day', type: 'text', label: 'HD' },
];

const AttendanceRadio = ({ value, onChange }) => (
  <div className="flex items-center gap-2.5">
    {ATTENDANCE_OPTIONS.map(opt => {
      const active = value === opt.key;
      return (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          title={opt.key}
          className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-[11.5px] font-bold
            transition-all select-none border
            ${active
              ? 'bg-[#1D64F2] text-white border-[#1D64F2]'
              : 'bg-white text-[#4A6482] border-slate-800 hover:border-slate-300 hover:bg-slate-50'}`}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

const semNumToYear = (n) => {
  if (!n) return 'I Year';
  const y = Math.ceil(n / 2);
  return ['', 'I Year', 'II Year', 'III Year', 'IV Year'][y] || `${y} Year`;
};

// Convert "14:30" → "2:30 PM"
const to12hr = (time24) => {
  if (!time24) return null;
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
};

const formatDate = (d) => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MarkAttendance() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();

  // ── URL params (passed by MyClasses via Take Attendance link) ──────────────
  const urlSectionId   = searchParams.get('sectionId')    || '';
  const urlSubjectId   = searchParams.get('subjectId')    || '';
  const urlSemesterId  = searchParams.get('semesterId')   || '';
  const urlPeriodNum   = parseInt(searchParams.get('periodNumber') || '1', 10);
  const urlTimetableId = searchParams.get('timetableId')  || '';
  const urlDate        = searchParams.get('date')         || new Date().toISOString().split('T')[0];

  // ── State ──────────────────────────────────────────────────────────────────
  const [students,    setStudents]    = useState([]);
  const [attendance,  setAttendance]  = useState({});
  const [session,     setSession]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [isSaving,    setIsSaving]    = useState(false);
  const [showToast,   setShowToast]   = useState(false);

  // ── Header info (resolved from API) ───────────────────────────────────────
  const [info, setInfo] = useState({
    department:  '',
    year:        '',
    section:     '',
    subject:     '',
    semester:    '',
    semNumber:   0,
    periodNum:   urlPeriodNum,
    date:        formatDate(new Date(urlDate)),
  });

  // ── All timetable classes for switching (for the Subject dropdown) ─────────
  const [allClasses,       setAllClasses]       = useState([]);
  const [selectedClassIdx, setSelectedClassIdx] = useState(0);

  // ── Load all of today's classes for this faculty ───────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/faculty/timetable/today?date=${urlDate}`);
        const classes = res.data.data || [];
        setAllClasses(classes);

        // Find which class matches the URL params
        let targetIdx = 0;
        if (urlSectionId && urlSubjectId) {
          const idx = classes.findIndex(
            c => c.section?._id === urlSectionId && c.subject?._id === urlSubjectId
          );
          if (idx !== -1) targetIdx = idx;
        }
        setSelectedClassIdx(targetIdx);

        if (classes.length > 0) {
          await loadClass(classes[targetIdx], urlSectionId || classes[targetIdx]?.section?._id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load classes:', err);
        toast.error('Failed to load timetable');
        setLoading(false);
      }
    })();
  }, []);

  // ── Load students + session for a chosen class ─────────────────────────────
  const loadClass = useCallback(async (cls, sectionIdOverride) => {
    if (!cls) return;
    setLoading(true);
    try {
      const secId  = sectionIdOverride || cls.section?._id;
      const subId  = cls.subject?._id;
      const semId  = cls.semester?._id;
      const perNum = cls.periodNumber || urlPeriodNum;

      // ── 1. Fetch students in this section ─────────────────────────────────
      const stuRes = await api.get(`/faculty/students/${secId}`);
      const stds   = stuRes.data.data || [];
      setStudents(stds);
      const init = {};
      stds.forEach(s => { init[s._id] = 'Present'; });
      setAttendance(init);

      // ── 2. Resolve info labels ─────────────────────────────────────────────
      const semNumber = cls.semester?.number || 0;
      setInfo({
        department:  cls.department?.name || cls.section?.department?.name || cls.section?.department || '',
        year:        semNumToYear(semNumber),
        section:     cls.section?.name || '',
        subject:     cls.subject?.name || '',
        semester:    cls.semester?.name || '',
        semNumber,
        periodNum:   perNum,
        date:        formatDate(new Date(urlDate)),
      });

      // ── 3. Create / fetch attendance session ──────────────────────────────
      if (subId && semId && secId) {
        try {
          const sessRes = await api.post('/attendance/session', {
            subject:      subId,
            section:      secId,
            date:         new Date(urlDate),
            periodNumber: perNum,
            semester:     semId,
          });
          setSession(sessRes.data.data);
          
          if (sessRes.data.records && sessRes.data.records.length > 0) {
            const existing = { ...init };
            sessRes.data.records.forEach(r => {
              if (r.student) {
                existing[typeof r.student === 'object' ? r.student._id : r.student] = r.status;
              }
            });
            setAttendance(existing);
          }
        } catch (sErr) {
          console.warn('Session error:', sErr.response?.data?.message);
        }
      }
    } catch (err) {
      toast.error('Failed to load students for this class');
    } finally {
      setLoading(false);
    }
  }, [urlPeriodNum]);

  // ── Handle switching class via Subject dropdown ────────────────────────────
  const handleClassChange = async (e) => {
    const idx = parseInt(e.target.value, 10);
    setSelectedClassIdx(idx);
    const cls = allClasses[idx];
    if (cls) await loadClass(cls, cls.section?._id);
  };

  // ── Handle attendance status change ───────────────────────────────────────
  const handleStatus = (studentId, status) =>
    setAttendance(prev => ({ ...prev, [studentId]: status }));

  // ── Save attendance ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (students.length === 0) { toast.error('No students to save'); return; }
    setIsSaving(true);
    try {
      const hasNotMarked = students.some(s => (attendance[s._id] || 'Not Marked') === 'Not Marked');
      if (hasNotMarked) {
        toast.error('Please mark attendance for all students before saving.');
        setIsSaving(false);
        return;
      }

      const records = students.map(s => ({
        student: s._id,
        status:  attendance[s._id] || 'Not Marked',
        remarks: '',
      }));
      if (session) {
        const res = await api.post('/attendance/mark', { sessionId: session._id, records });
        console.log("Save Response:", res.data);
        if (res.data?.demoNotifications && res.data.demoNotifications.length > 0) {
          console.log("Triggering Demo SMS Toast for:", res.data.demoNotifications);
          res.data.demoNotifications.forEach(demo => {
            toast.custom((t) => (
              <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex flex-col ring-1 ring-black ring-opacity-5 overflow-hidden border border-slate-100`}>
                <div className="bg-[#eff2fa] px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📱</span>
                    <h3 className="text-sm font-bold text-slate-800">SMS Notification</h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" strokeWidth={3} /> Demo SMS Generated
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">To</span>
                    <span className="text-sm font-semibold text-slate-700">{demo.to}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Message</span>
                    <div className="mt-1 text-[13px] text-slate-700 bg-slate-50 border border-slate-100 p-3 rounded-xl leading-relaxed whitespace-pre-wrap font-medium">
                      {demo.message}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    <span className="text-sm">⚠️</span>
                    <p className="text-[12px] font-bold">Demo SMS – Not an actual SMS</p>
                  </div>
                </div>
              </div>
            ), { duration: 10000, position: 'top-center' });
          });
        }
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
      toast.success('Attendance saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Derive dept name for the Department dropdown ───────────────────────────
  // Try to get it from the section's department object (populated)
  const currentClass = allClasses[selectedClassIdx];
  const deptName =
    info.department ||
    currentClass?.section?.department?.name ||
    currentClass?.section?.department ||
    'Department';

  return (
    <div className="max-w-[1200px] mx-auto min-h-screen pb-12 relative font-sans p-4 sm:p-6 lg:p-10 bg-[#F4F7FE]">

      {/* ── Success Toast ── */}
      {showToast && (
        <div className="fixed top-8 right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-gradient-to-r from-[#0E6C4D] to-[#0A4833] rounded-2xl p-4 shadow-2xl
                          flex items-center gap-4 min-w-[340px] border border-[#107F5A]">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <Check className="w-6 h-6 text-[#0E6C4D]" strokeWidth={3} />
            </div>
            <div>
              <h4 className="text-white font-bold text-[15px]">Attendance Saved!</h4>
              <p className="text-emerald-100 text-[12px] mt-0.5 opacity-90">
                {students.length} students recorded for {info.subject}.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-800 p-6 sm:p-8">

        {/* ── Header ── */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Classes
          </button>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">Take Attendance</h1>
          <div className="flex items-center text-[13px] font-semibold mt-1.5">
            <span className="text-blue-600">Attendance</span>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-400" strokeWidth={2.5} />
            <span className="text-slate-500">Take Attendance</span>
          </div>
        </div>

        {/* ── Filters ── Two-row layout ── */}
        <div className="mb-8 border-b border-slate-800 pb-8 space-y-4">

          {/* Row 1 — Department + Subject */}
          <div className="flex flex-wrap items-end gap-4">
            {/* Department */}
            <div className="space-y-1.5 flex-1 min-w-[220px]">
              <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wide block">
                Department
              </label>
              <div className="w-full h-11 flex items-center bg-slate-50 border border-slate-800
                              rounded-xl px-4 text-sm font-semibold text-slate-800 shadow-sm
                              whitespace-nowrap overflow-hidden">
                {loading
                  ? <span className="text-slate-400">Loading...</span>
                  : <span className="block w-full" title={deptName}>{deptName || '—'}</span>
                }
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1.5 flex-[1.5] min-w-[280px]">
              <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wide block">
                Subject
              </label>
              <div className="w-full h-11 flex items-center bg-slate-50 border border-slate-800
                              rounded-xl px-4 text-sm font-semibold text-slate-800 shadow-sm
                              whitespace-nowrap overflow-hidden">
                {loading
                  ? <span className="text-slate-400">Loading...</span>
                  : <span className="block w-full" title={info.subject}>
                      {info.subject || '—'}
                    </span>
                }
              </div>
            </div>
          </div>

          {/* Row 2 — Year, Section, Semester, Period, Time, Date */}
          <div className="flex flex-wrap items-end gap-4">

            {/* Year */}
            <div className="space-y-1.5 flex-1 min-w-[100px]">
              <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wide block">Year</label>
              <div className="h-11 flex items-center bg-slate-50 border border-slate-800 rounded-xl px-4
                              text-sm font-semibold text-slate-800 shadow-sm whitespace-nowrap">
                {loading ? '...' : info.year}
              </div>
            </div>

            {/* Section */}
            <div className="space-y-1.5 flex-1 min-w-[90px]">
              <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wide block">Section</label>
              <div className="h-11 flex items-center bg-slate-50 border border-slate-800 rounded-xl px-4
                              text-sm font-semibold text-slate-800 shadow-sm">
                {loading ? '...' : (info.section || '—')}
              </div>
            </div>

            {/* Semester */}
            <div className="space-y-1.5 flex-1 min-w-[120px]">
              <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wide block">Semester</label>
              <div className="h-11 flex items-center bg-slate-50 border border-slate-800 rounded-xl px-4
                              text-sm font-semibold text-slate-800 shadow-sm whitespace-nowrap">
                {loading ? '...' : (info.semester || '—')}
              </div>
            </div>

            {/* Period */}
            <div className="space-y-1.5 flex-1 min-w-[80px]">
              <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wide block">Period</label>
              <div className="h-11 flex items-center bg-slate-50 border border-slate-800 rounded-xl px-4
                              text-sm font-semibold text-slate-800 shadow-sm">
                P{info.periodNum}
              </div>
            </div>

            {/* Time */}
            <div className="space-y-1.5 flex-[1.5] min-w-[150px]">
              <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wide block">Time</label>
              <div className="h-11 flex items-center bg-slate-50 border border-slate-800 rounded-xl px-4
                              text-[13px] font-semibold text-slate-800 shadow-sm whitespace-nowrap">
                {currentClass?.startTime && currentClass?.endTime
                  ? `${to12hr(currentClass.startTime)} - ${to12hr(currentClass.endTime)}`
                  : '—'}
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5 flex-[1.5] min-w-[130px]">
              <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wide block">Date</label>
              <div className="h-11 flex items-center justify-between bg-slate-50 border border-slate-800
                              rounded-xl px-4 text-sm font-semibold text-slate-800 shadow-sm gap-3">
                <span>{info.date}</span>
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Student Table ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm text-slate-400">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            No students found for this section.
          </div>
        ) : (
          <div className="w-full">
            {/* Table header */}
            <div className="grid grid-cols-[50px_130px_1fr_240px_80px_120px] gap-4 px-6 py-4
                            bg-[#F1F3F9] rounded-t-2xl">
              {['#', 'Register No', 'Student Name', 'Attendance', '%', 'Status'].map(h => (
                <div key={h} className="text-[12px] font-bold text-[#4B5563]
                                        last:text-center [&:nth-child(4)]:text-center [&:nth-child(5)]:text-center">
                  {h}
                </div>
              ))}
            </div>

            {/* Table rows */}
            <div className="flex flex-col divide-y divide-slate-50">
              {students.map((student, idx) => {
                const status  = attendance[student._id] || 'Not Marked';
                const pct     = Math.round(student.attendanceSummary?.overallPercentage ?? 85);
                const isLow   = pct < 80;
                const isCrit  = pct < 75;
                const highlighted = idx === 2 || (isLow && status === 'Absent');

                let badge = { label: 'Safe',     cls: 'bg-[#E3F5EE] text-[#0E8B58]' };
                if (isCrit)     badge = { label: 'Critical', cls: 'bg-[#FDE2E4] text-[#D42A39]' };
                else if (isLow) badge = { label: 'High Risk',cls: 'bg-[#FDE2E4] text-[#D42A39]' };

                return (
                  <div
                    key={student._id}
                    className={`grid grid-cols-[50px_130px_1fr_240px_80px_120px] gap-4 items-center
                                px-6 py-4 transition-colors
                                ${highlighted
                                  ? 'bg-gradient-to-r from-[#F3F4FE] via-[#EAEBFA] to-[#F3F4FE]'
                                  : 'hover:bg-slate-50'}`}
                  >
                    <div className="text-[13px] font-bold text-slate-500">{idx + 1}</div>
                    <div className="text-[13px] font-bold text-slate-800">{student.registerNumber || '—'}</div>
                    <div className="text-[13px] font-bold text-slate-800">{student.user?.name || '—'}</div>
                    <div className="flex items-center justify-center">
                      <AttendanceRadio value={status} onChange={val => handleStatus(student._id, val)} />
                    </div>
                    <div className={`text-[13px] font-bold text-center ${isLow ? 'text-red-500' : 'text-slate-700'}`}>
                      {pct}%
                    </div>
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center justify-center h-7 px-4 rounded-full
                                        text-[11px] font-bold tracking-wide ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Bottom actions ── */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
          <p className="text-sm text-slate-500">
            {students.length > 0 && (
              <>
                <span className="font-semibold text-slate-800">{students.length}</span> students ·{' '}
                <span className="font-semibold text-emerald-600">
                  {Object.values(attendance).reduce((total, s) => {
                    if (['Present', 'Late Entry', 'On Duty'].includes(s)) return total + 1;
                    if (s === 'Half Day') return total + 0.5;
                    return total;
                  }, 0)}
                </span> present
              </>
            )}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-11 px-8 bg-white border border-slate-800 text-slate-700 text-[13px]
                         font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const newAtt = {};
                students.forEach(s => newAtt[s._id] = 'Present');
                setAttendance(newAtt);
              }}
              className="h-11 px-8 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[13px]
                         font-bold rounded-xl hover:bg-indigo-100 transition-all shadow-sm"
            >
              Mark All Present
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || students.length === 0}
              className="h-11 px-8 bg-[#3E42EC] hover:bg-[#2C2FBB] disabled:opacity-60
                         text-white text-[13px] font-bold rounded-xl transition-all shadow-md
                         shadow-[#3E42EC]/30 flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
