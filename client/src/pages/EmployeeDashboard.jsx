import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Card, Badge } from '../components/UI';
import ChangePassword from '../components/ChangePassword';
import { Loader2, Plus, Receipt, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function EmployeeDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ amount: '', currency: user?.currency || 'USD', category: '', description: '', date: '' });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchClaims = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/expenses/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClaims(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleTextChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: '', type: '' });

    const submitData = new FormData();
    Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
    if (file) submitData.append('receipt', file);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/expenses', submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMessage({ text: 'Claim submitted successfully!', type: 'success' });
      setFormData({ amount: '', currency: user?.currency || 'USD', category: '', description: '', date: '' });
      setFile(null);
      setShowForm(false);
      fetchClaims(); 
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to submit claim', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800"><CheckCircle className="w-3 h-3"/> Approved</span>;
      case 'REJECTED': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800"><XCircle className="w-3 h-3"/> Rejected</span>;
      default: return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3"/> Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Employee Dashboard</h1>
            <p className="text-on-surface-variant mt-1">Manage your expenses for {user?.companyName}</p>
          </div>
          <div className="flex gap-4">
             <Button onClick={() => setShowForm(!showForm)}>
               {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> New Claim</>}
             </Button>
             <Button onClick={logout} variant="outline">Logout</Button>
          </div>
        </header>

        {message.text && (
          <div className={`p-4 mb-6 rounded-xl text-sm font-semibold ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {showForm && (
              <Card variant="high" className="p-8 shadow-sm">
                <h2 className="text-xl font-headline font-bold text-primary mb-6 border-b pb-4">Submit New Claim</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Amount</label>
                    <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleTextChange} className="w-full p-3 rounded-xl border border-outline focus:border-primary outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Currency</label>
                    <input type="text" name="currency" value={formData.currency} onChange={handleTextChange} className="w-full p-3 rounded-xl border border-outline focus:border-primary outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Category (e.g. Travel, Meals)</label>
                    <input type="text" name="category" value={formData.category} onChange={handleTextChange} className="w-full p-3 rounded-xl border border-outline focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Date of Expense</label>
                    <input type="date" name="date" value={formData.date} onChange={handleTextChange} className="w-full p-3 rounded-xl border border-outline focus:border-primary outline-none" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleTextChange} className="w-full p-3 rounded-xl border border-outline focus:border-primary outline-none" rows="2" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Receipt (Image/PDF)</label>
                    <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="w-full p-2 border border-outline rounded-xl" />
                  </div>
                  <div className="md:col-span-2 mt-2">
                    <Button type="submit" disabled={submitting} className="w-full">
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Submit Document'}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <Card variant="white" className="p-0 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                <Receipt className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-headline font-bold text-primary">My Recent Claims</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-on-surface-variant/60 font-bold border-b border-gray-100">
                      <th className="p-4">Date</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                       <tr><td colSpan="5" className="p-8 text-center text-on-surface-variant"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                    ) : claims.length === 0 ? (
                       <tr><td colSpan="5" className="p-8 text-center text-on-surface-variant font-medium">No claims submitted yet.</td></tr>
                    ) : (
                      claims.map(claim => (
                        <tr key={claim.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                          <td className="p-4 font-medium text-sm">{new Date(claim.date).toLocaleDateString()}</td>
                          <td className="p-4 text-sm font-semibold text-primary">{claim.category}</td>
                          <td className="p-4 font-bold">{claim.amount} {claim.currency}</td>
                          <td className="p-4">{getStatusBadge(claim.status)}</td>
                          <td className="p-4 text-sm">
                            {claim.receipt_url ? (
                              <a href={`http://localhost:5000${claim.receipt_url}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-semibold">View</a>
                            ) : '-'}
                          </td>
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
