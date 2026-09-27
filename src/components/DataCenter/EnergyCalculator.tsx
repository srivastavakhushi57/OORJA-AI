import React from 'react';
import {
  DataCenter,
  EnergyAssumptions,
  EnergyCalculationResult,
  Scenario,
} from '../../types';
import { MONTH_NAMES, getScenarioAssumptions } from '../../lib/energy';
import {
  Flame,
  Zap,
  Leaf,
  Users,
  Sliders,
  Calendar,
  Layers,
  ThermometerSun,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface EnergyCalculatorProps {
  dataCenter: DataCenter;
  assumptions: EnergyAssumptions;
  onAssumptionsChange: (updated: EnergyAssumptions) => void;
  calculationResult: EnergyCalculationResult;
  communitiesCount: number;
}

const PIE_COLORS = ['#059669', '#0284c7', '#94a3b8']; // Recoverable heat, Electricity, Unrecoverable

export const EnergyCalculator: React.FC<EnergyCalculatorProps> = ({
  dataCenter,
  assumptions,
  onAssumptionsChange,
  calculationResult,
  communitiesCount,
}) => {
  const handleScenarioChange = (scenario: Scenario) => {
    const preset = getScenarioAssumptions(
      dataCenter.cooling_type,
      scenario,
      dataCenter.typical_utilization_pct,
      dataCenter.pue
    );
    onAssumptionsChange({
      ...assumptions,
      scenario,
      ...preset,
    });
  };

  // Pie chart data: "Where the energy goes"
  const pieData = [
    {
      name: 'Recoverable Thermal Heat',
      value: calculationResult.recoverable_heat_mwh,
      unit: 'MWh',
    },
    {
      name: 'Electricity from Heat (ORC)',
      value: calculationResult.electricity_from_heat_mwh,
      unit: 'MWh',
    },
    {
      name: 'Unrecoverable Low-Temp Heat',
      value: calculationResult.unrecoverable_heat_mwh,
      unit: 'MWh',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recoverable Heat */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Recoverable Heat</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
            {calculationResult.recoverable_heat_mwh.toLocaleString()}{' '}
            <span className="text-xs font-semibold text-slate-500">MWh/mo</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Net usable: ~{calculationResult.net_delivered_thermal_mwh.toLocaleString()} MWh post pipe losses
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
        </div>

        {/* Electricity from Heat */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-900/60 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Electricity via ORC</span>
            <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-700 dark:text-sky-400 tracking-tight">
            {calculationResult.electricity_from_heat_mwh.toLocaleString()}{' '}
            <span className="text-xs font-semibold text-slate-500">MWh/mo</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {assumptions.orc_efficiency_pct > 0
              ? `${assumptions.orc_efficiency_pct}% ORC thermodynamic conversion`
              : 'Direct thermal heating mode (0% ORC)'}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-600" />
        </div>

        {/* Communities in Range */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Villages in Range</span>
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
            {communitiesCount}{' '}
            <span className="text-xs font-semibold text-slate-500">settlements</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Up to {calculationResult.households_heat_met.toLocaleString()} homes heated
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
        </div>

        {/* CO2 Avoided */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-900/60 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Carbon Offset</span>
            <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-700 dark:text-teal-400 tracking-tight">
            {calculationResult.co2_avoided_tons.toLocaleString()}{' '}
            <span className="text-xs font-semibold text-slate-500">tCO2/mo</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Eqv: {calculationResult.equivalent_trees.toLocaleString()} trees absorbing CO2
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-600" />
        </div>
      </div>

      {/* Control Panel: Month Picker, Low/Base/High Scenarios & Assumption Sliders */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Live Thermodynamic Assumption Controls
            </h3>
          </div>

          {/* Low / Base / High Scenario Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['low', 'base', 'high'] as Scenario[]).map((sc) => {
              const active = assumptions.scenario === sc;
              return (
                <button
                  key={sc}
                  onClick={() => handleScenarioChange(sc)}
                  className={`px-3 py-1 text-xs font-bold capitalize rounded-lg transition ${
                    active
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {sc} Case
                </button>
              );
            })}
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 text-xs">
          <span className="flex items-center gap-1 text-slate-500 shrink-0 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Month:
          </span>
          <div className="flex items-center gap-1.5">
            {MONTH_NAMES.map((name, i) => {
              const isSelected = assumptions.month === i + 1;
              return (
                <button
                  key={name}
                  onClick={() => onAssumptionsChange({ ...assumptions, month: i + 1 })}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition shrink-0 ${
                    isSelected
                      ? 'bg-emerald-700 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {name.substring(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ambient Temperature badge */}
        <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <ThermometerSun className="w-4 h-4 text-amber-500" />
            <span>
              Estimated {MONTH_NAMES[assumptions.month - 1]} Ambient Temperature:
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {calculationResult.ambient_temp_c}°C
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Estimated District Heat Pump COP: <b>{calculationResult.cop_heat_pump_estimate}</b>
          </div>
        </div>

        {/* 4 Interactive Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Utilization Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Capacity Utilization:
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {assumptions.utilization_pct}% ({((dataCenter.capacity_mw * assumptions.utilization_pct) / 100).toFixed(1)} MW load)
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={assumptions.utilization_pct}
              onChange={(e) =>
                onAssumptionsChange({
                  ...assumptions,
                  utilization_pct: parseInt(e.target.value),
                })
              }
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>20% (Idle/Off-peak)</span>
              <span>75% (Typical AI)</span>
              <span>100% (Max Load)</span>
            </div>
          </div>

          {/* PUE Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Power Usage Effectiveness (PUE):
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {assumptions.pue} (IT: {calculationResult.it_power_mw} MW)
              </span>
            </div>
            <input
              type="range"
              min="1.05"
              max="1.70"
              step="0.01"
              value={assumptions.pue}
              onChange={(e) =>
                onAssumptionsChange({
                  ...assumptions,
                  pue: parseFloat(e.target.value),
                })
              }
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1.05 (World-class Liquid)</span>
              <span>1.25 (Modern Hyperscale)</span>
              <span>1.70 (Legacy)</span>
            </div>
          </div>

          {/* Heat Capture % Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Heat Capture Efficiency:
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {assumptions.heat_capture_pct}% (
                {dataCenter.cooling_type === 'liquid'
                  ? 'Liquid Loop: High Grade'
                  : dataCenter.cooling_type === 'hybrid'
                  ? 'Hybrid: Moderate Grade'
                  : 'Air: Low Grade'}
                )
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="95"
              value={assumptions.heat_capture_pct}
              onChange={(e) =>
                onAssumptionsChange({
                  ...assumptions,
                  heat_capture_pct: parseInt(e.target.value),
                })
              }
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>15% (Poor Capture)</span>
              <span>65% (Hybrid Baseline)</span>
              <span>95% (Optimized Immersion)</span>
            </div>
          </div>

          {/* ORC Conversion Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Electricity via ORC Conversion:
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {assumptions.orc_efficiency_pct}% (
                {assumptions.orc_efficiency_pct === 0
                  ? 'Direct Heat Reuse'
                  : `${calculationResult.electricity_from_heat_mwh} MWh Elec`}
                )
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={assumptions.orc_efficiency_pct}
              onChange={(e) =>
                onAssumptionsChange({
                  ...assumptions,
                  orc_efficiency_pct: parseInt(e.target.value),
                })
              }
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (100% Thermal)</span>
              <span>5% (Typical Low-Temp ORC)</span>
              <span>15% (Theoretical Max)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2 Recharts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Recoverable Heat Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Daily Recoverable Heat ({MONTH_NAMES[assumptions.month - 1]})
              </h4>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                MWh / day
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Estimated day-by-day thermal profile across the {calculationResult.days_in_month} days of the month.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calculationResult.daily_breakdown}>
                <XAxis
                  dataKey="day"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  unit=" MWh"
                  width={60}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} MWh`, 'Recoverable Heat']}
                  labelFormatter={(lbl) => `Day ${lbl}`}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="recoverable_mwh" fill="#059669" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Where the Energy Goes Pie Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Where the Energy Goes (Thermodynamic Balance)
              </h4>
              <span className="text-[11px] font-semibold text-slate-500">
                Total: {calculationResult.total_waste_heat_mwh.toLocaleString()} MWh
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Breakdown of total IT server dissipation into recovered thermal, ORC power, and low-delta losses.
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val.toLocaleString()} MWh`, '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-[11px] text-slate-600 dark:text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
