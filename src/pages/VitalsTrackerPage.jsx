import React, { useState, useEffect, useCallback } from 'react';
import { vitalsApi } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { PremiumButton } from '../components/ui/PremiumButton';
import {
  Heart, Thermometer, Wind, Activity, Plus, TrendingUp,
  TrendingDown, Minus, Clock, CheckCircle, X, AlertCircle,
  Loader2
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

// ─── Helper: status classifier ──────────────────────────────────────────────
const getHeartRateStatus = (hr) => {
  if (!hr) return null;
  if (hr < 60) return { label: 'Low', color: 'text-blue-600', bg: 'bg-blue-50' };
  if (hr <= 100) return { label: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  return { label: 'High', color: 'text-red-600', bg: 'bg-red-50' };
};
const getOxygenStatus = (o) => {
  if (!o) return null;
  if (o >= 95) return { label: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  if (o >= 90) return { label: 'Mild Low', color: 'text-amber-600', bg: 'bg-amber-50' };
  return { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50' };
};
const getTempStatus = (t) => {
  if (!t) return null;
  if (t < 36.1) return { label: 'Low', color: 'text-blue-600', bg: 'bg-blue-50' };
  if (t <= 37.2) return { label: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  if (t <= 38) return { label: 'Mild Fever', color: 'text-amber-600', bg: 'bg-amber-50' };
  return { label: 'Fever', color: 'text-red-600', bg: 'bg-red-50' };
};

const formatDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleString('en-IN', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};


const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="font-bold text-slate-800">{payload[0]?.value} {payload[0]?.unit || ''}</p>
    </div>
  );
};

export default function VitalsTrackerPage() {
  const [history, setHistory] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeChart, setActiveChart] = useState('heart_rate');
  const [form, setForm] = useState({
    heart_rate: '',
    blood_pressure: '',
    temperature: '',
    oxygen: '',
  });

  const fetchVitals = useCallback(async () => {
    try {
      const res = await vitalsApi.getHistory();
      const data = res.data?.data || res.data || {};
      const vitals = data.vitals || [];
      setHistory(vitals);
      setLatest(data.latest || (vitals.length > 0 ? vitals[0] : null));
    } catch {
      setHistory([]);
      setLatest(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVitals(); }, [fetchVitals]);

  const handleLog = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      heart_rate: form.heart_rate ? parseInt(form.heart_rate) : null,
      blood_pressure: form.blood_pressure || null,
      temperature: form.temperature ? parseFloat(form.temperature) : null,
      oxygen: form.oxygen ? parseInt(form.oxygen) : null,
    };
    try {
      await vitalsApi.log(payload);
    } catch { /* store locally if backend offline */ }
    const newEntry = {
      id: `v${Date.now()}`,
      ...payload,
      recorded_at: new Date().toISOString(),
    };
    setHistory(prev => [newEntry, ...prev]);
    setLatest(newEntry);
    setForm({ heart_rate: '', blood_pressure: '', temperature: '', oxygen: '' });
    setSaveSuccess(true);
    setSaving(false);
    setTimeout(() => { setSaveSuccess(false); setShowLogForm(false); }, 1500);
  };

  // Chart data
  const chartData = [...history].reverse().slice(-15).map(v => ({
    time: formatDate(v.recorded_at).split(',')[0],
    heart_rate: v.heart_rate,
    temperature: v.temperature,
    oxygen: v.oxygen,
  }));

  const CHART_CONFIGS = {
    heart_rate: { label: 'Heart Rate', color: '#EF4444', unit: 'BPM' },
    temperature: { label: 'Temperature', color: '#F59E0B', unit: '°C' },
    oxygen: { label: 'SpO₂', color: '#06B6D4', unit: '%' },
  };

  const hrStatus = getHeartRateStatus(latest?.heart_rate);
  const o2Status = getOxygenStatus(latest?.oxygen);
  const tmpStatus = getTempStatus(latest?.temperature);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } } };

  return (
    <div className="pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Activity className="text-brand-500" size={28} />
            Vitals Tracker
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Monitor and log your health metrics over time
          </p>
        </div>
        <PremiumButton icon={Plus} onClick={() => setShowLogForm(true)}>
          Log Vitals
        </PremiumButton>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          {/* Latest Vitals Cards */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Heart Rate */}
              <GlassCard className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <Heart size={20} className="text-red-500" fill="currentColor" />
                  </div>
                  {hrStatus && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${hrStatus.bg} ${hrStatus.color}`}>
                      {hrStatus.label}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {latest?.heart_rate ?? '—'}
                  </p>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">BPM · Heart Rate</p>
                </div>
              </GlassCard>

              {/* Blood Pressure */}
              <GlassCard className="p-5 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                  <Activity size={20} className="text-violet-500" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">
                    {latest?.blood_pressure ?? '—'}
                  </p>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">mmHg · Blood Pressure</p>
                </div>
              </GlassCard>

              {/* Temperature */}
              <GlassCard className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Thermometer size={20} className="text-amber-500" />
                  </div>
                  {tmpStatus && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${tmpStatus.bg} ${tmpStatus.color}`}>
                      {tmpStatus.label}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {latest?.temperature ?? '—'}
                  </p>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">°C · Temperature</p>
                </div>
              </GlassCard>

              {/* SpO₂ */}
              <GlassCard className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                    <Wind size={20} className="text-cyan-500" />
                  </div>
                  {o2Status && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${o2Status.bg} ${o2Status.color}`}>
                      {o2Status.label}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {latest?.oxygen != null ? `${latest.oxygen}%` : '—'}
                  </p>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">SpO₂ · Oxygen</p>
                </div>
              </GlassCard>
            </div>
          </motion.div>

          {history.length === 0 ? (
            <GlassCard className="p-16 text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Activity size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">No vitals recorded yet</h3>
              <p className="text-sm text-slate-400 mt-2">Use the Log Vitals button to add your first reading.</p>
            </GlassCard>
          ) : (
            <>
              {/* Trend Chart */}
              <motion.div variants={itemVariants}>
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp size={20} className="text-brand-500" />
                      Vitals Trend
                    </h3>
                    <div className="flex gap-2">
                      {Object.entries(CHART_CONFIGS).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => setActiveChart(key)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            activeChart === key
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey={activeChart}
                        stroke={CHART_CONFIGS[activeChart].color}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: CHART_CONFIGS[activeChart].color, strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </GlassCard>
              </motion.div>

              {/* History Table */}
              <motion.div variants={itemVariants}>
                <GlassCard className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                    <Clock size={20} className="text-slate-400" />
                    Reading History
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="pb-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Time</th>
                          <th className="pb-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">HR (BPM)</th>
                          <th className="pb-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">BP</th>
                          <th className="pb-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Temp (°C)</th>
                          <th className="pb-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">SpO₂ (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {history.slice(0, 10).map((v, idx) => (
                          <tr key={v._id || v.id || idx} className={`hover:bg-slate-50 transition-colors ${idx === 0 ? 'bg-brand-50/30' : ''}`}>
                            <td className="py-3 text-slate-500 text-xs">{formatDate(v.recorded_at)}</td>
                            <td className="py-3 text-center font-bold text-slate-800">{v.heart_rate ?? '—'}</td>
                            <td className="py-3 text-center text-slate-600">{v.blood_pressure ?? '—'}</td>
                            <td className="py-3 text-center text-slate-600">{v.temperature ?? '—'}</td>
                            <td className="py-3 text-center text-slate-600">{v.oxygen != null ? `${v.oxygen}%` : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </motion.div>
            </>
          )}
        </motion.div>
      )}

      {/* Log Vitals Modal */}
      <AnimatePresence>
        {showLogForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowLogForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Log Vitals</h2>
                  <p className="text-sm text-slate-400 mt-0.5">Record your current readings</p>
                </div>
                <button onClick={() => setShowLogForm(false)} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                  <X size={18} className="text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleLog} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      <Heart size={12} className="inline mr-1 text-red-500" />
                      Heart Rate (BPM)
                    </label>
                    <input
                      type="number"
                      min="30" max="220"
                      placeholder="e.g. 72"
                      value={form.heart_rate}
                      onChange={e => setForm(f => ({ ...f, heart_rate: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      <Activity size={12} className="inline mr-1 text-violet-500" />
                      Blood Pressure
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 120/80"
                      value={form.blood_pressure}
                      onChange={e => setForm(f => ({ ...f, blood_pressure: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      <Thermometer size={12} className="inline mr-1 text-amber-500" />
                      Temperature (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1" min="32" max="43"
                      placeholder="e.g. 36.6"
                      value={form.temperature}
                      onChange={e => setForm(f => ({ ...f, temperature: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      <Wind size={12} className="inline mr-1 text-cyan-500" />
                      SpO₂ (%)
                    </label>
                    <input
                      type="number"
                      min="70" max="100"
                      placeholder="e.g. 98"
                      value={form.oxygen}
                      onChange={e => setForm(f => ({ ...f, oxygen: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-400 text-center">Fill in at least one reading to save</p>

                <button
                  type="submit"
                  disabled={saving || saveSuccess || (!form.heart_rate && !form.blood_pressure && !form.temperature && !form.oxygen)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saveSuccess ? (
                    <><CheckCircle size={16} /> Saved!</>
                  ) : saving ? (
                    <><Loader2 size={16} className="animate-spin" /> Saving...</>
                  ) : (
                    <><Plus size={16} /> Save Vitals</>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
