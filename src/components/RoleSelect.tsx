import React from 'react';
import { Language, UserRole } from '../types';
import { translations } from '../data/translations';
import { User, Stethoscope, Building2, GraduationCap, ArrowRight, Shield } from 'lucide-react';

interface RoleSelectProps {
  currentLanguage: Language;
  onSelectRole: (role: UserRole) => void;
  onBackToLanguage: () => void;
}

export const RoleSelect: React.FC<RoleSelectProps> = ({
  currentLanguage,
  onSelectRole,
  onBackToLanguage,
}) => {
  const t = translations[currentLanguage];

  const roles: { id: UserRole; titleKey: string; descKey: string; icon: React.FC<{ className?: string }>; badgeColor: string }[] = [
    {
      id: 'patient',
      titleKey: 'patientRole',
      descKey: 'patientRoleDesc',
      icon: User,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'doctor',
      titleKey: 'doctorRole',
      descKey: 'doctorRoleDesc',
      icon: Stethoscope,
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      id: 'hr',
      titleKey: 'hrRole',
      descKey: 'hrRoleDesc',
      icon: Building2,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      id: 'trainee',
      titleKey: 'traineeRole',
      descKey: 'traineeRoleDesc',
      icon: GraduationCap,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      <div className="max-w-4xl w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm relative z-10">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold mb-3">
            <Shield className="w-3.5 h-3.5 text-sky-600" />
            <span>Smartcare Access Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            {t.selectRoleTitle}
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            {t.selectRoleSubtitle}
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelectRole(r.id)}
                className="text-left p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-sky-500 transition-all duration-200 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-sky-600">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border uppercase ${r.badgeColor}`}>
                      {r.id.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-sky-600 transition-colors mb-1.5">
                    {t[r.titleKey as keyof typeof t] || r.titleKey}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t[r.descKey as keyof typeof t] || r.descKey}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-sky-600 transition-colors">
                  <span>Proceed to Portal</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onBackToLanguage}
            className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            ← {t.selectLanguage}
          </button>
          <span className="text-xs text-slate-400 font-mono font-semibold">Language: {currentLanguage.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};
