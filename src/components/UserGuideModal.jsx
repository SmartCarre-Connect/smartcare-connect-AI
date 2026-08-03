import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Card from './ui/Card';

export default function UserGuideModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="relative p-8">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition"
                  aria-label="Close"
                >
                  <X size={24} className="text-slate-600" />
                </button>

                {/* Content */}
                <div className="space-y-6 pr-8">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                      SmartCare Connect User Guide
                    </h1>
                    <p className="text-slate-600">
                      Learn how to make the most of SmartCare Connect in 7 simple steps.
                    </p>
                  </div>

                  <div className="space-y-4 border-t pt-6">
                    <GuideStep
                      number={1}
                      title="Register or Login"
                      description="Create your account or sign in with your credentials to access the platform."
                    />
                    <GuideStep
                      number={2}
                      title="Select Your Role"
                      description="Choose your role (Patient, Doctor, Trainee, HR, or Admin) to unlock the appropriate dashboard and features."
                    />
                    <GuideStep
                      number={3}
                      title="Access Your Dashboard"
                      description="View your personalized dashboard with health insights, upcoming appointments, and quick actions."
                    />
                    <GuideStep
                      number={4}
                      title="Book Appointments"
                      description="Schedule appointments with doctors, view their availability, and manage your care calendar."
                    />
                    <GuideStep
                      number={5}
                      title="Upload Medical Reports"
                      description="Store and organize your medical reports, test results, and health documents securely."
                    />
                    <GuideStep
                      number={6}
                      title="Chat with the AI Assistant"
                      description="Ask the AI assistant questions about your prescriptions, reports, appointments, and health guidance."
                    />
                    <GuideStep
                      number={7}
                      title="View Reports and Notifications"
                      description="Access all your medical reports, stay updated with notifications, and monitor your health metrics."
                    />
                  </div>

                  <div className="border-t pt-6 flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition"
                    >
                      Got It
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function GuideStep({ number, title, description }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold">
          {number}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
      </div>
    </div>
  );
}
