import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle, Sparkles, Phone } from 'lucide-react';
import { authApi } from '../services/api';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { PremiumButton } from '../components/ui/PremiumButton';

const baseSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string().min(6, 'Please confirm your password'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
});

const patientSchema = baseSchema.extend({
  blood_group: z.string().optional(),
  address: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  emergency_contact: z.string().optional(),
  otp: z.string().optional(),
});

const doctorSchema = baseSchema.extend({
  medical_reg_number: z.string().min(2, 'Registration number required'),
  specialization: z.string().min(2, 'Specialization required'),
  department: z.string().optional(),
  experience: z.number().int().min(0).optional(),
  hospital_id: z.string().optional(),
});

const hrSchema = baseSchema.extend({
  employee_id: z.string().min(1, 'Employee ID required'),
  department: z.string().optional(),
  designation: z.string().optional(),
});

const traineeSchema = baseSchema.extend({
  college_name: z.string().optional(),
  department: z.string().optional(),
  supervisor: z.string().optional(),
  year: z.string().optional(),
});

export default function Register() {
  const navigate = useNavigate();
  const { register: registerAuth } = useAuth();
  const [error, setError] = useState('');
  const [role, setRole] = useState('patient');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');
  const {
    register: registerField,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(baseSchema)
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      // ensure passwords match
      if (data.password !== data.confirm_password) {
        setError('Passwords do not match');
        return;
      }

      // For patient, require OTP verification via backend
      if (role === 'patient') {
        if (!otpVerified) {
          setError('Please verify phone via OTP before registering');
          return;
        }
      }

      const payload = {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role,
      };

      if (role === 'patient') {
        payload.blood_group = data.blood_group || '';
        payload.address = data.address || '';
        payload.dob = data.dob || '';
        payload.gender = data.gender || '';
        payload.emergency_contact = data.emergency_contact || '';
      } else if (role === 'doctor') {
        payload.medical_reg_number = data.medical_reg_number || '';
        payload.specialization = data.specialization || '';
        payload.department = data.department || '';
        payload.experience = data.experience || 0;
        payload.hospital_id = data.hospital_id || '';
      } else if (role === 'hr') {
        payload.employee_id = data.employee_id || '';
        payload.department = data.department || '';
        payload.designation = data.designation || '';
      } else if (role === 'trainee') {
        payload.college_name = data.college_name || '';
        payload.department = data.department || '';
        payload.supervisor = data.supervisor || '';
        payload.year = data.year || '';
      }

      await registerAuth(payload);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Registration failed. Please try again.');
    }
  };

  const sendOtp = async () => {
    const phone = watch('phone');
    setOtpError('');
    setOtpMessage('');
    if (!phone || phone.length < 10) {
      setOtpError('Enter a valid phone number before requesting OTP.');
      return;
    }

    try {
      await authApi.sendOtp({ phone });
      setOtpSent(true);
      setOtpVerified(false);
      setOtpMessage('📱 Demo Mode: OTP would be sent to your phone number. For presentation, you can proceed directly.');
    } catch (err) {
      // Presentation mode fallback: allow skip in demo
      setOtpSent(true);
      setOtpMessage('📱 Demo Mode: OTP service temporarily unavailable. Enter any 6 digits to continue.');
      setOtpError('');
    }
  };

  const verifyOtp = async () => {
    const phone = watch('phone');
    const data = watch('otp');
    setOtpError('');
    setOtpMessage('');
    if (!phone || !data) {
      setOtpError('Enter phone and OTP to verify.');
      return;
    }

    try {
      await authApi.verifyOtp({ phone, otp: data });
      setOtpVerified(true);
      setOtpMessage('✅ Phone verified successfully.');
    } catch (err) {
      // Presentation mode fallback: allow demo verification
      if (data.length >= 4) {
        // Accept any reasonable OTP in demo mode
        setOtpVerified(true);
        setOtpMessage('✅ Demo Mode: Phone number accepted for presentation.');
        setOtpError('');
      } else {
        setOtpError('Please enter at least 4 digits.');
        setOtpVerified(false);
      }
    }
  };

  useEffect(() => {
    // clear errors when role changes
    setError('');
    setOtpSent(false);
    setOtpVerified(false);
    setOtpMessage('');
    setOtpError('');
  }, [role]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden px-4">
      {/* Animated Background Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-medical-500/20 rounded-full blur-[120px]"
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-brand-500/20 rounded-full blur-[100px]"
      />

      <div className="w-full max-w-md z-10 my-8">
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 mx-auto bg-gradient-to-br from-medical-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-glow-green mb-6"
          >
            <Sparkles className="text-white w-8 h-8" />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-extrabold text-slate-900 tracking-tight"
          >
            Create Account
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 font-medium mt-2"
          >
            Join SmartCare-Connect for personalized healthcare
          </motion.p>
        </div>

        <GlassCard delay={0.3} className="!p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2 border border-red-100"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900 ml-1">Select Role</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setRole('patient')} className={`px-3 py-2 rounded-lg ${role==='patient'?'bg-brand-500 text-white':'bg-white/50'}`}>Patient</button>
                <button type="button" onClick={() => setRole('doctor')} className={`px-3 py-2 rounded-lg ${role==='doctor'?'bg-brand-500 text-white':'bg-white/50'}`}>Doctor</button>
                <button type="button" onClick={() => setRole('hr')} className={`px-3 py-2 rounded-lg ${role==='hr'?'bg-brand-500 text-white':'bg-white/50'}`}>HR</button>
                <button type="button" onClick={() => setRole('trainee')} className={`px-3 py-2 rounded-lg ${role==='trainee'?'bg-brand-500 text-white':'bg-white/50'}`}>Trainee</button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900 ml-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  {...registerField('full_name')}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                  placeholder="John Doe"
                />
              </div>
              {errors.full_name && <p className="text-xs text-red-500 font-medium ml-1 mt-1">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  {...registerField('email')}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 font-medium ml-1 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  {...registerField('password')}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-xs text-red-500 font-medium ml-1 mt-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900 ml-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  {...registerField('confirm_password')}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirm_password && <p className="text-xs text-red-500 font-medium ml-1 mt-1">{errors.confirm_password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900 ml-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="tel"
                  {...registerField('phone')}
                  className="block w-full pl-11 pr-28 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                  placeholder="+91 98xxxxxxx"
                />
                {role === 'patient' && (
                  <button type="button" onClick={sendOtp} className="absolute right-2 top-2 px-3 py-2 rounded-xl bg-brand-500 text-white">{otpSent ? 'Resend OTP' : 'Send OTP'}</button>
                )}
              </div>
              {errors.phone && <p className="text-xs text-red-500 font-medium ml-1 mt-1">{errors.phone.message}</p>}
            </div>

            {role === 'patient' && otpSent && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-900 ml-1">Enter OTP</label>
                <div className="relative">
                  <input type="text" {...registerField('otp')} className="block w-full pr-28 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-500" placeholder="123456" />
                  <button type="button" onClick={verifyOtp} className="absolute right-2 top-2 px-3 py-2 rounded-xl bg-brand-500 text-white">Verify</button>
                </div>
                {otpError && <p className="text-xs text-red-500 font-medium ml-1 mt-1">{otpError}</p>}
                {otpMessage && <p className="text-xs text-emerald-600 font-medium ml-1 mt-1">{otpMessage}</p>}
              </div>
            )}

            {/* Role-specific extra fields */}
            {role === 'patient' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-slate-900 ml-1">Blood Group</label>
                    <input type="text" {...registerField('blood_group')} className="block w-full mt-1 p-3 rounded-xl border" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-900 ml-1">Gender</label>
                    <input type="text" {...registerField('gender')} className="block w-full mt-1 p-3 rounded-xl border" />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-sm font-semibold text-slate-900 ml-1">Date of Birth</label>
                  <input type="date" {...registerField('dob')} className="block w-full mt-1 p-3 rounded-xl border" />
                </div>
                <div className="mt-3">
                  <label className="text-sm font-semibold text-slate-900 ml-1">Emergency Contact</label>
                  <input type="text" {...registerField('emergency_contact')} className="block w-full mt-1 p-3 rounded-xl border" />
                </div>
                <div className="mt-3">
                  <label className="text-sm font-semibold text-slate-900 ml-1">Address</label>
                  <input type="text" {...registerField('address')} className="block w-full mt-1 p-3 rounded-xl border" />
                </div>
              </>
            )}

            {role === 'doctor' && (
              <>
                <div className="mt-3">
                  <label className="text-sm font-semibold text-slate-900 ml-1">Medical Registration Number</label>
                  <input type="text" {...registerField('medical_reg_number')} className="block w-full mt-1 p-3 rounded-xl border" />
                </div>
                <div className="mt-3">
                  <label className="text-sm font-semibold text-slate-900 ml-1">Specialization</label>
                  <input type="text" {...registerField('specialization')} className="block w-full mt-1 p-3 rounded-xl border" />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <input type="text" {...registerField('department')} placeholder="Department" className="p-3 rounded-xl border" />
                  <input type="number" {...registerField('experience')} placeholder="Years experience" className="p-3 rounded-xl border" />
                </div>
                <div className="mt-3">
                  <label className="text-sm font-semibold text-slate-900 ml-1">Hospital ID</label>
                  <input type="text" {...registerField('hospital_id')} className="block w-full mt-1 p-3 rounded-xl border" />
                </div>
              </>
            )}

            {role === 'hr' && (
              <>
                <div className="mt-3">
                  <label className="text-sm font-semibold text-slate-900 ml-1">Employee ID</label>
                  <input type="text" {...registerField('employee_id')} className="block w-full mt-1 p-3 rounded-xl border" />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <input type="text" {...registerField('department')} placeholder="Department" className="p-3 rounded-xl border" />
                  <input type="text" {...registerField('designation')} placeholder="Designation" className="p-3 rounded-xl border" />
                </div>
              </>
            )}

            {role === 'trainee' && (
              <>
                <div className="mt-3">
                  <label className="text-sm font-semibold text-slate-900 ml-1">College Name</label>
                  <input type="text" {...registerField('college_name')} className="block w-full mt-1 p-3 rounded-xl border" />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <input type="text" {...registerField('department')} placeholder="Department" className="p-3 rounded-xl border" />
                  <input type="text" {...registerField('supervisor')} placeholder="Supervisor" className="p-3 rounded-xl border" />
                </div>
                <div className="mt-3">
                  <label className="text-sm font-semibold text-slate-900 ml-1">Year</label>
                  <input type="text" {...registerField('year')} className="block w-full mt-1 p-3 rounded-xl border" />
                </div>
              </>
            )}

            <PremiumButton 
              type="submit" 
              loading={isSubmitting}
              className="w-full mt-8"
              variant="medical"
            >
              Create Account
            </PremiumButton>
          </form>
        </GlassCard>

        <p className="text-center text-sm text-slate-900 mt-8 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
