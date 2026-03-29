import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/UI';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/login');
    } else {
      const parsed = JSON.parse(stored);
      if (parsed.role !== 'ADMIN') navigate('/user-dashboard');
      setUser(parsed);
    }
  }, [navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/users/create', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ text: 'User successfully created!', type: 'success' });
      setFormData({ name: '', email: '', password: '', role: 'EMPLOYEE' }); // reset
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error creating user', type: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Admin Dashboard</h1>
            <p className="text-on-surface-variant mt-1">Manage users for {user.companyName || 'your company'}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </header>

        <Card variant="high" className="p-8 shadow-sm rounded-3xl bg-white text-on-surface">
          <h2 className="text-xl font-headline font-bold text-primary mb-6 border-b pb-4">Create New User</h2>
          
          {message.text && (
            <div className={`p-4 mb-6 rounded-xl text-sm font-semibold ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full p-3 rounded-xl border border-outline focus:border-primary outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 rounded-xl border border-outline focus:border-primary outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Temporary Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-3 rounded-xl border border-outline focus:border-primary outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full p-3 rounded-xl border border-outline focus:border-primary outline-none bg-white">
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="FINANCE">Finance</option>
                <option value="DIRECTOR">Director</option>
              </select>
            </div>
            <div className="md:col-span-2 mt-2">
              <Button type="submit" className="w-full sm:w-auto px-8 py-3">Provision User</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
