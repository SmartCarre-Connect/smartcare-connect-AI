import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, ArrowRight, X, Clock } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { useLanguage } from "../context/LanguageContext";

const roleContent = {
  patient: {
    title: "Welcome, Patient 👋",
    duration: "90 seconds",
    description:
      "This quick guide will show you how to register, login, book appointments, use AI Chat, Online OPD, Medical Reports, Medicine Availability and Hospital Navigation.",
    points: [
      "Patient Registration",
      "Book Appointment",
      "AI Medical Chatbot",
      "Online OPD Slip",
      "Doctor Availability",
      "Medicine Availability",
      "Hospital Navigation",
      "Medical Reports"
    ]
  },

  doctor: {
    title: "Welcome, Doctor 👨‍⚕️",
    duration: "60 seconds",
    description:
      "Learn how to manage appointments, patients, prescriptions and reports.",
    points: [
      "Today's Patients",
      "Appointments",
      "Prescriptions",
      "Medical Reports",
      "Availability",
      "Notifications"
    ]
  },

  hr: {
    title: "Welcome, HR 👩‍💼",
    duration: "60 seconds",
    description:
      "Learn how to manage employees, schedules, attendance and notifications.",
    points: [
      "Staff Management",
      "Duty Schedule",
      "Attendance",
      "Leave Approval",
      "Notifications"
    ]
  },

  trainee: {
    title: "Welcome, Trainee 🎓",
    duration: "60 seconds",
    description:
      "Learn GPS attendance, today's schedule and trainee workflow.",
    points: [
      "GPS Attendance",
      "Today's Schedule",
      "Supervisor",
      "Notifications",
      "Leave Request"
    ]
  }
};

export default function RoleGuideDialog({
  open,
  role = "patient",
  onWatch,
  onSkip
}) {
  const { t } = useLanguage();

  const data = roleContent[role] || roleContent.patient;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-2xl"
          >
            <GlassCard className="!rounded-3xl !bg-white !p-8">

              <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900">
                  {data.title}
                </h1>

                <p className="mt-3 text-slate-600">
                  {data.description}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                  <Clock size={16} />
                  Estimated Time : {data.duration}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="mb-3 font-semibold text-slate-700">
                  This guide will cover
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {data.points.map((item) => (
                    <div
                      key={item}
                      className="rounded-xl bg-white border p-3 shadow-sm"
                    >
                      ✅ {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <button
                  onClick={onWatch}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-4 text-white font-semibold flex items-center justify-center gap-2"
                >
                  <PlayCircle size={22} />
                  Watch AI Guide
                </button>

                <button
                  onClick={onSkip}
                  className="flex-1 rounded-2xl border border-slate-300 py-4 font-semibold text-slate-700 flex items-center justify-center gap-2"
                >
                  Skip & Continue
                  <ArrowRight size={18} />
                </button>

              </div>

            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}