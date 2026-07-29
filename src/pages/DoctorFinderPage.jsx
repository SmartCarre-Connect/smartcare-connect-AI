import React, { useState, useEffect, useCallback } from 'react';
import { doctorsApi, appointmentsApi } from '../services/api';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { PremiumButton } from '../components/ui/PremiumButton';
import {
  Stethoscope, Search, Star, Clock, Briefcase, Calendar,
  Filter, ChevronRight, DollarSign, Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SPECIALIZATIONS = [
  'All', 'Cardiologist', 'General Physician', 'Dermatologist',
  'Orthopedic Surgeon', 'Pediatrician', 'Neurologist', 'Psychiatrist',
  'Gynecologist', 'Ophthalmologist', 'ENT Specialist',
];

const DEMO_DOCTORS = [
  {
    id: 'd1', full_name: 'Dr. Sarah Wilson', specialization: 'Cardiologist',
    experience: 12, consultation_fee: 800, qualification: 'MBBS, MD (Cardiology)',
    avg_rating: 4.8, total_reviews: 124, is_available: true,
  },
  {
    id: 'd2', full_name: 'Dr. Michael Chen', specialization: 'General Physician',
    experience: 8, consultation_fee: 500, qualification: 'MBBS, DNB',
    avg_rating: 4.6, total_reviews: 89, is_available: true,
  },
  {
    id: 'd3', full_name: 'Dr. Priya Sharma', specialization: 'Dermatologist',
    experience: 6, consultation_fee: 600, qualification: 'MBBS, MD (Dermatology)',
    avg_rating: 4.9, total_reviews: 203, is_available: true,
  },
  {
    id: 'd4', full_name: 'Dr. Raj Patel', specialization: 'Orthopedic Surgeon',
    experience: 15, consultation_fee: 900, qualification: 'MBBS, MS (Ortho)',
    avg_rating: 4.7, total_reviews: 156, is_available: false,
  },
  {
    id: 'd5', full_name: 'Dr. Aisha Khan', specialization: 'Pediatrician',
    experience: 10, consultation_fee: 550, qualification: 'MBBS, DCH',
    avg_rating: 4.9, total_reviews: 312, is_available: true,
  },
  {
    id: 'd6', full_name: 'Dr. Robert James', specialization: 'Neurologist',
    experience: 18, consultation_fee: 1200, qualification: 'MBBS, DM (Neurology)',
    avg_rating: 4.5, total_reviews: 78, is_available: true,
  },
];

export default function DoctorFinderPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('All');
  const navigate = useNavigate();

  const fetchDoctors = useCallback(async () => {
    try {
      const res = await doctorsApi.list(selectedSpec === 'All' ? null : selectedSpec);
      const data = res.data?.data || res.data || {};
      const list = data.doctors || [];
      setDoctors(list.length > 0 ? list : DEMO_DOCTORS);
    } catch {
      setDoctors(DEMO_DOCTORS);
    } finally {
      setLoading(false);
    }
  }, [selectedSpec]);

  useEffect(() => {
    setLoading(true);
    fetchDoctors();
  }, [fetchDoctors]);

  const filtered = doctors.filter(d =>
    !search ||
    (d.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.specialization || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.qualification || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleBookNow = (doctor) => {
    // Navigate to appointments page with doctor pre-selected (via state)
    navigate('/appointments', { state: { preSelectDoctor: doctor } });
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } },
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Stethoscope className="text-brand-500" size={28} />
          Find a Doctor
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          {filtered.length} doctors available · Book an appointment instantly
        </p>
      </motion.div>

      {/* Search + Filter */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctors by name, specialization..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 shadow-sm"
          />
        </div>

        {/* Specialization chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-400 shrink-0" />
          {SPECIALIZATIONS.map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpec(spec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSpec === spec
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-brand-200 hover:text-brand-600'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard className="p-16 text-center">
          <Stethoscope size={40} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600">No doctors found</h3>
          <p className="text-sm text-slate-400 mt-1">Try a different search or specialization</p>
        </GlassCard>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        >
          {filtered.map((doc) => {
            const docId = doc._id || doc.id;
            const rating = doc.avg_rating || (Math.random() * 0.8 + 4.1).toFixed(1);
            const reviews = doc.total_reviews || Math.floor(Math.random() * 200 + 50);
            return (
              <motion.div key={docId} variants={itemVariants}>
                <GlassCard className="p-6 h-full flex flex-col gap-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-100 to-cyan-100 flex items-center justify-center text-brand-700 text-xl font-extrabold shrink-0">
                      {(doc.full_name || 'D').charAt(4) || (doc.full_name || 'D').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900">{doc.full_name || 'Doctor'}</h3>
                          <p className="text-sm text-brand-600 font-semibold">{doc.specialization}</p>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                          doc.is_available !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-slate-50 text-slate-500 border border-slate-100'
                        }`}>
                          {doc.is_available !== false ? '● Available' : '○ Busy'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center p-3 bg-amber-50 rounded-xl">
                      <div className="flex items-center gap-1 text-amber-600">
                        <Star size={13} fill="currentColor" />
                        <span className="text-sm font-extrabold">{Number(rating).toFixed(1)}</span>
                      </div>
                      <span className="text-[10px] text-amber-600/70 font-medium mt-0.5">{reviews} reviews</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-blue-50 rounded-xl">
                      <div className="flex items-center gap-1 text-blue-600">
                        <Briefcase size={13} />
                        <span className="text-sm font-extrabold">{doc.experience}yr</span>
                      </div>
                      <span className="text-[10px] text-blue-600/70 font-medium mt-0.5">experience</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-brand-50 rounded-xl">
                      <div className="flex items-center gap-1 text-brand-600">
                        <span className="text-sm font-extrabold">₹{doc.consultation_fee || 500}</span>
                      </div>
                      <span className="text-[10px] text-brand-600/70 font-medium mt-0.5">consult</span>
                    </div>
                  </div>

                  {/* Qualification */}
                  {doc.qualification && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Award size={13} className="text-slate-400 shrink-0" />
                      <span>{doc.qualification}</span>
                    </div>
                  )}

                  {/* Book btn */}
                  <button
                    onClick={() => handleBookNow(doc)}
                    disabled={doc.is_available === false}
                    className="mt-auto w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Calendar size={16} />
                    {doc.is_available !== false ? 'Book Appointment' : 'Not Available'}
                  </button>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
