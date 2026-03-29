import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/Button';
import { 
  Loader2, Plus, Receipt, Clock, CheckCircle, XCircle, 
  Download, FileText, AlertCircle, HelpCircle, ArrowRight,
  TrendingUp, Activity, X
} from 'lucide-react';

export default function EmployeeDashboard() {
  const { user } = useContext(AuthContext);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal Form State
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
      fetchClaims(); 
      setTimeout(() => setShowForm(false), 1500);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to submit claim', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED': return <span className="inline-flex items-center px-3 py-1 bg-[#d5ecf8] text-[#003345] text-xs font-black tracking-widest rounded-full uppercase">Approved</span>;
      case 'REJECTED': return <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-xs font-black tracking-widest rounded-full uppercase">Rejected</span>;
      default: return <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-[#40484c] text-xs font-black tracking-widest rounded-full uppercase">Processing</span>;
    }
  };

  // Calculations
  const totalReimbursed = claims.filter(c => c.status === 'APPROVED').reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
  const pendingAmount = claims.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
  const activeCount = claims.filter(c => c.status === 'PENDING').length;
  const userCurrency = user?.currency || 'USD';

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 min-h-full">
      
      {/* Header and Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-black text-[#003345]">Welcome back, {user?.name.split(' ')[0] || 'User'}.</h1>
          <p className="text-[#40484c] font-medium mt-2">Your reimbursement pipeline is currently optimized. You have 0 items requiring immediate attention.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="bg-[#e6f6ff] text-[#003345] hover:bg-[#d5ecf8] px-6 py-4 rounded-2xl font-bold flex items-center gap-4 shadow-sm transition-colors text-left">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Quick Action</p>
              <p className="text-sm">Download Statement</p>
            </div>
          </button>

          <button onClick={() => setShowForm(true)} className="bg-[#003345] text-white hover:bg-[#004b63] px-6 py-4 rounded-2xl font-bold flex items-center gap-4 shadow-sm transition-colors text-left">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5" />
            </div>
            <div className="pr-4">
              <p className="text-sm">Submit New<br/>Claim</p>
            </div>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border-l-[6px] border-[#003345] shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
           <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-[#e6f6ff] rounded-xl flex items-center justify-center">
                 <svg className="w-5 h-5 text-[#003345]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
              </div>
              <span className="bg-[#d5ecf8] text-[#003345] text-[10px] font-black tracking-widest px-3 py-1 rounded-full">+12% VS LY</span>
           </div>
           <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-[#40484c]/60 mb-1">Total Reimbursed (YTD)</p>
              <h2 className="text-3xl font-headline font-black text-[#003345]">${totalReimbursed.toFixed(2)}</h2>
           </div>
        </div>

        <div className="bg-[#e6f6ff] p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
           <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                 <Activity className="w-5 h-5 text-[#003345]" />
              </div>
              <span className="bg-[#d5ecf8] text-[#003345] text-[10px] font-black tracking-widest px-3 py-1 rounded-full">{activeCount} ACTIVE</span>
           </div>
           <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-[#40484c]/60 mb-1">Claims Pending</p>
              <h2 className="text-3xl font-headline font-black text-[#003345]">${pendingAmount.toFixed(2)}</h2>
           </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border-l-[6px] border-red-500 shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
           <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                 <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <span className="bg-red-50 text-red-600 text-[10px] font-black tracking-widest px-3 py-1 rounded-full">ALL CLEAR</span>
           </div>
           <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-[#40484c]/60 mb-1">Needs Attention</p>
              <h2 className="text-3xl font-headline font-black text-red-600">00 <span className="text-sm font-bold text-[#40484c] opacity-60 tracking-normal">Claims</span></h2>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (Requires Attention & Recent Claims) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Recent Claims Table */}
          <div className="space-y-4">
            <div className="flex justify-between items-end mb-2">
               <h3 className="text-xl font-headline font-black text-[#003345]">Recent Claims</h3>
               <div className="flex gap-2">
                 <button className="text-[#40484c] hover:text-[#003345]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M6 12h12m-9 6h6"/></svg></button>
               </div>
            </div>
            
            <div className="bg-white rounded-3xl border border-[#003345]/5 shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-white text-[10px] uppercase tracking-widest text-[#40484c]/60 font-black border-b border-gray-100">
                      <th className="px-6 py-4">Claim ID</th>
                      <th className="px-6 py-4">Merchant / Event</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                        <tr><td colSpan="5" className="p-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#003345]" /></td></tr>
                    ) : claims.length === 0 ? (
                        <tr><td colSpan="5" className="p-12 text-center text-[#40484c]/60 font-medium">No claims found.</td></tr>
                    ) : (
                      claims.slice(0, 5).map(claim => (
                        <tr key={claim.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-5 text-sm font-bold text-[#40484c]/60">#{claim.id.split('-')[0]}</td>
                          <td className="px-6 py-5">
                            <p className="font-bold text-[#003345] truncate max-w-[180px]">{claim.category || 'Uncategorized'}</p>
                            <p className="text-[11px] font-bold text-[#40484c]/50 mt-0.5 truncate max-w-[180px]">{claim.description || 'No description'}</p>
                          </td>
                          <td className="px-6 py-5 text-sm font-medium text-[#40484c]/70">
                            {new Date(claim.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-5 font-bold text-[#003345]">
                            ${parseFloat(claim.amount).toFixed(2)}
                          </td>
                          <td className="px-6 py-5 text-center">
                            {getStatusBadge(claim.status)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50/50 p-4 text-center border-t border-gray-100">
                 <button className="text-sm font-bold text-[#003345] hover:opacity-70 transition-opacity">
                    View All Transaction History
                 </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Widgets) */}
        <div className="space-y-6">
          
          {/* Vault Quick Tip */}
          <div className="bg-[#003345] p-8 rounded-3xl relative overflow-hidden flex flex-col justify-center">
            <h3 className="text-lg font-headline font-bold text-white mb-3 relative z-10">Vault Quick Tip</h3>
            <p className="text-sm font-medium text-white/70 leading-relaxed mb-6 relative z-10">
              Did you know? Meals under $25 no longer require physical receipt scanning if paid with your corporate card.
            </p>
            <button className="text-white text-xs font-black tracking-widest uppercase flex items-center gap-2 hover:opacity-80 transition-opacity w-fit relative z-10">
              Read Policy <ArrowRight className="w-4 h-4" />
            </button>
            <HelpCircle className="w-40 h-40 absolute -right-10 -bottom-10 text-white/5" strokeWidth={1} />
          </div>

          {/* Approval Pipeline */}
          <div className="bg-white p-6 rounded-3xl border border-[#003345]/5 shadow-sm">
             <h3 className="text-sm font-bold text-[#003345] mb-6">Approval Pipeline</h3>
             
             <div className="space-y-5 relative">
               <div className="absolute left-[3px] top-6 bottom-6 w-px bg-gray-100"></div>
               
               {/* Step 1 */}
               <div className="relative z-10">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-[#003345] bg-white pr-2">Manager Review</span>
                    <span className="text-xs font-black text-[#003345]">85%</span>
                 </div>
                 <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#003345] rounded-full" style={{ width: '85%' }}></div>
                 </div>
               </div>

               {/* Step 2 */}
               <div className="relative z-10">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-[#40484c] bg-white pr-2">Finance Audit</span>
                    <span className="text-xs font-black text-[#40484c]">40%</span>
                 </div>
                 <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#14696d] rounded-full" style={{ width: '40%' }}></div>
                 </div>
               </div>

               {/* Step 3 */}
               <div className="relative z-10">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-[#40484c]/60 bg-white pr-2">Bank Transfer</span>
                    <span className="text-xs font-black text-[#40484c]/60">15%</span>
                 </div>
                 <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-300 rounded-full" style={{ width: '15%' }}></div>
                 </div>
               </div>
             </div>
          </div>

          {/* Support Widget */}
          <div className="bg-white p-6 rounded-3xl border border-[#003345]/5 shadow-sm flex flex-col items-center">
             <div className="flex items-center gap-4 w-full mb-4">
                <div className="w-12 h-12 bg-[#e6f6ff] rounded-full flex items-center justify-center text-[#003345] font-bold shadow-sm">
                   SM
                </div>
                <div>
                   <p className="text-[10px] font-black tracking-widest uppercase text-[#40484c]/60 mb-0.5">Claims Specialist</p>
                   <p className="text-sm font-bold text-[#003345]">Sarah Miller</p>
                </div>
             </div>
             <button className="w-full py-3 bg-[#f3faff] text-[#003345] hover:bg-[#e6f6ff] rounded-xl font-bold text-sm transition-colors border border-[#003345]/10">
               Message Support
             </button>
          </div>

        </div>
      </div>

      {/* Upload Claim Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button 
              onClick={() => setShowForm(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
               <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <div className="w-10 h-10 rounded-full bg-[#003345]/10 flex items-center justify-center text-[#003345]">
                 <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-headline font-bold text-[#003345]">Submit New Claim</h2>
            </div>
            
            {message.text && (
              <div className={`p-4 mb-6 rounded-xl text-sm font-semibold ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                 {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div>
                  <label className="block text-sm font-bold mb-2 text-[#003345]">Amount</label>
                  <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleTextChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003345]/20 focus:border-[#003345] outline-none" required />
               </div>
               <div>
                  <label className="block text-sm font-bold mb-2 text-[#003345]">Currency</label>
                  <input type="text" name="currency" value={formData.currency} onChange={handleTextChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003345]/20 focus:border-[#003345] outline-none" required />
               </div>
               <div>
                  <label className="block text-sm font-bold mb-2 text-[#003345]">Date of Expense</label>
                  <input type="date" name="date" value={formData.date} onChange={handleTextChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003345]/20 focus:border-[#003345] outline-none" required />
               </div>
               <div>
                  <label className="block text-sm font-bold mb-2 text-[#003345]">Category</label>
                  <input type="text" name="category" value={formData.category} onChange={handleTextChange} placeholder="e.g. Travel" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003345]/20 focus:border-[#003345] outline-none" required />
               </div>
               <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2 text-[#003345]">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleTextChange} rows="2" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003345]/20 focus:border-[#003345] outline-none" />
               </div>
               <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2 text-[#003345]">Receipt Upload</label>
                  <div className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-center hover:bg-gray-100 transition-colors">
                     <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="text-sm font-medium w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#003345]/10 file:text-[#003345] hover:file:bg-[#003345]/20 cursor-pointer" />
                  </div>
               </div>
               <div className="md:col-span-2 mt-2 pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="px-6 py-3 border-gray-200">
                     Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="px-8 py-3 bg-[#003345] text-white hover:bg-[#004b63]">
                     {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : 'Upload Claim'}
                  </Button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
