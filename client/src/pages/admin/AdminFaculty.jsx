import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Search, Filter, Plus, MoreVertical, Edit2, Trash2, 
  Download, RotateCcw, Building2, UserCheck, UserMinus, Loader2 
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

// Mocks removed: we now fetch fully populated faculty data directly from the API.

export default function AdminFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    facultyName: '',
    email: '',
    department: '',
    designation: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [stats, setStats] = useState({ total: 0, active: 0, departments: 0, onLeave: 0 });
  const [departmentsList, setDepartmentsList] = useState([]);

  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchFaculty();
  }, [search, filterDept, filterDesignation, filterStatus, page]);

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

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterDept) params.append('department', filterDept);
      if (filterDesignation) params.append('designation', filterDesignation);
      if (filterStatus) params.append('status', filterStatus);
      params.append('page', page);
      params.append('limit', itemsPerPage);

      const res = await api.get(`/admin/faculty?${params.toString()}`);
      const facultyData = res.data.data || [];
      setFaculty(facultyData);
      setTotalCount(res.data.total || 0);

      if (res.data.stats) {
        setStats(res.data.stats);
      } else {
        setStats({
          total: facultyData.length,
          active: facultyData.filter(f => f.isActive).length,
          departments: new Set(facultyData.map(f => f.department?.name)).size,
          onLeave: facultyData.filter(f => f.leaveStatus === 'On Leave' || !f.isActive).length
        });
      }
    } catch (err) {
      toast.error('Failed to load faculty');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member? This action cannot be undone and will remove associated authentication records.')) return;
    try {
      await api.delete(`/admin/faculty/${id}`);
      toast.success('Faculty deleted successfully');
      fetchFaculty();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete faculty');
    }
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (!newFaculty.facultyName || !newFaculty.email || !newFaculty.department || !newFaculty.designation) {
        return toast.error('All required fields must be filled');
      }
      
      const payload = {
        name: newFaculty.facultyName,
        email: newFaculty.email,
        password: 'password123',
        role: newFaculty.designation === 'Professor' || newFaculty.designation === 'Associate Professor' ? 'hod' : 'faculty',
        department: newFaculty.department,
        designation: newFaculty.designation,
        phone: newFaculty.phone
      };

      await api.post('/admin/users', payload);
      toast.success('Faculty added successfully');
      setIsAddModalOpen(false);
      setNewFaculty({ facultyName: '', email: '', department: '', designation: '', phone: '' });
      fetchFaculty();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add faculty');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Derived Statistics
  const total = stats.total;
  const active = stats.active;
  const departments = stats.departments;
  const onLeave = stats.onLeave;

  // Pagination (Server-side)
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const paginated = faculty;

  const handleReset = () => {
    setSearch(''); setFilterDept(''); setFilterDesignation(''); 
    setFilterStatus('');
    setPage(1);
  };

  const Badge = ({ status }) => {
    const styles = {
      Active: 'bg-[var(--safe-bg)] text-[var(--safe)] border-[var(--safe)]/20',
      'On Leave': 'bg-[var(--warn-bg)] text-[var(--warn)] border-[var(--warn)]/20',
      Inactive: 'bg-[var(--paper)] text-[var(--ink-soft)] border-[var(--rule)]',
    };
    return (
      <span className={`px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-full border tracking-wider whitespace-nowrap flex items-center justify-center gap-1.5 mx-auto w-fit uppercase ${styles[status] || styles.Active}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-[var(--safe)]' : status === 'On Leave' ? 'bg-[var(--warn)]' : 'bg-[var(--ink-soft)]'}`} />
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto page-enter px-4 sm:px-0">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-[var(--navy)] tracking-tight">Faculty Ledger</h1>
          </div>
          <p className="text-xs font-mono text-[var(--ink-soft)] mt-1">Institutional academic staff directory, departments, and instructional assignments.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={() => setIsAddModalOpen(true)} className="btn-navy flex-1 sm:flex-none px-4 py-2 text-white text-xs font-mono uppercase tracking-wider rounded-[7px] flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add Faculty
          </button>
        </div>
      </div>

      {/* FACULTY STATISTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Faculty', value: total, icon: Users, color: 'text-[var(--navy)]', bg: 'bg-[var(--paper)]', valColor: 'text-[var(--navy)]' },
          { label: 'Active Faculty', value: active, icon: UserCheck, color: 'text-[var(--safe)]', bg: 'bg-[var(--safe-bg)]', valColor: 'text-[var(--safe)]' },
          { label: 'Academic Depts', value: departments, icon: Building2, color: 'text-[var(--navy)]', bg: 'bg-[var(--paper)]', valColor: 'text-[var(--navy)]' },
          { label: 'Approved Leave', value: onLeave, icon: UserMinus, color: 'text-[var(--warn)]', bg: 'bg-[var(--warn-bg)]', valColor: 'text-[var(--warn)]' },
        ].map((stat, i) => (
          <div key={i} className="flex items-center gap-4 p-5 bg-[var(--paper-raised)] border border-[var(--rule)] rounded-[10px] shadow-none h-full">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className={`text-3xl font-mono font-bold tracking-tight ${stat.valColor}`}>{stat.value}</p>
              <p className="text-xs font-mono text-[var(--ink-soft)] uppercase tracking-wider mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-col xl:flex-row gap-3 p-4 bg-[var(--paper-raised)] border border-[var(--rule)] rounded-[10px] shadow-none">
        <div className="relative flex-1 min-w-0 h-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-soft)]" />
          <input 
            type="text" placeholder="Search Faculty by name or employee ID..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-[var(--paper)] border border-[var(--rule)] rounded-[7px] text-xs font-mono text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus:outline-none focus:border-[var(--navy)] transition-all"
          />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3 h-auto sm:h-10">
          {/* Department */}
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="h-10 px-3 bg-[var(--paper)] border border-[var(--rule)] rounded-[7px] text-xs font-mono text-[var(--ink)] focus:outline-none min-w-[130px] flex-1 sm:flex-none cursor-pointer">
            <option value="">Department</option>
            {departmentsList.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
          <select value={filterDesignation} onChange={e => setFilterDesignation(e.target.value)} className="h-10 px-3 bg-[var(--paper)] border border-[var(--rule)] rounded-[7px] text-xs font-mono text-[var(--ink)] focus:outline-none min-w-[130px] flex-1 sm:flex-none cursor-pointer">
            <option value="">Designation</option>
            <option value="Professor">Professor</option>
            <option value="Associate Professor">Associate Professor</option>
            <option value="Assistant Professor">Assistant Professor</option>
            <option value="Lecturer">Lecturer</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-10 px-3 bg-[var(--paper)] border border-[var(--rule)] rounded-[7px] text-xs font-mono text-[var(--ink)] focus:outline-none min-w-[110px] flex-1 sm:flex-none cursor-pointer">
            <option value="">Roster Status</option>
            <option value="active">Active</option>
            <option value="on leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <button onClick={handleReset} className="h-10 px-4 btn-navy-outline text-xs font-mono uppercase tracking-wider rounded-[7px] transition-colors flex items-center justify-center gap-2 min-w-[100px]">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* FACULTY DATA TABLE */}
      <div className="bg-[var(--paper-raised)] border border-[var(--rule)] rounded-[10px] shadow-none overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
            <p className="text-sm text-slate-500">Loading faculty records...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#1E334D] flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">No faculty found</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mb-6">We couldn't find any faculty matching your current search and filter criteria.</p>
            <button onClick={handleReset} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white rounded-lg text-sm font-medium">Clear Filters</button>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            {/* Desktop Table View */}
            <table className="w-full text-left border-collapse hidden md:table min-w-[1100px]">
              <thead className="bg-[var(--paper)] border-b border-[var(--rule)] sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3.5 border-b border-[var(--rule)] text-center w-12"><input type="checkbox" className="rounded border-[var(--rule)]" /></th>
                  <th className="px-4 py-3.5 border-b border-[var(--rule)] text-left text-[11px] font-mono font-semibold text-[var(--ink-soft)] uppercase tracking-wider">Faculty</th>
                  <th className="px-4 py-3.5 border-b border-[var(--rule)] text-center text-[11px] font-mono font-semibold text-[var(--ink-soft)] uppercase tracking-wider">Employee ID</th>
                  <th className="px-4 py-3.5 border-b border-[var(--rule)] text-left text-[11px] font-mono font-semibold text-[var(--ink-soft)] uppercase tracking-wider">Department</th>
                  <th className="px-4 py-3.5 border-b border-[var(--rule)] text-left text-[11px] font-mono font-semibold text-[var(--ink-soft)] uppercase tracking-wider">Designation</th>
                  <th className="px-4 py-3.5 border-b border-[var(--rule)] text-center text-[11px] font-mono font-semibold text-[var(--ink-soft)] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3.5 border-b border-[var(--rule)] text-center text-[11px] font-mono font-semibold text-[var(--ink-soft)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--rule)]/60">
                {paginated.map(f => (
                  <tr key={f._id} className="hover:bg-[var(--paper)] transition-colors h-[70px]">
                    <td className="px-4 text-center"><input type="checkbox" className="rounded border-[var(--rule)]" /></td>
                    <td className="px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--navy)] text-white font-mono font-bold flex items-center justify-center flex-shrink-0 text-xs">
                          {f.user?.name?.charAt(0).toUpperCase() || 'F'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--ink)] truncate max-w-[180px]" title={f.user?.name}>{f.user?.name}</p>
                          <p className="text-[11px] font-mono text-[var(--ink-soft)] truncate max-w-[180px]" title={f.user?.email}>{f.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 text-center font-mono text-[13px] font-bold text-[var(--navy)]">{f.employeeId}</td>
                    <td className="px-4 text-left text-xs font-mono text-[var(--ink-soft)] truncate max-w-[180px]">{f.department?.name || 'N/A'}</td>
                    <td className="px-4 text-left text-xs font-mono text-[var(--ink)] truncate max-w-[160px]">{f.designation}</td>
                    <td className="px-4 text-center"><Badge status={f.isActive ? 'Active' : 'Inactive'} /></td>
                    <td className="px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 text-[var(--ink-soft)] hover:text-[var(--navy)] hover:bg-[var(--paper)] rounded transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteFaculty(f._id)}
                          className="p-1.5 text-[var(--ink-soft)] hover:text-[var(--crit)] hover:bg-[var(--crit-bg)] rounded transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-[#E2E8F0] dark:divide-[#1E334D]">
              {paginated.map(f => (
                <div key={f._id} className="p-4 space-y-4 bg-white dark:bg-[#0F1B2D]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-base">
                        {f.user?.name?.charAt(0).toUpperCase() || 'F'}
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-tight">{f.user?.name}</p>
                        <p className="text-[13px] font-mono font-medium text-slate-500 mt-0.5">{f.employeeId}</p>
                      </div>
                    </div>
                    <Badge status={f.isActive ? 'Active' : 'Inactive'} />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px] bg-[#F8FAFC] dark:bg-[#07111F] p-3.5 rounded-lg border border-slate-800 dark:border-[#1E334D]">
                    <div className="flex flex-col"><span className="text-slate-500 text-[11px] uppercase tracking-wider mb-0.5">Department</span> <span className="font-semibold text-[#0F172A] dark:text-white truncate">{f.department?.name || 'N/A'}</span></div>
                    <div className="flex flex-col"><span className="text-slate-500 text-[11px] uppercase tracking-wider mb-0.5">Designation</span> <span className="font-semibold text-[#0F172A] dark:text-white">{f.designation}</span></div>
                  </div>
                  
                  <div className="flex gap-2 pt-1">
                    <button className="flex-1 py-2 bg-slate-50 dark:bg-[#1E334D] border border-slate-800 dark:border-transparent text-slate-700 dark:text-slate-200 text-[13px] font-semibold rounded-lg hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors"><MoreVertical className="w-[14px] h-[14px]"/> View</button>
                    <button className="flex-1 py-2 bg-slate-50 dark:bg-[#1E334D] border border-slate-800 dark:border-transparent text-slate-700 dark:text-slate-200 text-[13px] font-semibold rounded-lg hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors"><Edit2 className="w-[14px] h-[14px]"/> Edit</button>
                    <button 
                      onClick={() => handleDeleteFaculty(f._id)}
                      className="flex-1 py-2 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-[13px] font-semibold rounded-lg hover:bg-rose-100 flex items-center justify-center gap-1.5 transition-colors"><Trash2 className="w-[14px] h-[14px]"/> Delete</button>
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
            Showing <span className="font-medium text-[#0F172A] dark:text-white">{(page - 1) * itemsPerPage + 1}</span> – <span className="font-medium text-[#0F172A] dark:text-white">{Math.min(page * itemsPerPage, totalCount)}</span> of <span className="font-medium text-[#0F172A] dark:text-white">{totalCount}</span> faculty
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
      {/* Add Faculty Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#0F1B2D] border-slate-800 dark:border-[#1E334D]">
          <DialogHeader>
            <DialogTitle>Add New Faculty</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddFaculty} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="facultyName">Faculty Name</Label>
              <Input id="facultyName" placeholder="e.g. Dr. Jane Smith" value={newFaculty.facultyName} onChange={(e) => setNewFaculty({...newFaculty, facultyName: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="e.g. janesmith@smarterp.edu" value={newFaculty.email} onChange={(e) => setNewFaculty({...newFaculty, email: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <select 
                id="department" 
                value={newFaculty.department} 
                onChange={(e) => setNewFaculty({...newFaculty, department: e.target.value})}
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
              <Label htmlFor="designation">Designation</Label>
              <select 
                id="designation" 
                value={newFaculty.designation} 
                onChange={(e) => setNewFaculty({...newFaculty, designation: e.target.value})}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Designation</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input id="phone" placeholder="e.g. 9876543210" value={newFaculty.phone} onChange={(e) => setNewFaculty({...newFaculty, phone: e.target.value})} />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Faculty'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
