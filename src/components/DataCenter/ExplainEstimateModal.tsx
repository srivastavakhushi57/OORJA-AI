import React from 'react';
import { DataCenter, EnergyAssumptions, EnergyCalculationResult } from '../../types';
import { X, Lightbulb, CheckCircle2, ArrowRight } from 'lucide-react';
import { MONTH_NAMES } from '../../lib/energy';

interface ExplainEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  dc: DataCenter;
  calc: EnergyCalculationResult;
  assumptions: EnergyAssumptions;
}

export const ExplainEstimateModal: React.FC<ExplainEstimateModalProps> = ({
  isOpen,
  onClose,
  dc,
  calc,
  assumptions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                How We Estimated This Energy Recovery
              </h3>
              <p className="text-xs text-slate-500">
                Thermodynamic first principles & empirical energy balance for {dc.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* Executive Summary */}
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-100">
            <span className="font-bold">Plain-Language Summary: </span>
            In {MONTH_NAMES[assumptions.month - 1]}, running at {assumptions.utilization_pct}% utilization, this {dc.capacity_mw} MW facility draws approximately <b>{calc.total_power_mw} MW</b> of total grid power.
            Because virtually all electricity powering AI accelerators (GPUs/TPUs) converts into heat, {calc.it_power_mw} MW of continuous thermal energy is dissipated.
            With its {dc.cooling_type} cooling system capturing {assumptions.heat_capture_pct}%, <b>{calc.recoverable_heat_mwh.toLocaleString()} MWh</b> of heat can be recovered to heat <b>{calc.households_heat_met.toLocaleString()} homes</b>, cutting <b>{calc.co2_avoided_tons.toLocaleString()} tons of CO2</b>.
          </div>

          {/* 5 Scientific Steps */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Step-by-Step Thermodynamic Walkthrough
            </h4>

            {/* Step 1 */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between mb-1">
                <span>1. Effective IT Workload Power (P_IT)</span>
                <span className="text-emerald-600 font-mono">{calc.it_power_mw} MW</span>
              </div>
              <p className="text-slate-500">
                Formula: <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px]">P_IT = (Capacity × Utilization) / PUE</code>
                <br />
                Calculation: ({dc.capacity_mw} MW × {assumptions.utilization_pct}%) / {assumptions.pue} = {calc.it_power_mw} MW.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between mb-1">
                <span>2. Total Monthly Thermal Dissipation (Q_IT)</span>
                <span className="text-emerald-600 font-mono">{calc.total_waste_heat_mwh.toLocaleString()} MWh</span>
              </div>
              <p className="text-slate-500">
                According to the First Law of Thermodynamics and Ohm's Law (Joule heating), ~98% of electrical power into semiconductor silicon is converted into heat:
                <br />
                {calc.it_power_mw} MW × 24 h/day × {calc.days_in_month} days × 0.98 = {calc.total_waste_heat_mwh.toLocaleString()} MWh.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between mb-1">
                <span>3. Usable Thermal Capture ({dc.cooling_type.toUpperCase()} Loop)</span>
                <span className="text-emerald-600 font-mono">{calc.recoverable_heat_mwh.toLocaleString()} MWh</span>
              </div>
              <p className="text-slate-500">
                Not all heat can be captured; return water temperature dictates recovery quality.
                Direct liquid cooling reaches 50-65°C allowing up to 80-90% capture without boosting.
                At {assumptions.heat_capture_pct}% capture, recoverable heat = {calc.recoverable_heat_mwh.toLocaleString()} MWh.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between mb-1">
                <span>4. Pipeline Delivery & Distance-Decay Loss</span>
                <span className="text-emerald-600 font-mono">{calc.net_delivered_thermal_mwh.toLocaleString()} MWh</span>
              </div>
              <p className="text-slate-500">
                Pre-insulated polyurethane bonded steel pipes incur ~0.5% thermal loss per kilometer.
                Net delivered thermal energy to local villages averages {calc.net_delivered_thermal_mwh.toLocaleString()} MWh.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between mb-1">
                <span>5. Displaced Carbon Emissions</span>
                <span className="text-emerald-600 font-mono">{calc.co2_avoided_tons.toLocaleString()} tCO2</span>
              </div>
              <p className="text-slate-500">
                Calculated by multiplying displaced grid heating electricity (accounting for seasonal COP) with the regional grid emission factor ({dc.grid_emission_factor_g_per_kwh} gCO2/kWh).
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
