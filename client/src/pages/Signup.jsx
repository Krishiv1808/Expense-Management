import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { Card } from '../components/UI';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', companyName: '', country: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating company');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-20">
      <Card variant="high" className="w-full max-w-md p-8 shadow-2xl rounded-3xl bg-white text-on-surface">
        <h2 className="text-3xl font-headline font-bold text-primary mb-2">Register Company</h2>
        <p className="text-on-surface-variant font-medium mb-6">Create your Admin account to get started.</p>
        
        {error && <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto w-full no-scrollbar pb-2">
          <div>
            <label className="block text-sm font-semibold mb-1 text-on-surface">Admin Name</label>
            <input name="name" onChange={handleChange} className="w-full p-2.5 rounded-xl border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-on-surface">Email</label>
            <input type="email" name="email" onChange={handleChange} className="w-full p-2.5 rounded-xl border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-on-surface">Password</label>
            <input type="password" name="password" onChange={handleChange} className="w-full p-2.5 rounded-xl border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-on-surface">Company Name</label>
            <input name="companyName" onChange={handleChange} className="w-full p-2.5 rounded-xl border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-on-surface">Country (Code)</label>
            <input name="country" placeholder="e.g. US, IN, UK" onChange={handleChange} className="w-full p-2.5 rounded-xl border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />
          </div>
          <Button type="submit" className="w-full mt-4 py-3">Sign Up</Button>
        </form>
        <p className="text-center mt-6 text-sm text-on-surface-variant">
          Already have an account? <span onClick={() => navigate('/login')} className="text-primary font-bold cursor-pointer hover:underline">Log in</span>
        </p>
      </Card>
    </div>
  );
}
