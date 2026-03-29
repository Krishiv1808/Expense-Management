import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Lock, Building, Globe, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/UI';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    country: ''
  });
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCountries, setFetchingCountries] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/countries');
        setCountries(res.data);
      } catch (err) {
        console.error('Error fetching countries:', err);
      } finally {
        setFetchingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-primary font-headline">Join Stratos Ledger</h2>
          <p className="text-on-surface-variant font-medium mt-2">Setup your company in seconds</p>
        </div>

        <Card variant="white" className="p-8 shadow-xl" hover={false}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-error-container text-error text-sm font-bold rounded-xl text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe" 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@company.com" 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">Company Name</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                <input 
                  type="text" 
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="TechScale Systems" 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">Country</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                <select 
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all font-medium"
                  required
                >
                  <option value="">{fetchingCountries ? 'Loading countries...' : 'Select Country'}</option>
                  {countries.map(c => (
                    <option key={c.code} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button className="w-full py-4 mt-4" type="submit">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm font-medium mt-6 text-on-surface-variant/60">
            Already have an account? <a href="/login" className="text-primary font-bold hover:underline">Log in</a>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
