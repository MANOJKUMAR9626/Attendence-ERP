import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser, logoutUser } from './store/slices/authSlice';
import api from './utils/api';
import ProtectedRoute from './components/routing/ProtectedRoute';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import HODLayout from './components/layout/HODLayout';
import StudentLayout from './components/layout/StudentLayout';
import FacultyLayout from './components/layout/FacultyLayout';
import AdvisorLayout from './components/layout/AdvisorLayout';
import ParentLayout from './components/layout/ParentLayout';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import AdminStudents from './pages/admin/AdminStudents';
import AdminFaculty from './pages/admin/AdminFaculty';
import ManageDepartments from './pages/admin/ManageDepartments';
import Settings from './pages/admin/Settings';
import AcademicCalendar from './pages/admin/AcademicCalendar';
import Timetables from './pages/admin/Timetables';
import FacultyAllocations from './pages/admin/FacultyAllocations';
import AdminAttendance from './pages/admin/AdminAttendance';

// HOD Pages
import HODDashboard from './pages/hod/Dashboard';
import FacultyOverview from './pages/hod/FacultyOverview';
import DeptAnalytics from './pages/hod/DeptAnalytics';
import AttendanceReview from './pages/hod/AttendanceReview';
import AtRiskStudents from './pages/hod/AtRiskStudents';
import HODLeaveApprovals from './pages/hod/LeaveApprovals';
import Notifications from './pages/hod/Notifications';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import Timetable from './pages/student/Timetable';
import LeaveRequest from './pages/student/LeaveRequest';
import AttendanceLog from './pages/student/AttendanceLog';
import StudentAIAnalytics from './pages/student/AIAnalytics';
import StudentProfile from './pages/student/Profile';
import StudentNotifications from './pages/student/Notifications';

// Faculty Pages
import FacultyDashboard from './pages/faculty/Dashboard';
import MarkAttendance from './pages/faculty/MarkAttendance';
import FacultyTimetable from './pages/faculty/FacultyTimetable';
import AttendanceHistory from './pages/faculty/AttendanceHistory';
import FacultyAIAnalytics from './pages/faculty/AIAnalytics';
import MyClasses from './pages/faculty/MyClasses';
import FacultyStudents from './pages/faculty/FacultyStudents';
import FacultyProfile from './pages/faculty/Profile';

// Advisor Pages
import AdvisorDashboard from './pages/advisor/Dashboard';
import LeaveApprovals from './pages/advisor/LeaveApprovals';
import ClassAttendance from './pages/advisor/ClassAttendance';
import StudentList from './pages/advisor/StudentList';
import DefaultersList from './pages/advisor/DefaultersList';

// Parent Pages
import ParentDashboard from './pages/parent/Dashboard';
import ParentNotifications from './pages/parent/Notifications';
import DetailedAttendance from './pages/parent/DetailedAttendance';
import WarningNotices from './pages/parent/WarningNotices';
import ParentAIPrediction from './pages/parent/AIPrediction';
import ParentProfile from './pages/parent/Profile';

// Global Components
import AIChatbot from './components/chatbot/AIChatbot';
import CommandPalette from './components/CommandPalette';

// ─── Placeholder stub for pages not yet built ─────────────────────────────────
const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center w-full min-h-[60vh] gap-5 text-center px-6 py-12 bg-[var(--paper-raised)] rounded-none border border-[var(--rule)] shadow-none">
    <div className="w-16 h-16 rounded-full bg-[var(--paper)] flex items-center justify-center text-3xl border border-[var(--rule)] text-[var(--navy)]">
      <span>🏛️</span>
    </div>
    <div>
      <h2 className="text-2xl font-serif font-bold text-[var(--navy)] mb-2">
        {title}
      </h2>
      <p className="text-[var(--ink-soft)] text-sm max-w-md mx-auto font-sans leading-relaxed">
        This institutional ledger module is undergoing administrative verification and will be published in an upcoming ledger release.
      </p>
    </div>
  </div>
);

const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4 bg-slate-50 dark:bg-slate-950">
    <div className="relative">
      <div className="absolute inset-0 bg-rose-500 blur-[80px] opacity-20 rounded-full" />
      <p className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-rose-400 to-rose-600 relative z-10">403</p>
    </div>
    <div className="z-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-2">Access Denied</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        You don't have the required permissions to view this module. If you believe this is an error, please contact your administrator.
      </p>
      <a href="/" className="inline-flex items-center justify-center h-11 px-8 mt-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:scale-105 transition-transform">
        Return Home
      </a>
    </div>
  </div>
);

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4 bg-slate-50 dark:bg-slate-950">
    <div className="relative">
      <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-20 rounded-full" />
      <p className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-600 relative z-10">404</p>
    </div>
    <div className="z-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-2">Page Not Found</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved to another location.
      </p>
      <a href="/" className="inline-flex items-center justify-center h-11 px-8 mt-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:scale-105 transition-transform">
        Return Home
      </a>
    </div>
  </div>
);

