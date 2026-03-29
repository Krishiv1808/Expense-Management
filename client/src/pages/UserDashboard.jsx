import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/UI';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/login');
    } else {
      setUser(JSON.parse(stored));
    }
  }, [navigate]);

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
            <h1 className="text-3xl font-headline font-bold text-primary">Welcome, {user.name}</h1>
            <p className="text-on-surface-variant mt-1">Employee Portal - {user.companyName}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </header>

        <Card variant="high" className="p-12 text-center rounded-3xl bg-white text-on-surface shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 md:col-span-3">
              <h2 className="text-2xl font-headline font-bold text-primary">Your Dashboard</h2>
              <p className="text-on-surface-variant max-w-lg mx-auto mt-4">This space will contain your expense reports, approvals, and history.</p>
            </div>
        </Card>
      </div>
    </div>
  );
}
