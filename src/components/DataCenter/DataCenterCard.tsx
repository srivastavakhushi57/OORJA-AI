import React from 'react';
import { Link } from 'react-router-dom';
import { DataCenter } from '../../types';
import { DataQualityBadge } from '../UI/DataQualityBadge';
import { COOLING_COLORS } from '../Map/LeafletMap';
import { Zap, Thermometer, Wind, ArrowRight, MapPin } from 'lucide-react';

interface DataCenterCardProps {
  dc: DataCenter;
}

export const DataCenterCard: React.FC<DataCenterCardProps> = ({ dc }) => {
  const coolingInfo = COOLING_COLORS[dc.cooling_type] || COOLING_COLORS.liquid;

  // Approximate baseline recoverable heat: Capacity * 0.70 util / PUE * 0.98 * (liquid ? 0.8 : air ? 0.4 : 0.65) * 720
  const capturePct = dc.cooling_type === 'liquid' ? 0.8 : dc.cooling_type === 'air' ? 0.4 : 0.65;
  const estimatedMonthlyHeatMwh = Math.round(
    (dc.capacity_mw * 0.75 / dc.pue) * 0.98 * capturePct * 720
  );

  return (
    <div className="flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white ${coolingInfo.bg}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="capitalize">{dc.cooling_type} Cooled</span>
          </span>
          <DataQualityBadge quality={dc.data_quality} />
        </div>

        {/* Title & Operator */}
        <Link to={`/datacenter/${dc.id}`} className="block">
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition leading-snug">
            {dc.name}
          </h3>
        </Link>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
          <span className="font-medium text-slate-700 dark:text-slate-300">{dc.operator}</span>
          <span>•</span>
          <span className="flex items-center gap-0.5">
            <MapPin className="w-3 h-3 text-slate-400" />
            {dc.city}, {dc.country}
          </span>
        </p>

        {/* Technical Specs Grid */}
        <div className="grid grid-cols-3 gap-2 my-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Capacity</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-0.5">
              <Zap className="w-3 h-3 text-amber-500" />
              {dc.capacity_mw} <span className="text-[10px] font-normal text-slate-500">MW</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">PUE</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-0.5">
              <Wind className="w-3 h-3 text-sky-500" />
              {dc.pue}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Supply Temp</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-0.5">
              <Thermometer className="w-3 h-3 text-emerald-500" />
              {dc.cooling_supply_temp_c || (dc.cooling_type === 'liquid' ? 52 : 35)} <span className="text-[10px] font-normal text-slate-500">°C</span>
            </div>
          </div>
        </div>

        {/* Estimated Recovery Callout */}
        <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border border-emerald-200/60 dark:border-emerald-800/60 mb-4">
          <span className="font-medium text-emerald-800 dark:text-emerald-300">Est. Waste Heat:</span>
          <span className="font-extrabold text-emerald-700 dark:text-emerald-300 text-sm">
            ~{estimatedMonthlyHeatMwh.toLocaleString()} <span className="text-[11px] font-normal">MWh/mo</span>
          </span>
        </div>
      </div>

      {/* Action CTA */}
      <Link
        to={`/datacenter/${dc.id}`}
        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-emerald-700 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-700 text-slate-700 dark:text-slate-200 transition group-hover:bg-emerald-700 group-hover:text-white"
      >
        <span>View Details & Nearby Map</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
      </Link>
    </div>
  );
};
