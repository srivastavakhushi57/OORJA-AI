import React, { useState } from 'react';
import { OtherDataCenterResult } from '../../types';
import { ArrowUpDown, ExternalLink, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { COOLING_COLORS } from '../Map/LeafletMap';

interface OtherDataCentersTableProps {
  otherDataCenters: OtherDataCenterResult[];
}

export const OtherDataCentersTable: React.FC<OtherDataCentersTableProps> = ({
  otherDataCenters,
}) => {
  const [sortField, setSortField] = useState<keyof OtherDataCenterResult>('distance_km');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof OtherDataCenterResult) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sorted = [...otherDataCenters].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return 0;
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th
              className="py-3 px-4 cursor-pointer hover:text-emerald-600 transition select-none"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-1">
                <span>Facility Name</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th
              className="py-3 px-3 cursor-pointer hover:text-emerald-600 transition select-none"
              onClick={() => handleSort('distance_km')}
            >
              <div className="flex items-center gap-1">
                <span>Haversine Distance</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th
              className="py-3 px-3 cursor-pointer hover:text-emerald-600 transition select-none"
              onClick={() => handleSort('capacity_mw')}
            >
              <div className="flex items-center gap-1">
                <span>Capacity</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="py-3 px-3">Cooling Type</th>
            <th className="py-3 px-3">PUE</th>
            <th className="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
          {sorted.map((dc) => {
            const coolingBadge = COOLING_COLORS[dc.cooling_type] || COOLING_COLORS.liquid;
            return (
              <tr key={dc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                  <Link
                    to={`/datacenter/${dc.id}`}
                    className="hover:text-emerald-600 transition flex items-center gap-1.5"
                  >
                    <span>{dc.name}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                  </Link>
                  <div className="text-[10px] text-slate-500 font-normal">
                    {dc.operator} • {dc.city}, {dc.country}
                  </div>
                </td>
                <td className="py-3 px-3 font-semibold text-emerald-700 dark:text-emerald-400">
                  {dc.distance_km.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">km</span>
                </td>
                <td className="py-3 px-3 font-medium">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span>{dc.capacity_mw} MW</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${coolingBadge.bg}`}
                  >
                    {coolingBadge.label}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                  {dc.pue}
                </td>
                <td className="py-3 px-4 text-right">
                  <Link
                    to={`/datacenter/${dc.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-emerald-700 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-700 text-slate-700 dark:text-slate-200 transition"
                  >
                    <span>Open</span>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
