import React, { useMemo, useState } from 'react';
import { Language, MedicineItem } from '../types';
import { mockMedicines } from '../data/mockData';
import { translations } from '../data/translations';
import {
  Pill,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShoppingBag,
  MapPin,
  Sparkles,
  Check,
  FileText,
  ShieldCheck,
  BellRing,
} from 'lucide-react';

interface MedicineAvailabilityProps {
  currentLanguage: Language;
}

export const MedicineAvailability: React.FC<MedicineAvailabilityProps> = ({ currentLanguage }) => {
  const t = translations[currentLanguage];
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [reservedMedicines, setReservedMedicines] = useState<Record<string, boolean>>({});
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineItem | null>(mockMedicines[0]);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(mockMedicines.map((med) => med.category)))],
    []
  );

  const getAvailabilityText = (status: string) => {
    if (status === 'in_stock') return 'Available';
    if (status === 'low_stock') return 'Low stock';
    return 'Out of stock';
  };

  const filteredMedicines = mockMedicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'All' || med.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleReserve = (medId: string) => {
    setReservedMedicines((prev) => ({
      ...prev,
      [medId]: !prev[medId],
    }));
  };

  const selectedMedicineDetails = useMemo(() => selectedMedicine || mockMedicines[0], [selectedMedicine]);

  const getStockBadge = (status: string, count: number) => {
    if (status === 'in_stock') {
      return (
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.inStock} ({count})</span>
        </span>
      );
    }
    if (status === 'low_stock') {
      return (
        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>{t.lowStock} ({count})</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        <span>{t.outOfStock}</span>
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold mb-2 border border-sky-200">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>24/7 Hospital Pharmacy Stock Tracker</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
            {t.medicineTitle}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            {t.medicineSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 bg-sky-50 border border-sky-200 text-sky-700 font-bold text-xs rounded-full">
            Counter #3 (Ground Floor)
          </span>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder={t.searchMedicines}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map((cat) => {
            const isSelected = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-200'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl bg-white p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Low stock alert</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">Glycomet 500 mg currently below safe inventory threshold.</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nearby pharmacy</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-700"><BellRing className="h-4 w-4 text-sky-500" /> Main Pharmacy • Counter 3 • Open till 10 PM</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800">Selected medicine insight</h3>
          <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">{selectedMedicineDetails.name}</p>
                <p className="text-xs text-slate-500">{selectedMedicineDetails.genericName}</p>
              </div>
              <div className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">{getAvailabilityText(selectedMedicineDetails.status)}</div>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">{selectedMedicineDetails.description}</p>
            <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
              <div className="rounded-xl bg-white p-2"><span className="font-semibold text-slate-700">Dosage:</span> {selectedMedicineDetails.dosage}</div>
              <div className="rounded-xl bg-white p-2"><span className="font-semibold text-slate-700">Quantity:</span> {selectedMedicineDetails.stockCount} units</div>
            </div>
            <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
              <div className="rounded-xl bg-white p-2"><span className="font-semibold text-slate-700">Available at:</span> {selectedMedicineDetails.nearbyPharmacy}</div>
              <div className="rounded-xl bg-white p-2"><span className="font-semibold text-slate-700">Alternative medicine:</span> {selectedMedicineDetails.substitutes.join(', ')}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-semibold text-slate-700"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Hospital pharmacy stock</div>
              <p className="mt-1">{selectedMedicineDetails.hospitalPharmacyStock}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><FileText className="h-4 w-4 text-sky-500" /> Admin-ready inventory view</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stock quantity</p>
              <p className="mt-1 font-semibold text-slate-800">{selectedMedicineDetails.stockCount} units</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dosage form</p>
              <p className="mt-1 font-semibold text-slate-800">{selectedMedicineDetails.dosageForm}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 sm:col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Generic alternatives</p>
              <p className="mt-1 font-semibold text-slate-800">{selectedMedicineDetails.substitutes.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedicines.map((med) => {
          const isReserved = !!reservedMedicines[med.id];
          return (
            <div
              key={med.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-sky-500 transition-all duration-200 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <button type="button" onClick={() => setSelectedMedicine(med)} className="flex items-start justify-between gap-3 text-left w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center shrink-0">
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                        {med.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">{med.genericName}</p>
                    </div>
                  </div>
                </button>

                <div className="flex items-center justify-between">
                  {getStockBadge(med.status, med.stockCount)}
                  <span className="text-xs font-bold text-slate-800 font-mono bg-slate-100 px-2.5 py-1 rounded-lg">
                    ₹{med.pricePerUnit} / unit
                  </span>
                </div>

                <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400 font-bold">Category:</span>
                    <span className="font-semibold text-slate-700">{med.category}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400 font-bold">Form:</span>
                    <span className="font-semibold text-slate-700">{med.dosageForm}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400 font-bold">Rack Location:</span>
                    <span className="font-mono font-bold text-sky-700 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {med.rackLocation}
                    </span>
                  </div>
                </div>

                {med.substitutes.length > 0 && (
                  <div className="text-[11px] text-slate-500">
                    <span className="font-bold text-slate-600">Generic Substitutes: </span>
                    <span>{med.substitutes.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Reserve Button */}
              <button
                type="button"
                disabled={med.status === 'out_of_stock'}
                onClick={() => handleReserve(med.id)}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  isReserved
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : med.status === 'out_of_stock'
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-200'
                }`}
              >
                {isReserved ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{t.reservedMsg}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t.reserveMedicine}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
