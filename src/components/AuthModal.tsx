import React, { useState } from 'react';
import { Language, UserRole, UserProfile } from '../types';
import { translations } from '../data/translations';
import {
  User,
  Mail,
  Lock,
  Phone,
  Droplet,
  MapPin,
  FileCheck,
  Stethoscope,
  Building2,
  GraduationCap,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';


interface AuthModalProps {
  currentLanguage: Language;
  selectedRole: UserRole;
  onLoginSuccess: (user: UserProfile) => void;
  onBackToRoles: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentLanguage,
  selectedRole,
  onLoginSuccess,
  onBackToRoles,
}) => {
  const t = translations[currentLanguage];
  const [isRegistering, setIsRegistering] = useState(true);

  // Common Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Patient Specific
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('');

  // Doctor Specific
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('Cardiology');
  const [qualification, setQualification] = useState('MBBS, MD');
  const [experienceYears, setExperienceYears] = useState('10');
  const [consultationFee, setConsultationFee] = useState('500');

  // HR Specific
  const [employeeId, setEmployeeId] = useState('');
  const [hrDepartment, setHrDepartment] = useState('Administration');

  // Trainee Specific
  const [traineeId, setTraineeId] = useState('');
  const [institute, setInstitute] = useState('Grant Government Medical College, Mumbai');
  const [supervisorDoctor, setSupervisorDoctor] = useState('Dr. Anjali Deshmukh');

  // Mobile OTP Verification State
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    setIsOtpSent(true);
    setOtpError('');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode === '123456' || otpCode.length === 6) {
      setIsVerified(true);
      setOtpError('');
    } else {
      setOtpError('Invalid OTP code. Please enter 123456 or any 6-digit code.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegistering && !isVerified) {
      alert('Please complete Mobile OTP Verification before completing registration.');
      return;
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: fullName || (selectedRole === 'doctor' ? 'Dr. Rahul Verma' : 'Suresh Patel'),
      email: email || 'user@smartcare.org',
      role: selectedRole,
      phone: phone || '9876543210',
      isVerified: true,
      bloodGroup: selectedRole === 'patient' ? bloodGroup : undefined,
      address: selectedRole === 'patient' ? address : undefined,
      licenseNumber: selectedRole === 'doctor' ? licenseNumber || 'MCI-884920' : undefined,
      specialization: selectedRole === 'doctor' ? specialization : undefined,
      qualification: selectedRole === 'doctor' ? qualification : undefined,
      experienceYears: selectedRole === 'doctor' ? Number(experienceYears) : undefined,
      consultationFee: selectedRole === 'doctor' ? Number(consultationFee) : undefined,
      employeeId: selectedRole === 'hr' ? employeeId || 'HR-904' : undefined,
      hrDepartment: selectedRole === 'hr' ? hrDepartment : undefined,
      traineeId: selectedRole === 'trainee' ? traineeId || 'TRN-402' : undefined,
      institute: selectedRole === 'trainee' ? institute : undefined,
      supervisorDoctor: selectedRole === 'trainee' ? supervisorDoctor : undefined,
    };

    onLoginSuccess(newUser);
  };

  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const departmentOptions = [
    'Cardiology',
    'Orthopedics',
    'Pediatrics',
    'General Medicine',
    'Gynecology & Obstetrics',
    'Neurology',
    'ENT',
    'Dermatology',
    'General Surgery',
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 sm:p-6 relative my-auto">
      <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm relative my-8">
        {/* Role Header Banner */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center font-bold">
              {selectedRole === 'patient' && <User className="w-6 h-6" />}
              {selectedRole === 'doctor' && <Stethoscope className="w-6 h-6" />}
              {selectedRole === 'hr' && <Building2 className="w-6 h-6" />}
              {selectedRole === 'trainee' && <GraduationCap className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                {selectedRole.toUpperCase()} PORTAL
              </span>
              <h2 className="text-xl font-bold text-slate-800">
                {isRegistering ? `${t.register} (${selectedRole.toUpperCase()})` : `${t.login} (${selectedRole.toUpperCase()})`}
              </h2>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100 uppercase">
              {selectedRole}
            </span>
            <button
              type="button"
              onClick={onBackToRoles}
              className="text-xs text-sky-600 hover:text-sky-700 font-bold underline cursor-pointer"
            >
              {t.switchRole}
            </button>
          </div>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200 mb-6">
          <button
            type="button"
            onClick={() => setIsRegistering(true)}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              isRegistering
                ? 'bg-sky-600 text-white shadow-md shadow-sky-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.register}
          </button>
          <button
            type="button"
            onClick={() => setIsRegistering(false)}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              !isRegistering
                ? 'bg-sky-600 text-white shadow-md shadow-sky-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.login}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Fields for First Time Register or Login */}
          {isRegistering && (
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                {t.fullName} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder={selectedRole === 'doctor' ? 'Dr. Anjali Deshmukh' : 'Suresh Patil'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                {t.email} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="user@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                {t.password} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>
          </div>

          {/* ROLE-SPECIFIC REGISTRATION FIELDS */}
          {isRegistering && selectedRole === 'patient' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                    {t.bloodGroup} *
                  </label>
                  <div className="relative">
                    <Droplet className="w-4 h-4 text-rose-500 absolute left-3.5 top-3.5" />
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    >
                      {bloodGroupOptions.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                    {t.address} *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Flat 301, FC Road, Pune, MH"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {isRegistering && selectedRole === 'doctor' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                    {t.licenseNumber} *
                  </label>
                  <div className="relative">
                    <FileCheck className="w-4 h-4 text-sky-600 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="MCI-984029"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                    {t.specialization} *
                  </label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  >
                    {departmentOptions.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                    {t.qualification}
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                    {t.experienceYears}
                  </label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                    {t.consultationFee}
                  </label>
                  <input
                    type="number"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>
            </>
          )}

          {isRegistering && selectedRole === 'hr' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  {t.employeeId} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="HR-ADMIN-010"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  {t.hrDepartment}
                </label>
                <input
                  type="text"
                  value={hrDepartment}
                  onChange={(e) => setHrDepartment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>
          )}

          {isRegistering && selectedRole === 'trainee' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  {t.traineeId} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="TRN-2024-88"
                  value={traineeId}
                  onChange={(e) => setTraineeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  {t.institute}
                </label>
                <input
                  type="text"
                  value={institute}
                  onChange={(e) => setInstitute(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  {t.supervisorDoctor}
                </label>
                <input
                  type="text"
                  value={supervisorDoctor}
                  onChange={(e) => setSupervisorDoctor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>
          )}

          {/* MOBILE NUMBER & OTP VERIFICATION STEP */}
          {isRegistering && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-700 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span>{t.verifyMobile}</span>
                </span>
                {isVerified && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={phone}
                    disabled={isVerified}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:opacity-70"
                  />
                </div>
                {!isVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 cursor-pointer transition-colors"
                  >
                    {isOtpSent ? 'Resend OTP' : t.sendOtp}
                  </button>
                )}
              </div>

              {isOtpSent && !isVerified && (
                <div className="pt-2 space-y-2 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    {t.otpSentMsg} <span className="text-sky-700 font-mono font-bold">••••{phone.slice(-4)}</span> (Demo Code: <span className="font-mono text-emerald-700 font-bold">123456</span>)
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-36 bg-white border border-slate-200 rounded-xl px-3 py-2 text-center text-sm font-mono tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 cursor-pointer shadow-xs"
                    >
                      Verify OTP
                    </button>
                  </div>
                  {otpError && <p className="text-xs text-rose-600 font-medium">{otpError}</p>}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-6 py-4 px-6 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-sky-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{isRegistering ? t.verifyAndSubmit : t.loginSuccess}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
