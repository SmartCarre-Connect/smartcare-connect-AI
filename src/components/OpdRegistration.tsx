import React, { useState } from 'react';
import { Language, OpdSlip, UserProfile } from '../types';
import { mockDoctors } from '../data/mockData';
import { translations } from '../data/translations';
import {
  FileText,
  QrCode,
  Printer,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Building,
  Sparkles,
  Award,
} from 'lucide-react';

interface OpdRegistrationProps {
  currentLanguage: Language;
  currentUser: UserProfile;
}

export const OpdRegistration: React.FC<OpdRegistrationProps> = ({
  currentLanguage,
  currentUser,
}) => {
  const t = translations[currentLanguage];

  const [patientName, setPatientName] = useState(currentUser.name || 'Rahul Sharma');
  const [patientAge, setPatientAge] = useState(32);
  const [patientGender, setPatientGender] = useState('Male');
  const [patientPhone, setPatientPhone] = useState(currentUser.phone || '9876543210');
  const [bloodGroup, setBloodGroup] = useState(currentUser.bloodGroup || 'O+');
  const [selectedDept, setSelectedDept] = useState('Cardiology');
  const [selectedDoctorId, setSelectedDoctorId] = useState(mockDoctors[0].id);
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:00 AM');
  const [symptoms, setSymptoms] = useState('Mild chest discomfort & fatigue during morning exercise');
  const [scheme, setScheme] = useState('Ayushman Bharat (PM-JAY)');

  const [activeSlip, setActiveSlip] = useState<OpdSlip | null>(null);
  const [savedSlips, setSavedSlips] = useState<OpdSlip[]>([]);

  // Filter doctors based on selected department
  const filteredDoctors = mockDoctors.filter(
    (d) => d.specialization.toLowerCase().includes(selectedDept.toLowerCase()) || selectedDept === 'All'
  );

  const selectedDoctorObj = mockDoctors.find((d) => d.id === selectedDoctorId) || mockDoctors[0];

  const handleGenerateSlip = (e: React.FormEvent) => {
    e.preventDefault();

    const deptPrefix = selectedDept.slice(0, 3).toUpperCase();
    const tokenSeq = Math.floor(10 + Math.random() * 85);
    const tokenNum = `OPD-${deptPrefix}-${tokenSeq}`;
    const uhid = `UHID-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const newSlip: OpdSlip = {
      tokenNumber: tokenNum,
      patientUhid: uhid,
      patientName,
      patientAge: Number(patientAge),
      patientGender,
      patientPhone,
      bloodGroup,
      department: selectedDept,
      doctorName: selectedDoctorObj.name,
      opdRoom: selectedDoctorObj.opdRoom,
      appointmentDate,
      timeSlot,
      symptoms,
      scheme,
      paymentStatus: scheme.includes('Cash') ? 'paid' : 'covered_under_scheme',
      fee: scheme.includes('Cash') ? selectedDoctorObj.fee : 0,
      qrCodeValue: `https://smartcare.org/opd/verify?token=${tokenNum}&uhid=${uhid}`,
      createdTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setActiveSlip(newSlip);
    setSavedSlips((prev) => [newSlip, ...prev]);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold mb-2 border border-sky-200">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Smartcare Digital OPD Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
            {t.opdTitle}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            {t.opdSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs rounded-full">
            Kiosk Instant Entry
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: OPD Registration Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-3 border-b border-slate-200">
            <FileText className="w-5 h-5 text-sky-600" />
            <span>OPD Registration Form</span>
          </h3>

          <form onSubmit={handleGenerateSlip} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  {t.fullName} *
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                    Age
                  </label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                    Gender
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  {t.phone} *
                </label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  {t.bloodGroup}
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                >
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  {t.selectDept} *
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Orthopedics">Orthopedics & Joint</option>
                  <option value="Pediatrics">Pediatrics & Child Care</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Gynecology">Gynecology & Maternity</option>
                  <option value="Neurology">Neurology</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  {t.selectDoctor} *
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                >
                  {filteredDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.specialization})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  {t.appointmentDate} *
                </label>
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  {t.timeSlot} *
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                  <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                  <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                  <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                  <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                {t.chiefComplaint}
              </label>
              <textarea
                rows={2}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe your symptoms or reason for visiting..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>{t.healthScheme}</span>
              </label>
              <select
                value={scheme}
                onChange={(e) => setScheme(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-sky-700 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="Ayushman Bharat (PM-JAY)">{t.ayushmanBharat} [Free / Cashless]</option>
                <option value="Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)">{t.mjpjay} [Free / Cashless]</option>
                <option value="Direct Cash Payment">{t.noneCash} (₹{selectedDoctorObj.fee})</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-sky-200 flex items-center justify-center gap-2 transition-all cursor-pointer mt-6"
            >
              <QrCode className="w-5 h-5" />
              <span>{t.generateOpdSlip}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Instant Digital OPD Token Ticket Slip */}
        <div className="lg:col-span-5 space-y-6">
          {activeSlip ? (
            <div id="printable-opd-slip" className="bg-white border-2 border-sky-500 rounded-3xl p-6 shadow-md relative overflow-hidden space-y-5">
              {/* Slip Header */}
              <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-sky-600" />
                    <span className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider">
                      Smartcare Hospital OPD Ticket
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mt-0.5">Official Digital OPD Token</h4>
                </div>
                <div className="px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-mono font-bold">
                  {activeSlip.createdTimestamp}
                </div>
              </div>

              {/* Big Token Display */}
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-center space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.opdTokenNumber}</span>
                <div className="text-3xl font-black text-sky-700 tracking-wider font-mono">
                  {activeSlip.tokenNumber}
                </div>
                <div className="text-xs text-emerald-700 font-bold flex items-center justify-center gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>OPD Queue Position: #{Math.floor(Math.random() * 5) + 3}</span>
                </div>
              </div>

              {/* Slip Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Patient Name</span>
                  <span className="font-bold text-slate-800 text-sm">{activeSlip.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">UHID Number</span>
                  <span className="font-bold text-slate-700 font-mono">{activeSlip.patientUhid}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Department</span>
                  <span className="font-semibold text-sky-700">{activeSlip.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Doctor</span>
                  <span className="font-semibold text-slate-800">{activeSlip.doctorName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">{t.opdRoomNo}</span>
                  <span className="font-bold text-amber-700">{activeSlip.opdRoom}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Appointment Date</span>
                  <span className="font-semibold text-slate-700">{activeSlip.appointmentDate}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Health Scheme / Fee</span>
                  <span className="font-bold text-emerald-700">
                    {activeSlip.scheme} • {activeSlip.fee === 0 ? 'Cashless / Free' : `₹${activeSlip.fee}`}
                  </span>
                </div>
              </div>

              {/* Simulated QR Code Kiosk Scanner */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block mb-0.5">Scan at Hospital Kiosk</span>
                  <span className="text-[11px] text-slate-500">Show this QR code at Counter #1 for direct entry</span>
                </div>
                <div className="w-16 h-16 bg-white rounded-xl p-1.5 flex items-center justify-center shrink-0 border border-slate-200 shadow-xs">
                  <QrCode className="w-full h-full text-slate-800" />
                </div>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4 text-sky-400" />
                <span>{t.printSlip}</span>
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center text-sky-600">
                <QrCode className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-800">No OPD Slip Generated Yet</h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Fill in the registration form on the left to instantly generate your digital QR token.
              </p>
            </div>
          )}

          {/* Previous Slips History */}
          {savedSlips.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-200">
                <FileText className="w-4 h-4 text-sky-600" />
                <span>{t.myOpdSlips} ({savedSlips.length})</span>
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {savedSlips.map((slip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlip(slip)}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-500 flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-sky-700 block">{slip.tokenNumber}</span>
                      <span className="text-slate-700">{slip.doctorName} • {slip.department}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">{slip.createdTimestamp}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
