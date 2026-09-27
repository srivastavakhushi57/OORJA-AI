import React from 'react';
import { EnergyCalculationResult } from '../../types';
import { Home, Trees, Car, ShieldAlert, Award, ArrowUpRight } from 'lucide-react';

interface ImpactPanelProps {
  calc: EnergyCalculationResult;
  gridFactor: number;
}

export const ImpactPanel: React.FC<ImpactPanelProps> = ({ calc, gridFactor }) => {
  return (
    <div className="rounded-2xl p-6 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white shadow-lg border border-emerald-900/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-emerald-800/40">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Environmental & Community Impact Assessment
            </h3>
          </div>
          <p className="text-xs text-emerald-200/70 mt-0.5">
            Equivalent carbon offset and societal utility derived from recovered computing heat
          </p>
        </div>
        <div className="text-[11px] text-emerald-300/80 bg-emerald-900/40 px-3 py-1 rounded-full border border-emerald-700/50">
          Local Grid Factor: <b>{gridFactor} gCO2/kWh</b>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Households Heating */}
        <div className="p-4 rounded-xl bg-white/5 border border-emerald-700/30 backdrop-blur-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-emerald-300 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Households Heated</span>
              <Home className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {calc.households_heat_met.toLocaleString()}
            </div>
          </div>
          <p className="text-[11px] text-emerald-200/60 mt-3 pt-2 border-t border-white/5">
            Assumes ~0.8 MWh/mo in cold climate or ~0.45 MWh/mo domestic hot water in mild zones.
          </p>
        </div>

        {/* CO2 Avoided vs Diesel/Gas Boilers */}
        <div className="p-4 rounded-xl bg-white/5 border border-emerald-700/30 backdrop-blur-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-emerald-300 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Vs Diesel Boilers</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-300 tracking-tight">
              {calc.co2_avoided_diesel_tons.toLocaleString()}
              <span className="text-xs font-normal text-emerald-200 ml-1">tCO2/mo</span>
            </div>
          </div>
          <p className="text-[11px] text-emerald-200/60 mt-3 pt-2 border-t border-white/5">
            Displacing rural light-fuel oil or diesel heating boilers (0.27 tCO2/thermal MWh).
          </p>
        </div>

        {/* Trees Equivalent */}
        <div className="p-4 rounded-xl bg-white/5 border border-emerald-700/30 backdrop-blur-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-emerald-300 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Tree Absorption</span>
              <Trees className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-300 tracking-tight">
              {calc.equivalent_trees.toLocaleString()}
              <span className="text-xs font-normal text-emerald-200 ml-1">trees</span>
            </div>
          </div>
          <p className="text-[11px] text-emerald-200/60 mt-3 pt-2 border-t border-white/5">
            Equivalent to urban forest sequestering carbon at ~21.8 kg CO2/tree/year.
          </p>
        </div>

        {/* Cars Off Road */}
        <div className="p-4 rounded-xl bg-white/5 border border-emerald-700/30 backdrop-blur-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-emerald-300 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Vehicles Removed</span>
              <Car className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-3xl font-black text-teal-300 tracking-tight">
              {calc.equivalent_cars_off_road.toLocaleString()}
              <span className="text-xs font-normal text-emerald-200 ml-1">cars</span>
            </div>
          </div>
          <p className="text-[11px] text-emerald-200/60 mt-3 pt-2 border-t border-white/5">
            Equivalent to annual emissions of average internal-combustion passenger vehicle (4.6 tCO2/yr).
          </p>
        </div>
      </div>
    </div>
  );
};
