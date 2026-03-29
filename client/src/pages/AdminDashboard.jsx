import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Card } from '../components/UI';
import ChangePassword from '../components/ChangePassword';
import { Users, Loader2, UserPlus } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [creating, setCreating] = useState(false);

  // Fetch users list
  const fetchUsers = async () => {
    try {
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
      setFormData({ name: '', email: '', password: '', role: 'EMPLOYEE' }); // reset
      fetchUsers(); // Refresh the list
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error creating user', type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Admin Control Center</h1>
            <p className="text-on-surface-variant mt-1">Manage infrastructure for {user?.companyName}</p>
          </div>
          <Button onClick={logout} variant="outline">Logout</Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <Card variant="high" className="p-8 shadow-sm rounded-3xl bg-white text-on-surface">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-headline font-bold text-primary">Create New User</h2>
              </div>
              
              {message.text && (
                <div className={`p-4 mb-6 rounded-xl text-sm font-semibold ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name</label>
                  <input name="name" value={formData.name} onChange={handleChange} className="w-full p-3 rounded-xl border border-outline focus:border-primary outline-none" placeholder="Jane Doe" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 rounded-xl border border-outline focus:border-primary outline-none" placeholder="jane@company.com" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Initial Password</label>
                  <input type="text" name="password" value={formData.password} onChange={handleChange} className="w-full p-3 rounded-xl border border-outline focus:border-primary outline-none" placeholder="Provide to user directly" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">System Role</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="w-full p-3 rounded-xl border border-outline focus:border-primary outline-none bg-white font-semibold">
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MANAGER">Manager</option>
                    <option value="FINANCE">Finance Officer</option>
                    <option value="DIRECTOR">Director</option>
                    <option value="ADMIN">System Admin</option>
                  </select>
                </div>
                <div className="md:col-span-2 mt-2">
                  <Button type="submit" disabled={creating} className="w-full sm:w-auto px-10 py-3">
                     {creating ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : 'Provision User'}
                  </Button>
                </div>
              </form>
            </Card>

            <Card variant="white" className="p-0 shadow-sm overflow-hidden border border-outline/20">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-headline font-bold text-primary">Company Directory</h2>
                </div>
                <div className="bg-primary/5 text-primary px-3 py-1 rounded-full text-sm font-bold">
                  {users.length} Users
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-on-surface-variant/60 font-bold border-b border-gray-100">
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers ? (
                       <tr><td colSpan="3" className="p-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                    ) : (
                      users.map(u => (
                        <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 font-bold text-sm text-primary">{u.name}</td>
                          <td className="p-4 text-sm font-medium text-on-surface-variant opacity-80">{u.email}</td>
                          <td className="p-4 text-xs font-black tracking-widest text-primary/60">{u.role}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <ChangePassword />
          </div>

        </div>
      </div>
    </div>
  );
}
