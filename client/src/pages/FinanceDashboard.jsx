import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Loader2, CheckCircle, XCircle, FileText, 
  TrendingUp, Download, Filter, HelpCircle,
  MoreVertical, ChevronLeft, ChevronRight, Activity, Building2, Car, Coffee
} from 'lucide-react';

export default function FinanceDashboard() {
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
      await axios.patch(`http://localhost:5000/api/expenses/${id}/status`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove handled claim from UI
      setClaims(claims.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to update status');
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

  const totalPendingAmount = claims.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
  
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
           <h2 className="text-3xl font-headline font-black mb-3">Welcome back, {user?.name.split(' ')[0] || 'Arthur'}</h2>
           <p className="text-white/80 font-medium max-w-[85%] leading-relaxed">
             There are {claims.length} claims waiting for your review today. Your current efficiency rating is up 12% this week.
           </p>
           <HelpCircle className="w-48 h-48 absolute -right-12 -bottom-12 text-white/5" strokeWidth={1} />
        </div>

        {/* Pending Approvals Widget */}
        <div className="bg-[#e6f6ff] p-8 rounded-3xl border border-[#003345]/5 flex flex-col justify-center h-56 shadow-sm">
           <p className="text-xs font-black tracking-widest text-[#40484c]/60 uppercase mb-4">Pending Approvals</p>
           <div className="flex items-end gap-3 mb-4">
              <h2 className="text-6xl font-headline font-black text-[#003345] leading-none">{claims.length}</h2>
              <span className="flex items-center gap-1 text-[#14696d] font-bold text-sm bg-[#cfe6f2] px-2 py-1 rounded-md mb-2">
                 <TrendingUp className="w-3 h-3" />
                 ~4.5%
              </span>
           </div>
           <p className="text-sm font-bold text-[#40484c]/70">Required for EOM close</p>
        </div>

        {/* Total Pending Amount Widget */}
        <div className="bg-white p-8 rounded-3xl border border-[#003345]/10 flex flex-col justify-center h-56 shadow-sm">
           <p className="text-xs font-black tracking-widest text-[#40484c]/60 uppercase mb-4">Total Pending Amount</p>
           <h2 className="text-5xl font-headline font-black text-[#003345] mb-4">
             ${totalPendingAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
           </h2>
           <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                 <div className="w-8 h-8 rounded-full border-2 border-white bg-[#003345] text-white flex items-center justify-center font-bold text-[10px] z-30">A</div>
                 <div className="w-8 h-8 rounded-full border-2 border-white bg-[#14696d] text-white flex items-center justify-center font-bold text-[10px] z-20">MB</div>
                 <div className="w-8 h-8 rounded-full border-2 border-white bg-[#cfe6f2] text-[#003345] flex items-center justify-center font-bold text-[10px] z-10">+18</div>
              </div>
              <p className="text-sm font-bold text-[#40484c]/70">Awaiting Officer Action</p>
           </div>
        </div>

      </div>

      {/* Main Review Table */}
      <div className="bg-white rounded-3xl border border-[#003345]/10 shadow-sm overflow-hidden flex flex-col mt-4">
        
        {/* Table Header/Toolbar */}
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
             <h3 className="text-2xl font-headline font-black text-[#003345] mb-1">High-Priority Review</h3>
             <p className="text-[#40484c]/60 font-medium">Items requiring immediate verification for the Q3 cycle.</p>
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
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5 relative z-10">Status</th>
                <th className="px-8 py-5 text-right w-[150px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                  <tr><td colSpan="6" className="p-16"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#003345]" /></td></tr>
              ) : claims.length === 0 ? (
                  <tr><td colSpan="6" className="p-16 text-center text-[#40484c]/60 font-medium text-lg">No pending claims. You're all caught up!</td></tr>
              ) : (
                currentItems.map((claim, i) => (
                  <tr key={claim.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg cursor-pointer hover:opacity-80
                        ${i % 3 === 0 ? 'bg-[#d5ecf8] text-[#003345]' : i % 3 === 1 ? 'bg-indigo-50 text-indigo-700' : 'bg-[#cfe6f2] text-[#14696d]'}`}>
                        {getInitials(claim.employee_name)}
                      </div>
                      <div>
                        <p className="font-bold text-[#003345] text-[15px]">{claim.employee_name}</p>
                        <p className="text-xs font-bold text-[#40484c]/50 mt-1">Software Engineering</p>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3 text-[#40484c]">
                        {getCategoryIcon(claim.category)}
                        <span className="font-bold text-sm">{claim.category || 'Uncategorized'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm font-bold text-[#40484c]/60 whitespace-nowrap">
                      {new Date(claim.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-6 font-black text-[#003345] whitespace-nowrap">
                      ${parseFloat(claim.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-6">
                      <span className="inline-flex items-center px-4 py-1.5 bg-[#d5ecf8] text-[#003345] text-[10px] font-black tracking-widest rounded-full uppercase">
                        Pending
                      </span>
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
                            title="Approve"
                          >
                            {actionLoading === claim.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => handleAction(claim.id, 'REJECTED')}
                            disabled={actionLoading === claim.id}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 border border-red-200"
                            title="Reject"
                          >
                            {actionLoading === claim.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <XCircle className="w-4 h-4" />}
                          </button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between text-sm">
          <p className="text-[#40484c]/60 font-bold text-xs uppercase tracking-wider">
            Showing <span className="text-[#003345]">{claims.length > 0 ? indexOfFirstItem + 1 : 0} of {Math.min(indexOfLastItem, claims.length)}</span> pending items
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
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-50 text-[#003345]"
             >
                <ChevronRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>


    </div>
  );
}
