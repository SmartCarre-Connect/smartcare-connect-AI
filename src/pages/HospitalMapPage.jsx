import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, MapPin, Minus, Plus, Search, Navigation, Clock3, Stethoscope, Sparkles, Building2, Car, Droplets, FlaskConical, BedDouble, HeartPulse, ScanLine, Pill, ArrowUp } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { adminApi } from '../services/api';

const DEFAULT_FLOORS = ['Ground', 'First', 'Second', 'Third', 'Basement'];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Simple conversions for pixel to meters (tweak as needed)
const PX_TO_METERS = 0.5; // 1 px = 0.5 meter (approx for this schematic map)
const WALKING_SPEED_M_PER_MIN = 80; // approx 80 m/min (~1.33 m/s)
const formatDistance = (px) => `${Math.round((px * PX_TO_METERS))} m`;
const formatTime = (minutes) => `${minutes} min`;

export default function HospitalMapPage() {
  const mapRef = useRef(null);
  const [viewportSize, setViewportSize] = useState({ width: 900, height: 620 });
  // Keep a selectedDepartment state used by UI (backwards compatible with previous code)
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [floor, setFloor] = useState('Ground');
  const [floors, setFloors] = useState(DEFAULT_FLOORS);
  const [locations, setLocations] = useState([]); // loaded from backend
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [view, setView] = useState({ scale: 1, offsetX: 0, offsetY: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState(null);
  const [route, setRoute] = useState(null);
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });

  // Fallback static departments (used if backend data not available)
  const DEPARTMENTS = useMemo(() => [
    { id: 'reception', name: 'Reception', floor: 'Ground', x: 70, y: 70, width: 120, height: 70, color: '#0f766e', description: 'Welcome desk, visitor registration, and wayfinding support.', doctors: ['Front Desk Team'], hours: '24/7', waitingTime: '5 min', category: 'Administration', point: { x: 130, y: 105 } },
    { id: 'emergency', name: 'Emergency', floor: 'Ground', x: 70, y: 180, width: 140, height: 90, color: '#dc2626', description: 'Trauma care, urgent intake, and immediate stabilization.', doctors: ['Dr. Asha Mehta', 'Dr. Rahul Verma'], hours: '24/7', waitingTime: '12 min', category: 'Critical Care', point: { x: 140, y: 225 } },
    { id: 'cardiology', name: 'Cardiology', floor: 'First', x: 240, y: 80, width: 120, height: 70, color: '#2563eb', description: 'Heart screening, ECG, and specialist consultations.', doctors: ['Dr. N. Rao', 'Dr. S. Shah'], hours: '08:00-20:00', waitingTime: '8 min', category: 'Specialty', point: { x: 300, y: 115 } },
    { id: 'pharmacy', name: 'Pharmacy', floor: 'Ground', x: 500, y: 70, width: 120, height: 70, color: '#16a34a', description: 'Prescription pickup, medicine counseling, and discharge meds.', doctors: ['Pharmacist R. Mehra'], hours: '08:00-22:00', waitingTime: '7 min', category: 'Support', point: { x: 560, y: 105 } },
    { id: 'laboratory', name: 'Laboratory', floor: 'First', x: 660, y: 80, width: 120, height: 70, color: '#0891b2', description: 'Pathology, blood tests, and specimen collection.', doctors: ['Dr. S. Malhotra'], hours: '08:00-20:00', waitingTime: '6 min', category: 'Diagnostics', point: { x: 720, y: 115 } },
    { id: 'operation-theatre', name: 'Operation Theatre', floor: 'Third', x: 430, y: 220, width: 140, height: 80, color: '#1d4ed8', description: 'Sterile surgical suites and pre-op support.', doctors: ['Dr. Y. Patel', 'Dr. K. Das'], hours: '24/7', waitingTime: '4 min', category: 'Surgery', point: { x: 500, y: 260 } },
    { id: 'cafeteria', name: 'Cafeteria', floor: 'Ground', x: 650, y: 70, width: 120, height: 70, color: '#f59e0b', description: 'Refreshments, snacks, and family seating.', doctors: ['Dining Team'], hours: '06:00-22:00', waitingTime: '2 min', category: 'Support', point: { x: 710, y: 105 } },
  ], []);

  const departmentIcons = useMemo(() => ({
    Reception: Building2,
    Emergency: HeartPulse,
    Cardiology: Stethoscope,
    Neurology: Stethoscope,
    Radiology: ScanLine,
    MRI: ScanLine,
    'CT Scan': ScanLine,
    ICU: HeartPulse,
    Pharmacy: Pill,
    Billing: Building2,
    Parking: Car,
    Lift: ArrowUp,
    Washroom: Building2,
    'Blood Bank': Droplets,
    Laboratory: FlaskConical,
    'Operation Theatre': BedDouble,
    Cafeteria: Building2,
  }), []);

  useEffect(() => {
    const updateSize = () => {
      if (mapRef.current) {
        const bounds = mapRef.current.getBoundingClientRect();
        setViewportSize({ width: bounds.width || 900, height: bounds.height || 620 });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Load locations from backend and merge with fallback DEPARTMENTS by name
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    adminApi.listLocations().then((res) => {
      if (!mounted) return;
      const payload = res.data || [];
      if (Array.isArray(payload) && payload.length > 0) {
        // merge by name (case-insensitive)
        const merged = DEPARTMENTS.map((d) => {
          const found = payload.find((p) => (p.name || '').toLowerCase() === (d.name || '').toLowerCase());
          if (found) {
            return { ...d, description: found.description || d.description, category: found.category || d.category, floor: found.floor || d.floor };
          }
          return d;
        });
        setLocations(merged);
      } else {
        setLocations(DEPARTMENTS);
      }
    }).catch((err) => {
      console.warn('Could not load hospital locations, using fallback', err);
      setLocations(DEPARTMENTS);
    }).finally(() => setLoading(false));

    return () => { mounted = false; };
  }, []);

  // Initialize defaults when locations available
  useEffect(() => {
    if (!locations || locations.length === 0) return;
    if (!selectedDepartment) {
      const rec = locations.find((d) => (d.name || '').toLowerCase() === 'reception') || locations[0];
      const ph = locations.find((d) => (d.name || '').toLowerCase() === 'pharmacy') || locations[1] || locations[0];
      setSelectedDepartment(rec);
      setCurrentLocation(rec);
      setDestination(ph);
      setFloor(rec.floor || floor);
    }
  }, [locations]);

  useEffect(() => {
    if (!searchTerm) return;
    const q = searchTerm.trim().toLowerCase();
    const src = locations && locations.length ? locations : DEPARTMENTS;
    const matches = src.filter((dept) => dept.floor === floor && (dept.name || '').toLowerCase().includes(q));
    if (matches[0]) {
      setSelectedDepartment(matches[0]);
      setFloor(matches[0].floor);
      setView((prev) => ({ ...prev, scale: 1.4, offsetX: viewportSize.width / 2 - (matches[0].x + matches[0].width / 2) * 1.4, offsetY: viewportSize.height / 2 - (matches[0].y + matches[0].height / 2) * 1.4 }));
    }
  }, [searchTerm, floor, viewportSize.height, viewportSize.width]);

  const floorDepartments = useMemo(() => (locations || DEPARTMENTS).filter((dept) => dept.floor === floor), [locations, floor]);
  const selectedDepartmentInfo = useMemo(() => selectedDepartment, [selectedDepartment]);

  const routePoints = useMemo(() => {
    if (!currentLocation || !destination) return [];
    const start = currentLocation.point;
    const end = destination.point;
    const mid = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - 30 };
    return [start, mid, end];
  }, [currentLocation, destination]);

  // Precompute SVG path for route if available
  const pathD = routePoints.length > 2 ? `M ${routePoints[0].x} ${routePoints[0].y} Q ${routePoints[1].x} ${routePoints[1].y} ${routePoints[2].x} ${routePoints[2].y}` : null;

  const routeDistance = useMemo(() => {
    if (routePoints.length < 2) return 0;
    const [start, , end] = routePoints;
    return Math.round(Math.hypot(end.x - start.x, end.y - start.y));
  }, [routePoints]);

  const routeTime = useMemo(() => Math.max(4, Math.round(routeDistance / 90)), [routeDistance]);

  const nearbyDepartments = useMemo(() => {
    if (!selectedDepartment) return [];
    const list = (locations || DEPARTMENTS).filter((dept) => dept.floor === selectedDepartment.floor && dept.id !== selectedDepartment.id);
    return list.filter((dept) => Math.hypot(dept.point.x - selectedDepartment.point.x, dept.point.y - selectedDepartment.point.y) < 180).slice(0, 4);
  }, [selectedDepartment, locations]);

  const handleWheel = (event) => {
    event.preventDefault();
    const factor = event.deltaY > 0 ? 0.9 : 1.1;
    setView((prev) => ({ ...prev, scale: clamp(prev.scale * factor, 0.8, 2.4) }));
  };

  const handlePointerDown = (event) => {
    setDragging(true);
    setDragOrigin({ x: event.clientX - view.offsetX, y: event.clientY - view.offsetY });
  };

  const handlePointerMove = (event) => {
    if (!dragging) return;
    setView((prev) => ({
      ...prev,
      offsetX: event.clientX - dragOrigin.x,
      offsetY: event.clientY - dragOrigin.y,
    }));
  };

  const handlePointerUp = () => setDragging(false);
  const resetView = () => setView({ scale: 1, offsetX: 0, offsetY: 0 });

  const handleSelectDepartment = (dept) => {
    setSelectedDepartment(dept);
    setFloor(dept.floor);
    setDestination(dept);
    setView((prev) => ({ ...prev, scale: 1.4, offsetX: viewportSize.width / 2 - (dept.x + dept.width / 2) * 1.4, offsetY: viewportSize.height / 2 - (dept.y + dept.height / 2) * 1.4 }));
  };

  const handleNavigateHere = (dept) => {
    setDestination(dept);
    setSelectedDepartment(dept);
    setFloor(dept.floor);
  };

  return (
    <div className="min-h-screen bg-surface px-3 py-6 lg:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-glass backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Indoor Navigation</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">SmartCare Hospital Navigation</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">Locate departments instantly, zoom into corridors, and follow an animated route inside the hospital.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={resetView} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">Reset View</button>
              <button onClick={() => setView((prev) => ({ ...prev, scale: clamp(prev.scale + 0.2, 0.8, 2.4) }))} className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm"><Plus size={16} /></button>
              <button onClick={() => setView((prev) => ({ ...prev, scale: clamp(prev.scale - 0.2, 0.8, 2.4) }))} className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm"><Minus size={16} /></button>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <GlassCard className="!p-0 overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Compass size={16} className="text-brand-500" />
                  Interactive Hospital Map
                </div>
                <div className="flex flex-wrap gap-2">
                  {floors.map((item) => {
                    const Icon = floorIcons[item] || Building2;
                    return (
                      <button
                        key={item}
                        onClick={() => setFloor(item)}
                        className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${floor === item ? 'bg-sky-500/10 text-sky-500' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        <span className="mr-1.5 inline-flex"><Icon size={14} /></span>{item}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search departments like Pharmacy, MRI, Lab..." className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-800 shadow-sm outline-none ring-0" />
              </div>

              <div ref={mapRef} className="relative h-[560px] overflow-hidden rounded-[24px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.15),_transparent_30%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_100%)]">
                <svg viewBox="0 0 800 420" className="h-full w-full cursor-grab" onWheel={handleWheel} onMouseDown={handlePointerDown} onMouseMove={handlePointerMove} onMouseUp={handlePointerUp} onMouseLeave={handlePointerUp} style={{ touchAction: 'none' }}>
                  <rect x="0" y="0" width="800" height="420" fill="transparent" />
                    { /* Apply pan/zoom transform */ }
                    <g transform={`translate(${view.offsetX},${view.offsetY}) scale(${view.scale})`}>
                    <rect x="30" y="30" width="740" height="360" rx="28" fill="#ffffff" stroke="#dbe7ff" strokeWidth="2" />
                    <rect x="70" y="60" width="660" height="320" rx="24" fill="#f7fbff" stroke="#d8e5ff" strokeWidth="2" />
                    <rect x="100" y="90" width="240" height="250" rx="20" fill="#eef6ff" stroke="#c8daf9" strokeWidth="2" />
                    <rect x="360" y="90" width="300" height="250" rx="20" fill="#f3f6ff" stroke="#c8daf9" strokeWidth="2" />
                    <rect x="680" y="90" width="60" height="250" rx="20" fill="#eef5ff" stroke="#c8daf9" strokeWidth="2" />
                    <rect x="110" y="110" width="220" height="210" rx="16" fill="#ffffff" stroke="#d0defd" strokeWidth="2" />
                    <rect x="370" y="110" width="280" height="210" rx="16" fill="#ffffff" stroke="#d0defd" strokeWidth="2" />
                    <line x1="340" y1="90" x2="340" y2="340" stroke="#b6c8f0" strokeWidth="6" strokeLinecap="round" />
                    <line x1="650" y1="90" x2="650" y2="340" stroke="#b6c8f0" strokeWidth="6" strokeLinecap="round" />
                    <line x1="110" y1="320" x2="680" y2="320" stroke="#cde0ff" strokeWidth="8" strokeLinecap="round" />
                    <line x1="110" y1="120" x2="680" y2="120" stroke="#dceaff" strokeWidth="4" strokeLinecap="round" />
                    <line x1="110" y1="170" x2="680" y2="170" stroke="#dceaff" strokeWidth="4" strokeLinecap="round" />
                    <line x1="110" y1="220" x2="680" y2="220" stroke="#dceaff" strokeWidth="4" strokeLinecap="round" />
                    <line x1="110" y1="270" x2="680" y2="270" stroke="#dceaff" strokeWidth="4" strokeLinecap="round" />
                    <text x="110" y="55" fontSize="16" fill="#64748b" fontWeight="600">{floor} Floor • Indoor Wayfinding</text>

                    {floorDepartments.map((dept) => {
                      const isSelected = selectedDepartment?.id === dept.id;
                      const isCurrent = currentLocation?.id === dept.id;
                      const isDestination = destination?.id === dept.id;
                      return (
                        <g key={dept.id} onClick={() => handleSelectDepartment(dept)} style={{ cursor: 'pointer' }}>
                          <rect x={dept.x} y={dept.y} width={dept.width} height={dept.height} rx="16" fill={isSelected ? '#dbeafe' : '#ffffff'} stroke={dept.color} strokeWidth={isSelected ? '3' : '1.5'} />
                          <rect x={dept.x + 6} y={dept.y + 6} width={dept.width - 12} height={dept.height - 12} rx="12" fill={isSelected ? '#eff6ff' : '#f8fbff'} stroke="transparent" />
                          <circle cx={dept.x + 18} cy={dept.y + 20} r="8" fill={dept.color} />
                          <text x={dept.x + 34} y={dept.y + 25} fontSize="12" fill="#0f172a" fontWeight="700">{dept.name}</text>
                          <text x={dept.x + 10} y={dept.y + 46} fontSize="10" fill="#64748b">{dept.category}</text>
                          {isCurrent && <circle cx={dept.x + dept.width - 24} cy={dept.y + 20} r="7" fill="#0f766e" />}
                          {isDestination && <circle cx={dept.x + dept.width - 24} cy={dept.y + 40} r="7" fill="#2563eb" />}
                        </g>
                      );
                    })}

                    {pathD && (
                      <g>
                        <path d={pathD} fill="none" stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" />
                        <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 8" style={{ animation: 'dash 1.6s linear infinite' }} />
                        <circle cx={routePoints[0].x} cy={routePoints[0].y} r="7" fill="#0f766e" />
                        <circle cx={routePoints[2].x} cy={routePoints[2].y} r="7" fill="#2563eb" />
                      </g>
                    )}
                  </g>
                </svg>
              </div>
            </div>
          </GlassCard>

          <div className="flex flex-col gap-4">
            <GlassCard className="!p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Current Route</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">{currentLocation?.name} → {destination?.name}</h2>
                </div>
                <div className="rounded-2xl bg-brand-50 p-2 text-brand-700"><Navigation size={18} /></div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Distance</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{formatDistance(routeDistance || 0)}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Walking Time</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{formatTime(routeTime || 0)}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Floor</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{destination?.floor || floor}</div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="!p-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                <MapPin size={16} className="text-brand-500" />
                Department Detail
              </div>
              {selectedDepartmentInfo ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{selectedDepartmentInfo.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{selectedDepartmentInfo.description}</p>
                    </div>
                    <div className="rounded-2xl bg-brand-50 p-2 text-brand-700">
                      {React.createElement(departmentIcons[selectedDepartmentInfo.name] || Building2, { size: 18 })}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">
                      <div className="mb-1 flex items-center gap-1.5 font-semibold text-slate-900"><Stethoscope size={14} className="text-brand-500" />Doctors Available</div>
                      {selectedDepartmentInfo.doctors.join(', ')}
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">
                      <div className="mb-1 flex items-center gap-1.5 font-semibold text-slate-900"><Clock3 size={14} className="text-brand-500" />Working Hours</div>
                      {selectedDepartmentInfo.hours}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">
                    <div className="mb-1 flex items-center gap-1.5 font-semibold text-slate-900"><Compass size={14} className="text-brand-500" />Current Waiting Time</div>
                    {selectedDepartmentInfo.waitingTime}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleNavigateHere(selectedDepartmentInfo)} className="flex-1 rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm">Navigate Here</button>
                    <button onClick={() => setCurrentLocation(selectedDepartmentInfo)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">Set Current</button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">Select a department to see its details.</div>
              )}
            </GlassCard>

            <GlassCard className="!p-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                <Sparkles size={16} className="text-brand-500" />
                Nearby Departments
              </div>
              <div className="mt-3 space-y-2">
                {nearbyDepartments.length > 0 ? nearbyDepartments.map((dept) => (
                  <button key={dept.id} onClick={() => handleSelectDepartment(dept)} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 transition hover:border-brand-200 hover:bg-brand-50">
                    <span className="font-semibold">{dept.name}</span>
                    <span className="text-xs text-slate-500">{dept.floor}</span>
                  </button>
                )) : <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">No nearby departments available on this floor.</div>}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
      <style>{`@keyframes dash { to { stroke-dashoffset: -100; } }`}</style>
    </div>
  );
}
