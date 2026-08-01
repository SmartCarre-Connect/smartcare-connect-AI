import React, { useEffect, useMemo, useState } from 'react';
import { Language, NavigationDestination, OpdSlip, UserProfile } from '../types';
import { translations } from '../data/translations';
import { appointmentsApi, doctorsApi } from '../services/api';
import { mockNavigationDestinations } from '../data/mockData';
import { QRCodeCanvas } from 'qrcode.react';
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
  Brain,
  ArrowRight,
  BellRing,
  HeartPulse,
  X,
  Pill,
  Microscope,
  Ambulance,
  MapPin,
} from 'lucide-react';

interface OpdRegistrationProps {
  currentLanguage: Language;
  currentUser: UserProfile;
  initialSelectedDoctorId?: string;
}

export const OpdRegistration: React.FC<OpdRegistrationProps> = ({
  currentLanguage,
  currentUser,
  initialSelectedDoctorId,
}) => {
  const t = translations[currentLanguage];

  const [patientName, setPatientName] = useState(currentUser.name || 'Rahul Sharma');
  const [patientAge, setPatientAge] = useState(32);
  const [patientGender, setPatientGender] = useState('Male');
  const [patientPhone, setPatientPhone] = useState(currentUser.phone || '9876543210');
  const [bloodGroup, setBloodGroup] = useState(currentUser.bloodGroup || 'O+');
  const [selectedDept, setSelectedDept] = useState('Cardiology');
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialSelectedDoctorId || '');
  const [showDoctorSelectionAlert, setShowDoctorSelectionAlert] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:00 AM');
  const [symptoms, setSymptoms] = useState('Mild chest discomfort & fatigue during morning exercise');
  const [scheme, setScheme] = useState('Ayushman Bharat (PM-JAY)');

  const [activeSlip, setActiveSlip] = useState<OpdSlip | null>(null);
  const [savedSlips, setSavedSlips] = useState<OpdSlip[]>([]);
  const [recommendation, setRecommendation] = useState<{department: string; specialist: string; urgency: string; advice: string} | null>(null);
  const [selectedHospitalBranch, setSelectedHospitalBranch] = useState('SmartCare Central Hospital');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedNavTarget, setSelectedNavTarget] = useState('OPD');
  const [navSearch, setNavSearch] = useState('');
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const response = await doctorsApi.list();
        const payload = response.data?.doctors || response.data?.data || response.data || [];
        const doctorList = Array.isArray(payload) ? payload : payload.doctors || [];
        setDoctors(doctorList);
        const initialDoctorId = initialSelectedDoctorId || doctorList[0]?._id || doctorList[0]?.id || '';
        if (initialDoctorId) {
          setSelectedDoctorId(initialDoctorId);
        }
      } catch {
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, [initialSelectedDoctorId]);

  useEffect(() => {
    const loadAppointmentHistory = async () => {
      try {
        const response = await appointmentsApi.list();
        const payload = response.data?.appointments || response.data || [];
        const appointments = Array.isArray(payload) ? payload : payload.appointments || [];
        const slips = appointments.map(convertAppointmentToSlip);
        setSavedSlips(slips);
        if (slips.length > 0) {
          setActiveSlip(slips[0]);
        }
      } catch {
        setSavedSlips([]);
      }
    };

    loadAppointmentHistory();
  }, []);

  useEffect(() => {
    if (initialSelectedDoctorId) {
      setShowDoctorSelectionAlert(true);
    }
  }, [initialSelectedDoctorId]);

  const filteredDoctors = doctors.filter((doctor) => {
    const name = (doctor.full_name || doctor.name || '').toLowerCase();
    const specialization = (doctor.specialization || '').toLowerCase();
    const deptName = selectedDept.toLowerCase();
    return specialization.includes(deptName) || name.includes(deptName) || selectedDept === 'All' || deptName === 'general medicine';
  });

  const selectedDoctorObj = filteredDoctors.find((doctor) => (doctor._id || doctor.id) === selectedDoctorId) || filteredDoctors[0] || {
    full_name: 'Selected Specialist',
    specialization: selectedDept,
    consultation_fee: 0,
    opd_room: 'Room TBD',
  };

  const availableNavigationDestinations: NavigationDestination[] = mockNavigationDestinations.filter((item) =>
    item.name.toLowerCase().includes(navSearch.toLowerCase()) || item.route.toLowerCase().includes(navSearch.toLowerCase())
  );

  const selectedNavigation =
    availableNavigationDestinations.find((item) => item.name === selectedNavTarget) ||
    availableNavigationDestinations[0] ||
    mockNavigationDestinations[0];

  const convertAppointmentToSlip = (appointment: any): OpdSlip => {
    const doctorName = appointment.doctor_name || appointment.doctorName || appointment.doctor?.full_name || 'Selected Specialist';
    const appointmentDateValue = appointment.appointment_date || appointment.appointmentDate || appointmentDate;
    const timeSlotValue = appointment.time_slot || appointment.timeSlot || appointment.appointmentTime || timeSlot;
    const tokenNumberValue = appointment.token_number || appointment.tokenNumber || appointment.appointment_id || `OPD-${selectedDept.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 85)}`;
    const patientUhidValue = appointment.patient_uhid || appointment.patientUhid || appointment.patientUhid || `UHID-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      id: appointment.id || appointment._id || appointment.appointment_id,
      tokenNumber: tokenNumberValue,
      patientUhid: patientUhidValue,
      patientName: appointment.patient_name || appointment.patientName || patientName,
      patientAge: appointment.patient_age || appointment.patientAge || Number(patientAge),
      patientGender: appointment.patient_gender || appointment.patientGender || patientGender,
      patientPhone: appointment.patient_phone || appointment.patientPhone || patientPhone,
      bloodGroup: appointment.blood_group || appointment.bloodGroup || bloodGroup,
      department: appointment.department || appointment.department_name || selectedDept,
      doctorName,
      opdRoom: appointment.opd_room || appointment.opdRoom || selectedDoctorObj.opd_room || selectedDoctorObj.opdRoom || 'Room TBD',
      appointmentDate: appointmentDateValue,
      timeSlot: timeSlotValue,
      symptoms: appointment.reason || appointment.symptoms || symptoms,
      scheme: appointment.scheme || appointment.scheme || scheme,
      paymentStatus: appointment.payment_status || appointment.paymentStatus || (scheme.includes('Cash') ? 'paid' : 'covered_under_scheme'),
      fee: appointment.fee ?? Number(selectedDoctorObj.consultation_fee || selectedDoctorObj.fee || 0),
      qrCodeValue: appointment.qr_code_value || appointment.qrCodeValue || `https://smartcare.org/opd/verify?token=${tokenNumberValue}&uhid=${patientUhidValue}`,
      createdTimestamp: appointment.created_timestamp || appointment.createdTimestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      registrationId: appointment.registration_id || appointment.registrationId || `REG-${Math.floor(1000 + Math.random() * 9000)}`,
      opdNumber: appointment.opd_number || appointment.opdNumber || `OPD-${Math.floor(10000 + Math.random() * 90000)}`,
      hospitalBranch: appointment.hospital_branch || appointment.hospitalBranch || selectedHospitalBranch,
      appointmentTime: timeSlotValue,
      status: (appointment.status || 'confirmed').toString().toLowerCase() as any,
    };
  };

  useEffect(() => {
    if (filteredDoctors.length === 0) {
      return;
    }

    const hasSelectedDoctor = filteredDoctors.some((doctor) => (doctor._id || doctor.id) === selectedDoctorId);
    if (!hasSelectedDoctor) {
      setSelectedDoctorId(filteredDoctors[0]._id || filteredDoctors[0].id || '');
    }
  }, [filteredDoctors, selectedDoctorId]);

  const recommendationSummary = useMemo(() => {
    const lowerSymptoms = symptoms.toLowerCase();
    if (lowerSymptoms.includes('chest') || lowerSymptoms.includes('pain') || lowerSymptoms.includes('breathing')) {
      return { department: 'Cardiology', specialist: 'Dr. Anjali Deshmukh', urgency: 'Urgent', advice: 'Seek medical attention promptly if symptoms worsen or persist.' };
    }
    if (lowerSymptoms.includes('joint') || lowerSymptoms.includes('bone') || lowerSymptoms.includes('knee')) {
      return { department: 'Orthopedics', specialist: 'Dr. Vikram Sharma', urgency: 'Routine', advice: 'Keep the affected area rested and avoid heavy activity until consultation.' };
    }
    if (lowerSymptoms.includes('child') || lowerSymptoms.includes('fever') || lowerSymptoms.includes('cough')) {
      return { department: 'Pediatrics', specialist: 'Dr. Sunita Kulkarni', urgency: 'Soon', advice: 'Monitor temperature and hydration closely before the visit.' };
    }
    return { department: selectedDept, specialist: selectedDoctorObj.full_name || selectedDoctorObj.name || 'Selected Specialist', urgency: 'Routine', advice: 'A clinical review is recommended for continued symptoms.' };
  }, [selectedDept, selectedDoctorObj.full_name, selectedDoctorObj.name, symptoms]);

  const handleGenerateSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingDoctors) {
      setError('Doctors are still loading. Please wait before creating your appointment.');
      return;
    }
    if (!selectedDoctorId || filteredDoctors.length === 0) {
      setError('Please select a doctor before generating an OPD slip.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await appointmentsApi.create({
        doctor_id: selectedDoctorId,
        appointment_date: appointmentDate,
        time_slot: timeSlot,
        reason: symptoms,
        scheme,
        payment_status: scheme.includes('Cash') ? 'paid' : 'covered_under_scheme',
        fee: Number(selectedDoctorObj.consultation_fee || selectedDoctorObj.fee || 0),
        hospital_branch: selectedHospitalBranch,
        patient_name: patientName,
        patient_age: Number(patientAge),
        patient_gender: patientGender,
        patient_phone: patientPhone,
        blood_group: bloodGroup,
        opd_room: selectedDoctorObj.opd_room || selectedDoctorObj.opdRoom || 'Room TBD',
      });

      const createdSlip = convertAppointmentToSlip(response.data || {});
      setActiveSlip(createdSlip);
      setSavedSlips((prev) => [createdSlip, ...prev.filter((slip) => slip.tokenNumber !== createdSlip.tokenNumber)]);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Unable to create the appointment right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSymptomRecommendation = () => {
    setRecommendation(recommendationSummary);
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

          {showDoctorSelectionAlert && selectedDoctorObj.full_name && (
            <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-slate-700 flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">Doctor selected from availability</p>
                <p className="mt-1 text-slate-600">
                  You chose <span className="font-semibold">{selectedDoctorObj.full_name}</span> ({selectedDoctorObj.specialization}). Continue with this booking or pick a different doctor below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDoctorSelectionAlert(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-sky-100 hover:text-slate-900 transition"
                aria-label="Dismiss doctor selection notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

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
                  {loadingDoctors ? (
                    <option value="">Loading doctors…</option>
                  ) : filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doc) => {
                      const doctorId = doc._id || doc.id;
                      const doctorName = doc.full_name || doc.name || 'Doctor';
                      return (
                        <option key={doctorId} value={doctorId}>
                          {doctorName} ({doc.specialization})
                        </option>
                      );
                    })
                  ) : (
                    <option value="">No doctors available</option>
                  )}
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
                aria-label="Describe your symptoms"
                rows={2}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe your symptoms or reason for visiting..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Brain className="h-4 w-4 text-sky-600" />
                AI symptom guidance
              </div>
              <p className="mt-2 text-xs text-slate-600">This recommendation is informational only and does not replace professional medical diagnosis.</p>
              <button type="button" onClick={handleSymptomRecommendation} className="mt-3 inline-flex items-center gap-2 rounded-full bg-sky-600 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white">
                Check recommendation <ArrowRight className="h-3.5 w-3.5" />
              </button>
              {recommendation && (
                <div className="mt-3 rounded-xl border border-sky-200 bg-white p-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2 font-semibold text-slate-800"><HeartPulse className="h-3.5 w-3.5 text-rose-500" /> {recommendation.department}</div>
                  <p className="mt-1">Suggested specialist: {recommendation.specialist}</p>
                  <p className="mt-1">Urgency: <span className="font-semibold text-sky-700">{recommendation.urgency}</span></p>
                  <p className="mt-1">Advice: {recommendation.advice}</p>
                </div>
              )}
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
                <option value="Direct Cash Payment">{t.noneCash} (₹{selectedDoctorObj.consultation_fee || selectedDoctorObj.fee || 0})</option>
              </select>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || loadingDoctors || filteredDoctors.length === 0}
              className="w-full py-4 px-6 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-sky-200 flex items-center justify-center gap-2 transition-all cursor-pointer mt-6 disabled:opacity-60"
            >
              <QrCode className="w-5 h-5" />
              <span>{submitting ? 'Creating appointment…' : loadingDoctors ? 'Loading doctors…' : t.generateOpdSlip}</span>
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
                <div className="col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Registration details</span>
                  <span className="font-semibold text-slate-700">
                    {activeSlip.registrationId} • {activeSlip.opdNumber} • {activeSlip.hospitalBranch}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-semibold text-slate-800"><BellRing className="h-4 w-4 text-amber-500" /> Smart notifications</div>
                <p className="mt-2">Confirmation, token updates, and reminder alerts will be delivered to your registered mobile number and app inbox.</p>
              </div>

              {/* Simulated QR Code Kiosk Scanner */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block mb-0.5">Scan at Hospital Kiosk</span>
                  <span className="text-[11px] text-slate-500">Show this QR code at Counter #1 for direct entry</span>
                </div>
                <div className="w-20 h-20 bg-white rounded-xl p-1.5 flex items-center justify-center shrink-0 border border-slate-200 shadow-xs">
                  <QRCodeCanvas value={activeSlip.qrCodeValue} size={84} bgColor="#ffffff" fgColor="#0f172a" level="H" />
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

          {/* Hospital Navigation */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-200">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Hospital Navigation</h4>
                <p className="mt-1 text-xs text-slate-500">Find Departments, Pharmacy, Emergency, OPD, and Labs with route guidance.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-700" />
                {selectedNavigation.time}
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <input
                type="search"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search departments, labs, pharmacy..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div className="mt-4 grid gap-2">
              {availableNavigationDestinations.map((item) => {
                const selected = item.name === selectedNavigation.name;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedNavTarget(item.name)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${selected ? 'border-sky-500 bg-sky-50 text-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="mt-1 text-[11px] text-slate-500">{item.floor}</p>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500">{item.time}</div>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">{item.route}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h5 className="font-semibold text-slate-900">Current path</h5>
                  <p className="mt-1 text-xs text-slate-500">{selectedNavigation.route}</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase text-slate-600">
                  {selectedNavigation.floor}
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-600">Estimated walking time: <span className="font-semibold text-slate-800">{selectedNavigation.time}</span></div>
            </div>
          </div>

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
