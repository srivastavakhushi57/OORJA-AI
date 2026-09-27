import React from 'react';
import { COOLING_COLORS } from './LeafletMap';

export interface MapLegendProps {
  showRadiusLegend?: boolean;
  radiusKm?: number;
}

export const MapLegend: React.FC<MapLegendProps> = ({ showRadiusLegend = true, radiusKm = 25 }) => {
  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-md text-xs font-sans text-slate-700 dark:text-slate-300">
      <div className="font-semibold text-slate-900 dark:text-white mb-2 text-[11px] uppercase tracking-wider">
        Map Legend
      </div>

      {/* Cooling types */}
      <div className="space-y-1.5 mb-2.5">
        <div className="text-[10px] text-slate-400 font-medium uppercase">Cooling Technology</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block shadow-xs" />
          <span>Liquid Cooled (~80% recovery, 50-65°C)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-xs" />
          <span>Hybrid Cooled (~65% recovery, 35-50°C)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-sky-500 inline-block shadow-xs" />
          <span>Air Cooled (~40% recovery, 25-35°C)</span>
        </div>
      </div>

      {/* Capacity scaling */}
      <div className="space-y-1.5 mb-2.5 border-t border-slate-100 dark:border-slate-800 pt-2">
        <div className="text-[10px] text-slate-400 font-medium uppercase">Facility Capacity</div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
            <span className="text-[11px]">&lt; 50 MW</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-400 inline-block" />
            <span className="text-[11px]">50-100 MW</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4.5 h-4.5 rounded-full bg-slate-400 inline-block" />
            <span className="text-[11px]">&gt; 100 MW</span>
          </div>
        </div>
      </div>

      {/* Radius */}
      {showRadiusLegend && (
        <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-3 h-3 rounded-full border-2 border-dashed border-emerald-600 bg-emerald-500/20 inline-block" />
            <span>Thermal Pipe Range: <b>{radiusKm} km radius</b></span>
          </div>
        </div>
      )}
    </div>
  );
};
