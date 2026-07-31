import React, { useMemo, useState } from 'react';
import { Activity, Bell, HeartPulse, Hospital, MapPinned, Pill, ShieldCheck, Sparkles, Stethoscope, Users } from 'lucide-react';
import { mockAnnouncements, mockFamilyMembers, mockNavigationDestinations } from '../data/mockData';
import { AnnouncementItem, FamilyMember, NavigationDestination } from '../types';

interface EnterpriseHealthcareHubProps {
  currentLanguage: 'en' | 'hi' | 'mr';
}

export const EnterpriseHealthcareHub: React.FC<EnterpriseHealthcareHubProps> = ({ currentLanguage }) => {
  const [selectedDestination, setSelectedDestination] = useState('OPD');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDestinations = useMemo(() => {
    return mockNavigationDestinations.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const selectedDestinationInfo = filteredDestinations.find((item) => item.name === selectedDestination) || filteredDestinations[0] || mockNavigationDestinations[0];

  const renderAnnouncement = (item: AnnouncementItem) => (
    <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-slate-800">{item.title}</span>
        <span className="text-[10px] uppercase tracking-wider text-slate-500">{item.date}</span>
      </div>
      <p className="mt-1 text-xs text-slate-600">{item.message}</p>
    </div>
  );

  const renderFamilyMember = (member: FamilyMember) => (
    <div key={member.id} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-800">{member.name}</p>
          <p className="text-xs text-slate-500">{member.relation}</p>
        </div>
        <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700">{member.bloodGroup}</span>
      </div>
      <p className="mt-2 text-xs text-slate-600">{member.medicalHistory}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Enterprise Care Ecosystem</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Connected digital healthcare operations</h2>
            <p className="mt-1 text-sm text-slate-500">Appointments, queue flow, family care, navigation, and smart announcements are now part of the same experience.</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <div className="flex items-center gap-2 font-semibold"><Bell className="h-4 w-4" /> Smart alerts enabled</div>
            <p className="mt-1 text-xs">Appointment reminders, queue updates, and hospital announcements stay active.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-teal-300"><Activity className="h-4 w-4" /> Queue & OPD Health</div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-2xl bg-slate-800 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-400">Daily OPD Registrations</p>
              <p className="mt-1 text-2xl font-bold text-white">186</p>
            </div>
            <div className="rounded-2xl bg-slate-800 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-400">Token Updates</p>
              <p className="mt-1 text-2xl font-bold text-white">09 / 24</p>
            </div>
            <div className="rounded-2xl bg-slate-800 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-400">Doctors Active</p>
              <p className="mt-1 text-2xl font-bold text-white">14</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><HeartPulse className="h-4 w-4 text-rose-500" /> Symptom Check</div>
          <p className="mt-3 text-sm text-slate-600">The AI symptom checker recommends the right department before booking. It is informational only and does not replace a clinical diagnosis.</p>
          <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-semibold">Suggested department: Cardiology</p>
            <p className="mt-1 text-xs">Urgency level: Urgent • Seek early medical attention if symptoms worsen.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Care Compliance</div>
          <p className="mt-3 text-sm text-slate-600">Security, privacy, and accessibility are preserved throughout the experience with multilingual support and responsive queues.</p>
          <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">96% digital compliance • 24/7 monitoring active</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><MapPinned className="h-4 w-4 text-sky-500" /> Indoor navigation</div>
          <div className="mt-4 flex gap-3">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search OPD, Emergency, Pharmacy..."
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {filteredDestinations.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedDestination(item.name)}
                className={`rounded-2xl border p-3 text-left text-sm transition ${selectedDestination === item.name ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 bg-white text-slate-600'}`}
              >
                <p className="font-semibold">{item.name}</p>
                <p className="mt-1 text-xs">{item.floor}</p>
                <p className="mt-1 text-xs">{item.time}</p>
              </button>
            ))}
          </div>
          {selectedDestinationInfo && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{selectedDestinationInfo.name}</p>
                  <p className="text-xs text-slate-500">{selectedDestinationInfo.floor}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Accessible route</span>
              </div>
              <p className="mt-2 text-xs">Route: {selectedDestinationInfo.route}</p>
              <p className="mt-1 text-xs">Estimated walking time: {selectedDestinationInfo.time}</p>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Bell className="h-4 w-4 text-amber-500" /> Announcements</div>
          <div className="mt-4 space-y-3">{mockAnnouncements.map(renderAnnouncement)}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Users className="h-4 w-4 text-purple-500" /> Family care</div>
          <div className="mt-4 space-y-3">{mockFamilyMembers.map(renderFamilyMember)}</div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Pill className="h-4 w-4 text-sky-500" /> Pharmacy insight</div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-800">Low stock alert: Glycomet 500 mg</p>
            <p className="mt-1 text-xs">Hospital pharmacy stock is below threshold; the system recommends automatic reorder.</p>
          </div>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-800">Nearby pharmacy</p>
            <p className="mt-1 text-xs">Main Pharmacy • Counter 3 • Open till 10 PM.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
