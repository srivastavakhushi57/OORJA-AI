import React, { useState } from 'react';
import { CoolingType, DataCenter, DataQuality, DCStatus } from '../../types';
import { X, CheckCircle, ExternalLink, Globe } from 'lucide-react';
import { saveDataCenter } from '../../lib/storage';

interface AddEditDataCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (savedDc: DataCenter) => void;
  initialData?: Partial<DataCenter>;
  mode?: 'add' | 'edit';
}

export const AddEditDataCenterModal: React.FC<AddEditDataCenterModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialData,
  mode = 'add',
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Partial<DataCenter>>({
    id: initialData?.id || '',
    name: initialData?.name || '',
    operator: initialData?.operator || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    country: initialData?.country || 'India',
    region: initialData?.region || 'Asia Pacific',
    latitude: initialData?.latitude || 19.0,
    longitude: initialData?.longitude || 73.0,
    capacity_mw: initialData?.capacity_mw || 40,
    typical_utilization_pct: initialData?.typical_utilization_pct || 75,
    pue: initialData?.pue || 1.25,
    cooling_type: initialData?.cooling_type || 'liquid',
    status: initialData?.status || 'operational',
    commissioning_year: initialData?.commissioning_year || 2023,
    approx_water_use_l_per_kwh: initialData?.approx_water_use_l_per_kwh || 0.35,
    renewable_share_pct: initialData?.renewable_share_pct || 60,
    grid_emission_factor_g_per_kwh: initialData?.grid_emission_factor_g_per_kwh || 650,
    sources: initialData?.sources && initialData.sources.length > 0 ? initialData.sources : [''],
    description: initialData?.description || '',
    data_quality: initialData?.data_quality || 'User-submitted',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name?.trim()) errs.name = 'Data center name is required';
    if (!formData.operator?.trim()) errs.operator = 'Operator is required';
    if (!formData.city?.trim()) errs.city = 'City is required';
    if (!formData.country?.trim()) errs.country = 'Country is required';
    if (!formData.capacity_mw || formData.capacity_mw <= 0) errs.capacity_mw = 'Capacity must be > 0 MW';
    if (!formData.pue || formData.pue < 1.01 || formData.pue > 2.5) errs.pue = 'PUE must be between 1.01 and 2.5';
    if (formData.latitude === undefined || formData.latitude < -90 || formData.latitude > 90) {
      errs.latitude = 'Valid latitude (-90 to 90) required';
    }
    if (formData.longitude === undefined || formData.longitude < -180 || formData.longitude > 180) {
      errs.longitude = 'Valid longitude (-180 to 180) required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const sourceList = (formData.sources || []).filter((s) => s.trim() !== '');
    const quality: DataQuality = sourceList.length > 0 ? (formData.data_quality === 'Measured' ? 'Measured' : 'Estimated') : 'User-submitted';

    const dcToSave: DataCenter = {
      id: formData.id || `custom-dc-${Date.now()}`,
      name: formData.name!.trim(),
      operator: formData.operator!.trim(),
      city: formData.city!.trim(),
      state: formData.state?.trim(),
      country: formData.country!.trim(),
      region: formData.region as any,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      capacity_mw: Number(formData.capacity_mw),
      typical_utilization_pct: Number(formData.typical_utilization_pct),
      pue: Number(formData.pue),
      cooling_type: formData.cooling_type as CoolingType,
      status: formData.status as DCStatus,
      commissioning_year: Number(formData.commissioning_year),
      approx_water_use_l_per_kwh: Number(formData.approx_water_use_l_per_kwh),
      renewable_share_pct: Number(formData.renewable_share_pct),
      grid_emission_factor_g_per_kwh: Number(formData.grid_emission_factor_g_per_kwh),
      sources: sourceList,
      data_quality: quality,
      last_updated: new Date().toISOString().split('T')[0],
      description: formData.description,
    };

    saveDataCenter(dcToSave);
    onSaved(dcToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              {mode === 'edit' ? 'Edit Data Center Specifications' : 'Add New AI Data Center'}
            </h2>
            <p className="text-xs text-slate-500">
              {mode === 'edit'
                ? 'Update operating parameters and empirical factors for live calculations.'
                : 'Entries immediately populate both the Search, Explore Map, and Detail engines.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* Basic identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 text-slate-900 dark:text-slate-200">
                Facility Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Yotta D1 Campus"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              />
              {errors.name && <p className="text-rose-500 text-[11px] mt-0.5">{errors.name}</p>}
            </div>

            <div>
              <label className="block font-medium mb-1 text-slate-900 dark:text-slate-200">
                Operator / Company *
              </label>
              <input
                type="text"
                value={formData.operator || ''}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                placeholder="e.g. Yotta / CtrlS / Google"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              />
              {errors.operator && <p className="text-rose-500 text-[11px] mt-0.5">{errors.operator}</p>}
            </div>

            <div>
              <label className="block font-medium mb-1 text-slate-900 dark:text-slate-200">
                City *
              </label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Navi Mumbai"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              />
              {errors.city && <p className="text-rose-500 text-[11px] mt-0.5">{errors.city}</p>}
            </div>

            <div>
              <label className="block font-medium mb-1 text-slate-900 dark:text-slate-200">
                Country *
              </label>
              <input
                type="text"
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g. India"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              />
              {errors.country && <p className="text-rose-500 text-[11px] mt-0.5">{errors.country}</p>}
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block font-medium mb-1 text-slate-900 dark:text-slate-200">
                Latitude *
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude ?? ''}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white text-xs"
              />
              {errors.latitude && <p className="text-rose-500 text-[11px] mt-0.5">{errors.latitude}</p>}
            </div>

            <div>
              <label className="block font-medium mb-1 text-slate-900 dark:text-slate-200">
                Longitude *
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude ?? ''}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white text-xs"
              />
              {errors.longitude && <p className="text-rose-500 text-[11px] mt-0.5">{errors.longitude}</p>}
            </div>
          </div>

          {/* Electrical & Thermodynamic specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium mb-1 text-slate-900 dark:text-slate-200">
                Capacity (MW) *
              </label>
              <input
                type="number"
                step="1"
                value={formData.capacity_mw ?? ''}
                onChange={(e) => setFormData({ ...formData, capacity_mw: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              />
              {errors.capacity_mw && <p className="text-rose-500 text-[11px] mt-0.5">{errors.capacity_mw}</p>}
            </div>

            <div>
              <label className="block font-medium mb-1 text-slate-900 dark:text-slate-200">
                Design PUE *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.pue ?? ''}
                onChange={(e) => setFormData({ ...formData, pue: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              />
              {errors.pue && <p className="text-rose-500 text-[11px] mt-0.5">{errors.pue}</p>}
            </div>

            <div>
              <label className="block font-medium mb-1 text-slate-900 dark:text-slate-200">
                Cooling Architecture
              </label>
              <select
                value={formData.cooling_type}
                onChange={(e) => setFormData({ ...formData, cooling_type: e.target.value as CoolingType })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              >
                <option value="liquid">Liquid Cooled (High Recovery: 50-65°C)</option>
                <option value="hybrid">Hybrid Cooled (Medium Recovery: 35-50°C)</option>
                <option value="air">Air Cooled (Standard: 25-35°C)</option>
              </select>
            </div>
          </div>

          {/* Operational metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium mb-1 text-slate-900 dark:text-slate-200">
                Typical Utilization %
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={formData.typical_utilization_pct ?? 75}
                onChange={(e) => setFormData({ ...formData, typical_utilization_pct: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-slate-900 dark:text-slate-200">
                Grid Emission Factor (gCO2/kWh)
              </label>
              <input
                type="number"
                value={formData.grid_emission_factor_g_per_kwh ?? 700}
                onChange={(e) => setFormData({ ...formData, grid_emission_factor_g_per_kwh: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-slate-900 dark:text-slate-200">
                Renewable Share %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.renewable_share_pct ?? 50}
                onChange={(e) => setFormData({ ...formData, renewable_share_pct: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Sources and Scientific Verification */}
          <div>
            <label className="block font-medium mb-1 text-slate-900 dark:text-slate-200 flex items-center justify-between">
              <span>Primary Source URLs</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Adding verified URLs upgrades quality from "User-submitted" to "Estimated/Measured"
              </span>
            </label>
            <input
              type="url"
              value={formData.sources?.[0] || ''}
              onChange={(e) => setFormData({ ...formData, sources: [e.target.value] })}
              placeholder="https://company.com/sustainability-report-2024"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium mb-1 text-slate-900 dark:text-slate-200">
              Brief Description / Campus Notes
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Hyperscale campus located near agricultural greenhouses with year-round district thermal demand."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              {mode === 'edit' ? 'Save Changes' : 'Save & Add to Maps'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
