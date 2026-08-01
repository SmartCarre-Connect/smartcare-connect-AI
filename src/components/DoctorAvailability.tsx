import React, { useMemo, useState, useEffect } from 'react';
import { Language, DoctorSchedule } from '../types';
import { mockDoctors } from '../data/mockData';
import { translations } from '../data/translations';
import { appointmentsApi, doctorsApi } from '../services/api';
import {
  Stethoscope,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Sparkles,
  Award,
  Star,
  ChevronRight,
  BellRing,
  X,
} from 'lucide-react';

interface DoctorAvailabilityProps {
  currentLanguage: Language;
  onBookDoctor: (doctorId: string) => void;
}

export const DoctorAvailability: React.FC<DoctorAvailabilityProps> = ({
  currentLanguage,
  onBookDoctor,
}) => {
  const t = translations[currentLanguage];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [highlightedDoctorId, setHighlightedDoctorId] = useState<string | null>(mockDoctors[0].id);
  const [doctors, setDoctors] = useState<DoctorSchedule[]>(mockDoctors);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState<DoctorSchedule | null>(null);
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingReason, setBookingReason] = useState('Follow-up consultation');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const departments = ['All', 'Cardiology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Neurology', 'Gynecology'];
  const specializations = useMemo(() => ['All', ...Array.from(new Set(mockDoctors.map((doc) => doc.department)))], []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await doctorsApi.list();
        const payload = response.data;
        const doctorList = Array.isArray(payload) ? payload : payload.doctors || [];
        if (doctorList.length > 0) {
          setDoctors(doctorList);
          setHighlightedDoctorId(doctorList[0]?.id || doctorList[0]?._id || mockDoctors[0].id);
        }
      } catch {
        setDoctors(mockDoctors);
      } finally {
        setDoctorsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const bookingTimeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  ];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDeptFilter === 'All' || doc.department === selectedDeptFilter;
    const matchesSpecialization = selectedSpecialization === 'All' || doc.specialization === selectedSpecialization;
    return matchesSearch && matchesDept && matchesSpecialization;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.statusAvailable}</span>
          </span>
        );
      case 'in_opd':
      case 'emergency':
      case 'off_duty':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{status === 'off_duty' ? t.statusOffDuty : t.statusInOpd}</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-xs font-bold">
            {t.statusOffDuty}
          </span>
        );
    }
  };

  const openBookingModal = (doctor: DoctorSchedule) => {
    setBookingDoctor(doctor);
    setBookingError('');
    setBookingSuccess('');
    const nextSlot = doctor.nextAvailableSlot?.split('•').pop()?.trim() || '10:00 AM';
    setBookingTime(nextSlot);
    setBookingReason('Follow-up consultation');
    setBookingDate(new Date().toISOString().split('T')[0]);
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setBookingDoctor(null);
    setBookingError('');
    setBookingSuccess('');
  };

  const handleBookingSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bookingDoctor) {
      setBookingError('Please select a doctor to book.');
      return;
    }
    setBookingSubmitting(true);
    setBookingError('');
    setBookingSuccess('');

    try {
      await appointmentsApi.create({
        doctor_id: bookingDoctor.id,
        appointment_date: bookingDate,
        time_slot: bookingTime,
        reason: bookingReason,
      });
      setBookingSuccess('Appointment booked successfully. You can track it from the Appointments page.');
    } catch (error: any) {
      setBookingError(error?.response?.data?.detail || 'Unable to book the appointment. Please try again.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold mb-2 border border-sky-200">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Live Hospital OPD Roster</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
            {t.doctorTitle}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            {t.doctorSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span>14 Specialists On-Duty</span>
          </div>
        </div>
      </div>

      {/* Search & Department Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder={t.searchDoctor}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-xs"
          />
        </div>

        {/* Department Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {departments.map((dept) => {
            const isSelected = selectedDeptFilter === dept;
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDeptFilter(dept)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-200'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Today's availability</p>
          <p className="mt-1 text-xl font-bold text-slate-800">{doctors.length} Specialists</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Next available slot</p>
          <p className="mt-1 text-xl font-bold text-slate-800">{doctors.find((doc) => doc.status === 'available')?.nextAvailableSlot || 'Today • 11:30 AM'}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notifications</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-700"><BellRing className="h-4 w-4 text-sky-500" /> Token updates live</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
          {specializations.map((specialty) => {
            const isSelected = selectedSpecialization === specialty;
            return (
              <button key={specialty} type="button" onClick={() => setSelectedSpecialization(specialty)} className={`rounded-xl px-3 py-2 text-xs font-bold whitespace-nowrap ${isSelected ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                {specialty}
              </button>
            );
          })}
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-sky-500 transition-all duration-200 flex flex-col justify-between space-y-5 group"
          >
            <div className="space-y-4">
              <button type="button" onClick={() => setHighlightedDoctorId(doc.id)} className="text-left w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <Star className="h-3.5 w-3.5 text-amber-500" />
                    {doc.rating.toFixed(1)} • {doc.reviewCount} reviews
                  </div>
                  {highlightedDoctorId === doc.id && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">Recommended</span>}
                </div>
              </button>
              {/* Doctor Avatar & Status Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={doc.avatarUrl}
                    alt={doc.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                      {doc.name}
                    </h3>
                    <p className="text-xs font-bold text-sky-700">{doc.specialization}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{doc.qualification}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                {getStatusBadge(doc.status)}
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                  Fee: ₹{doc.fee}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600">
                <p className="font-semibold text-slate-700">{doc.reviewSummary}</p>
                <p className="mt-1">Languages: {doc.languagesSpoken.join(', ')}</p>
                <p className="mt-1">Weekly schedule: {doc.weeklySchedule.slice(0, 2).join(' • ')}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="font-semibold">{doc.opdRoom}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-medium text-[11px]">{doc.timing}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-bold">Token Live Queue:</span>
                  <span className="font-mono font-bold text-sky-700">
                    Token #{doc.currentToken} of {doc.totalTokens}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Next available slot</span>
                <span className="font-bold text-sky-700">{doc.nextAvailableSlot}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openBookingModal(doc)}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-sky-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {showBookingModal && bookingDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Book Appointment</h3>
                <p className="text-sm text-slate-500">{bookingDoctor.name} • {bookingDoctor.specialization}</p>
              </div>
              <button
                type="button"
                onClick={closeBookingModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-6 px-6 py-6">
              {bookingError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {bookingError}
                </div>
              )}
              {bookingSuccess && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {bookingSuccess}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2 text-sm text-slate-700">
                  Date
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Time slot
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none"
                  >
                    {bookingTimeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Appointment reason
                  <input
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none"
                    placeholder="Describe your concern"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="text-slate-700 font-semibold">Status</p>
                  <p className="mt-1">{bookingDoctor.status === 'available' ? 'Available' : 'Busy / Next slot'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="text-slate-700 font-semibold">Next slot</p>
                  <p className="mt-1">{bookingDoctor.nextAvailableSlot}</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={bookingSubmitting}
                className="w-full rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold uppercase tracking-widest text-white hover:bg-sky-700 transition-colors disabled:opacity-70"
              >
                {bookingSubmitting ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
