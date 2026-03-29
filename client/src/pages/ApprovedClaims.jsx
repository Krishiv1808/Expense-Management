import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Loader2, FileText, Download, Filter, HelpCircle,
  Car, Coffee, CheckCircle2, Building2
} from 'lucide-react';

export default function ApprovedClaims() {
  const { user } = useContext(AuthContext);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchApprovedClaims = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/expenses/approved', {
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
    fetchApprovedClaims();
  }, []);

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
  const totalApprovedAmount = claims.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
  
  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = claims.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(claims.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 min-h-full">
      
      {/* Top Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Welcome Area */}
        <div className="bg-[#003345] p-8 rounded-3xl relative overflow-hidden flex flex-col justify-center text-white h-56 shadow-sm">
           <div className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-md rounded-2xl">
             <CheckCircle2 className="w-8 h-8 text-green-400" />
           </div>
           <h2 className="text-3xl font-headline font-black mb-3">Approved Historical Ledger</h2>
           <p className="text-white/80 font-medium max-w-[85%] leading-relaxed">
             This secure vault displays all cross-departmental claims that have successfully passed the final operational review tier.
           </p>
           <Building2 className="w-48 h-48 absolute -right-12 -bottom-12 text-white/5" strokeWidth={1} />
        </div>

        {/* Total Processed Widget */}
        <div className="bg-[#e6f6ff] p-8 rounded-3xl border border-[#003345]/5 flex flex-col justify-center h-56 shadow-sm">
           <p className="text-xs font-black tracking-widest text-[#40484c]/60 uppercase mb-4">Total Value Approved</p>
           <div className="flex items-end gap-3 mb-4">
              <h2 className="text-6xl font-headline font-black text-[#003345] leading-none">
                ${totalApprovedAmount.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}
              </h2>
           </div>
           <p className="text-sm font-bold text-[#40484c]/70">Representing {claims.length} completely finalized documents</p>
        </div>

      </div>

      {/* Main Review Table */}
      <div className="bg-white rounded-3xl border border-[#003345]/10 shadow-sm overflow-hidden flex flex-col mt-4">
        
        {/* Table Header/Toolbar */}
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
             <h3 className="text-2xl font-headline font-black text-[#003345] mb-1">Finalized Claims</h3>
             <p className="text-[#40484c]/60 font-medium">Claims that have achieved rigorous pipeline consensus.</p>
           </div>
           
           <div className="flex gap-3">
             <button className="flex items-center gap-2 px-5 py-2.5 bg-[#e6f6ff] text-[#003345] hover:bg-[#d5ecf8] font-bold text-sm rounded-xl transition-colors">
                <Filter className="w-4 h-4" /> Filters
             </button>
             <button className="flex items-center gap-2 px-5 py-2.5 bg-[#003345] text-white hover:bg-[#004b63] font-bold text-sm rounded-xl transition-colors">
                <Download className="w-4 h-4" /> Export Ledger
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
                 <th className="px-6 py-5">Date of Approval</th>
                 <th className="px-6 py-5">Amount</th>
                 <th className="px-8 py-5 text-right w-[150px]">Actions</th>
               </tr>
             </thead>
             <tbody>
               {loading ? (
                   <tr><td colSpan="5" className="p-16"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#003345]" /></td></tr>
               ) : claims.length === 0 ? (
                   <tr><td colSpan="5" className="p-16 text-center text-[#40484c]/60 font-medium text-lg">No finalized claims found in the ledger.</td></tr>
               ) : (
                 currentItems.map((claim, i) => (
                     <tr key={claim.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                       <td className="px-8 py-6 flex items-center gap-4">
                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg
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
                         <span className="px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-green-50 text-green-700">
                           {new Date(claim.updated_at || claim.created_at).toLocaleDateString()}
                         </span>
                       </td>
                       <td className="px-6 py-6 font-black text-[#003345] whitespace-nowrap">
                         ${parseFloat(claim.amount).toFixed(2)}
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2 action-btns">
                             {claim.receipt_url ? (
                                <a 
                                  href={`http://localhost:5000${claim.receipt_url}`} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#f3faff] text-[#003345] hover:bg-[#e6f6ff] transition-colors border border-[#003345]/10"
                                  title="View Original Receipt"
                                >
                                  <FileText className="w-4 h-4" />
                                </a>
                             ) : (
                                <span className="text-[10px] font-bold text-[#40484c]/40 uppercase">No Receipt</span>
                             )}
                           </div>
                       </td>
                     </tr>
                 ))
               )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
