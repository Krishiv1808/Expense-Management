import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, Hero, Logos, Features, Testimonial, CTA, Footer } from './components/Sections';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Signup from './pages/Signup';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AppLayout from './components/AppLayout';
import ChangePassword from './components/ChangePassword';

function LandingPage() {
  return (
    <div className="min-h-screen selection:bg-secondary-container selection:text-primary">
      <Navbar />
      <main>
        <Hero />
        <Logos />
        <Features />
        <Testimonial />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

const DummyView = ({ title, children }) => (
  <div className="p-8 h-full flex flex-col pt-16 mt-8 sm:mt-0 items-center max-w-2xl mx-auto">
    <div className="w-full text-center">
      <h2 className="text-3xl font-black text-[#003345] font-headline mb-4">{title}</h2>
      {children ? children : (
        <p className="text-[#40484c]/80 font-medium bg-white p-6 rounded-2xl border border-[#003345]/10 shadow-sm inline-block">
          This section is currently under construction.
        </p>
      )}
    </div>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          
          {/* Default redirect for /admin-dashboard */}
          <Route path="/admin-dashboard" element={<Navigate to="/admin-dashboard/users" replace />} />
          <Route path="/finance-dashboard" element={<Navigate to="/finance-dashboard/overview" replace />} />
          <Route path="/user-dashboard" element={<Navigate to="/user-dashboard/overview" replace />} />

          {/* Protected Admin Routes with Layout */}
          <Route 
            path="/admin-dashboard/*" 
            element={
              <ProtectedRoute role="ADMIN">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="overview" element={<DummyView title="Admin Overview" />} />
            <Route path="claims" element={<DummyView title="Claims Management" />} />
            <Route path="team" element={<DummyView title="Team Organization" />} />
            <Route path="users" element={<AdminDashboard />} />
            <Route path="settings" element={
              <DummyView title="System Settings">
                 <div className="text-left mt-8 w-full max-w-md mx-auto">
                    <ChangePassword />
                 </div>
              </DummyView>
            } />
          </Route>

          {/* Protected Finance Routes */}
          <Route 
            path="/finance-dashboard/*" 
            element={
              <ProtectedRoute role="FINANCE">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="overview" element={<FinanceDashboard />} />
            <Route path="claims" element={<DummyView title="Claims Pipeline" />} />
            <Route path="team" element={<DummyView title="Finance Team" />} />
            <Route path="users" element={<DummyView title="Users (Finance View)" />} />
            <Route path="settings" element={
              <DummyView title="Finance Settings">
                 <div className="text-left mt-8 w-full max-w-md mx-auto">
                    <ChangePassword />
                 </div>
              </DummyView>
            } />
          </Route>

          {/* Protected Employee Routes */}
          <Route 
            path="/user-dashboard/*" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="overview" element={<EmployeeDashboard />} />
            <Route path="claims" element={<DummyView title="My Past Claims" />} />
            <Route path="team" element={<DummyView title="My Team" />} />
            <Route path="users" element={<Navigate to="/user-dashboard/overview" replace />} />
            <Route path="settings" element={
              <DummyView title="My Settings">
                 <div className="text-left mt-8 w-full max-w-md mx-auto">
                    <ChangePassword />
                 </div>
              </DummyView>
            } />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}
