import React, { useState } from 'react';
import { Community } from '../../types';
import { Users, Flame, ArrowUpDown, CheckCircle2, AlertCircle } from 'lucide-react';

interface CommunityTableProps {
  communities: Community[];
}

export const CommunityTable: React.FC<CommunityTableProps> = ({ communities }) => {
  const [sortField, setSortField] = useState<keyof Community>('suitability_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Community) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedCommunities = [...communities].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
    return 0;
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="py-3 px-4">Community Name</th>
            <th className="py-3 px-3">Type</th>
            <th
              className="py-3 px-3 cursor-pointer hover:text-emerald-600 transition select-none"
              onClick={() => handleSort('distance_km')}
            >
              <div className="flex items-center gap-1">
                <span>Distance</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th
              className="py-3 px-3 cursor-pointer hover:text-emerald-600 transition select-none"
              onClick={() => handleSort('population')}
            >
              <div className="flex items-center gap-1">
                <span>Population</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th
              className="py-3 px-3 cursor-pointer hover:text-emerald-600 transition select-none"
              onClick={() => handleSort('estimated_monthly_heat_demand_mwh')}
            >
              <div className="flex items-center gap-1">
                <span>Heat Need</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th
              className="py-3 px-3 cursor-pointer hover:text-emerald-600 transition select-none"
              onClick={() => handleSort('suitability_score')}
            >
              <div className="flex items-center gap-1">
                <span>Suitability</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="py-3 px-4">Pipeline Feasibility</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
          {sortedCommunities.map((c) => {
            const isHigh = c.suitability_score >= 90;
            const isMed = c.suitability_score >= 75 && c.suitability_score < 90;

            return (
              <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                  <div>{c.name}</div>
                  {c.notes && (
                    <div className="text-[10px] text-slate-500 font-normal line-clamp-1">{c.notes}</div>
                  )}
                </td>
                <td className="py-3 px-3 capitalize">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {c.type}
                  </span>
                </td>
                <td className="py-3 px-3 font-medium">
                  {c.distance_km} <span className="text-[10px] text-slate-400">km</span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>{c.population.toLocaleString()}</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                    <Flame className="w-3 h-3" />
                    <span>{c.estimated_monthly_heat_demand_mwh.toLocaleString()} MWh</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-14 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isHigh ? 'bg-emerald-600' : isMed ? 'bg-amber-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${c.suitability_score}%` }}
                      />
                    </div>
                    <span
                      className={`font-bold ${
                        isHigh
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : isMed
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {c.suitability_score}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      c.pipeline_feasibility === 'High'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : c.pipeline_feasibility === 'Medium'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}
                  >
                    {c.pipeline_feasibility === 'High' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    {c.pipeline_feasibility} (~{c.pipe_loss_pct}% loss)
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
