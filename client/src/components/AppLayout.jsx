import React, { useContext } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings, LogOut, Search, Bell, History, Shield, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function AppLayout() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getBasePath = () => {
    if (user?.role === 'ADMIN') return '/admin-dashboard';
    if (['MANAGER', 'FINANCE', 'DIRECTOR'].includes(user?.role)) return '/approver-dashboard';
    return '/user-dashboard'; // Default employee
  };

  const basePath = getBasePath();

  const navItems = [
    ...(!(['ADMIN'].includes(user?.role)) ? [
      { name: 'Dashboard', path: `${basePath}/overview`, icon: LayoutDashboard },
    ] : []),
    ...(['MANAGER', 'FINANCE', 'DIRECTOR'].includes(user?.role) ? [
      { name: 'Approved Claims', path: `${basePath}/approved`, icon: CheckCircle },
      { name: 'My Expenses', path: `/user-dashboard/overview`, icon: FileText }
    ] : []),
    ...(!(['ADMIN', 'MANAGER', 'FINANCE', 'DIRECTOR'].includes(user?.role)) ? [
      { name: 'Claims', path: `${basePath}/claims`, icon: FileText },
      { name: 'Accepted Claims', path: `${basePath}/accepted`, icon: CheckCircle }
    ] : []),
    ...(user?.role === 'ADMIN' ? [
      { name: 'Users', path: `${basePath}/users`, icon: Shield }
    ] : []),
    { name: 'Settings', path: `${basePath}/settings`, icon: Settings },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f3faff] flex font-body">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#003345]/10 flex flex-col justify-between hidden md:flex h-screen fixed">
        <div>
          <div className="p-6 border-b border-[#003345]/5">
            <h1 className="font-headline font-black text-[#003345] text-xl leading-tight">
              Fimberse
            </h1>
            <p className="text-[10px] font-bold tracking-widest text-[#40484c]/60 uppercase mt-1">
              Enterprise <br /> Reimbursement
            </p>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[#003345]/5 text-[#003345] relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-8 before:bg-[#003345] before:rounded-r-md'
                      : 'text-[#40484c] hover:bg-[#003345]/5'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-[#003345]' : 'text-[#40484c]/50'}`} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#003345]/5">
          <button className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-[#40484c]/70 hover:text-[#003345] w-full text-left">
            <CheckCircle className="w-4 h-4" />
            Support
          </button>
          
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-[#40484c]/70 hover:text-[#ba1a1a] w-full text-left mt-1">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 bg-white/50 backdrop-blur-md border-b border-[#003345]/5 sticky top-0 z-10 px-8 flex items-center justify-between">
          <div className="flex-1 max-w-xl relative hidden md:block">
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#003345] leading-tight">{user?.name || 'User'}</p>
                <p className="text-[10px] font-black tracking-widest text-[#40484c]/50 uppercase">{user?.role || 'Guest'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#003345] flex items-center justify-center text-white font-bold shadow-sm shadow-[#003345]/30">
                {getInitials(user?.name)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
