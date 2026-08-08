import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { roleHome } from "../utils/rbac";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  FileText,
  Clock,
  ImageIcon,
  CheckCircle,
  Zap,
  BarChart3,
  ArrowRight,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

/* ---------------- Floating Particles ---------------- */

const Particle = ({ delay, x, y, size, duration }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.6, 0],
      scale: [0, 1, 0],
      y: [0, -40, -80],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeOut",
    }}
  >
    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-cyan-300" />
  </motion.div>
);

/* ---------------- Counter ---------------- */

const AnimCounter = ({ end, suffix = "", label }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;

    const step = Math.ceil(end / 40);

    const timer = setInterval(() => {
      current += step;

      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 40);

    return () => clearInterval(timer);
  }, [end]);

  return (
    <div className="text-center">
      <div className="text-lg font-extrabold text-slate-900">
        {count.toLocaleString()}
        {suffix}
      </div>

      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
};

/* ===================================================== */

export default function Login() {
  const navigate = useNavigate();

  const { login, selectRole } = useAuth();

  const { t } = useLanguage();

  const [searchParams] = useSearchParams();

  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  const [focusedField, setFocusedField] = useState(null);

  const loginSchema = z.object({
    email: z.string().email(
      t(
        "validation.email",
        "Please enter a valid email address"
      )
    ),

    password: z
      .string()
      .min(
        6,
        t(
          "validation.passwordMin",
          "Password must be at least 6 characters"
        )
      ),
  });

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "demo@smartcare.ai",
      password: "Demo@123",
    },
  });

  useEffect(() => {
    const role = searchParams.get("role");

    if (!role) return;

    const currentRole = localStorage.getItem("SmartCare-Connect_selected_role");
    if (currentRole !== role) {
      selectRole(role);
    }
  }, [searchParams, selectRole]);

  useEffect(() => {
    window.__showToast = (message, type = "info") => {
      console.log(`[${type}] ${message}`);
    };
  }, []);
  const onSubmit = async (data) => {
    try {
      setError("");

      // Use AuthContext for ALL login logic
      const loggedInUser = await login(
        data.email,
        data.password
      );

      // Determine dashboard
      const role =
        loggedInUser?.role ||
        localStorage.getItem("SmartCare-Connect_selected_role") ||
        "patient";

      // Navigate once after successful login
      navigate(roleHome(role), { replace: true });
    } catch (err) {
      console.error(err);

      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Invalid email or password";

      setError(message);
    }
  };

  const handleDemo = async () => {
    try {
      setError("");
      const demoUser = await login("demo@smartcare.ai", "Demo@123");
      const role = demoUser?.role || localStorage.getItem("SmartCare-Connect_selected_role") || "patient";
      navigate(roleHome(role), { replace: true });
    } catch (err) {
      console.error(err);
      setError("Demo login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4 text-slate-100">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left - Branding */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="hidden md:flex flex-col justify-center rounded-2xl p-8 bg-slate-900/40 border border-white/6">
          <div className="mb-6">
            <div className="inline-flex items-center gap-3">
              <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 shadow-md">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.08" />
                  <path d="M7 12h10M12 7v10" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-300">SmartCare Connect AI</div>
                <div className="mt-1 text-2xl font-extrabold text-white tracking-tight">Welcome back</div>
              </div>
            </div>
          </div>

          <p className="text-slate-400 mb-6">Secure AI-powered healthcare platform for Patients, Doctors, HR, and Administrators.</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/6 rounded-lg p-4">
              <AnimCounter end={120000} suffix="+" label="Patients" />
            </div>
            <div className="bg-white/6 rounded-lg p-4">
              <AnimCounter end={800} suffix="+" label="Hospitals" />
            </div>
          </div>
        </motion.div>

        {/* Right - Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl p-8 bg-slate-900/60 border border-white/6 shadow-glass">
          <div className="mb-6">
            <div className="text-sm font-semibold text-slate-300">Sign in</div>
            <div className="mt-1 text-2xl font-extrabold text-white tracking-tight">Access your workspace</div>
            <div className="mt-2 text-sm text-slate-400">Enter your credentials to continue</div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 mb-2 block">Email</label>
              <div className="relative">
                <input
                  type="email"
                  {...register('email')}
                  className="w-full rounded-xl border border-white/6 bg-slate-900/30 px-4 py-3 text-white focus:outline-none"
                  placeholder="demo@smartcare.ai"
                />
                {errors.email && <div className="text-xs text-rose-400 mt-1">{errors.email?.message}</div>}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full rounded-xl border border-white/6 bg-slate-900/30 px-4 py-3 text-white focus:outline-none"
                  placeholder="Password"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff /> : <Eye />}</button>
                {errors.password && <div className="text-xs text-rose-400 mt-1">{errors.password?.message}</div>}
              </div>
            </div>

            {error && <div className="text-sm text-rose-400">{error}</div>}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input id="remember" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4" />
                <label htmlFor="remember" className="text-sm text-slate-300">Remember me</label>
              </div>

              <Link to="/forgot" className="text-sm text-sky-300">Forgot password?</Link>
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={isSubmitting} className="flex-1 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900">Sign in</button>
              <button type="button" onClick={handleDemo} className="rounded-2xl bg-white/6 px-4 py-3 text-sm font-semibold">Demo</button>
            </div>

            <div className="text-center text-sm text-slate-400">
              Don't have an account? <Link to="/role-selection" className="text-sky-300">Choose role</Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
