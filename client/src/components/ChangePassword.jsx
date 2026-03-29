import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { Card } from './UI';

export default function ChangePassword() {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return setMessage({ text: 'New passwords do not match', type: 'error' });
    }

    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/users/password', 
        { currentPassword: formData.currentPassword, newPassword: formData.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ text: 'Password updated successfully!', type: 'success' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update password', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="white" className="p-8 shadow-sm rounded-3xl" hover={false}>
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Lock className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-headline font-bold text-primary">Security Settings</h2>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-xl text-sm font-semibold ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-2">Current Password</label>
          <input 
            type="password" 
            name="currentPassword" 
            value={formData.currentPassword} 
            onChange={handleChange} 
            className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium" 
            required 
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-2">New Password</label>
          <input 
            type="password" 
            name="newPassword" 
            value={formData.newPassword} 
            onChange={handleChange} 
            className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium" 
            required 
            minLength={6}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-2">Confirm New Password</label>
          <input 
            type="password" 
            name="confirmPassword" 
            value={formData.confirmPassword} 
            onChange={handleChange} 
            className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium" 
            required 
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full mt-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Update Password'}
        </Button>
      </form>
    </Card>
  );
}
