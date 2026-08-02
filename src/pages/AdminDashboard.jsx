import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import DisclaimerBanner from '../components/ui/DisclaimerBanner';
import {
  ShieldCheck,
  Users,
  FileText,
  Cpu,
  Star,
  PlusCircle,
  Edit3,
  Trash2,
  RefreshCw,
  Building2,
  Pill,
  MapPin,
  Megaphone,
  Activity,
  Briefcase,
  CalendarDays,
} from 'lucide-react';

const emptyDoctorForm = {
  full_name: '',
  medical_reg_number: '',
  specialization: '',
  experience: '',
  qualification: '',
  consultation_fee: '',
  department_id: '',
  availability: 'Available',
};

const emptyDepartmentForm = {
  department_name: '',
  description: '',
  floor_id: '',
  head_doctor: '',
};

const emptyMedicineForm = {
  name: '',
  category: '',
  stock: '',
  unit: '',
  status: 'Available',
  price: '',
  expiry_date: '',
  supplier: '',
  description: '',
};

const emptyLocationForm = {
  name: '',
  route: '',
  floor: '',
  description: '',
  category: '',
};

const emptyAnnouncementForm = {
  title: '',
  message: '',
  priority: 'normal',
  published_at: '',
};

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [doctorForm, setDoctorForm] = useState(emptyDoctorForm);
  const [doctorError, setDoctorError] = useState('');
  const [editingDoctorId, setEditingDoctorId] = useState(null);

  const [departmentForm, setDepartmentForm] = useState(emptyDepartmentForm);
  const [departmentError, setDepartmentError] = useState('');
  const [editingDepartmentId, setEditingDepartmentId] = useState(null);

  const [medicineForm, setMedicineForm] = useState(emptyMedicineForm);
  const [medicineError, setMedicineError] = useState('');
  const [editingMedicineId, setEditingMedicineId] = useState(null);

  const [locationForm, setLocationForm] = useState(emptyLocationForm);
  const [locationError, setLocationError] = useState('');
  const [editingLocationId, setEditingLocationId] = useState(null);

  const [announcementForm, setAnnouncementForm] = useState(emptyAnnouncementForm);
  const [announcementError, setAnnouncementError] = useState('');
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);

  const loadData = async () => {
    try {
      const [statsRes, doctorsRes, departmentsRes, medicinesRes, locationsRes, announcementsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.listDoctors(),
        adminApi.listDepartments(),
        adminApi.listMedicines(),
        adminApi.listLocations(),
        adminApi.listAnnouncements(),
      ]);

      setStats(statsRes?.data || {});
      setDoctors(Array.isArray(doctorsRes?.data) ? doctorsRes.data : []);
      setDepartments(Array.isArray(departmentsRes?.data) ? departmentsRes.data : []);
      setMedicines(Array.isArray(medicinesRes?.data) ? medicinesRes.data : []);
      setLocations(Array.isArray(locationsRes?.data) ? locationsRes.data : []);
      setAnnouncements(Array.isArray(announcementsRes?.data) ? announcementsRes.data : []);
    } catch (error) {
      console.error('Failed to load admin dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetDoctorForm = () => {
    setDoctorForm(emptyDoctorForm);
    setEditingDoctorId(null);
    setDoctorError('');
  };

  const resetDepartmentForm = () => {
    setDepartmentForm(emptyDepartmentForm);
    setEditingDepartmentId(null);
    setDepartmentError('');
  };

  const resetMedicineForm = () => {
    setMedicineForm(emptyMedicineForm);
    setEditingMedicineId(null);
    setMedicineError('');
  };

  const resetLocationForm = () => {
    setLocationForm(emptyLocationForm);
    setEditingLocationId(null);
    setLocationError('');
  };

  const resetAnnouncementForm = () => {
    setAnnouncementForm(emptyAnnouncementForm);
    setEditingAnnouncementId(null);
    setAnnouncementError('');
  };

  const handleDoctorSubmit = async (event) => {
    event.preventDefault();
    if (!doctorForm.full_name.trim() || !doctorForm.specialization.trim() || !doctorForm.qualification.trim() || !doctorForm.experience) {
      setDoctorError('Please fill the required doctor fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        full_name: doctorForm.full_name,
        medical_reg_number: doctorForm.medical_reg_number,
        specialization: doctorForm.specialization,
        experience: Number(doctorForm.experience),
        qualification: doctorForm.qualification,
        consultation_fee: Number(doctorForm.consultation_fee || 0),
        department_id: doctorForm.department_id || null,
        availability: doctorForm.availability,
      };

      if (editingDoctorId) {
        await adminApi.updateDoctor(editingDoctorId, payload);
      } else {
        await adminApi.createDoctor(payload);
      }
      await loadData();
      resetDoctorForm();
    } catch (error) {
      console.error('Doctor form submission failed', error);
      setDoctorError('Unable to save doctor record right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDoctorDelete = async (doctor) => {
    if (!window.confirm(`Delete ${doctor.full_name || doctor.name || 'this doctor'}?`)) {
      return;
    }
    try {
      await adminApi.deleteDoctor(doctor.id);
      await loadData();
    } catch (error) {
      console.error('Delete doctor failed', error);
    }
  };

  const handleDoctorAvailabilityChange = async (doctorId, availability) => {
    try {
      await adminApi.updateDoctorAvailability(doctorId, availability);
      await loadData();
    } catch (error) {
      console.error('Availability update failed', error);
    }
  };

  const handleDepartmentSubmit = async (event) => {
    event.preventDefault();
    if (!departmentForm.department_name.trim()) {
      setDepartmentError('Department name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        department_name: departmentForm.department_name,
        description: departmentForm.description,
        floor_id: departmentForm.floor_id || null,
        head_doctor: departmentForm.head_doctor || null,
      };

      if (editingDepartmentId) {
        await adminApi.updateDepartment(editingDepartmentId, payload);
      } else {
        await adminApi.createDepartment(payload);
      }
      await loadData();
      resetDepartmentForm();
    } catch (error) {
      console.error('Department submission failed', error);
      setDepartmentError('Unable to save department right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDepartmentDelete = async (department) => {
    if (!window.confirm(`Delete ${department.department_name || 'this department'}?`)) {
      return;
    }
    try {
      await adminApi.deleteDepartment(department.id);
      await loadData();
    } catch (error) {
      console.error('Delete department failed', error);
    }
  };

  const handleMedicineSubmit = async (event) => {
    event.preventDefault();
    if (!medicineForm.name.trim() || !medicineForm.stock) {
      setMedicineError('Medicine name and stock are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: medicineForm.name,
        category: medicineForm.category,
        stock: Number(medicineForm.stock),
        unit: medicineForm.unit,
        status: medicineForm.status,
        price: Number(medicineForm.price || 0),
        expiry_date: medicineForm.expiry_date,
        supplier: medicineForm.supplier,
        description: medicineForm.description,
      };

      if (editingMedicineId) {
        await adminApi.updateMedicine(editingMedicineId, payload);
      } else {
        await adminApi.createMedicine(payload);
      }
      await loadData();
      resetMedicineForm();
    } catch (error) {
      console.error('Medicine submission failed', error);
      setMedicineError('Unable to save medicine inventory item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMedicineDelete = async (medicine) => {
    if (!window.confirm(`Delete ${medicine.name || 'this medicine'}?`)) {
      return;
    }
    try {
      await adminApi.deleteMedicine(medicine.id);
      await loadData();
    } catch (error) {
      console.error('Delete medicine failed', error);
    }
  };

  const handleMedicineStatusChange = async (medicineId, status) => {
    try {
      await adminApi.updateMedicine(medicineId, { status });
      await loadData();
    } catch (error) {
      console.error('Medicine status update failed', error);
    }
  };

  const handleLocationSubmit = async (event) => {
    event.preventDefault();
    if (!locationForm.name.trim() || !locationForm.route.trim() || !locationForm.floor.trim()) {
      setLocationError('Name, route, and floor are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: locationForm.name,
        route: locationForm.route,
        floor: locationForm.floor,
        description: locationForm.description,
        category: locationForm.category,
      };

      if (editingLocationId) {
        await adminApi.updateLocation(editingLocationId, payload);
      } else {
        await adminApi.createLocation(payload);
      }
      await loadData();
      resetLocationForm();
    } catch (error) {
      console.error('Location submission failed', error);
      setLocationError('Unable to save hospital location.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLocationDelete = async (location) => {
    if (!window.confirm(`Delete ${location.name || 'this location'}?`)) {
      return;
    }
    try {
      await adminApi.deleteLocation(location.id);
      await loadData();
    } catch (error) {
      console.error('Delete location failed', error);
    }
  };

  const handleAnnouncementSubmit = async (event) => {
    event.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.message.trim()) {
      setAnnouncementError('Title and message are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: announcementForm.title,
        message: announcementForm.message,
        priority: announcementForm.priority,
        published_at: announcementForm.published_at,
      };

      if (editingAnnouncementId) {
        await adminApi.updateAnnouncement(editingAnnouncementId, payload);
      } else {
        await adminApi.createAnnouncement(payload);
      }
      await loadData();
      resetAnnouncementForm();
    } catch (error) {
      console.error('Announcement submission failed', error);
      setAnnouncementError('Unable to publish announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnnouncementDelete = async (announcement) => {
    if (!window.confirm(`Delete ${announcement.title || 'this announcement'}?`)) {
      return;
    }
    try {
      await adminApi.deleteAnnouncement(announcement.id);
      await loadData();
    } catch (error) {
      console.error('Delete announcement failed', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading Hospital Admin Portal...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <DisclaimerBanner />

      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-500" /> Hospital Head Portal
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage doctors, departments, medicines, navigation points, announcements, and live hospital analytics from one place.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Patients</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{stats?.total_patients ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Patients in the system</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Doctors</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{stats?.total_doctors ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Doctors registered</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Today's Appointments</span>
            <CalendarDays className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{stats?.today_appointments ?? 0}</div>
          <div className="text-[11px] text-purple-400 mt-1">Scheduled for today</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Today's OPD</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{stats?.today_opd ?? stats?.today_appointments ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">OPD visits recorded</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Medicines in Stock</span>
            <Pill className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{stats?.medicines_in_stock ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Inventory available</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Staff</span>
            <Briefcase className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{stats?.active_staff ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Operational team members</div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Live Operating Summary
          </h3>
          <button onClick={loadData} className="flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600">
          <div className="rounded-xl border border-slate-200 p-3">Doctors on record: <span className="font-semibold text-slate-900">{doctors.length}</span></div>
          <div className="rounded-xl border border-slate-200 p-3">Departments configured: <span className="font-semibold text-slate-900">{departments.length}</span></div>
          <div className="rounded-xl border border-slate-200 p-3">Medicine items tracked: <span className="font-semibold text-slate-900">{medicines.length}</span></div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-blue-400" /> Manage Doctors
            </h3>
            <span className="text-[11px] text-slate-500">Add, edit, or update availability</span>
          </div>
          <form onSubmit={handleDoctorSubmit} className="space-y-3">
            {doctorError ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">{doctorError}</div> : null}
            <input value={doctorForm.full_name} onChange={(e) => setDoctorForm({ ...doctorForm, full_name: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Doctor name" />
            <input value={doctorForm.medical_reg_number} onChange={(e) => setDoctorForm({ ...doctorForm, medical_reg_number: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Medical registration number" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={doctorForm.specialization} onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Specialization" />
              <input value={doctorForm.experience} onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Years of experience" type="number" min="0" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={doctorForm.qualification} onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Qualification" />
              <input value={doctorForm.consultation_fee} onChange={(e) => setDoctorForm({ ...doctorForm, consultation_fee: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Consultation fee" type="number" min="0" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={doctorForm.department_id} onChange={(e) => setDoctorForm({ ...doctorForm, department_id: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Department ID" />
              <select value={doctorForm.availability} onChange={(e) => setDoctorForm({ ...doctorForm, availability: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
                <option value="Available">Available</option>
                <option value="On Leave">On Leave</option>
                <option value="Busy">Busy</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{editingDoctorId ? 'Update Doctor' : 'Add Doctor'}</button>
              {editingDoctorId ? <button type="button" onClick={resetDoctorForm} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button> : null}
            </div>
          </form>
          <div className="space-y-2">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-900">{doctor.full_name || doctor.name}</div>
                    <div className="text-xs text-slate-500">{doctor.specialization || 'General Care'} · {doctor.qualification || 'Specialist'}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setDoctorForm({ ...emptyDoctorForm, full_name: doctor.full_name || '', medical_reg_number: doctor.medical_reg_number || '', specialization: doctor.specialization || '', experience: doctor.experience ?? '', qualification: doctor.qualification || '', consultation_fee: doctor.consultation_fee ?? '', department_id: doctor.department_id || '', availability: doctor.availability || 'Available' }); setEditingDoctorId(doctor.id); setDoctorError(''); }} className="rounded-full border border-slate-300 p-2 text-slate-600"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDoctorDelete(doctor)} className="rounded-full border border-slate-300 p-2 text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                  <span>Availability</span>
                  <select value={doctor.availability || 'Available'} onChange={(e) => handleDoctorAvailabilityChange(doctor.id, e.target.value)} className="rounded-full border border-slate-300 px-2 py-1 text-xs">
                    <option value="Available">Available</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Busy">Busy</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-500" /> Manage Departments
            </h3>
            <span className="text-[11px] text-slate-500">Add or update department structure</span>
          </div>
          <form onSubmit={handleDepartmentSubmit} className="space-y-3">
            {departmentError ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">{departmentError}</div> : null}
            <input value={departmentForm.department_name} onChange={(e) => setDepartmentForm({ ...departmentForm, department_name: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Department name" />
            <textarea value={departmentForm.description} onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Department description" rows="3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={departmentForm.floor_id} onChange={(e) => setDepartmentForm({ ...departmentForm, floor_id: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Floor ID" />
              <input value={departmentForm.head_doctor} onChange={(e) => setDepartmentForm({ ...departmentForm, head_doctor: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Head doctor ID" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{editingDepartmentId ? 'Update Department' : 'Add Department'}</button>
              {editingDepartmentId ? <button type="button" onClick={resetDepartmentForm} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button> : null}
            </div>
          </form>
          <div className="space-y-2">
            {departments.map((department) => (
              <div key={department.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-900">{department.department_name}</div>
                    <div className="text-xs text-slate-500">{department.description || 'Department overview'}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setDepartmentForm({ department_name: department.department_name || '', description: department.description || '', floor_id: department.floor_id || '', head_doctor: department.head_doctor || '' }); setEditingDepartmentId(department.id); setDepartmentError(''); }} className="rounded-full border border-slate-300 p-2 text-slate-600"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDepartmentDelete(department)} className="rounded-full border border-slate-300 p-2 text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-4 h-4 text-sky-500" /> Manage Medicines
            </h3>
            <span className="text-[11px] text-slate-500">Track stock and availability</span>
          </div>
          <form onSubmit={handleMedicineSubmit} className="space-y-3">
            {medicineError ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">{medicineError}</div> : null}
            <input value={medicineForm.name} onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Medicine name" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={medicineForm.category} onChange={(e) => setMedicineForm({ ...medicineForm, category: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Category" />
              <input value={medicineForm.stock} onChange={(e) => setMedicineForm({ ...medicineForm, stock: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Stock" type="number" min="0" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={medicineForm.unit} onChange={(e) => setMedicineForm({ ...medicineForm, unit: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Unit" />
              <input value={medicineForm.price} onChange={(e) => setMedicineForm({ ...medicineForm, price: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Price" type="number" min="0" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={medicineForm.status} onChange={(e) => setMedicineForm({ ...medicineForm, status: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
                <option value="Available">Available</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
              <input value={medicineForm.expiry_date} onChange={(e) => setMedicineForm({ ...medicineForm, expiry_date: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Expiry date" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={medicineForm.supplier} onChange={(e) => setMedicineForm({ ...medicineForm, supplier: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Supplier" />
              <input value={medicineForm.description} onChange={(e) => setMedicineForm({ ...medicineForm, description: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Description" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{editingMedicineId ? 'Update Medicine' : 'Add Medicine'}</button>
              {editingMedicineId ? <button type="button" onClick={resetMedicineForm} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button> : null}
            </div>
          </form>
          <div className="space-y-2">
            {medicines.map((medicine) => (
              <div key={medicine.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-900">{medicine.name}</div>
                    <div className="text-xs text-slate-500">Stock: {medicine.stock ?? 0} · {medicine.unit || 'pcs'}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setMedicineForm({ name: medicine.name || '', category: medicine.category || '', stock: medicine.stock ?? '', unit: medicine.unit || '', status: medicine.status || 'Available', price: medicine.price ?? '', expiry_date: medicine.expiry_date || '', supplier: medicine.supplier || '', description: medicine.description || '' }); setEditingMedicineId(medicine.id); setMedicineError(''); }} className="rounded-full border border-slate-300 p-2 text-slate-600"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleMedicineDelete(medicine)} className="rounded-full border border-slate-300 p-2 text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                  <span>Status</span>
                  <select value={medicine.status || 'Available'} onChange={(e) => handleMedicineStatusChange(medicine.id, e.target.value)} className="rounded-full border border-slate-300 px-2 py-1 text-xs">
                    <option value="Available">Available</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-500" /> Manage Hospital Navigation
            </h3>
            <span className="text-[11px] text-slate-500">Add and maintain route locations</span>
          </div>
          <form onSubmit={handleLocationSubmit} className="space-y-3">
            {locationError ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">{locationError}</div> : null}
            <input value={locationForm.name} onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Location name" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={locationForm.route} onChange={(e) => setLocationForm({ ...locationForm, route: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Route" />
              <input value={locationForm.floor} onChange={(e) => setLocationForm({ ...locationForm, floor: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Floor" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={locationForm.category} onChange={(e) => setLocationForm({ ...locationForm, category: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Category" />
              <input value={locationForm.description} onChange={(e) => setLocationForm({ ...locationForm, description: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Description" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{editingLocationId ? 'Update Location' : 'Add Location'}</button>
              {editingLocationId ? <button type="button" onClick={resetLocationForm} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button> : null}
            </div>
          </form>
          <div className="space-y-2">
            {locations.map((location) => (
              <div key={location.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-900">{location.name}</div>
                    <div className="text-xs text-slate-500">Route: {location.route || 'Main'} · Floor: {location.floor || 'Ground'}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setLocationForm({ name: location.name || '', route: location.route || '', floor: location.floor || '', description: location.description || '', category: location.category || '' }); setEditingLocationId(location.id); setLocationError(''); }} className="rounded-full border border-slate-300 p-2 text-slate-600"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleLocationDelete(location)} className="rounded-full border border-slate-300 p-2 text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-500" /> Manage Announcements
            </h3>
            <span className="text-[11px] text-slate-500">Publish and edit hospital notices</span>
          </div>
          <form onSubmit={handleAnnouncementSubmit} className="space-y-3">
            {announcementError ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">{announcementError}</div> : null}
            <input value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Announcement title" />
            <textarea value={announcementForm.message} onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Announcement message" rows="3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={announcementForm.priority} onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
              <input value={announcementForm.published_at} onChange={(e) => setAnnouncementForm({ ...announcementForm, published_at: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Published at" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{editingAnnouncementId ? 'Update Announcement' : 'Publish Announcement'}</button>
              {editingAnnouncementId ? <button type="button" onClick={resetAnnouncementForm} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button> : null}
            </div>
          </form>
          <div className="space-y-2">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-900">{announcement.title}</div>
                    <div className="text-xs text-slate-500">{announcement.message}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setAnnouncementForm({ title: announcement.title || '', message: announcement.message || '', priority: announcement.priority || 'normal', published_at: announcement.published_at || '' }); setEditingAnnouncementId(announcement.id); setAnnouncementError(''); }} className="rounded-full border border-slate-300 p-2 text-slate-600"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleAnnouncementDelete(announcement)} className="rounded-full border border-slate-300 p-2 text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
