import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Plus, Search, MoreVertical, Edit2, Trash2, 
  ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import api from '@/utils/api';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Form State
  const [currentDept, setCurrentDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '', establishedYear: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/departments');
      setDepartments(res.data.data);
    } catch (err) {
      console.error('Failed to fetch departments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      await api.post('/admin/departments', formData);
      setIsAddOpen(false);
      setFormData({ name: '', code: '', description: '', establishedYear: '' });
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add department');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      await api.put(`/admin/departments/${currentDept._id}`, formData);
      setIsEditOpen(false);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update department');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await api.delete(`/admin/departments/${currentDept._id}`);
      setIsDeleteOpen(false);
      fetchDepartments();
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const openEdit = (dept) => {
    setCurrentDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      establishedYear: dept.establishedYear || ''
    });
    setIsEditOpen(true);
  };

  const openDelete = (dept) => {
    setCurrentDept(dept);
    setIsDeleteOpen(true);
  };

  const filteredData = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-500" />
            Departments
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage academic departments and branches.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Department
        </Button>
      </div>

      <Card className="border-slate-800 dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-slate-800 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search departments..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white dark:bg-slate-950 border-slate-800 dark:border-slate-800 h-9"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full erp-table">
            <thead>
              <tr>
                <th className="text-left w-16">Code</th>
                <th className="text-left">Department Name</th>
                <th className="text-left">Est. Year</th>
                <th className="text-left">HOD</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-10 skeleton w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 className="w-12 h-12 text-slate-300 mb-3" />
                      <p>No departments found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((dept, index) => (
                  <motion.tr 
                    key={dept._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                        {dept.code}
                      </span>
                    </td>
                    <td className="font-medium text-slate-900 dark:text-slate-100">{dept.name}</td>
                    <td>{dept.establishedYear || '-'}</td>
                    <td>
                      {dept.hod ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium">
                            {dept.hod.name.charAt(0)}
                          </div>
                          <span>{dept.hod.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Not assigned</span>
                      )}
                    </td>
                    <td className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(dept)}><Edit2 className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openDelete(dept)} className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-500/10">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleAdd}>
            <DialogHeader>
              <DialogTitle>Add Department</DialogTitle>
              <DialogDescription>Create a new academic department.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {error && <div className="text-sm text-rose-500 flex items-center gap-2 bg-rose-50 p-2 rounded"><AlertCircle className="w-4 h-4" />{error}</div>}
              <div className="grid gap-2">
                <Label htmlFor="name">Department Name</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Computer Science" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">Department Code</Label>
                <Input id="code" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required placeholder="e.g. CSE" className="uppercase" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="year">Established Year</Label>
                <Input id="year" type="number" value={formData.establishedYear} onChange={e => setFormData({...formData, establishedYear: e.target.value})} placeholder="e.g. 2005" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={formLoading} className="bg-indigo-600 hover:bg-indigo-700">Save Department</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {error && <div className="text-sm text-rose-500">{error}</div>}
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Department Name</Label>
                <Input id="edit-name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-code">Department Code</Label>
                <Input id="edit-code" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={formLoading} className="bg-indigo-600">Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2"><Trash2 className="w-5 h-5" /> Delete Department</DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete <strong>{currentDept?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={formLoading}>Yes, delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ManageDepartments;
