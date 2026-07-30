import React, { useState } from 'react';
import { Language, UserProfile } from '../types';
import { translations } from '../data/translations';
import {
  Users,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  Building2,
  MapPin,
  GraduationCap,
  Award,
  Stethoscope,
  Send,
  Plus,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface RoleDashboardsProps {
  currentLanguage: Language;
  currentUser: UserProfile;
}

export const DoctorWorkspace: React.FC<RoleDashboardsProps> = ({ currentLanguage, currentUser }) => {
  const t = translations[currentLanguage];
  const [docStatus, setDocStatus] = useState<'available' | 'in_opd' | 'emergency' | 'off_duty'>('in_opd');
  const [prescriptionPatient, setPrescriptionPatient] = useState('Rahul Sharma');
  const [rxNotes, setRxNotes] = useState('Tab. Paracetamol 650mg BD x 5 days, Cap. Amoxicillin 500mg TDS');
  const [savedRx, setSavedRx] = useState<string[]>([]);

  const patientQueue = [
    { token: 'OPD-CAR-12', name: 'Rahul Sharma', age: 34, symptoms: 'Chest discomfort & palpitation', status: 'In Consultation' },
    { token: 'OPD-CAR-14', name: 'Priya Deshmukh', age: 28, symptoms: 'Routine Cardiac Checkup', status: 'Waiting' },
    { token: 'OPD-CAR-15', name: 'Sanjay Kulkarni', age: 52, symptoms: 'High BP & Dizziness', status: 'Waiting' },
    { token: 'OPD-CAR-18', name: 'Sunita Patil', age: 45, symptoms: 'ECG Follow up', status: 'Waiting' },
  ];

  const handleAddPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxNotes) return;
    setSavedRx((prev) => [`[${new Date().toLocaleTimeString()}] ${prescriptionPatient}: ${rxNotes}`, ...prev]);
    setRxNotes('');
    alert('Digital e-Prescription saved and sent to Pharmacy!');
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-900/60 via-slate-900 to-slate-900 border border-teal-500/30 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-mono mb-2">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor Portal Workspace</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              Welcome, {currentUser.name}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Specialization: {currentUser.specialization || 'Cardiology'} • Room {currentUser.opdRoom || 'OPD-204'}
            </p>
          </div>

          {/* Status Switcher */}
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-mono pl-2">Status:</span>
            <select
              value={docStatus}
              onChange={(e) => setDocStatus(e.target.value as any)}
              className="bg-slate-900 text-teal-300 border border-teal-500/30 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
            >
              <option value="in_opd">🟢 In OPD Consultation</option>
              <option value="available">🟢 Available</option>
              <option value="emergency">🔴 Emergency ICU</option>
              <option value="off_duty">⚪ Off Duty</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Today OPD Queue */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-400" />
              <span>Today's OPD Patient Queue</span>
            </span>
            <span className="text-xs font-mono text-teal-400 font-bold bg-teal-500/10 px-3 py-1 rounded-full">
              4 Patients Remaining
            </span>
          </h3>

          <div className="space-y-3">
            {patientQueue.map((pt, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs hover:border-teal-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-300">{pt.token}</span>
                    <span className="font-bold text-white text-sm">{pt.name} ({pt.age} yrs)</span>
                  </div>
                  <p className="text-slate-400 mt-1">{pt.symptoms}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase font-mono ${
                    pt.status === 'In Consultation'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {pt.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Prescription Generator */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <FileText className="w-5 h-5 text-teal-400" />
            <span>Write Digital e-Prescription</span>
          </h3>

          <form onSubmit={handleAddPrescription} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Patient</label>
              <select
                value={prescriptionPatient}
                onChange={(e) => setPrescriptionPatient(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
              >
                {patientQueue.map((p) => (
                  <option key={p.token} value={p.name}>{p.name} ({p.token})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Medicines & Dosage Instructions</label>
              <textarea
                rows={4}
                value={rxNotes}
                onChange={(e) => setRxNotes(e.target.value)}
                placeholder="Enter Rx medicines, timing, and advice..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Sign & Send Rx to Pharmacy</span>
            </button>
          </form>

          {savedRx.length > 0 && (
            <div className="pt-2 space-y-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300">Issued Prescriptions ({savedRx.length})</span>
              {savedRx.map((rx, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950 text-[11px] text-teal-300 font-mono">
                  {rx}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const HrWorkspace: React.FC<RoleDashboardsProps> = ({ currentLanguage, currentUser }) => {
  const [leaves, setLeaves] = useState([
    { id: 1, name: 'Dr. Sameer Joshi', dept: 'Orthopedics', date: '01 Aug - 04 Aug', reason: 'Medical Conference', status: 'Pending' },
    { id: 2, name: 'Pooja Naik (Nurse)', dept: 'ICU Ward 3', date: '02 Aug', reason: 'Personal Emergency', status: 'Pending' },
  ]);

  const handleLeaveAction = (id: number, approved: boolean) => {
    setLeaves((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: approved ? 'Approved' : 'Rejected' } : item))
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 border border-blue-500/30 rounded-3xl p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono mb-2">
          <Building2 className="w-3.5 h-3.5" />
          <span>HR Management & Staff Operations Portal</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white">HR Admin: {currentUser.name}</h2>
        <p className="text-xs text-slate-300 mt-1">Employee ID: {currentUser.employeeId || 'HR-ADM-904'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Leave Requests */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-400" />
              <span>Pending Staff Leave Approvals</span>
            </span>
          </h3>

          <div className="space-y-3">
            {leaves.map((l) => (
              <div key={l.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white text-sm block">{l.name} ({l.dept})</span>
                  <span className="text-slate-400 block mt-0.5">{l.date} • Reason: {l.reason}</span>
                </div>
                {l.status === 'Pending' ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleLeaveAction(l.id, true)}
                      className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLeaveAction(l.id, false)}
                      className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${l.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                    {l.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Roster & Attendance Overview */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Today's Staff Shift Duty</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Morning OPD Shift</span>
                <span className="text-slate-400">08:00 AM - 04:00 PM</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold">18 Doctors Active</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Night Emergency Shift</span>
                <span className="text-slate-400">08:00 PM - 08:00 AM</span>
              </div>
              <span className="font-mono text-teal-300 font-bold">6 Trauma On-Call</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TraineeWorkspace: React.FC<RoleDashboardsProps> = ({ currentLanguage, currentUser }) => {
  const [checkedIn, setCheckedIn] = useState(false);

  const handleGpsCheckIn = () => {
    setCheckedIn(true);
    alert('GPS Location Verified: SmartCare Central Hospital Campus! Attendance Marked.');
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono mb-2">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Medical Intern / Trainee Portal</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white">Trainee: {currentUser.name}</h2>
        <p className="text-xs text-slate-300 mt-1">
          Institute: {currentUser.institute || 'Grant Govt Medical College'} • Supervisor: {currentUser.supervisorDoctor || 'Dr. Anjali Deshmukh'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* GPS Attendance */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <MapPin className="w-5 h-5 text-teal-400" />
            <span>GPS Campus Attendance</span>
          </h3>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Geofence Location:</span>
              <span className="font-bold text-white">SmartCare Ward #3</span>
            </div>

            {checkedIn ? (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Attendance Verified for Today!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGpsCheckIn}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                <span>Mark GPS Hospital Attendance</span>
              </button>
            )}
          </div>
        </div>

        {/* Schedule & Clinical Rotations */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Award className="w-5 h-5 text-teal-400" />
            <span>Assigned Clinical Rotation Schedule</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm block">Cardiology OPD & ECG Rounds</span>
                <span className="text-slate-400">Supervisor: Dr. Anjali Deshmukh</span>
              </div>
              <span className="font-mono text-teal-300 font-bold">09:00 AM - 01:00 PM</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm block">Trauma & Emergency Care Procedures</span>
                <span className="text-slate-400">Supervisor: Dr. Vikram Malhotra</span>
              </div>
              <span className="font-mono text-amber-300 font-bold">02:00 PM - 05:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
