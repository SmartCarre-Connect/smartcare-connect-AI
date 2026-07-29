import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, CheckCircle2, AlertTriangle, Navigation, Video, Clock3 } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { isAttendanceEligible, HOSPITAL_LOCATION } from '../utils/attendance';

const useQueryParam = () => {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search), [location.search]);
};

export default function AttendancePage() {
  const navigate = useNavigate();
  const query = useQueryParam();
  const role = query.get('role') || 'trainee';
  const [currentLocation, setCurrentLocation] = useState(null);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('We will verify whether you are inside the hospital zone before attendance can be marked.');

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('unsupported');
      setMessage('This device does not support geolocation so attendance cannot be verified.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setCurrentLocation(location);
        const result = isAttendanceEligible(location);
        setStatus(result.eligible ? 'success' : 'blocked');
        setMessage(result.reason);
      },
      () => {
        setStatus('blocked');
        setMessage('Location permission was denied. Attendance will stay unavailable until location access is granted.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const result = useMemo(() => isAttendanceEligible(currentLocation), [currentLocation]);

  return (
    <div className="min-h-screen bg-surface px-4 py-10 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-glass backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">GPS Attendance</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Attendance for {role}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">Attendance is only accepted when the device is within the hospital zone. Outside the zone, the check is blocked and the attendance is not considered valid.</p>
            </div>
            <button onClick={() => navigate('/hospital-map')} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
              <Navigation className="h-4 w-4" />
              View hospital map
            </button>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <GlassCard className="!p-8">
            <div className="flex items-start gap-3">
              <div className={`rounded-2xl p-3 ${result.eligible ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                {result.eligible ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Current status</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MapPin className="h-4 w-4" />
                Verification zone
              </div>
              <p className="mt-2 text-sm text-slate-600">{HOSPITAL_LOCATION.name} • radius {HOSPITAL_LOCATION.radiusMeters}m</p>
              {currentLocation ? (
                <p className="mt-2 text-sm font-medium text-slate-700">Your coordinates: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}</p>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Waiting for your device location…</p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => window.location.reload()} className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Re-check location</button>
              <button onClick={() => navigate('/hospital-map')} className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white">Open hospital guide</button>
            </div>
          </GlassCard>

          <GlassCard className="!p-8">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              <Video className="h-4 w-4" />
              Quick guide
            </div>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">How the attendance flow works</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex gap-2"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />Your device must be inside the hospital zone before attendance is accepted.</li>
              <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />If you are outside the hospital, attendance is blocked and the system marks it as invalid.</li>
              <li className="flex gap-2"><Navigation className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />Use the hospital map to reach the right departments and sections quickly.</li>
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
