import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Filter, Plus, MoreVertical, Edit2, Trash2, 
  ShieldAlert, CheckCircle2, XCircle, Mail, Key, Shield, UserCircle, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', department: '', identifier: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const openEdit = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role, department: '', identifier: user.identifier || '' });
    setOpenModal(true);
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/departments');
      setDepartments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load departments');
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingUser) {
        await api.put(`/admin/users/${editingUser._id}`, formData);
        toast.success('User updated successfully');
      } else {
        await api.post('/admin/users', formData);
        toast.success('User created successfully');
      }
      setOpenModal(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'student', department: '', identifier: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone and will remove associated student/faculty records.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleStyle = (role) => {
    const styles = {
      admin: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      hod: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      faculty: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      student: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      class_advisor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      parent: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    };
    return styles[role] || styles.parent;
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-[Poppins] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" /> User Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">View, create and manage system access</p>
        </div>
        
        <button 
          onClick={() => setOpenModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-[#0F172A] dark:text-[#F8FAFC] text-sm font-medium rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0F1B2D] border border-slate-800 dark:border-[#1E334D] rounded-xl text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm shadow-sm"
          />
        </div>
        <button className="px-4 py-2 bg-white dark:bg-[#0F1B2D] border border-slate-800 dark:border-[#1E334D] hover:bg-slate-100 dark:hover:bg-[#1E334D] text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-sm shadow-sm">
          <Filter className="w-4 h-4" /> Filter Role
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-[#0F1B2D] border border-slate-800 dark:border-[#1E334D] rounded-2xl shadow-xl shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <span className="text-slate-400 text-sm font-medium">Loading users...</span>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white dark:bg-[#0F1B2D] z-10">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 dark:border-[#1E334D]">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 dark:border-[#1E334D]">ID / Register No</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 dark:border-[#1E334D]">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 dark:border-[#1E334D]">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 dark:border-[#1E334D]">Joined</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 dark:border-[#1E334D] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length > 0 ? filteredUsers.map((user, i) => (
                  <motion.tr 
                    key={user._id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-slate-800 dark:border-[#1E334D] flex items-center justify-center text-blue-400 font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-blue-400 transition-colors">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {user.identifier || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border uppercase tracking-wider ${getRoleStyle(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isActive !== false ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" /> Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                          <XCircle className="w-4 h-4" /> Disabled
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        <button 
                          onClick={() => openEdit(user)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-[#0F172A] dark:text-[#F8FAFC] hover:bg-white/10 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <ShieldAlert className="w-8 h-8 mb-3 opacity-50" />
                        <p className="text-sm font-medium">No users found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modern Modal */}
      <AnimatePresence>
        {openModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-50 dark:bg-[#07111F]/80 backdrop-blur-sm z-50"
              onClick={() => setOpenModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-[#0F1B2D] border border-slate-800 dark:border-[#1E334D] rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-800 dark:border-[#1E334D] flex items-center gap-3 bg-white/[0.02]">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Shield className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-[Poppins] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Create System User</h2>
              </div>
              
              <form onSubmit={handleSaveUser} className="p-6 space-y-5">
                <div className="space-y-2 group">
                  <label className="text-sm font-medium text-slate-400 group-focus-within:text-blue-400 transition-colors flex items-center gap-2">
                    <UserCircle className="w-4 h-4" /> Full Name
                  </label>
                  <input 
                    type="text" required
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#07111F] border border-slate-800 dark:border-[#1E334D] rounded-xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="space-y-2 group">
                  <label className="text-sm font-medium text-slate-400 group-focus-within:text-blue-400 transition-colors flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email Address
                  </label>
                  <input 
                    type="email" required
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#07111F] border border-slate-800 dark:border-[#1E334D] rounded-xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    placeholder="john@smarterp.edu"
                  />
                </div>

                <div className="space-y-2 group">
                  <label className="text-sm font-medium text-slate-400 group-focus-within:text-blue-400 transition-colors flex items-center gap-2">
                    <UserCircle className="w-4 h-4" /> Register No / Employee ID (Optional)
                  </label>
                  <input 
                    type="text"
                    value={formData.identifier} onChange={e => setFormData({...formData, identifier: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#07111F] border border-slate-800 dark:border-[#1E334D] rounded-xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    placeholder="e.g. 7376202AL160"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 group">
                    <label className="text-sm font-medium text-slate-400 group-focus-within:text-blue-400 transition-colors flex items-center gap-2">
                      <Key className="w-4 h-4" /> Password
                    </label>
                    <input 
                      type="password" required minLength={8}
                      value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#07111F] border border-slate-800 dark:border-[#1E334D] rounded-xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-sm font-medium text-slate-400 group-focus-within:text-blue-400 transition-colors flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Role
                    </label>
                    <select 
                      value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#07111F] border border-slate-800 dark:border-[#1E334D] rounded-xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="class_advisor">Class Advisor</option>
                      <option value="hod">HOD</option>
                      <option value="admin">Admin</option>
                      <option value="parent">Parent</option>
                    </select>
                  </div>
                </div>

                {['student', 'faculty', 'class_advisor', 'hod'].includes(formData.role) && (
                  <div className="space-y-2 group">
                    <label className="text-sm font-medium text-slate-400 group-focus-within:text-blue-400 transition-colors flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Branch / Department
                    </label>
                    <select 
                      required
                      value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#07111F] border border-slate-800 dark:border-[#1E334D] rounded-xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Branch...</option>
                      {departments.map(dept => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800 dark:border-[#1E334D] mt-6">
                  <button 
                    type="button" 
                    onClick={() => setOpenModal(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-[#0F172A] dark:text-[#F8FAFC] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-[#0F172A] dark:text-[#F8FAFC] text-sm font-medium rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
};

export default ManageUsers;
