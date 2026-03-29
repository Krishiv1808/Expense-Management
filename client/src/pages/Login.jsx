import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowLeft, KeyRound, ShieldCheck, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/UI';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ─── Forgot Password State ──────────────────────────────────────────────
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1=email, 2=otp, 3=new password, 4=done
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      login(res.data.token, res.data.user);
      if (res.data.user.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else if (['MANAGER', 'FINANCE', 'DIRECTOR'].includes(res.data.user.role)) {
        navigate('/approver-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ─── Forgot Password Handlers ──────────────────────────────────────────
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email: forgotEmail });
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-reset-otp', {
        email: forgotEmail, otp: forgotOtp
      });
      setResetToken(res.data.resetToken);
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setForgotError('Password must be at least 6 characters');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', {
        resetToken, newPassword: forgotNewPassword
      });
      setForgotStep(4);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgot = () => {
    setShowForgot(false);
    setForgotStep(1);
    setForgotEmail('');
    setForgotOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setResetToken('');
    setForgotError('');
  };

  // ─── Step Indicator ──────────────────────────────────────────────────────
  const StepDots = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1,2,3].map(s => (
        <div key={s} className={`w-2.5 h-2.5 rounded-full transition-all ${
          forgotStep >= s ? 'bg-[#003345] scale-110' : 'bg-gray-200'
        }`} />
      ))}
    </div>
  );

  // ─── Forgot Password Modal ───────────────────────────────────────────────
  const ForgotModal = showForgot ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
      >
        <button onClick={closeForgot} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">✕</button>

        {/* Step 1: Enter Email */}
        {forgotStep === 1 && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#003345]/10 flex items-center justify-center text-[#003345]">
                <KeyRound className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-[#003345]">Reset Password</h2>
            </div>
            <StepDots />
            <p className="text-sm text-[#40484c]/70 mb-6 font-medium">Enter your email and we'll send a 6-digit verification code.</p>
            {forgotError && <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl text-center mb-4">{forgotError}</div>}
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#40484c]/40" />
                <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="john@company.com" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#003345]/20 outline-none font-medium" required />
              </div>
              <button type="submit" disabled={forgotLoading} className="w-full py-3 bg-[#003345] hover:bg-[#004b63] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                {forgotLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
              </button>
              <button type="button" onClick={closeForgot} className="w-full py-3 border border-gray-200 text-[#40484c]/70 hover:text-[#003345] rounded-xl font-bold flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
            </form>
          </>
        )}

        {/* Step 2: Enter OTP */}
        {forgotStep === 2 && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#003345]/10 flex items-center justify-center text-[#003345]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-[#003345]">Verify OTP</h2>
            </div>
            <StepDots />
            <p className="text-sm text-[#40484c]/70 mb-2 font-medium">We sent a 6-digit code to:</p>
            <p className="text-sm font-bold text-[#003345] mb-6">{forgotEmail}</p>
            {forgotError && <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl text-center mb-4">{forgotError}</div>}
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <input
                type="text"
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full text-center py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#003345]/20 outline-none font-black text-2xl tracking-[12px] text-[#003345]"
                required
              />
              <button type="submit" disabled={forgotLoading || forgotOtp.length !== 6} className="w-full py-3 bg-[#003345] hover:bg-[#004b63] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {forgotLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify OTP'}
              </button>
              <button type="button" onClick={() => { setForgotStep(1); setForgotError(''); }} className="w-full py-3 border border-gray-200 text-[#40484c]/70 hover:text-[#003345] rounded-xl font-bold flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Change Email
              </button>
            </form>
          </>
        )}

        {/* Step 3: New Password */}
        {forgotStep === 3 && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#003345]/10 flex items-center justify-center text-[#003345]">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-[#003345]">New Password</h2>
            </div>
            <StepDots />
            <p className="text-sm text-[#40484c]/70 mb-6 font-medium">Create a strong new password for your account.</p>
            {forgotError && <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl text-center mb-4">{forgotError}</div>}
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#40484c]/40" />
                <input type="password" value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)} placeholder="New password" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#003345]/20 outline-none font-medium" required minLength={6} />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#40484c]/40" />
                <input type="password" value={forgotConfirmPassword} onChange={(e) => setForgotConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#003345]/20 outline-none font-medium" required minLength={6} />
              </div>
              <button type="submit" disabled={forgotLoading} className="w-full py-3 bg-[#003345] hover:bg-[#004b63] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                {forgotLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        {/* Step 4: Success */}
        {forgotStep === 4 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-[#003345] mb-2">Password Reset!</h3>
            <p className="text-sm text-[#40484c]/70 font-medium mb-6">Your password has been successfully updated. You can now log in with your new credentials.</p>
            <button onClick={closeForgot} className="w-full py-3 bg-[#003345] hover:bg-[#004b63] text-white rounded-xl font-bold flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  ) : null;

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-primary font-headline">Welcome Back</h2>
            <p className="text-on-surface-variant font-medium mt-2">Access your financial dashboard</p>
          </div>
          <Card variant="white" className="p-8 shadow-xl" hover={false}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-error-container text-error text-sm font-bold rounded-xl text-center">{error}</div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@company.com" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" required />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Password</label>
                  <button type="button" onClick={() => { setShowForgot(true); setForgotStep(1); setForgotEmail(formData.email); setForgotError(''); }} className="text-xs font-bold text-primary hover:underline">Forgot password?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" required />
                </div>
              </div>
              <Button className="w-full py-4 mt-4" type="submit">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
              </Button>
            </form>
            <p className="text-center text-sm font-medium mt-6 text-on-surface-variant/60">
              Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline">Sign up</Link>
            </p>
          </Card>
        </motion.div>
      </div>
      {ForgotModal}
    </>
  );
}
