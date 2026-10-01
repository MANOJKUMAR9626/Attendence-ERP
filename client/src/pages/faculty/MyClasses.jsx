import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Database, Monitor, Settings, Users, CheckSquare, Layers,
  CalendarDays, Info, Clock, MapPin, GraduationCap, FlaskConical
} from 'lucide-react';
import api from '@/utils/api';

// ── Circular progress ring ────────────────────────────────────────────────────
const CircularProgress = ({ percentage, color }) => {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  return (
    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} stroke="#E2E8F0" strokeWidth="4" fill="none" />
        <circle
          cx="28" cy="28" r={r}
          stroke={color} strokeWidth="4" fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[12px] font-bold text-slate-700 dark:text-slate-200">
        {percentage}%
      </span>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const semToYear = (num) => {
  if (!num) return '';
  const y = Math.ceil(num / 2);
  const suffix = ['', 'I', 'II', 'III', 'IV'];
  return `${suffix[y] || y} Year`;
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

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const COLORS = [
  { icon: BookOpen,      iconColor: 'text-indigo-600',  iconBg: 'bg-indigo-100  dark:bg-indigo-500/20',  ring: '#6366F1' },
  { icon: Database,      iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100 dark:bg-emerald-500/20', ring: '#10B981' },
  { icon: Monitor,       iconColor: 'text-sky-600',     iconBg: 'bg-sky-100     dark:bg-sky-500/20',     ring: '#0EA5E9' },
  { icon: Settings,      iconColor: 'text-orange-500',  iconBg: 'bg-orange-100  dark:bg-orange-500/20',  ring: '#F97316' },
  { icon: Layers,        iconColor: 'text-purple-600',  iconBg: 'bg-purple-100  dark:bg-purple-500/20',  ring: '#8B5CF6' },
  { icon: FlaskConical,  iconColor: 'text-rose-500',    iconBg: 'bg-rose-100    dark:bg-rose-500/20',    ring: '#F43F5E' },
  { icon: GraduationCap, iconColor: 'text-teal-600',    iconBg: 'bg-teal-100    dark:bg-teal-500/20',    ring: '#14B8A6' },
];

// ── Card component ────────────────────────────────────────────────────────────
const ClassCard = ({ period, index, selectedDate }) => {
  const c = COLORS[index % COLORS.length];
  const Icon = c.icon;

  const semNum  = period.semester?.number;
  const yearStr = semToYear(semNum);
  const semName = period.semester?.name || `Semester ${semNum || ''}`;
  const section = period.section?.name   || '—';
  const students= period.section?.currentStrength ?? 0;
  const sectionId = period.section?._id;
  const subjectId = period.subject?._id;
  const semesterId= period.semester?._id;

  const hasTime = period.startTime && period.endTime;

  return (
    <div className="bg-white dark:bg-[#0F1C2E] rounded-2xl border border-slate-800 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* ── Body ── */}
      <div className="p-5 flex-1">
        {/* Row 1 : icon + title + ring */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Icon */}
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.iconBg}`}>
              <Icon className={`w-5 h-5 ${c.iconColor}`} />
            </div>
            {/* Subject name */}
            <div className="min-w-0">
              <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                {period.subject?.name || 'Unknown Subject'}
              </h3>
              {/* Section */}
              <p className={`text-[12px] font-semibold mt-0.5 ${c.iconColor} flex items-center flex-wrap gap-1`}>
                <span>Section {section}</span>
              </p>
            </div>
          </div>
          {/* Percentage ring */}
          {period.isCompleted ? (
            <CircularProgress percentage={period.attendancePercentage || 0} color={c.ring} />
          ) : (
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" stroke="#E2E8F0" strokeWidth="4" strokeDasharray="4 4" fill="none" className="dark:stroke-slate-700" />
              </svg>
              <span className="absolute text-[12px] font-bold text-slate-400 dark:text-slate-500">
                00%
              </span>
            </div>
          )}
        </div>

        {/* Row 2 : Time | Room */}
        <div className="flex items-center gap-2 text-[12.5px] text-slate-500 dark:text-slate-400 mb-1.5">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          {hasTime ? (
            <span>
              Time: <strong className="text-slate-700 dark:text-slate-300">{to12hr(period.startTime)} - {to12hr(period.endTime)}</strong>
            </span>
          ) : (
            <span className="italic text-slate-400">Time: TBD</span>
          )}
          {period.room && (
            <>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span>Room: <strong className="text-slate-700 dark:text-slate-300">{period.room}</strong></span>
            </>
          )}
        </div>

        {/* Row 3 : Students | Today status */}
        <div className="flex items-center gap-2 text-[12.5px] text-slate-500 dark:text-slate-400">
          <span>Students: <strong className="text-slate-700 dark:text-slate-300">{students}</strong></span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span>Status:</span>
          {period.isCompleted ? (
            <span className="font-bold text-emerald-600">Attendance Taken ({period.attendancePercentage}%)</span>
          ) : (
            <span className="font-bold text-orange-500">Pending</span>
          )}
          {period.isLab && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300">LAB</span>
          )}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-slate-800 dark:border-slate-700/60" />

      {/* ── Action buttons ── */}
      <div className="flex gap-3 p-4">
        <Link
          to={sectionId ? `/faculty/students/${sectionId}?subjectId=${subjectId || ''}&date=${selectedDate}` : `/faculty/students?date=${selectedDate}`}
          className="flex-1 py-2.5 flex justify-center items-center gap-2 rounded-xl border border-slate-800 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-[13px] font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Users className="w-4 h-4 text-indigo-500" />
          View Students ({students})
        </Link>
        <Link
          to={`/faculty/attendance?sectionId=${sectionId || ''}&subjectId=${subjectId || ''}&semesterId=${semesterId || ''}&periodNumber=${period.periodNumber || 1}&timetableId=${period.timetableId || ''}&date=${selectedDate}`}
          className={`flex-1 py-2.5 flex justify-center items-center gap-2 rounded-xl active:scale-[0.98] text-[13px] font-semibold transition-all ${
            period.isCompleted 
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          {period.isCompleted ? 'View / Edit Attendance' : 'Take Attendance'}
        </Link>
      </div>
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────
export default function MyClasses() {
  const [periods,    setPeriods]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [dayOfWeek,  setDayOfWeek]  = useState('');
  
  // Default to today's date formatted as YYYY-MM-DD for the input
  // Read from sessionStorage to persist across navigation (e.g. returning from Take Attendance)
  const [selectedDate, setSelectedDate] = useState(() => {
    return sessionStorage.getItem('facultySelectedDate') || new Date().toLocaleDateString('en-CA');
  });

  // Update sessionStorage whenever selectedDate changes
  useEffect(() => {
    sessionStorage.setItem('facultySelectedDate', selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/faculty/timetable/today?date=${selectedDate}`);
        if (data.success) {
          setPeriods(data.data || []);
          setIsFallback(data.isFallback || false);
          setDayOfWeek(data.dayOfWeek || DAY_NAMES[new Date(selectedDate).getDay()]);
        }
      } catch (err) {
        console.error('MyClasses fetch error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedDate]);

  const isWeekend = dayOfWeek === 'Sunday' || dayOfWeek === 'Saturday';
  
  // Create a display-friendly version of the selected date
  const displayDate = new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-[1600px] mx-auto space-y-5 pb-12 min-h-screen">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4
                      bg-white dark:bg-[#0F1C2E] p-5 rounded-2xl
                      border border-slate-800 dark:border-slate-700/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Classes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isFallback
              ? 'Showing all your assigned subjects & sections.'
              : 'Manage your scheduled classes and take attendance.'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl
                        bg-slate-50 dark:bg-slate-800/60
                        border border-slate-800 dark:border-slate-700
                        text-sm text-slate-600 dark:text-slate-400">
          <CalendarDays className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="font-semibold hidden sm:inline">{dayOfWeek || DAY_NAMES[new Date(selectedDate).getDay()]}</span>
          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">·</span>
          <input 
            type="date"
            className="bg-transparent border-none outline-none font-medium cursor-pointer text-slate-700 dark:text-slate-300"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max="2026-12-31"
          />
        </div>
      </div>

      {/* ── Info banner on fallback ── */}
      {!loading && isFallback && periods.length > 0 && (
        <div className="flex items-start gap-3 bg-indigo-50 dark:bg-indigo-500/10
                        border border-indigo-200 dark:border-indigo-500/30
                        rounded-2xl px-5 py-3.5">
          <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            <span className="font-semibold">
              {isWeekend ? `No scheduled classes on ${dayOfWeek}.` : 'Timetable not configured for today.'}
            </span>{' '}
            Showing all your assigned subjects — you can still take attendance for any class.
          </p>
        </div>
      )}

      {/* ── Grid / States ── */}
      <div className="bg-white dark:bg-[#0F1C2E] rounded-2xl
                      border border-slate-800 dark:border-slate-700/60 shadow-sm
                      border-t-4 border-t-indigo-500 p-5">

        {loading ? (
          /* Loading skeleton */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-2xl border border-slate-800 dark:border-slate-800 p-5 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                  <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="border-t border-slate-800 dark:border-slate-800 pt-4 flex gap-3">
                  <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl flex-1" />
                  <div className="h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex-1" />
                </div>
              </div>
            ))}
          </div>
        ) : periods.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No subjects assigned yet</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                Ask your administrator to assign subjects and sections to your profile.
              </p>
            </div>
          </div>
        ) : (
          /* Class cards grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {periods.map((period, i) => (
              <ClassCard key={period._id || i} period={period} index={i} selectedDate={selectedDate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
