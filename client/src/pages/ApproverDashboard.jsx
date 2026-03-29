import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Loader2, CheckCircle, XCircle, FileText, 
  TrendingUp, Download, Filter, HelpCircle,
  Car, Coffee, AlertCircle
} from 'lucide-react';

export default function ApproverDashboard() {
  const { user } = useContext(AuthContext);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchPendingClaims = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/expenses/pending', {
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
    fetchPendingClaims();
  }, []);

  const handleAction = async (id, status) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.patch(`http://localhost:5000/api/expenses/${id}/status`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove handled claim from UI (optimistic update)
      setClaims(claims.filter(c => c.id !== id));
      
      // Optional: Add a subtle toast or log based on data.message
      console.log(data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  // Helper for generating initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  };

  // Category Icon helper
  const getCategoryIcon = (cat) => {
    const c = cat ? cat.toLowerCase() : '';
    if (c.includes('travel') || c.includes('flight')) return <FileText className="w-4 h-4" />;
    if (c.includes('meal') || c.includes('food') || c.includes('entertainment')) return <Coffee className="w-4 h-4" />;
    if (c.includes('mileage') || c.includes('car')) return <Car className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  // Dynamic Metrics
  const totalPendingAmount = claims.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
  
  const attentionNeededCount = claims.filter(c => {
    const hrPending = (new Date() - new Date(c.created_at)) / (1000 * 60 * 60);
    return hrPending > 16;
  }).length;
  
  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = claims.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(claims.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 min-h-full">
      
      {/* Top Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Welcome Area */}
        <div className="bg-[#003345] p-8 rounded-3xl relative overflow-hidden flex flex-col justify-center text-white h-56 shadow-sm">
           <h2 className="text-3xl font-headline font-black mb-3">Welcome, {user?.name.split(' ')[0] || 'Approver'}</h2>
           <p className="text-white/80 font-medium max-w-[85%] leading-relaxed">
             There are {claims.length} cross-departmental claims waiting for your {user?.role.toLowerCase()} review today.
           </p>
           <HelpCircle className="w-48 h-48 absolute -right-12 -bottom-12 text-white/5" strokeWidth={1} />
        </div>

        {/* Pending Approvals Widget */}
        <div className="bg-[#e6f6ff] p-8 rounded-3xl border border-[#003345]/5 flex flex-col justify-center h-56 shadow-sm">
           <p className="text-xs font-black tracking-widest text-[#40484c]/60 uppercase mb-4">Pending Escelation Queue</p>
           <div className="flex items-end gap-3 mb-4">
              <h2 className="text-6xl font-headline font-black text-[#003345] leading-none">{claims.length}</h2>
              <span className="flex items-center gap-1 text-[#14696d] font-bold text-sm bg-[#cfe6f2] px-2 py-1 rounded-md mb-2">
                 <TrendingUp className="w-3 h-3" />
                 Active
              </span>
           </div>
           <p className="text-sm font-bold text-[#40484c]/70">Total value: ${totalPendingAmount.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</p>
        </div>

        {/* Urgent Attention Widget */}
        <div className="bg-white p-8 rounded-3xl border border-[#003345]/10 flex flex-col justify-center h-56 shadow-sm relative overflow-hidden">
           <div className={`absolute left-0 top-0 bottom-0 w-2 ${attentionNeededCount > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
           <p className="text-xs font-black tracking-widest text-[#40484c]/60 uppercase mb-4 pl-4 flex items-center gap-2">
             <AlertCircle className="w-4 h-4" /> Attention Needed
           </p>
           <h2 className={`text-5xl font-headline font-black mb-4 pl-4 ${attentionNeededCount > 0 ? 'text-red-600' : 'text-[#003345]'}`}>
             {attentionNeededCount} <span className="text-sm font-bold opacity-60">Sluggish Items</span>
           </h2>
           <div className="flex items-center gap-4 pl-4">
              <p className="text-sm font-bold text-[#40484c]/70 leading-tight pr-4">
                {attentionNeededCount > 0 
                  ? 'Claims older than 16 hours. Action them to prevent tier escalation.' 
                  : 'All review queues are operating well within established SLAs.'}
              </p>
           </div>
        </div>

      </div>

      {/* Main Review Table */}
      <div className="bg-white rounded-3xl border border-[#003345]/10 shadow-sm overflow-hidden flex flex-col mt-4">
        
        {/* Table Header/Toolbar */}
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
             <h3 className="text-2xl font-headline font-black text-[#003345] mb-1">Approval Matrix</h3>
             <p className="text-[#40484c]/60 font-medium">Items that have escalated to your operational tier.</p>
           </div>
           
           <div className="flex gap-3">
             <button className="flex items-center gap-2 px-5 py-2.5 bg-[#e6f6ff] text-[#003345] hover:bg-[#d5ecf8] font-bold text-sm rounded-xl transition-colors">
                <Filter className="w-4 h-4" /> Filters
             </button>
             <button className="flex items-center gap-2 px-5 py-2.5 bg-[#003345] text-white hover:bg-[#004b63] font-bold text-sm rounded-xl transition-colors">
                <Download className="w-4 h-4" /> Export List
             </button>
           </div>
        </div>

        {/* Datatable */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#f3faff]/50 text-[10px] uppercase tracking-widest text-[#40484c]/60 font-black border-b border-gray-100">
                <th className="px-8 py-5">Employee</th>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5">Time Pending</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5 relative z-10">Current Actions</th>
                <th className="px-8 py-5 text-right w-[150px]">Your Call</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                  <tr><td colSpan="6" className="p-16"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#003345]" /></td></tr>
              ) : claims.length === 0 ? (
                  <tr><td colSpan="6" className="p-16 text-center text-[#40484c]/60 font-medium text-lg">No pending claims. You're all caught up!</td></tr>
              ) : (
                currentItems.map((claim, i) => {
                  const hoursOld = Math.floor((new Date() - new Date(claim.created_at)) / (1000 * 60 * 60));
                  const isSluggish = hoursOld >= 16;
                  
                  return (
                    <tr key={claim.id} className={`border-b border-gray-50 transition-colors group ${isSluggish ? 'bg-red-50/20 hover:bg-red-50/50' : 'hover:bg-gray-50/50'}`}>
                      <td className="px-8 py-6 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg cursor-pointer hover:opacity-80
                          ${i % 3 === 0 ? 'bg-[#d5ecf8] text-[#003345]' : i % 3 === 1 ? 'bg-indigo-50 text-indigo-700' : 'bg-[#cfe6f2] text-[#14696d]'}`}>
                          {getInitials(claim.employee_name)}
                        </div>
                        <div>
                          <p className="font-bold text-[#003345] text-[15px]">{claim.employee_name}</p>
                          <p className="text-xs font-bold text-[#40484c]/50 mt-1">{claim.category || 'Standard Expense'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3 text-[#40484c]">
                          {getCategoryIcon(claim.category)}
                          <span className="font-bold text-sm max-w-[120px] truncate" title={claim.description || claim.category}>{claim.description || 'No detailed description'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-medium text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase ${isSluggish ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-[#40484c]/70'}`}>
                          {hoursOld < 1 ? '< 1 HR' : `${hoursOld} HRS`}
                        </span>
                      </td>
                      <td className="px-6 py-6 font-black text-[#003345] whitespace-nowrap">
                        ${parseFloat(claim.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-1.5">
                           {claim.approvals && claim.approvals.filter(a => a.status === 'APPROVED').length > 0 ? (
                             claim.approvals.filter(a => a.status === 'APPROVED').map((a, idx) => (
                               <span key={idx} className="inline-flex items-center px-2 py-0.5 bg-green-100 border border-green-200 text-green-800 text-[9px] font-black tracking-widest rounded-md uppercase" title={`Approved by ${a.role}`}>
                                 {a.role.substring(0,3)} ✓
                               </span>
                             ))
                           ) : (
                             <span className="text-xs font-bold text-[#40484c]/40">Awaiting 1st Review</span>
                           )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex justify-end gap-2 action-btns">
                            {claim.receipt_url && (
                               <a 
                                 href={`http://localhost:5000${claim.receipt_url}`} 
                                 target="_blank" 
                                 rel="noreferrer" 
                                 className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#f3faff] text-[#003345] hover:bg-[#e6f6ff] transition-colors border border-[#003345]/10"
                                 title="View Receipt"
                               >
                                 <FileText className="w-4 h-4" />
                               </a>
                            )}
                            <button 
                              onClick={() => handleAction(claim.id, 'APPROVED')}
                              disabled={actionLoading === claim.id}
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50 border border-green-200"
                              title="Approve / Escalate"
                            >
                              {actionLoading === claim.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={() => handleAction(claim.id, 'REJECTED')}
                              disabled={actionLoading === claim.id}
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 border border-red-200"
                              title="Instant Reject"
                            >
                              {actionLoading === claim.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <XCircle className="w-4 h-4" />}
                            </button>
                          </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
