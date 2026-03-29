import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/Button';
import { 
  Users, Loader2, UserPlus, ShieldCheck, 
  TrendingUp, Building2, ShieldAlert,
  Archive, FileCode, CheckCircle2,
  MoreVertical, ChevronLeft, ChevronRight, X, Trash2, Edit2
} from 'lucide-react';

// Modal Component for Create User
const CreateUserModal = ({ 
  isOpen, 
  onClose, 
  formData, 
  handleChange, 
  handleSubmit, 
  creating, 
  message 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <div className="w-10 h-10 rounded-full bg-[#003345]/10 flex items-center justify-center text-[#003345]">
            <UserPlus className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-headline font-bold text-[#003345]">Create New User</h2>
        </div>
        
        {message.text && (
          <div className={`p-4 mb-6 rounded-xl text-sm font-semibold ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-[#003345]">Full Name</label>
            <input name="name" value={formData.name} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#003345] outline-none" placeholder="Jane Doe" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-[#003345]">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#003345] outline-none" placeholder="jane@company.com" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-[#003345]">Initial Password</label>
            <input type="text" name="password" value={formData.password} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#003345] outline-none" placeholder="Provide to user directly" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-[#003345]">System Role</label>
            <select name="role" value={formData.role} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#003345] outline-none bg-white font-semibold">
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="FINANCE">Finance Officer</option>
              <option value="DIRECTOR">Director</option>
              <option value="ADMIN">System Admin</option>
            </select>
          </div>
          <div className="md:col-span-2 mt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="px-6 py-3 border-gray-200">
               Cancel
            </Button>
            <Button type="submit" disabled={creating} className="px-8 py-3 bg-[#003345] text-white hover:bg-[#004b63]">
               {creating ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : 'Provision User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Change Role Modal
const ChangeRoleModal = ({ isOpen, onClose, targetUser, onConfirm, loading }) => {
  const [newRole, setNewRole] = useState(targetUser?.role || 'EMPLOYEE');
  
  useEffect(() => {
    if (targetUser) setNewRole(targetUser.role);
  }, [targetUser]);

  if (!isOpen || !targetUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700">
            <Edit2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[#003345]">Change Role</h2>
        </div>
        <p className="text-sm text-[#40484c]/70 mb-4 font-medium">
          Changing role for <span className="font-bold text-[#003345]">{targetUser.name}</span>
        </p>
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#003345] outline-none bg-white font-semibold mb-6"
        >
          <option value="EMPLOYEE">Employee</option>
          <option value="MANAGER">Manager</option>
          <option value="FINANCE">Finance Officer</option>
          <option value="DIRECTOR">Director</option>
          <option value="ADMIN">System Admin</option>
        </select>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 py-3 border-gray-200">Cancel</Button>
          <Button type="button" onClick={() => onConfirm(newRole)} disabled={loading} className="flex-1 py-3 bg-[#003345] text-white hover:bg-[#004b63]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Update Role'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Confirm Delete Modal
const ConfirmDeleteModal = ({ isOpen, onClose, targetUser, onConfirm, loading }) => {
  if (!isOpen || !targetUser) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <Trash2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[#003345]">Remove User</h2>
        </div>
        <p className="text-sm text-[#40484c]/70 mb-6 font-medium">
          Are you sure you want to remove <span className="font-bold text-red-600">{targetUser.name}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 py-3 border-gray-200">Cancel</Button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Remove User'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Department mapping
const getDepartment = (role) => {
  const map = {
    FINANCE: 'Finance',
    ADMIN: 'Administration',
    MANAGER: 'Management',
    DIRECTOR: 'Executive',
    EMPLOYEE: 'Operations',
  };
  return map[role] || 'General';
};

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [creating, setCreating] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

  // View filter: 'all' | 'department'
  const [viewMode, setViewMode] = useState('all');

  // Action dropdown state
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // Change Role modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setMessage({ text: '', type: '' });
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/users/create', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ text: 'User successfully created!', type: 'success' });
      setFormData({ name: '', email: '', password: '', role: 'EMPLOYEE' }); 
      fetchUsers(); 
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage({text: '', type: ''});
      }, 1500);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error creating user', type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  // Change Role handler
  const handleRoleChange = async (newRole) => {
    setRoleLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/users/${roleTarget.id}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      setRoleModalOpen(false);
      setRoleTarget(null);
    } catch (err) {
      console.error('Failed to update role', err);
    } finally {
      setRoleLoading(false);
    }
  };

  // Delete user handler
  const handleDeleteUser = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete user', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter logic
  const filteredUsers = viewMode === 'department'
    ? [...users].sort((a, b) => a.role.localeCompare(b.role))
    : users;

  // Pagination Logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Helper for generating initials
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  };

  // Group users by department when in department view
  const groupedByDepartment = viewMode === 'department'
    ? currentUsers.reduce((acc, u) => {
        const dept = getDepartment(u.role);
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(u);
        return acc;
      }, {})
    : null;

  const renderUserRow = (u, i) => (
    <tr key={u.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
      <td className="px-6 py-4 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg
          ${i % 3 === 0 ? 'bg-[#cfe6f2] text-[#003345]' : i % 3 === 1 ? 'bg-indigo-50 text-indigo-700' : 'bg-rose-50 text-rose-700'}`}>
          {getInitials(u.name)}
        </div>
        <div>
          <p className="font-bold text-[#003345]">{u.name}</p>
          <p className="text-xs font-medium text-[#40484c]/60 mt-0.5">{u.email}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {u.role === 'FINANCE' || u.role === 'ADMIN' ? 
            <Building2 className="w-4 h-4 text-[#14696d]" /> : 
            <Users className="w-4 h-4 text-[#40484c]/60" />
          }
          <span className={`text-sm font-bold ${u.role === 'FINANCE' || u.role === 'ADMIN' ? 'text-[#003345]' : 'text-[#40484c]/80'}`}>
            {u.role === 'EMPLOYEE' ? 'Employee' : 
             u.role === 'FINANCE' ? 'Finance Officer' : 
             u.role === 'MANAGER' ? 'Manager' :
             u.role === 'DIRECTOR' ? 'Director' :
             u.role === 'ADMIN' ? 'System Admin' : u.role}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm font-medium text-[#40484c]/70">
        {getDepartment(u.role)}
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-3 py-1 bg-[#d5ecf8] text-[#003345] text-xs font-black tracking-widest rounded-full uppercase">
          Active
        </span>
      </td>
      <td className="px-6 py-4 text-center relative">
        <div ref={openMenuId === u.id ? menuRef : null} className="relative inline-block">
          <button
            onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
            className="text-gray-400 hover:text-[#003345] transition-colors"
          >
            <MoreVertical className="w-5 h-5 mx-auto" />
          </button>
          {openMenuId === u.id && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden animate-in fade-in duration-150">
              <button
                onClick={() => {
                  setRoleTarget(u);
                  setRoleModalOpen(true);
                  setOpenMenuId(null);
                }}
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-[#003345] hover:bg-[#f3faff] w-full text-left transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Change Role
              </button>
              <button
                onClick={() => {
                  setDeleteTarget(u);
                  setDeleteModalOpen(true);
                  setOpenMenuId(null);
                }}
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 w-full text-left transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Remove User
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black text-[#003345]">User Management</h1>
          <p className="text-[#40484c]/80 font-medium mt-1">Provision access and manage administrative privileges for Stratos Ledger.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#003345] hover:bg-[#004b63] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-colors w-full sm:w-auto"
        >
          <UserPlus className="w-5 h-5" />
          Add New User
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Active */}
        <div className="bg-[#e6f6ff] p-6 rounded-2xl border border-[#003345]/5">
          <p className="text-xs font-black tracking-widest text-[#40484c]/60 uppercase mb-4">Total Active</p>
          <h2 className="text-4xl font-headline font-black text-[#003345] mb-2">{users.length.toLocaleString()}</h2>
          <p className="flex items-center gap-1 text-sm font-bold text-[#003345]">
            <TrendingUp className="w-4 h-4 text-[#14696d]" />
            <span className="text-[#14696d]">+12% this month</span>
          </p>
        </div>

        {/* Finance Officers */}
        <div className="bg-[#f0f9ff] p-6 rounded-2xl border border-[#003345]/5">
          <p className="text-xs font-black tracking-widest text-[#40484c]/60 uppercase mb-4">Finance Officers</p>
          <h2 className="text-4xl font-headline font-black text-[#003345] mb-2">
            {users.filter(u => u.role === 'FINANCE').length}
          </h2>
          <p className="text-sm font-bold text-[#40484c]/70">Authorized audit access</p>
        </div>

        {/* System Integrity */}
        <div className="bg-[#003345] p-6 rounded-2xl relative overflow-hidden flex flex-col justify-center">
          <div className="relative z-10">
            <p className="text-xs font-black tracking-widest text-white/60 uppercase mb-2">System Integrity</p>
            <h3 className="text-xl font-headline font-bold text-white mb-2">Operational Efficiency: 99.4%</h3>
            <p className="text-sm font-medium text-white/70 max-w-[85%] leading-relaxed">
              All automated expense matching systems are performing within peak parameters.
            </p>
          </div>
          <ShieldCheck className="w-32 h-32 absolute -right-6 -bottom-6 text-white/5" strokeWidth={1} />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-3xl border border-[#003345]/10 shadow-sm overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <h2 className="text-lg font-headline font-black text-[#003345]">Directory</h2>
            <div className="flex bg-gray-50 rounded-full p-1 border border-gray-200/60">
              <button
                onClick={() => { setViewMode('all'); setCurrentPage(1); }}
                className={`px-5 py-1.5 rounded-full text-sm font-bold transition-colors ${viewMode === 'all' ? 'bg-[#d5ecf8] text-[#003345]' : 'text-[#40484c]/60 hover:text-[#003345]'}`}
              >
                All Users
              </button>
              <button
                onClick={() => { setViewMode('department'); setCurrentPage(1); }}
                className={`px-5 py-1.5 rounded-full text-sm font-bold transition-colors ${viewMode === 'department' ? 'bg-[#d5ecf8] text-[#003345]' : 'text-[#40484c]/60 hover:text-[#003345]'}`}
              >
                By Department
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#f3faff]/50 text-[10px] uppercase tracking-widest text-[#40484c]/60 font-black border-b border-gray-100">
                <th className="px-6 py-4">Name & Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                  <tr><td colSpan="5" className="p-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#003345]" /></td></tr>
              ) : viewMode === 'department' && groupedByDepartment ? (
                Object.entries(groupedByDepartment).map(([dept, deptUsers]) => (
                  <React.Fragment key={dept}>
                    <tr className="bg-[#f3faff]">
                      <td colSpan="5" className="px-6 py-2 text-xs font-black uppercase tracking-widest text-[#003345]/60">
                        {dept} ({deptUsers.length})
                      </td>
                    </tr>
                    {deptUsers.map((u, i) => renderUserRow(u, i))}
                  </React.Fragment>
                ))
              ) : (
                currentUsers.map((u, i) => renderUserRow(u, i))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm">
          <p className="text-[#40484c]/60 font-medium">
            Showing {filteredUsers.length > 0 ? indexOfFirstUser + 1 : 0} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-50 text-[#003345]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                onClick={() => paginate(i + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${
                  currentPage === i + 1 ? 'bg-[#003345] text-white' : 'text-[#40484c]/70 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-50 text-[#003345]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>


      <footer className="pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 mt-8 text-xs font-bold text-[#40484c]/60">
         <p>© 2024 Stratos Ledger. Precision Vault Enterprise Edition v2.4.2</p>
         <div className="flex gap-6 mt-4 sm:mt-0">
           <span className="hover:text-[#003345] cursor-pointer">Privacy Policy</span>
           <span className="hover:text-[#003345] cursor-pointer">Audit Trail</span>
           <span className="hover:text-[#003345] cursor-pointer">Contact Oversight</span>
         </div>
      </footer>

      {/* Render Modals */}
      <CreateUserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        creating={creating}
        message={message}
      />

      <ChangeRoleModal
        isOpen={roleModalOpen}
        onClose={() => { setRoleModalOpen(false); setRoleTarget(null); }}
        targetUser={roleTarget}
        onConfirm={handleRoleChange}
        loading={roleLoading}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteTarget(null); }}
        targetUser={deleteTarget}
        onConfirm={handleDeleteUser}
        loading={deleteLoading}
      />
    </div>
  );
}
