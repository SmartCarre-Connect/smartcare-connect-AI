import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { roleHome } from '../utils/rbac';
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, Search, Bookmark, Sparkles, Mic, MessageCircle, SlidersHorizontal, Bell, ShieldCheck, Stethoscope, Briefcase, GraduationCap, UserRound, CalendarDays, LayoutGrid, ArrowRight } from 'lucide-react';
import { useOnboarding } from '../onboarding/OnboardingContext';
import useScreenSync from '../onboarding/useScreenSync';

const readMediaLibrary = () => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = window.localStorage.getItem('smartcare-presenter-media');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const getLocalizedCopy = (language, english, hindi, marathi) => {
  if (language === 'hi') return hindi;
  if (language === 'mr') return marathi;
  return english;
};

const roleProfiles = {
  patient: {
    id: 'patient',
    title: 'Patient Concierge Onboarding',
    badge: 'Patient',
    avatarTitle: 'Patient Concierge',
    intro: 'Meet your premium hospital receptionist as they guide you through appointments, reports, care tools, and safety features.',
    steps: [
      { id: 'welcome', duration: 8, titleEn: 'Welcome', titleHi: 'स्वागत', titleMr: 'स्वागत', badgeEn: 'Introduction', badgeHi: 'परिचय', badgeMr: 'परिचय', scriptEn: 'Welcome to SmartCare Connect. I am your hospital concierge and I will guide you through your care journey.', scriptHi: 'स्मार्टकेयर कनेक्ट में आपका स्वागत है। मैं आपका अस्पताल कन्सर्ज है और मैं आपके देखभाल अनुभव के माध्यम से आपको मार्गदर्शन करूँगा।', scriptMr: 'स्मार्टकेअर कनेक्टमध्ये तुमचे स्वागत आहे. मी तुमचा रुग्णसेवा दिग्दर्शक आहे आणि मी तुमच्या आरोग्ययात्रेमध्ये तुम्हाला मार्गदर्शन करीन.', previewTitle: 'Welcome screen', previewBody: 'Start the experience from a warm hospital welcome and secure sign-in.', highlight: 'Language, role, login' },
      { id: 'language', duration: 8, titleEn: 'Language Selection', titleHi: 'भाषा चयन', titleMr: 'भाषा निवड', badgeEn: 'Setup', badgeHi: 'सेटअप', badgeMr: 'सेटअप', scriptEn: 'Choose your preferred language to receive a polished experience in English, Hindi, or Marathi.', scriptHi: 'अपनी पसंद की भाषा चुनें ताकि आपको अंग्रेजी, हिंदी या मराठी में एक सहज अनुभव मिले।', scriptMr: 'तुमच्या आवडीची भाषा निवडा आणि इंग्रजी, हिंदी किंवा मराठीमध्ये सुसंस्कृत अनुभव मिळवा.', previewTitle: 'Language selection', previewBody: 'Switch instantly between English, Hindi, and Marathi with a single tap.', highlight: 'Language toggle' },
      { id: 'role', duration: 8, titleEn: 'Choose role', titleHi: 'भूमिका चुनें', titleMr: 'भूमिका निवडा', badgeEn: 'Access', badgeHi: 'प्रवेश', badgeMr: 'प्रवेश', scriptEn: 'Select your role to unlock the correct dashboard, tools, and patient journeys.', scriptHi: 'अपनी भूमिका चुनें ताकि सही डैशबोर्ड, उपकरण और मरीज अनुभव खुल जाएं।', scriptMr: 'तुमची योग्य भूमिका निवडा आणि तुमच्या कामासाठी योग्य डॅशबोर्ड, साधने आणि रुग्ण अनुभव उघडा.', previewTitle: 'Role selection', previewBody: 'Choose Patient, Doctor, Trainee, HR, or Admin and continue securely.', highlight: 'Role card' },
      { id: 'dashboard', duration: 8, titleEn: 'Dashboard overview', titleHi: 'डैशबोर्ड अवलोकन', titleMr: 'डॅशबोर्ड अवलोकन', badgeEn: 'Dashboard', badgeHi: 'डैशबोर्ड', badgeMr: 'डॅशबोर्ड', scriptEn: 'Review your care summary, health insights, reminders, and AI recommendations from one place.', scriptHi: 'एक ही स्थान से अपने देखभाल सारांश, स्वास्थ्य अंतर्दृष्टि, अनुस्मारक और AI सिफारिशें देखें।', scriptMr: 'एकाच ठिकाणावर तुमचे आरोग्य सारांश, आरोग्य अंतर्दृष्टी, स्मरणपत्रे आणि AI शिफारशी पाहा.', previewTitle: 'Health dashboard', previewBody: 'See your AI health score, upcoming reminders, and key actions at a glance.', highlight: 'Metrics and actions' },
      { id: 'appointments', duration: 8, titleEn: 'Book appointment', titleHi: 'अपॉइंटमेंट बुक करें', titleMr: 'अपॉइंटमेंट बुक करा', badgeEn: 'Care', badgeHi: 'देखभाल', badgeMr: 'सेवा', scriptEn: 'Book appointments, review doctor availability, and stay aligned with your weekly schedule.', scriptHi: 'अपॉइंटमेंट बुक करें, डॉक्टर की उपलब्धता देखें, और अपनी साप्ताहिक अनुसूची से जुड़े रहें।', scriptMr: 'अपॉइंटमेंट बुक करा, डॉक्टरांची उपलब्धता पाहा आणि तुमच्या आठवड्याच्या वेळापत्रकाशी जुळवा.', previewTitle: 'Appointments flow', previewBody: 'Book in a few taps while the system highlights the next available doctor.', highlight: 'Doctors and booking' },
      { id: 'chat', duration: 8, titleEn: 'AI assistant', titleHi: 'AI सहायक', titleMr: 'AI सहाय्यक', badgeEn: 'AI', badgeHi: 'AI', badgeMr: 'AI', scriptEn: 'Open the AI assistant to ask about prescriptions, reports, appointments, or hospital guidance.', scriptHi: 'दवाइयों, रिपोर्ट्स, अपॉइंटमेंट या अस्पताल मार्गदर्शन के बारे में पूछने के लिए AI सहायक खोलें।', scriptMr: 'औषधे, अहवाल, अपॉइंटमेंट किंवा रुग्णालय मार्गदर्शनाविषयी विचारण्यासाठी AI सहाय्यक उघडा.', previewTitle: 'AI concierge', previewBody: 'Ask the digital assistant anything from prescriptions to next steps.', highlight: 'Chat assistant' },
      { id: 'navigation', duration: 8, titleEn: 'Hospital navigation', titleHi: 'अस्पताल नेविगेशन', titleMr: 'रुग्णालय नेव्हिगेशन', badgeEn: 'Navigation', badgeHi: 'नेविगेशन', badgeMr: 'नेव्हिगेशन', scriptEn: 'Follow indoor directions, find departments, and reach the right clinic without confusion.', scriptHi: 'अंदरूनी दिशा का पालन करें, विभाग खोजें, और भ्रम के बिना सही क्लिनिक तक पहुँचें।', scriptMr: 'अंतर्गत दिशानिर्देशांचे अनुसरण करा, विभाग शोधा आणि गोंधळ न होता योग्य क्लिनिकपर्यंत पोहोचा.', previewTitle: 'Navigation map', previewBody: 'Use the indoor map and route highlights to move confidently through the facility.', highlight: 'Map and directions' },
      { id: 'emergency', duration: 8, titleEn: 'Emergency and profile', titleHi: 'आपातकालीन और प्रोफाइल', titleMr: 'आपत्कालीन आणि प्रोफाइल', badgeEn: 'Safety', badgeHi: 'सुरक्षा', badgeMr: 'सुरक्षा', scriptEn: 'Use emergency support, review notifications, and manage your profile settings whenever you need.', scriptHi: 'आपातकालीन सहायता का उपयोग करें, सूचनाएँ देखें और अपनी प्रोफाइल सेटिंग प्रबंधित करें।', scriptMr: 'आपत्कालीन मदत वापरा, सूचना पाहा आणि तुमच्या प्रोफाइल सेटिंग व्यवस्थापित करा.', previewTitle: 'Profile and safety', previewBody: 'Stay connected with alerts, profile preferences, and one-touch emergency help.', highlight: 'Emergency and settings' },
    ],
  },
  doctor: {
    id: 'doctor',
    title: 'Doctor Operations Onboarding',
    badge: 'Doctor',
    avatarTitle: 'Clinical Concierge',
    intro: 'A clinical-facing walkthrough for appointments, patient history, prescribing, and daily care operations.',
    steps: [
      { id: 'dashboard', duration: 8, titleEn: 'Doctor dashboard', titleHi: 'डॉक्टर डैशबोर्ड', titleMr: 'डॉक्टर डॅशबोर्ड', badgeEn: 'Daily view', badgeHi: 'रोज़मर्रा', badgeMr: 'रोज़चा दृष्टीकोन', scriptEn: 'Review today’s appointments, outstanding tasks, and priority patient insights at a glance.', scriptHi: 'आज की नियुक्तियों, लंबित कार्यों और प्राथमिकता वाले मरीजों की जानकारी एक ही नजर में देखें।', scriptMr: 'आजच्या अपॉइंटमेंट्स, प्रलंबित कामे आणि प्राधान्य असलेल्या रुग्णांच्या माहिती एकाच दृष्टीकोनात पाहा.', previewTitle: 'Doctor dashboard', previewBody: 'See scheduled consultations, follow-ups, and care priorities in one place.', highlight: 'Today’s appointments' },
      { id: 'history', duration: 8, titleEn: 'Patient history', titleHi: 'रोगी इतिहास', titleMr: 'रुग्ण इतिहास', badgeEn: 'Records', badgeHi: 'रिकॉर्ड', badgeMr: 'रेकॉर्ड', scriptEn: 'Open patient history, review medical records, and discuss recommendations with evidence.', scriptHi: 'रोगी इतिहास खोलें, मेडिकल रिकॉर्ड देखें, और सबूत के साथ सुझावों पर चर्चा करें।', scriptMr: 'रुग्ण इतिहास उघडा, वैद्यकीय नोंदी पाहा आणि पुराव्यांसह शिफारसीवर चर्चा करा.', previewTitle: 'Patient history', previewBody: 'Review records, notes, and prior visits without leaving the workflow.', highlight: 'Medical records' },
      { id: 'prescribe', duration: 8, titleEn: 'Prescription workflow', titleHi: 'पर्चा वर्कफ़्लो', titleMr: 'प्रिस्क्रिप्शन कार्यप्रवाह', badgeEn: 'Treatment', badgeHi: 'उपचार', badgeMr: 'उपचार', scriptEn: 'Create prescriptions, request labs, and connect next actions with secure workflows.', scriptHi: 'प्रिस्क्रिप्शन बनाएं, लैब अनुरोध करें, और सुरक्षित वर्कफ़्लो के साथ अगली कार्रवाइयों को जोड़ें।', scriptMr: 'प्रिस्क्रिप्शन तयार करा, लेब विनंती करा आणि सुरक्षित कार्यप्रवाहांत पुढील क्रियाकलाप जोडून घ्या.', previewTitle: 'Prescription suite', previewBody: 'Create treatments, labs, and follow-up plans from one place.', highlight: 'Medication and labs' },
      { id: 'notifications', duration: 8, titleEn: 'Notifications and scheduling', titleHi: 'सूचनाएँ और शेड्यूलिंग', titleMr: 'सूचना आणि वेळापत्रक', badgeEn: 'Operations', badgeHi: 'कार्य', badgeMr: 'कार्यक्षमता', scriptEn: 'Monitor notifications, manage your availability, and maintain your schedule with confidence.', scriptHi: 'सूचनाओं की निगरानी करें, अपनी उपलब्धता प्रबंधित करें और अपने शेड्यूल को आत्मविश्वास से बनाए रखें।', scriptMr: 'सूचना पाहा, तुमची उपलब्धता व्यवस्थापित करा आणि तुमचे वेळापत्रक आत्मविश्वासाने सांभाळा.', previewTitle: 'Schedule and alerts', previewBody: 'Stay in sync with new messages, patient updates, and availability changes.', highlight: 'Availability and alerts' },
    ],
  },
  trainee: {
    id: 'trainee',
    title: 'Trainee Workflow Onboarding',
    badge: 'Trainee',
    avatarTitle: 'Training Concierge',
    intro: 'Show trainees how to manage their schedule, attendance, supervisor interactions, and daily duties.',
    steps: [
      { id: 'schedule', duration: 8, titleEn: 'Today’s schedule', titleHi: 'आज का शेड्यूल', titleMr: 'आजचे वेळापत्रक', badgeEn: 'Duty', badgeHi: 'कार्य', badgeMr: 'कार्य', scriptEn: 'See your day’s schedule, assigned department, and key responsibilities at a glance.', scriptHi: 'अपने दिन का शेड्यूल, असाइन की गई विभाग और मुख्य जिम्मेदारियाँ एक ही नजर में देखें।', scriptMr: 'तुमच्या दिवसाचे वेळापत्रक, नेमलेले विभाग आणि मुख्य जबाबदाऱ्या एकाच दृष्टीकोनात पाहा.', previewTitle: 'Daily duty board', previewBody: 'Review your shift, department, and supervisor notes before checking in.', highlight: 'Duty board' },
      { id: 'attendance', duration: 8, titleEn: 'GPS check-in', titleHi: 'GPS चेक-इन', titleMr: 'GPS चेक-इन', badgeEn: 'Attendance', badgeHi: 'उपस्थिति', badgeMr: 'उपस्थिति', scriptEn: 'Use GPS check-in or check-out to confirm your presence and maintain a compliant attendance record.', scriptHi: 'अपनी उपस्थिति सुनिश्चित करने और अनुपालन वाली उपस्थिति रिकॉर्ड बनाए रखने के लिए GPS चेक-इन या चेक-आउट का उपयोग करें।', scriptMr: 'तुमची उपस्थिती सुनिश्चित करण्यासाठी आणि नियमबद्ध उपस्थिती नोंद राखण्यासाठी GPS चेक-इन किंवा चेक-आउट वापरा.', previewTitle: 'Attendance check', previewBody: 'Confirm your location and mark the start or end of your shift.', highlight: 'GPS attendance' },
      { id: 'leave', duration: 8, titleEn: 'Leave and performance', titleHi: 'छुट्टी और प्रदर्शन', titleMr: 'रजा आणि कामगिरी', badgeEn: 'Support', badgeHi: 'समर्थन', badgeMr: 'समर्थन', scriptEn: 'Request leave, review performance, and stay aware of your working hours and department updates.', scriptHi: 'छुट्टी के लिए अनुरोध करें, प्रदर्शन देखें, और अपने कार्य घंटे और विभाग अपडेट से अवगत रहें।', scriptMr: 'रजा मागा, कामगिरी पाहा आणि तुमच्या कामाच्या तासांबद्दल आणि विभागातील अपडेटकडे लक्ष द्या.', previewTitle: 'Leave & performance', previewBody: 'Keep your requests, hours, and notes in one transparent workspace.', highlight: 'Leave and hours' },
      { id: 'alerts', duration: 8, titleEn: 'Notifications and history', titleHi: 'सूचनाएँ और इतिहास', titleMr: 'सूचना आणि इतिहास', badgeEn: 'Follow-up', badgeHi: 'पुनरावलोकन', badgeMr: 'पुनरावलोकन', scriptEn: 'Review notifications, attendance history, and upcoming reminders so nothing slips through the cracks.', scriptHi: 'सूचनाएँ, उपस्थिति इतिहास और आगामी अनुस्मारक देखें ताकि कुछ भी छूट न जाए।', scriptMr: 'सूचना, उपस्थिती इतिहास आणि आगामी स्मरणपत्रे पाहा, म्हणजे काहीही चुकणार नाही.', previewTitle: 'History and reminders', previewBody: 'Track attendance history and upcoming reminders from one simple view.', highlight: 'Notifications and history' },
    ],
  },
  hr: {
    id: 'hr',
    title: 'HR Operations Onboarding',
    badge: 'HR',
    avatarTitle: 'HR Operations Concierge',
    intro: 'Walk HR teams through workforce scheduling, shift assignments, attendance reports, leave approvals, and announcements.',
    steps: [
      { id: 'schedule', duration: 8, titleEn: 'Shift management', titleHi: 'शिफ्ट प्रबंधन', titleMr: 'शिफ्ट व्यवस्थापन', badgeEn: 'Workflow', badgeHi: 'कार्यप्रवाह', badgeMr: 'कार्यप्रवाह', scriptEn: 'Create schedules, publish duty assignments, and keep every shift visible for your team.', scriptHi: 'शेड्यूल बनाएं, ड्यूटी असाइनमेंट प्रकाशित करें, और हर शिफ्ट को अपनी टीम के लिए दिखाई दें।', scriptMr: 'वेळापत्रके तयार करा, ड्युटी असाइनमेंट्स जाहीर करा आणि प्रत्येक शिफ्ट तुमच्या टीमसाठी दिसेल.', previewTitle: 'Shift planner', previewBody: 'Organize shifts, assign people, and deliver clear duty visibility.', highlight: 'Duty planner' },
      { id: 'attendance', duration: 8, titleEn: 'Attendance reports', titleHi: 'उपस्थिति रिपोर्ट', titleMr: 'उपस्थिती अहवाल', badgeEn: 'Compliance', badgeHi: 'अनुपालन', badgeMr: 'अनुपालन', scriptEn: 'Review attendance reports, monitor compliance, and escalate issues before they become problems.', scriptHi: 'उपस्थिति रिपोर्ट देखें, अनुपालन की निगरानी करें, और समस्याओं को गंभीर होने से पहले हल करें।', scriptMr: 'उपस्थिती अहवाल पाहा, अनुपालनावर लक्ष ठेवा आणि समस्या गंभीर होण्यापूर्वी ती सोडवा.', previewTitle: 'Attendance analytics', previewBody: 'Check attendance quality, exceptions, and trends in one report view.', highlight: 'Reports and trends' },
      { id: 'leave', duration: 8, titleEn: 'Leave approvals', titleHi: 'छुट्टी स्वीकृतियाँ', titleMr: 'रजा मंजुरी', badgeEn: 'HR', badgeHi: 'HR', badgeMr: 'HR', scriptEn: 'Approve leave requests and maintain a transparent decision trail for the workforce.', scriptHi: 'छुट्टी अनुरोधों को मंजूरी दें और कार्यबल के लिए पारदर्शी निर्णय इतिहास बनाए रखें।', scriptMr: 'रजा विनंत्या मंजूर करा आणि कार्यबलासाठी पारदर्शक निर्णय इतिहास राखा.', previewTitle: 'Leave approvals', previewBody: 'Review and approve leave requests without losing context or traceability.', highlight: 'Approval queue' },
      { id: 'announcements', duration: 8, titleEn: 'Announcements and calendar', titleHi: 'घोषणाएँ और कैलेंडर', titleMr: 'घोषणा आणि कॅलेंडर', badgeEn: 'Communication', badgeHi: 'संचार', badgeMr: 'संवाद', scriptEn: 'Publish announcements, share updates, and keep every team member aligned through the calendar.', scriptHi: 'घोषणाएँ प्रकाशित करें, अपडेट साझा करें, और कैलेंडर के माध्यम से हर टीम सदस्य को संरेखित रखें।', scriptMr: 'घोषणा प्रकाशित करा, अपडेट शेअर करा आणि कॅलेंडरमधून प्रत्येक टीम सदस्याला संरेखित ठेवा.', previewTitle: 'Announcements hub', previewBody: 'Publish updates, keep the calendar visible, and communicate clearly.', highlight: 'Calendar and announcements' },
    ],
  },
  admin: {
    id: 'admin',
    title: 'Enterprise Admin Onboarding',
    badge: 'Admin',
    avatarTitle: 'Executive Concierge',
    intro: 'Show administrators how to oversee system health, users, analytics, departments, and permissions.',
    steps: [
      { id: 'overview', duration: 8, titleEn: 'Hospital overview', titleHi: 'अस्पताल अवलोकन', titleMr: 'रुग्णालय अवलोकन', badgeEn: 'Executive', badgeHi: 'कार्यकारी', badgeMr: 'कार्यकारी', scriptEn: 'Review hospital operations, system health, and live analytics from a centralized executive view.', scriptHi: 'केंद्रीकृत कार्यकारी दृश्य से अस्पताल संचालन, सिस्टम स्वास्थ्य और लाइव एनालिटिक्स की समीक्षा करें।', scriptMr: 'केंद्रीकृत कार्यकारी दृश्यातून रुग्णालयाच्या संचालन, सिस्टम आरोग्य आणि थेट विश्लेषण पाहा.', previewTitle: 'Executive overview', previewBody: 'Monitor the hospital pulse from one trusted command surface.', highlight: 'Analytics and health' },
      { id: 'users', duration: 8, titleEn: 'User management', titleHi: 'उपयोगकर्ता प्रबंधन', titleMr: 'वापरकर्ता व्यवस्थापन', badgeEn: 'Access', badgeHi: 'प्रवेश', badgeMr: 'प्रवेश', scriptEn: 'Manage users, permissions, role assignments, and access controls with confidence.', scriptHi: 'उपयोगकर्ताओं, अनुमतियों, भूमिका असाइनमेंट और एक्सेस नियंत्रणों का प्रबंधन करें।', scriptMr: 'वापरकर्ते, परवानग्या, भूमिका असाइनमेंट आणि प्रवेश नियंत्रण प्रभावीपणे व्यवस्थापित करा.', previewTitle: 'User controls', previewBody: 'Maintain secure access across patients, staff, and administrators.', highlight: 'Roles and permissions' },
      { id: 'departments', duration: 8, titleEn: 'Departments and settings', titleHi: 'विभाग और सेटिंग्स', titleMr: 'विभाग आणि सेटिंग्ज', badgeEn: 'Operations', badgeHi: 'कार्य', badgeMr: 'कार्यक्षमता', scriptEn: 'Configure departments, monitor operations, and keep the system aligned with your hospital model.', scriptHi: 'विभागों को कॉन्फ़िगर करें, संचालन की निगरानी करें और अपने अस्पताल मॉडल के साथ सिस्टम को संरेखित रखें।', scriptMr: 'विभाग संरचित करा, कार्यप्रवाह पाहा आणि तुमच्या रुग्णालयाच्या मॉडेलशी सिस्टम संरेखित ठेवा.', previewTitle: 'Admin settings', previewBody: 'Maintain hospital structure, modules, and operating rules from one control center.', highlight: 'Departments and settings' },
    ],
  },
};

