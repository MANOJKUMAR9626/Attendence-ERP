import { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Trash2, Search, Users, GraduationCap, 
  Building2, Loader2, RefreshCw, AlertCircle, CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function FacultyAllocations() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Form state
  const [form, setForm] = useState({
    faculty: '',
    subject: '',
    section: '',
    department: '',
  });

  // Options
  const [facultyList, setFacultyList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [academicYearList, setAcademicYearList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);

  useEffect(() => {
    fetchAllocations();
    fetchDropdowns();
  }, []);

  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/allocations');
      setAllocations(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load allocations');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [facRes, subRes, secRes, semRes, ayRes, deptRes] = await Promise.all([
        api.get('/admin/faculty'),
        api.get('/admin/subjects').catch(() => ({ data: { data: [] } })),
        api.get('/admin/sections').catch(() => ({ data: { data: [] } })),
        api.get('/admin/semesters'),
        api.get('/admin/academic-years'),
        api.get('/admin/departments'),
      ]);
      setFacultyList(facRes.data.data || []);
      setSubjectList(subRes.data.data || []);
      setSectionList(secRes.data.data || []);
      setSemesterList(semRes.data.data || []);
      setAcademicYearList(ayRes.data.data || []);
      setDepartmentList(deptRes.data.data || []);
    } catch (err) {
      console.error('Failed to load dropdown options:', err);
    }
  };

  // Show all sections/subjects since semester is removed
  const filteredSections = sectionList;
  const filteredSubjects = subjectList;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.faculty || !form.subject || !form.section || !form.department) {
      toast.error('Please fill all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/admin/allocations', form);
      toast.success('Subject allocated to faculty successfully!');
      setIsModalOpen(false);
      setForm({ faculty: '', subject: '', section: '', department: '' });
      fetchAllocations();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create allocation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this allocation?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/allocations/${id}`);
      toast.success('Allocation removed');
      setAllocations(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      toast.error('Failed to remove allocation');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = allocations.filter(a => {
    const q = search.toLowerCase();
    return (
      a.faculty?.user?.name?.toLowerCase().includes(q) ||
      a.subject?.name?.toLowerCase().includes(q) ||
      a.section?.name?.toLowerCase().includes(q) ||
      a.semester?.name?.toLowerCase().includes(q) ||
      a.department?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#07111F] p-6 rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            Faculty Allocations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
            Assign subjects and sections to faculty members. These appear in the faculty's "My Classes" page.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllocations}
            className="p-2.5 rounded-xl border border-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-500"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Allocation
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Allocations', value: allocations.length, icon: BookOpen, color: 'indigo' },
          { label: 'Faculty Assigned', value: new Set(allocations.map(a => a.faculty?._id)).size, icon: Users, color: 'emerald' },
          { label: 'Subjects Covered', value: new Set(allocations.map(a => a.subject?._id)).size, icon: GraduationCap, color: 'blue' },
          { label: 'Sections', value: new Set(allocations.map(a => a.section?._id)).size, icon: Building2, color: 'purple' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-[#07111F] p-4 rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-${color}-50 dark:bg-${color}-500/10 flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Search & Table */}
      <div className="bg-white dark:bg-[#07111F] rounded-2xl border border-slate-800 dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-slate-800 dark:border-slate-800 flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search faculty, subject, section..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-800 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-300"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm text-slate-400">Loading allocations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                {search ? 'No matching allocations' : 'No allocations yet'}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                {search ? 'Try a different search term.' : 'Click "Add Allocation" to assign subjects to faculty.'}
              </p>
            </div>
            {!search && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" /> Add First Allocation
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50">
                  <th className="w-[18%] px-4 py-4 border-b border-slate-800 dark:border-[#1E334D] text-left text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Faculty</th>
                  <th className="w-[24%] px-4 py-4 border-b border-slate-800 dark:border-[#1E334D] text-left text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject</th>
                  <th className="w-[12%] px-4 py-4 border-b border-slate-800 dark:border-[#1E334D] text-left text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Section</th>

                  <th className="w-[16%] px-4 py-4 border-b border-slate-800 dark:border-[#1E334D] text-left text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</th>
                  <th className="w-[10%] px-4 py-4 border-b border-slate-800 dark:border-[#1E334D] text-left text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="w-[8%] px-4 py-4 border-b border-slate-800 dark:border-[#1E334D] text-right text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((alloc) => (
                  <tr key={alloc._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-sm font-bold text-indigo-700 dark:text-indigo-400 flex-shrink-0">
                          {alloc.faculty?.user?.name?.charAt(0) || 'F'}
                        </div>
                        <div className="min-w-0 pr-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate max-w-[150px] lg:max-w-[200px]">
                            {alloc.faculty?.user?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px] lg:max-w-[200px]">
                            {alloc.faculty?.user?.email || ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-semibold">
                        {alloc.subject?.name || '—'}
                      </span>
                      {alloc.subject?.code && (
                        <span className="ml-2 text-xs text-slate-500">({alloc.subject.code})</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-[#1E334D] text-slate-700 dark:text-slate-300 font-semibold text-[13px]">
                        Section {alloc.section?.name || '—'}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300 text-sm">
                      {alloc.department?.name || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> Active
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(alloc._id)}
                        disabled={deletingId === alloc._id}
                        className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-50"
                        title="Remove allocation"
                      >
                        {deletingId === alloc._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Allocation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-[#0F1B2D] border-slate-800 dark:border-[#1E334D]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Assign Subject to Faculty
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Faculty */}
            <div>
              <Label className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5 block">
                Faculty Member <span className="text-rose-500">*</span>
              </Label>
              <select
                value={form.faculty}
                onChange={e => setForm(f => ({ ...f, faculty: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-800 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              >
                <option value="">Select faculty...</option>
                {facultyList.map(f => (
                  <option key={f._id} value={f._id}>
                    {f.user?.name || 'Unknown'} — {f.department?.name || ''}
                  </option>
                ))}
              </select>
            </div>





            {/* Department */}
            <div>
              <Label className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5 block">
                Department <span className="text-rose-500">*</span>
              </Label>
              <select
                value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-800 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              >
                <option value="">Select department...</option>
                {departmentList.map(d => (
                  <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <Label className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5 block">
                Subject <span className="text-rose-500">*</span>
              </Label>
              <select
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-800 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              >
                <option value="">Select subject...</option>
                {filteredSubjects.length === 0
                  ? <option disabled>No subjects found for this semester</option>
                  : filteredSubjects.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                  ))}
              </select>
              {subjectList.length === 0 && (
                <p className="text-xs text-amber-500 mt-1">⚠ No subjects exist yet. Add subjects via the Subjects management page.</p>
              )}
            </div>

            {/* Section */}
            <div>
              <Label className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5 block">
                Section <span className="text-rose-500">*</span>
              </Label>
              <select
                value={form.section}
                onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-800 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              >
                <option value="">Select section...</option>
                {filteredSections.length === 0
                  ? <option disabled>No sections found for this semester</option>
                  : filteredSections.map(s => (
                    <option key={s._id} value={s._id}>Section {s.name}</option>
                  ))}
              </select>
              {sectionList.length === 0 && (
                <p className="text-xs text-amber-500 mt-1">⚠ No sections exist yet. Create sections via Sections management.</p>
              )}
            </div>
          </form>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : (
                <><Plus className="w-4 h-4 mr-2" />Assign Subject</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
