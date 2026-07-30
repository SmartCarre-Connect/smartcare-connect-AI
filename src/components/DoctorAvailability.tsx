import React, { useState } from 'react';
import { Language } from '../types';
import { mockDoctors } from '../data/mockData';
import { translations } from '../data/translations';
import {
  Stethoscope,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  PhoneCall,
  Sparkles,
  Award,
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

  const departments = ['All', 'Cardiology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Neurology', 'Gynecology'];

  const filteredDoctors = mockDoctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDeptFilter === 'All' || doc.specialization === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.availableNow}</span>
          </span>
        );
      case 'in_opd':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.inOpd}</span>
          </span>
        );
      case 'emergency':
        return (
          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Emergency Duty</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-xs font-bold">
            {t.offDuty}
          </span>
        );
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

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-sky-500 transition-all duration-200 flex flex-col justify-between space-y-5 group"
          >
            <div className="space-y-4">
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

              {/* Info Badges */}
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

            {/* Book Token Button */}
            <button
              type="button"
              onClick={() => onBookDoctor(doc.id)}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-sky-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>{t.bookToken}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
