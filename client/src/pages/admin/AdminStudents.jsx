import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Search, Filter, Plus, MoreVertical, Edit2, Trash2,
  Download, RotateCcw, AlertTriangle, CheckCircle2, UserCheck,
  UserX, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Mocks removed: we now fetch fully populated student data directly from the API.

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStudent, setNewStudent] = useState({
    studentName: '',
    rollNo: '',
    branch: '',
    department: '',
    section: 'A',
    parentId: '',
    parentEmail: '',
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [stats, setStats] = useState({ total: 0, active: 0, atRisk: 0, critical: 0 });
  const [departmentsList, setDepartmentsList] = useState([]);

  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchStudents();
  }, [search, filterDept, filterYear, filterRisk, filterStatus, page]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/departments');
      setDepartmentsList(res.data.data || []);
    } catch (err) {
      console.error('Failed to load departments');
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterDept) params.append('department', filterDept);
      if (filterYear) params.append('year', filterYear);
      if (filterRisk) params.append('risk', filterRisk);
      if (filterStatus) params.append('status', filterStatus);
      params.append('page', page);
      params.append('limit', itemsPerPage);

      const res = await api.get(`/admin/students?${params.toString()}`);
      const studentsData = res.data.data || [];
      setStudents(studentsData);
      setTotalCount(res.data.total || 0);

      if (res.data.stats) {
        setStats({
          total: res.data.stats?.total || 0,
          active: res.data.stats?.active || 0,
          atRisk: res.data.stats?.atRisk || 0,
          critical: res.data.stats?.critical || 0
        });
      }
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone and will remove associated authentication records.')) return;
    try {
      await api.delete(`/admin/students/${id}`);
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete student');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      // Validate all fields
      if (!newStudent.studentName || !newStudent.rollNo || !newStudent.branch || !newStudent.department) {
        return toast.error('All fields are required');
      }

      const payload = {
        name: newStudent.studentName,
        email: `${newStudent.rollNo.toLowerCase()}@smarterp.edu`,
        password: `${newStudent.rollNo}@123`,
        role: 'student',
        identifier: newStudent.rollNo,
        department: newStudent.department,
        course: newStudent.branch,
        section: newStudent.section,
        parentId: newStudent.parentId,
        parentEmail: newStudent.parentEmail,
      };

      await api.post('/admin/students', payload);
      toast.success('Student added successfully');
      setIsAddModalOpen(false);
      setNewStudent({ studentName: '', rollNo: '', branch: '', department: '', section: 'A', parentId: '', parentEmail: '' });
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add student');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Derived Statistics
  const total = stats.total;
  const active = stats.active;
  const atRisk = stats.atRisk;
  const critical = stats.critical;

  // Pagination (Server-side)
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const paginated = students; // The API already returns the paginated slice

  const handleReset = () => {
    setSearch(''); setFilterDept(''); setFilterYear('');
    setFilterRisk(''); setFilterStatus('');
    setPage(1);
  };

  const Badge = ({ level }) => {
    const styles = {
      NA: { bg: 'bg-slate-100 dark:bg-slate-500/10', text: 'text-slate-700 dark:text-slate-400', border: 'border-slate-800 dark:border-slate-500/20', dot: 'bg-slate-500' },
      Low: { bg: 'bg-emerald-100 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20', dot: 'bg-emerald-500' },
      Medium: { bg: 'bg-yellow-100 dark:bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-500/20', dot: 'bg-yellow-500' },
      High: { bg: 'bg-orange-100 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-500/20', dot: 'bg-orange-500' },
      Critical: { bg: 'bg-rose-100 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-500/20', dot: 'bg-rose-500' },
    };
    const s = styles[level] || styles.NA;
    return (
      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border tracking-wide whitespace-nowrap flex items-center justify-center gap-1.5 mx-auto w-fit ${s.bg} ${s.text} ${s.border}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} /> {level.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto page-enter px-4 sm:px-0">

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">Students</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage student profiles, attendance and academic information.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={() => setIsAddModalOpen(true)} className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20">
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {/* STUDENT STATISTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: total, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Active Students', value: active, icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'At Risk Students', value: atRisk, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Critical Students', value: critical, icon: UserX, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        ].map((stat, i) => (
          <div key={i} className="flex items-center gap-4 p-5 bg-white dark:bg-[#0F1B2D] border border-slate-800 dark:border-[#1E334D] rounded-xl shadow-sm h-full">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">{stat.value}</p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-col xl:flex-row gap-3 p-4 bg-white dark:bg-[#0F1B2D] border border-slate-800 dark:border-[#1E334D] rounded-xl shadow-sm">
        <div className="relative flex-1 min-w-0 h-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" placeholder="Search Students..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-slate-50 dark:bg-[#07111F] border border-slate-800 dark:border-[#1E334D] rounded-lg text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3 h-auto sm:h-10">
          {/* Department */}
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="h-10 px-3 bg-slate-50 dark:bg-[#07111F] border border-slate-800 dark:border-[#1E334D] rounded-lg text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none min-w-[130px] flex-1 sm:flex-none cursor-pointer">
            <option value="">Department</option>
            {departmentsList.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="h-10 px-3 bg-slate-50 dark:bg-[#07111F] border border-slate-800 dark:border-[#1E334D] rounded-lg text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none min-w-[90px] flex-1 sm:flex-none cursor-pointer">
            <option value="">Year</option>
            <option value="I">I</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
          </select>
          <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="h-10 px-3 bg-slate-50 dark:bg-[#07111F] border border-slate-800 dark:border-[#1E334D] rounded-lg text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none min-w-[130px] flex-1 sm:flex-none cursor-pointer">
            <option value="">Risk</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-10 px-3 bg-slate-50 dark:bg-[#07111F] border border-slate-800 dark:border-[#1E334D] rounded-lg text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none min-w-[110px] flex-1 sm:flex-none cursor-pointer">
            <option value="">Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button onClick={handleReset} className="h-10 px-4 bg-slate-100 dark:bg-[#1E334D] hover:bg-slate-200 dark:hover:bg-[#284160] text-slate-600 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 min-w-[100px]">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* STUDENT DATA TABLE */}
      <div className="bg-white dark:bg-[#0F1B2D] border border-slate-800 dark:border-[#1E334D] rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
            <p className="text-sm text-slate-500">Loading student records...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#1E334D] flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">No students found</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mb-6">We couldn't find any student matching your current search and filter criteria.</p>
            <button onClick={handleReset} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white rounded-lg text-sm font-medium">Clear Filters</button>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            {/* Desktop Table View */}
            <table className="w-full text-left border-collapse hidden md:table min-w-[1100px]">
              <thead className="bg-[#F8FAFC] dark:bg-[#07111F] sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-4 border-b border-slate-800 dark:border-[#1E334D] text-center w-12"><input type="checkbox" className="rounded border-slate-300" /></th>
                  <th className="px-4 py-4 border-b border-slate-800 dark:border-[#1E334D] text-left text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-4 border-b border-slate-800 dark:border-[#1E334D] text-center text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Register No</th>
                  <th className="px-4 py-4 border-b border-slate-800 dark:border-[#1E334D] text-left text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Branch</th>
                  <th className="px-4 py-4 border-b border-slate-800 dark:border-[#1E334D] text-center text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Section</th>
                  <th className="px-4 py-4 border-b border-slate-800 dark:border-[#1E334D] text-center text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Year</th>
                  <th className="px-4 py-4 border-b border-slate-800 dark:border-[#1E334D] text-center text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Attendance</th>
                  <th className="px-4 py-4 border-b border-slate-800 dark:border-[#1E334D] text-left text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Parent</th>
                  <th className="px-4 py-4 border-b border-slate-800 dark:border-[#1E334D] text-center text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Risk</th>
                  <th className="px-4 py-4 border-b border-slate-800 dark:border-[#1E334D] text-center text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-4 border-b border-slate-800 dark:border-[#1E334D] text-center text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E334D]">
                {paginated.map(s => (
                  <tr key={s._id} className="hover:bg-[#F8FAFC] dark:hover:bg-white/[0.02] transition-colors h-[72px]">
                    <td className="px-4 text-center"><input type="checkbox" className="rounded border-slate-300" /></td>
                    <td className="px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                          {s.user?.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate max-w-[150px] lg:max-w-[200px]" title={s.user?.name}>{s.user?.name}</p>
                          <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate max-w-[150px] lg:max-w-[200px]" title={s.user?.email}>{s.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 text-center font-mono text-[13px] font-semibold text-slate-700 dark:text-slate-300">{s.registerNumber || s.roll_number || 'N/A'}</td>
                    <td className="px-4 text-left text-sm text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{s.department?.name || s.department_name || 'N/A'}</td>
                    <td className="px-4 text-center text-sm font-semibold text-indigo-600 dark:text-indigo-400">{s.section?.name || 'A'}</td>
                    <td className="px-4 text-center text-sm font-medium text-slate-700 dark:text-slate-300">{s.currentSemester?.number ? Math.ceil(s.currentSemester.number / 2) : (s.current_year || 1)}</td>
                    <td className="px-4 text-center">
                      {!s.attendanceSummary?.totalClasses ? (
                        <span className="text-[13px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-3 py-1 rounded-full border border-slate-800 dark:border-slate-700">NA</span>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span className={`text-[13px] font-bold ${s.attendanceSummary.overallPercentage >= 80 ? 'text-emerald-600' : s.attendanceSummary.overallPercentage >= 75 ? 'text-orange-500' : 'text-rose-600'}`}>
                            {s.attendanceSummary.overallPercentage}%
                          </span>
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-[#1E334D] overflow-hidden">
                            <div className={`h-full rounded-full ${s.attendanceSummary.overallPercentage >= 80 ? 'bg-emerald-500' : s.attendanceSummary.overallPercentage >= 75 ? 'bg-orange-500' : 'bg-rose-500'}`} style={{ width: `${s.attendanceSummary.overallPercentage}%` }} />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 text-left">
                      {s.parents && s.parents.length > 0 ? (
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">
                            {s.parents[0]?.user?.identifier || (s.parents[0]?.user?.email ? 'PAR' + s.parents[0].user.email.match(/\d+/) : 'N/A')}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {s.parents[0]?.user?.email || 'N/A'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-4 text-center"><Badge level={s.aiRiskLevel || 'Low'} /></td>
                    <td className="px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 mx-auto w-fit px-3 py-1 bg-slate-50 dark:bg-[#07111F] rounded-full border border-slate-800 dark:border-[#1E334D]">
                        <div className={`w-2 h-2 rounded-full ${s.isActive !== false ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                        <span className="text-[12px] font-medium text-[#0F172A] dark:text-[#F8FAFC]">{s.isActive !== false ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md transition-colors" title="Edit">
                          <Edit2 className="w-[18px] h-[18px]" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(s._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors" title="Delete">
                          <Trash2 className="w-[18px] h-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-[#E2E8F0] dark:divide-[#1E334D]">
              {paginated.map(s => (
                <div key={s._id} className="p-4 space-y-4 bg-white dark:bg-[#0F1B2D]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center flex-shrink-0 text-base">
                        {s.user?.name?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-tight">{s.user?.name}</p>
                        <p className="text-[13px] font-mono font-medium text-slate-500 mt-0.5">{s.registerNumber}</p>
                      </div>
                    </div>
                    <Badge level={s.aiRiskLevel || 'Low'} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[13px] bg-[#F8FAFC] dark:bg-[#07111F] p-3.5 rounded-lg border border-slate-800 dark:border-[#1E334D]">
                    <div className="flex flex-col"><span className="text-slate-500 text-[11px] uppercase tracking-wider mb-0.5">Branch</span> <span className="font-semibold text-[#0F172A] dark:text-white truncate">{s.department?.name || s.department_name || 'N/A'}</span></div>
                    <div className="flex flex-col"><span className="text-slate-500 text-[11px] uppercase tracking-wider mb-0.5">Section</span> <span className="font-semibold text-indigo-600 dark:text-indigo-400">{s.section?.name || 'A'}</span></div>
                    <div className="flex flex-col"><span className="text-slate-500 text-[11px] uppercase tracking-wider mb-0.5">Year</span> <span className="font-semibold text-[#0F172A] dark:text-white">{s.currentSemester?.number ? Math.ceil(s.currentSemester.number / 2) : (s.current_year || 1)}</span></div>
                    <div className="flex flex-col"><span className="text-slate-500 text-[11px] uppercase tracking-wider mb-0.5">Attendance</span> <span className={`font-bold ${s.attendanceSummary?.overallPercentage >= 80 ? 'text-emerald-600' : s.attendanceSummary?.overallPercentage >= 75 ? 'text-orange-500' : 'text-rose-600'}`}>{Math.round(s.attendanceSummary?.overallPercentage || 0)}%</span></div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-[11px] uppercase tracking-wider mb-0.5">Status</span>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${s.isActive !== false ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                        <span className="font-semibold text-[#0F172A] dark:text-white">
                          {s.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button className="flex-1 py-2 bg-slate-50 dark:bg-[#1E334D] border border-slate-800 dark:border-transparent text-slate-700 dark:text-slate-200 text-[13px] font-semibold rounded-lg hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors"><MoreVertical className="w-[14px] h-[14px]" /> View</button>
                    <button className="flex-1 py-2 bg-slate-50 dark:bg-[#1E334D] border border-slate-800 dark:border-transparent text-slate-700 dark:text-slate-200 text-[13px] font-semibold rounded-lg hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors"><Edit2 className="w-[14px] h-[14px]" /> Edit</button>
                    <button
                      onClick={() => handleDeleteStudent(s._id)}
                      className="flex-1 py-2 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-[13px] font-semibold rounded-lg hover:bg-rose-100 flex items-center justify-center gap-1.5 transition-colors"><Trash2 className="w-[14px] h-[14px]" /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {!loading && paginated.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 pb-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium text-[#0F172A] dark:text-white">{(page - 1) * itemsPerPage + 1}</span> – <span className="font-medium text-[#0F172A] dark:text-white">{Math.min(page * itemsPerPage, totalCount)}</span> of <span className="font-medium text-[#0F172A] dark:text-white">{totalCount}</span> students
          </p>

          <div className="flex items-center gap-1 bg-white dark:bg-[#0F1B2D] border border-slate-800 dark:border-[#1E334D] rounded-lg p-1 shadow-sm">
            <button
              disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-[13px] font-medium rounded-md text-slate-500 hover:text-[#0F172A] hover:bg-slate-100 dark:hover:bg-[#1E334D] dark:hover:text-white disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p = i + 1;
              if (totalPages > 5 && page > 3) p = page - 2 + i;
              if (p > totalPages) return null;

              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-[32px] h-8 flex items-center justify-center text-[13px] font-semibold rounded-md transition-colors px-2 ${page === p ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E334D]'}`}
                >
                  {p}
                </button>
              );
            })}
            <button
              disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-[13px] font-medium rounded-md text-slate-500 hover:text-[#0F172A] hover:bg-slate-100 dark:hover:bg-[#1E334D] dark:hover:text-white disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#0F1B2D] border-slate-800 dark:border-[#1E334D]">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddStudent} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="studentName">Student Name</Label>
              <Input id="studentName" placeholder="John Doe" value={newStudent.studentName} onChange={(e) => setNewStudent({ ...newStudent, studentName: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rollNo">Register No</Label>
              <Input id="rollNo" placeholder="e.g. 7376202TT160" value={newStudent.rollNo} onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <select
                id="branch"
                value={newStudent.branch}
                onChange={(e) => setNewStudent({ ...newStudent, branch: e.target.value })}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Branch</option>
                <option value="BTECH">BTECH</option>
                <option value="BE">BE</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <select
                id="department"
                value={newStudent.department}
                onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Department</option>
                {departmentsList.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <select
                id="section"
                value={newStudent.section}
                onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentId">Parent ID (Optional)</Label>
              <Input id="parentId" placeholder="e.g. PAR7676" value={newStudent.parentId} onChange={(e) => setNewStudent({ ...newStudent, parentId: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentEmail">Parent Email (Optional)</Label>
              <Input id="parentEmail" type="email" placeholder="e.g. parent@example.com" value={newStudent.parentEmail} onChange={(e) => setNewStudent({ ...newStudent, parentEmail: e.target.value })} />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Student'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