function ApplicationPreview({ section, roleProfile }) {
  const previewIcon = roleProfile.id === 'patient' ? UserRound : roleProfile.id === 'doctor' ? Stethoscope : roleProfile.id === 'trainee' ? GraduationCap : roleProfile.id === 'hr' ? Briefcase : ShieldCheck;
  const Icon = previewIcon;

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-950/95 p-4 text-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{roleProfile.badge}</div>
          <div className="mt-1 text-sm font-semibold">{section.previewTitle}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-2">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-3">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">
          <LayoutGrid className="h-3.5 w-3.5" />
          <span>Application Preview</span>
        </div>
        <div className="mt-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>SmartCare Connect</span>
            <span>{roleProfile.badge}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <div className="h-2.5 flex-1 rounded-full bg-brand-500/70" />
            <div className="h-2.5 w-10 rounded-full bg-slate-700" />
            <div className="h-2.5 w-10 rounded-full bg-slate-700" />
          </div>
          <div className="mt-3 grid gap-2">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
              <span>{section.previewBody}</span>
              <ArrowRight className="h-4 w-4 text-brand-400" />
            </div>
            <div className="rounded-xl border border-brand-400/20 bg-brand-500/10 px-3 py-2 text-xs text-slate-300">
              {section.highlight}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIVirtualPresenter({ embedded = false, roleOverride = null }) {
  const { t, language, currentLanguage } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [voice, setVoice] = useState('female');
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(0.9);
  const [muted, setMuted] = useState(false);
  const [subtitlesOn, setSubtitlesOn] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [search, setSearch] = useState('');
  const [bookmarks, setBookmarks] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(window.localStorage.getItem('smartcare-presenter-bookmarks') || '[]');
    } catch {
      return [];
    }
  });
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: 'Ask me how to book an appointment, manage attendance, or explore your dashboard.' },
  ]);
  const [mediaLibrary, setMediaLibrary] = useState(readMediaLibrary);

  const roleParam = new URLSearchParams(location.search).get('role') || user?.role || 'patient';
  const miniParam = new URLSearchParams(location.search).get('mini');
  const roleKey = roleProfiles[roleOverride ?? (roleParam)] ? (roleOverride ?? roleParam) : 'patient';
  const compact = embedded || miniParam === 'true';
  const roleProfile = roleProfiles[roleKey];

  const onboarding = useOnboarding();
  const { syncToStep } = useScreenSync();

  const sections = useMemo(() => {
    // if onboarding has active published steps for the role, prefer those
    const published = onboarding?.getStepsForRole?.(roleKey) || [];
    const source = published.length > 0 ? published : roleProfile.steps;
    return source.map((step) => ({
      ...step,
      title: getLocalizedCopy(language, step.titleEn, step.titleHi, step.titleMr),
      badge: getLocalizedCopy(language, step.badgeEn, step.badgeHi, step.badgeMr),
      script: typeof step.script === 'string' ? step.script : getLocalizedCopy(language, step.script?.en || step.scriptEn, step.script?.hi || step.scriptHi, step.script?.mr || step.scriptMr),
      duration: Number(step.duration ?? 8),
      selector: step.selector || (step.highlight ? step.highlight : undefined),
    }));
  }, [language, roleProfile, onboarding, roleKey]);

  const totalDuration = useMemo(() => sections.reduce((sum, section) => sum + Number(section.duration ?? 8), 0), [sections]);
  const emptySections = sections.length === 0;
  const activeSection = sections[activeIndex] || sections[0] || {
    title: t('presenter.fallbackTitle', 'No onboarding steps available'),
    badge: t('presenter.fallbackBadge', 'Fallback'),
    script: t('presenter.fallbackScript', 'The AI presenter is ready, but no onboarding content has been configured yet. Open Presentation Manager to add a role tour or continue to the dashboard.'),
    duration: 8,
    selector: null,
  };
  const normalizedPlaybackTime = Number.isFinite(playbackTime) ? playbackTime : 0;
  const progressPercent = totalDuration > 0 ? (normalizedPlaybackTime / totalDuration) * 100 : 0;

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setPlaybackTime((current) => {
        const next = current + 1;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return totalDuration;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isPlaying, totalDuration]);

  useEffect(() => {
    let currentTime = 0;
    for (let index = 0; index < sections.length; index += 1) {
      const section = sections[index];
      if (normalizedPlaybackTime < currentTime + Number(section.duration ?? 8)) {
        setActiveIndex(index);
        return;
      }
      currentTime += Number(section.duration ?? 8);
    }
    setActiveIndex(Math.max(0, sections.length - 1));
  }, [normalizedPlaybackTime, sections]);

  // Sync onboarding currentStepIndex -> presenter playback
  useEffect(() => {
    if (!onboarding || !onboarding.active) return;
    const idx = onboarding.currentStepIndex ?? 0;
    if (typeof idx === 'number' && idx >= 0 && idx < sections.length) {
      // compute playbackTime to align with idx
      let time = 0;
      for (let i = 0; i < idx; i += 1) time += sections[i]?.duration || 0;
      setPlaybackTime(time);
      setActiveIndex(idx);
      setIsPlaying(true);
    }
  }, [onboarding?.currentStepIndex, onboarding?.active, sections]);

  useEffect(() => {
    if (!onboarding?.active && sections.length > 0) {
      onboarding?.start?.({ role: roleKey, language });
    }
  }, [onboarding, roleKey, language, sections.length]);

  useEffect(() => {
    if (typeof window === 'undefined' || !isPlaying || !activeSection) return;
    const synth = window.speechSynthesis;
    const hasSpeechSupport = typeof window !== 'undefined' && 'SpeechSynthesisUtterance' in window && synth;
    if (!hasSpeechSupport) return;
    synth.cancel();
    const utterance = new window.SpeechSynthesisUtterance(activeSection.script);
    const langCode = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';
    utterance.lang = langCode;
    utterance.rate = speed;
    utterance.pitch = pitch;
    utterance.volume = muted ? 0 : volume;
    const voices = synth.getVoices();
    const preferred = voices.find((voice) => voice.lang.startsWith(langCode.slice(0, 2)) && (voice.name.toLowerCase().includes(voice === 'female' ? 'female' : 'male') || voice.name.toLowerCase().includes('siri')));
    if (preferred) utterance.voice = preferred;
    synth.speak(utterance);
  }, [activeSection, isPlaying, language, speed, pitch, muted, volume]);

  // Register highlight for the active section when onboarding is active
  useEffect(() => {
    if (!onboarding) return;
    const selector = activeSection?.selector;
    if (onboarding.active && selector) {
      onboarding.registerHighlight(activeSection.id, selector, { label: activeSection.id });
    } else if (onboarding.active) {
      // clear highlights when no selector present
      onboarding.clearHighlights();
    }
  }, [activeSection?.id, activeSection?.selector, onboarding]);

  // perform safe screen-sync for the current active section
  useEffect(() => {
    if (!activeSection) return;
    syncToStep(activeSection, { allowClick: false }).catch(() => {});
  }, [activeSection?.id, activeSection?.selector, syncToStep]);

  // when presenter activeIndex changes, update onboarding context so UI controls stay in sync
  useEffect(() => {
    if (!onboarding) return;
    if (!onboarding.active) return;
    if (typeof onboarding.currentStepIndex === 'number' && onboarding.currentStepIndex === activeIndex) return;
    try { onboarding.goto(activeIndex); } catch (e) {}
  }, [activeIndex, onboarding]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('smartcare-presenter-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('smartcare-presenter-media', JSON.stringify(mediaLibrary));
  }, [mediaLibrary]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (totalDuration > 0 && normalizedPlaybackTime >= totalDuration && !isPlaying) {
      window.localStorage.setItem(`smartcare-onboarding-complete:${roleKey}`, 'true');
    }
  }, [normalizedPlaybackTime, totalDuration, isPlaying, roleKey]);

  const handleJump = (index) => {
    let time = 0;
    for (let i = 0; i < index; i += 1) {
      time += sections[i].duration;
    }
    setPlaybackTime(time);
    setActiveIndex(index);
    setIsPlaying(true);
  };

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(`smartcare-onboarding-complete:${roleKey}`, 'true');
    }
    navigate(roleHome(roleKey));
  };

  const toggleBookmark = () => {
    if (!activeSection) return;
    setBookmarks((prev) => prev.includes(activeSection.id) ? prev.filter((item) => item !== activeSection.id) : [...prev, activeSection.id]);
  };

  const askPresenter = () => {
    const key = question.trim().toLowerCase();
    const responseMap = {
      appointment: t('presenter.chat.appointment', 'You can book appointments from the Appointments section and track them on your dashboard.'),
      attendance: t('presenter.chat.attendance', 'GPS attendance helps teams verify presence through secure location-based check-ins.'),
      prescription: t('presenter.chat.prescription', 'Your prescriptions are available from the digital prescription workspace and reminder center.'),
      login: t('presenter.chat.login', 'You can sign in or register through the welcome flow and choose your role from the selection screen.'),
    };

    const answer = Object.entries(responseMap).find(([keyword]) => key.includes(keyword))?.[1] || t('presenter.chat.default', 'I can guide you through onboarding, appointments, navigation, attendance, and patient tools.');
    setChatHistory((prev) => [...prev, { role: 'user', text: question }, { role: 'assistant', text: answer }]);
    setQuestion('');
  };

  const handleFullscreen = () => {
    if (typeof document === 'undefined') return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    document.documentElement.requestFullscreen?.();
  };

  const mediaSource = mediaLibrary[activeSection?.id];

  return (
    <div className={`space-y-6 pb-12 ${compact ? 'p-0' : ''}`}>
      {compact && (
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/90 p-2 shadow">
            <div className="h-10 w-10 rounded-full bg-slate-900" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{roleProfile.avatarTitle}</div>
            <div className="text-xs text-slate-500">AI Healthcare Guide</div>
          </div>
          <div className="ml-auto">
            <button onClick={() => { setIsPlaying((v) => !v); }} className="rounded-lg px-3 py-1 bg-slate-100">{isPlaying ? 'Pause' : 'Play'}</button>
          </div>
        </div>
      )}
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-glass backdrop-blur-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
              <Sparkles className="h-3.5 w-3.5" />
              {t('presenter.badge', 'Enterprise AI Video Guide')}
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{t('presenter.title', 'Role-based onboarding for SmartCare Connect')}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{roleProfile.intro}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleComplete} icon={ArrowRight} variant="primary">{t('presenter.continue', 'Continue to dashboard')}</Button>
            <Link to="/presenter-manager" className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">{t('presenter.adminLink', 'Presentation Manager')}</Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card padding="large" className="space-y-5">
          {emptySections ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-700">
              <p className="text-sm font-semibold text-slate-900">{t('presenter.noStepsTitle', 'No tour content available')}</p>
              <p className="mt-3 text-sm text-slate-600">{t('presenter.noStepsBody', 'The AI presenter is ready, but no onboarding steps have been configured yet. Use the presentation manager to create a role-based tour or continue to your dashboard.')}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button onClick={() => navigate('/presenter-manager')} variant="secondary">{t('presenter.setupTour', 'Open Presentation Manager')}</Button>
                <Button onClick={handleComplete} variant="primary">{t('presenter.continue', 'Continue to dashboard')}</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{currentLanguage?.nativeLabel || 'English'} • {roleProfile.badge}</div>
                  <h2 className="text-xl font-bold text-slate-900">{activeSection?.title}</h2>
                </div>
                <div className="flex items-center gap-2">
              <Button onClick={() => setIsPlaying((value) => !value)} icon={isPlaying ? Pause : Play} variant="primary">
                {isPlaying ? t('presenter.pause', 'Pause') : t('presenter.play', 'Play')}
              </Button>
              <Button onClick={() => { setPlaybackTime(0); setIsPlaying(true); }} icon={RotateCcw} variant="secondary">
                {t('presenter.restart', 'Restart')}
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-brand-500/10 via-cyan-500/10 to-white p-5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span>{activeSection?.badge}</span>
              <span>{normalizedPlaybackTime}s / {totalDuration}s</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
              <motion.div animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.3 }} className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyan-500" />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-950/95 p-6 text-white shadow-glass">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t('presenter.avatar', 'Premium AI Avatar')}</div>
                  <div className="text-lg font-semibold">{roleProfile.avatarTitle}</div>
                </div>
                <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold">{t('presenter.live', 'Live Guide')}</div>
              </div>
              <div className="mt-6 flex min-h-[220px] items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/20 via-brand-500/20 to-slate-800 p-6">
                <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-white/20 bg-white/10">
                  <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="absolute inset-4 rounded-full border border-white/15" />
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 1.2, repeat: Infinity }} className="absolute top-10 h-16 w-16 rounded-full bg-white/90" />
                  <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 0.9, repeat: Infinity }} className="absolute top-16 h-8 w-8 rounded-full bg-slate-900" />
                  <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 1, repeat: Infinity }} className="absolute bottom-10 h-12 w-24 rounded-t-full bg-cyan-400/70" />
                </div>
              </div>
              {subtitlesOn && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-3 text-sm leading-7" style={{ fontSize: `${fontSize}px` }}>
                  {activeSection?.script}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Search className="h-4 w-4 text-brand-600" /> {t('presenter.search', 'Search walkthrough')}
                </div>
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('presenter.searchPlaceholder', 'Search the walkthrough')} className="mt-3" />
              </div>
              <ApplicationPreview section={activeSection} roleProfile={roleProfile} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              <input type="range" min="0" max="1" step="0.1" value={muted ? 0 : volume} onChange={(e) => setVolume(Number(e.target.value))} className="accent-brand-600" />
            </div>
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <span>{t('presenter.voice', 'Voice')}</span>
              <select value={voice} onChange={(e) => setVoice(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm">
                <option value="female">{t('presenter.voiceFemale', 'Female Voice')}</option>
                <option value="male">{t('presenter.voiceMale', 'Male Voice')}</option>
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <span>{t('presenter.speed', 'Speed')}</span>
              <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm">
                <option value={0.8}>0.8×</option>
                <option value={1}>1.0×</option>
                <option value={1.2}>1.2×</option>
                <option value={1.5}>1.5×</option>
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <span>{t('presenter.pitch', 'Pitch')}</span>
              <input type="range" min="0.8" max="1.4" step="0.1" value={pitch} onChange={(e) => setPitch(Number(e.target.value))} className="accent-brand-600" />
            </label>
            <button onClick={() => setSubtitlesOn((value) => !value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              {subtitlesOn ? t('presenter.subtitlesOn', 'Subtitles On') : t('presenter.subtitlesOff', 'Subtitles Off')}
            </button>
            <button onClick={toggleBookmark} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              <Bookmark className="mr-2 inline h-4 w-4" />{bookmarks.includes(activeSection?.id) ? t('presenter.bookmarked', 'Bookmarked') : t('presenter.bookmark', 'Bookmark')}
            </button>
            <button onClick={handleFullscreen} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              {t('presenter.fullscreen', 'Fullscreen')}
            </button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card padding="large" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t('presenter.timelineTitle', 'Video Timeline')}</h3>
                <p className="text-sm text-slate-500">{t('presenter.timelineSubtitle', 'Jump to any part of the onboarding walkthrough at any time.')}</p>
              </div>
              <Button onClick={() => handleJump(0)} icon={SkipForward} variant="secondary">
                {t('presenter.skip', 'Skip Intro')}
              </Button>
            </div>
            <div className="space-y-3">
              {sections.map((section, index) => (
                <button key={section.id} onClick={() => handleJump(index)} className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${activeIndex === index ? 'border-brand-300 bg-brand-50' : 'border-slate-200 bg-white hover:border-brand-200'}`}>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{section.title}</div>
                    <div className="text-xs text-slate-500">{section.badge}</div>
                  </div>
                  <div className="text-xs font-semibold text-slate-500">{section.duration}s</div>
                </button>
              ))}
            </div>
          </Card>

          <Card padding="large" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{t('presenter.chatTitle', 'Ask the guide')}</h3>
              <div className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">{t('presenter.chatBadge', 'Interactive')}</div>
            </div>
            <div className="space-y-3">
              {chatHistory.map((entry, idx) => (
                <div key={`${entry.role}-${idx}`} className={`rounded-2xl border p-3 text-sm ${entry.role === 'assistant' ? 'border-brand-200 bg-brand-50' : 'border-slate-200 bg-white'}`}>
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{entry.role === 'assistant' ? t('presenter.assistant', 'Guide') : t('presenter.you', 'You')}</div>
                  <p className="leading-6 text-slate-700">{entry.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t('presenter.chatPlaceholder', 'Ask how to book appointments or use attendance')} />
              <Button onClick={askPresenter} variant="primary">{t('presenter.send', 'Send')}</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
