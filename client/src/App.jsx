import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Hero, Logos, Features, Testimonial, CTA, Footer } from './components/Sections';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Signup from './pages/Signup';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

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

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          
          {/* Protected Routes */}
          <Route path="/admin-dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/finance-dashboard" element={<ProtectedRoute role="FINANCE"><FinanceDashboard /></ProtectedRoute>} />
          <Route path="/user-dashboard" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
