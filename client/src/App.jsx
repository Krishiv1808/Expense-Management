import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Hero, Logos, Features, Testimonial, CTA, Footer } from './components/Sections';
import Signup from './pages/Signup';
import Login from './pages/Login';

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
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        {/* Placeholder for Dashboard */}
        <Route path="/dashboard" element={<div className="p-20 text-center font-bold">Dashboard (Coming Soon)</div>} />
      </Routes>
    </Router>
  );
}
