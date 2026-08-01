import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { appointmentsApi, doctorsApi } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { PremiumButton } from '../components/ui/PremiumButton';
import {
  Calendar, Clock, User, Stethoscope, Plus, X, ChevronRight,
  CheckCircle, XCircle, AlertCircle, Loader2, CalendarDays,
  Search
} from 'lucide-react';

const STATUS_CONFIG = {
  booked:    { color: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500', icon: Clock, label: 'Booked' },
  confirmed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500', icon: CheckCircle, label: 'Confirmed' },
  completed: { color: 'bg-slate-50 text-slate-600 border-slate-100', dot: 'bg-slate-400', icon: CheckCircle, label: 'Completed' },
  cancelled: { color: 'bg-red-50 text-red-600 border-red-100', dot: 'bg-red-400', icon: XCircle, label: 'Cancelled' },
};

const normalizeStatus = (status) => String(status || '').trim().toLowerCase();


const TIME_SLOTS = [
  '09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM',
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showBookModal, setShowBookModal] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [preSelectDoctor, setPreSelectDoctor] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.preSelectDoctor) {
      setPreSelectDoctor(location.state.preSelectDoctor);
      setShowBookModal(true);
    }
  }, [location.state]);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await appointmentsApi.list();
      const payload = res.data;
      setAppointments(Array.isArray(payload) ? payload : payload.appointments || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleCancel = async (appointmentId) => {
    setCancellingId(appointmentId);
    try {
      await appointmentsApi.cancel(appointmentId);
      setAppointments(prev =>
        prev.map(a => {
          const id = a.appointment_id || a.id;
          return id === appointmentId ? { ...a, status: 'Cancelled' } : a;
        })
      );
    } catch {
      // Cancel failed, keep the existing appointment state.
    } finally {
      setCancellingId(null);
    }
  };

  const onBookSuccess = (newAppt) => {
    setAppointments(prev => [newAppt, ...prev]);
    setShowBookModal(false);
  };

  const filtered = appointments.filter(a => {
    const status = normalizeStatus(a.status);
    if (filter === 'upcoming') return ['booked', 'confirmed'].includes(status);
    if (filter === 'past') return ['completed', 'cancelled'].includes(status);
    return true;
  });

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } } };

  return (
    <div className="pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <CalendarDays className="text-brand-500" size={28} />
            Appointments
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {appointments.filter(a => ['Booked','Confirmed'].includes(a.status)).length} upcoming · {appointments.length} total
          </p>
        </div>
        <PremiumButton icon={Plus} onClick={() => setShowBookModal(true)}>
          Book Appointment
        </PremiumButton>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 mb-6">
        {['all', 'upcoming', 'past'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
              filter === f ? 'bg-brand-500 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:border-brand-200 hover:text-brand-600'
            }`}
          >
            {f}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard className="p-16 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Calendar size={28} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No appointments</h3>
          <p className="text-sm text-slate-400 mt-1 mb-6">Book your first appointment with a doctor</p>
          <PremiumButton icon={Plus} onClick={() => setShowBookModal(true)}>Book Now</PremiumButton>
        </GlassCard>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
          {filtered.map((appt) => {
            const id = appt._id || appt.id || appt.appointment_id;
            const status = normalizeStatus(appt.status);
            const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.booked;
            const canCancel = ['booked', 'confirmed'].includes(status);
            return (
              <motion.div key={id} variants={itemVariants}>
                <GlassCard className="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-100 to-cyan-100 flex items-center justify-center shrink-0">
                    <Stethoscope size={24} className="text-brand-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                              <h3 className="text-base font-bold text-slate-900">
                      {appt.doctor_name || 'Doctor'}
                    </h3>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusCfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                    </div>
                    {appt.specialization && (
                      <p className="text-sm text-brand-600 font-medium mb-2">{appt.specialization}</p>
                    )}
                    <div className="flex items-center gap-4 flex-wrap text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {appt.appointment_date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {appt.time_slot}
                      </span>
                      {appt.reason && (
                        <span className="text-slate-400 italic truncate max-w-[200px]">
                          "{appt.reason}"
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {canCancel && (
                    <button
                      onClick={() => handleCancel(appt.appointment_id || appt.id)}
                      disabled={cancellingId === (appt.appointment_id || appt.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50 shrink-0"
                    >
                      {cancellingId === appt.appointment_id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <X size={14} />
                      )}
                      Cancel
                    </button>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Book Appointment Modal */}
      <AnimatePresence>
        {showBookModal && (
          <BookAppointmentModal
            onClose={() => setShowBookModal(false)}
            onSuccess={onBookSuccess}
            preselectedDoctor={preSelectDoctor}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Book Appointment Modal ─────────────────────────────────────────────────

function BookAppointmentModal({ onClose, onSuccess, preselectedDoctor }) {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(preselectedDoctor || null);
  const [form, setForm] = useState({ appointment_date: '', time_slot: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedDoctor) {
      setSelectedDoctor(preselectedDoctor);
    }
  }, [preselectedDoctor]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await doctorsApi.list();
        const payload = res.data;
        setDoctors(Array.isArray(payload) ? payload : payload.doctors || []);
      } catch {
        setDoctors([]);
      } finally {
        setDoctorsLoading(false);
      }
    };
    load();
  }, []);

  const filteredDoctors = doctors.filter(d =>
    !search ||
    (d.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.specialization || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) { setError('Please select a doctor'); return; }
    if (!form.appointment_date) { setError('Please select a date'); return; }
    if (!form.time_slot) { setError('Please select a time slot'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await appointmentsApi.create({
        doctor_id: selectedDoctor._id || selectedDoctor.id,
        appointment_date: form.appointment_date,
        time_slot: form.time_slot,
        reason: form.reason,
      });
      const data = res.data || {};
      onSuccess({
        id: data._id || data.id || Math.random().toString(),
        appointment_id: data.appointment_id || data.id || 'APT' + Math.floor(Math.random() * 90000 + 10000),
        doctor_name: selectedDoctor.full_name || data.doctor_name,
        specialization: selectedDoctor.specialization || data.specialization,
        appointment_date: data.appointment_date || form.appointment_date,
        time_slot: data.time_slot || form.time_slot,
        reason: data.reason || form.reason,
        status: data.status || 'Booked',
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-6 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Book Appointment</h2>
            <p className="text-sm text-slate-500 mt-0.5">Select a doctor and time slot</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Doctor Search */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Select Doctor</label>
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or specialization..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {doctorsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                </div>
              ) : filteredDoctors.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No doctors found</p>
              ) : (
                filteredDoctors.map(doc => {
                  const docId = doc._id || doc.id;
                  const isSelected = (selectedDoctor?._id || selectedDoctor?.id) === docId;
                  return (
                    <div
                      key={docId}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer border transition-all ${
                        isSelected
                          ? 'border-brand-300 bg-brand-50 shadow-sm'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-100 to-cyan-100 flex items-center justify-center shrink-0">
                        <User size={18} className="text-brand-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900">{doc.full_name || 'Doctor'}</p>
                        <p className="text-xs text-slate-500">{doc.specialization} · {doc.experience}yr exp</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-brand-600">₹{doc.consultation_fee || 500}</p>
                        <p className="text-xs text-slate-400">fee</p>
                      </div>
                      {isSelected && <CheckCircle size={20} className="text-brand-500 shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Appointment Date</label>
              <input
                type="date"
                value={form.appointment_date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm(f => ({ ...f, appointment_date: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Time Slot</label>
              <select
                value={form.time_slot}
                onChange={e => setForm(f => ({ ...f, time_slot: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 bg-white"
              >
                <option value="">Select time</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Reason for Visit <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="Describe your symptoms or reason..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