// ─── Root Redirect ─────────────────────────────────────────────────────────────
const RootRedirect = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Landing />;
  switch (user?.role) {
    case 'admin': return <Navigate to="/admin" replace />;
    case 'hod': return <Navigate to="/hod" replace />;
    case 'class_advisor': return <Navigate to="/advisor" replace />;
    case 'faculty': return <Navigate to="/faculty" replace />;
    case 'student': return <Navigate to="/student" replace />;
    case 'parent': return <Navigate to="/parent" replace />;
    default: return <Landing />;
  }
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          dispatch(updateUser(response.data.data));
        } catch {
          dispatch(logoutUser());
        }
      }
      setIsInitializing(false);
    };
    fetchUser();
  }, [dispatch, token]);

  if (isInitializing) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Router>
        <CommandPalette />
        <AIChatbot />
        <Routes>
          {/* Public */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <RootRedirect />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <RootRedirect />} />
          <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <RootRedirect />} />

          {/* Admin */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} overrideAuth={true} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="faculty" element={<AdminFaculty />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="departments" element={<ManageDepartments />} />
              <Route path="calendar" element={<AcademicCalendar />} />
              <Route path="settings" element={<Settings />} />
              <Route path="timetables" element={<Timetables />} />
              <Route path="allocations" element={<FacultyAllocations />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="ai-prediction" element={<ComingSoon title="AI Prediction" />} />
              <Route path="analytics" element={<ComingSoon title="Analytics & Insights" />} />
              <Route path="reports" element={<ComingSoon title="Reports" />} />
              <Route path="notifications" element={<ComingSoon title="Notifications" />} />
              <Route path="profile" element={<ComingSoon title="Admin Profile" />} />
            </Route>
          </Route>

          {/* HOD */}
          <Route element={<ProtectedRoute allowedRoles={['hod']} />}>
            <Route path="/hod" element={<HODLayout />}>
              <Route index element={<HODDashboard />} />
              <Route path="faculty" element={<FacultyOverview />} />
              <Route path="analytics" element={<DeptAnalytics />} />
              <Route path="attendance" element={<AttendanceReview />} />
              <Route path="risk" element={<AtRiskStudents />} />
              <Route path="leaves" element={<HODLeaveApprovals />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>
          </Route>

          {/* Class Advisor */}
          <Route element={<ProtectedRoute allowedRoles={['class_advisor']} />}>
            <Route path="/advisor" element={<AdvisorLayout />}>
              <Route index element={<AdvisorDashboard />} />
              <Route path="leaves" element={<LeaveApprovals />} />
              <Route path="attendance" element={<ClassAttendance />} />
              <Route path="students" element={<StudentList />} />
              <Route path="defaulters" element={<DefaultersList />} />
            </Route>
          </Route>

          {/* Faculty */}
          <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
            <Route path="/faculty" element={<FacultyLayout />}>
              <Route index element={<FacultyDashboard />} />
              <Route path="attendance" element={<MarkAttendance />} />
              <Route path="timetable" element={<FacultyTimetable />} />
              <Route path="history" element={<AttendanceHistory />} />
              <Route path="analytics" element={<FacultyAIAnalytics />} />
              <Route path="classes" element={<MyClasses />} />
              <Route path="students" element={<FacultyStudents />} />
              <Route path="students/:sectionId" element={<FacultyStudents />} />
              <Route path="reports" element={<ComingSoon title="Attendance Reports" />} />
              <Route path="notifications" element={<ComingSoon title="Notifications" />} />
              <Route path="leaves" element={<ComingSoon title="Leave Requests" />} />
              <Route path="profile" element={<FacultyProfile />} />
              <Route path="settings" element={<ComingSoon title="Settings" />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="leaves" element={<LeaveRequest />} />
              <Route path="attendance" element={<AttendanceLog />} />
              <Route path="ai-prediction" element={<StudentAIAnalytics />} />
              <Route path="analytics" element={<ComingSoon title="Student Analytics" />} />
              <Route path="reports" element={<ComingSoon title="Student Reports" />} />
              <Route path="notifications" element={<StudentNotifications />} />
              <Route path="settings" element={<ComingSoon title="Settings" />} />
              <Route path="profile" element={<StudentProfile />} />
            </Route>
          </Route>

          {/* Parent */}
          <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
            <Route path="/parent" element={<ParentLayout />}>
              <Route index element={<ParentDashboard />} />
              <Route path="attendance" element={<DetailedAttendance />} />
              <Route path="warnings" element={<WarningNotices />} />
              <Route path="prediction" element={<ParentAIPrediction />} />
              <Route path="profile" element={<ParentProfile />} />
              <Route path="overview" element={<ComingSoon title="Overview" />} />
              <Route path="children" element={<ComingSoon title="My Children" />} />
              <Route path="academics" element={<ComingSoon title="Academics" />} />
              <Route path="notices" element={<ComingSoon title="Notices" />} />
              <Route path="notifications" element={<ParentNotifications />} />
              <Route path="calendar" element={<ComingSoon title="Calendar" />} />
              <Route path="reports" element={<ComingSoon title="Reports" />} />
              <Route path="settings" element={<ComingSoon title="Settings" />} />
            </Route>
          </Route>

          {/* Errors */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
