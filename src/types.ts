export type Language = 'en' | 'hi' | 'mr';

export type UserRole = 'patient' | 'doctor' | 'hr' | 'trainee';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  isVerified: boolean;
  hasCompletedOnboarding?: boolean;
  // Patient specific
  bloodGroup?: string;
  address?: string;
  // Doctor specific
  licenseNumber?: string;
  specialization?: string;
  qualification?: string;
  experienceYears?: number;
  consultationFee?: number;
  opdHours?: string;
  // HR specific
  employeeId?: string;
  hrDepartment?: string;
  // Trainee specific
  traineeId?: string;
  institute?: string;
  supervisorDoctor?: string;
}

export interface DoctorSchedule {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: string;
  opdRoom: string;
  status: 'available' | 'in_opd' | 'emergency' | 'off_duty';
  timing: string;
  fee: number;
  currentToken: number;
  totalTokens: number;
  avatarUrl: string;
  languagesSpoken: string[];
  weeklySchedule: string[];
  nextAvailableSlot: string;
  rating: number;
  reviewCount: number;
  reviewSummary: string;
  department: string;
}

export interface MedicineItem {
  id: string;
  name: string;
  genericName: string;
  category: string;
  stockCount: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  rackLocation: string;
  pricePerUnit: number;
  dosageForm: string; // Tablet, Syrup, Injection, Ointment
  manufacturer: string;
  substitutes: string[];
  description: string;
  dosage: string;
  nearbyPharmacy: string;
  hospitalPharmacyStock: string;
}

export interface OpdSlip {
  tokenNumber: string;
  patientUhid: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  bloodGroup: string;
  department: string;
  doctorName: string;
  opdRoom: string;
  appointmentDate: string;
  timeSlot: string;
  symptoms: string;
  scheme: string; // e.g., Ayushman Bharat, MJPJAY, Cash/General
  paymentStatus: 'paid' | 'covered_under_scheme' | 'pending';
  fee: number;
  qrCodeValue: string;
  createdTimestamp: string;
  registrationId?: string;
  opdNumber?: string;
  hospitalBranch?: string;
  appointmentTime?: string;
  status?: 'confirmed' | 'cancelled' | 'rescheduled' | 'completed';
}

export interface FamilyMember {
  id: string;
  relation: string;
  name: string;
  bloodGroup: string;
  medicalHistory: string;
  appointments: string[];
  reports: string[];
  prescriptions: string[];
}

export interface AnnouncementItem {
  id: string;
  title: string;
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'urgent';
  date: string;
}

export interface NavigationDestination {
  id: string;
  name: string;
  floor: string;
  route: string;
  time: string;
  accessible: boolean;
}

export interface WalkthroughStep {
  id: number;
  titleKey: string;
  descriptionKey: string;
  videoPlaceholderUrl: string;
  script: {
    en: string;
    hi: string;
    mr: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  audioUrl?: string;
}
