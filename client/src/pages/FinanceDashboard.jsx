import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Card } from '../components/UI';
import ChangePassword from '../components/ChangePassword';
import { Loader2, CheckCircle, XCircle, FileText } from 'lucide-react';

export default function FinanceDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

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

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Finance Portal</h1>
            <p className="text-on-surface-variant mt-1">Review queue for {user?.companyName}</p>
          </div>
          <Button onClick={logout} variant="outline">Logout</Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <Card variant="white" className="p-0 shadow-sm overflow-hidden border border-outline/20">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-headline font-bold text-primary">Pending Reviews</h2>
                </div>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                  {claims.length} items
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-on-surface-variant/60 font-bold border-b border-gray-100">
                      <th className="p-4">Employee</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Category & Desc</th>
                      <th className="p-4">Receipt</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                       <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                    ) : claims.length === 0 ? (
                       <tr><td colSpan="5" className="p-12 text-center text-on-surface-variant font-medium">Queue is empty. Great job!</td></tr>
                    ) : (
                      claims.map(claim => (
                        <tr key={claim.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-sm text-primary">{claim.employee_name}</div>
                            <div className="text-xs text-on-surface-variant opacity-70">{claim.employee_email}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold">{claim.amount} {claim.currency}</div>
                            <div className="text-xs text-on-surface-variant opacity-70">{new Date(claim.date).toLocaleDateString()}</div>
                          </td>
                          <td className="p-4 max-w-[200px]">
                            <div className="text-sm font-semibold">{claim.category}</div>
                            <div className="text-xs text-on-surface-variant truncate" title={claim.description}>{claim.description || '-'}</div>
                          </td>
                          <td className="p-4 text-sm">
                            {claim.receipt_url ? (
                              <a href={`http://localhost:5000${claim.receipt_url}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-semibold bg-blue-50 px-3 py-1 rounded-full">View Doc</a>
                            ) : <span className="text-xs opacity-50 font-bold">NONE</span>}
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleAction(claim.id, 'APPROVED')}
                                disabled={actionLoading === claim.id}
                                className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                {actionLoading === claim.id ? <Loader2 className="w-5 h-5 animate-spin"/> : <CheckCircle className="w-5 h-5" />}
                              </button>
                              <button 
                                onClick={() => handleAction(claim.id, 'REJECTED')}
                                disabled={actionLoading === claim.id}
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                {actionLoading === claim.id ? <Loader2 className="w-5 h-5 animate-spin"/> : <XCircle className="w-5 h-5" />}
                              </button>
                            </div>
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
