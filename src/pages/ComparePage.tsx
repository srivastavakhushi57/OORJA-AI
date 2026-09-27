import React, { useState, useMemo } from 'react';
import { DataCenter } from '../types';
import { LeafletMap } from '../components/Map/LeafletMap';
import { calculateEnergyRecovery, getScenarioAssumptions } from '../lib/energy';
import {
  GitCompare,
  Zap,
  Flame,
  Wind,
  Leaf,
  Users,
  Building,
  CheckCircle2,
  Plus,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface ComparePageProps {
  dataCenters: DataCenter[];
}

export const ComparePage: React.FC<ComparePageProps> = ({ dataCenters }) => {
  // Select up to 3 DCs for comparison
  const [selectedIds, setSelectedIds] = useState<string[]>([
    dataCenters[0]?.id || '',
    dataCenters[1]?.id || '',
  ]);

  const selectedDcs = useMemo(() => {
    return selectedIds
      .map((id) => dataCenters.find((d) => d.id === id))
      .filter((d): d is DataCenter => Boolean(d));
  }, [selectedIds, dataCenters]);

  const handleSelectDc = (index: number, id: string) => {
    const updated = [...selectedIds];
    updated[index] = id;
    setSelectedIds(updated);
  };

  const handleAddSlot = () => {
    if (selectedIds.length >= 3) return;
    const unused = dataCenters.find((d) => !selectedIds.includes(d.id));
    if (unused) {
      setSelectedIds([...selectedIds, unused.id]);
    }
  };

  const handleRemoveSlot = (index: number) => {
    if (selectedIds.length <= 2) return;
    const updated = selectedIds.filter((_, i) => i !== index);
    setSelectedIds(updated);
  };

  // Compare calculations
  const comparedData = useMemo(() => {
    return selectedDcs.map((dc) => {
      const preset = getScenarioAssumptions(dc.cooling_type, 'base', dc.typical_utilization_pct, dc.pue);
      const assumptions = {
        month: 1, // Jan benchmark
        scenario: 'base' as const,
        heat_reuse_mode: 'direct_heat' as const,
        ...preset,
      };
      const calc = calculateEnergyRecovery(dc, assumptions);
      return {
        dc,
        calc,
      };
    });
  }, [selectedDcs]);

  // Comparison bar chart dataset
  const chartData = [
    {
      metric: 'Capacity (MW)',
      ...Object.fromEntries(comparedData.map((c) => [c.dc.name, c.dc.capacity_mw])),
    },
    {
      metric: 'Waste Heat (GWh/mo)',
      ...Object.fromEntries(
        comparedData.map((c) => [c.dc.name, Number((c.calc.recoverable_heat_mwh / 1000).toFixed(1))])
      ),
    },
    {
      metric: 'CO2 Avoided (kt/mo)',
      ...Object.fromEntries(
        comparedData.map((c) => [c.dc.name, Number((c.calc.co2_avoided_tons / 1000).toFixed(1))])
      ),
    },
  ];

  const colors = ['#059669', '#d97706', '#7c3aed'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GitCompare className="w-5 h-5 text-emerald-600" />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Side-by-Side Data Center Comparison
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Compare thermodynamic recovery capacity, PUE efficiency, communities in range, and avoided emissions across 2-3 facilities.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {selectedIds.map((id, idx) => (
          <div key={idx} className="flex-1 min-w-[220px] flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: colors[idx % colors.length] }}
            />
            <select
              value={id}
              onChange={(e) => handleSelectDc(idx, e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {dataCenters.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.city}, {d.capacity_mw} MW)
                </option>
              ))}
            </select>
            {selectedIds.length > 2 && (
              <button
                onClick={() => handleRemoveSlot(idx)}
                className="p-1 text-slate-400 hover:text-rose-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {selectedIds.length < 3 && (
          <button
            onClick={handleAddSlot}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add 3rd Facility</span>
          </button>
        )}
      </div>

      {/* Mini Map showing selected DCs' relative locations */}
      <div className="rounded-2xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-800">
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>Relative Geographic Locations</span>
          <span className="text-[11px] text-slate-400 font-normal">
            Dotted lines illustrate inter-site network distance
          </span>
        </div>
        <LeafletMap
          mode="compare"
          compareDataCenters={selectedDcs}
          heightClass="h-72"
        />
      </div>

      {/* Comparison Grid Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4 w-1/4">Metric</th>
              {comparedData.map((c, i) => (
                <th key={c.dc.id} className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: colors[i % colors.length] }}
                    />
                    <Link
                      to={`/datacenter/${c.dc.id}`}
                      className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition"
                    >
                      {c.dc.name}
                    </Link>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                    {c.dc.operator} • {c.dc.city}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {/* Capacity */}
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Facility Capacity</td>
              {comparedData.map((c) => (
                <td key={c.dc.id} className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                  {c.dc.capacity_mw} MW
                </td>
              ))}
            </tr>

            {/* Cooling Type */}
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Cooling Technology</td>
              {comparedData.map((c) => (
                <td key={c.dc.id} className="py-3 px-4 capitalize font-medium">
                  {c.dc.cooling_type}
                </td>
              ))}
            </tr>

            {/* PUE */}
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">PUE (Efficiency)</td>
              {comparedData.map((c) => (
                <td key={c.dc.id} className="py-3 px-4 font-medium">
                  {c.dc.pue}
                </td>
              ))}
            </tr>

            {/* Recoverable Heat */}
            <tr className="bg-emerald-50/50 dark:bg-emerald-950/20">
              <td className="py-3 px-4 font-bold text-emerald-900 dark:text-emerald-300">
                Recoverable Heat (MWh/mo)
              </td>
              {comparedData.map((c) => (
                <td key={c.dc.id} className="py-3 px-4 font-black text-emerald-700 dark:text-emerald-400 text-sm">
                  {c.calc.recoverable_heat_mwh.toLocaleString()} MWh
                </td>
              ))}
            </tr>

            {/* Households Served */}
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Households Heated</td>
              {comparedData.map((c) => (
                <td key={c.dc.id} className="py-3 px-4 font-bold">
                  {c.calc.households_heat_met.toLocaleString()} homes
                </td>
              ))}
            </tr>

            {/* Communities in Range */}
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Villages in Range</td>
              {comparedData.map((c) => (
                <td key={c.dc.id} className="py-3 px-4 font-medium">
                  {c.dc.preseeded_communities?.length || 5} settlements
                </td>
              ))}
            </tr>

            {/* Avoided CO2 */}
            <tr className="bg-teal-50/50 dark:bg-teal-950/20">
              <td className="py-3 px-4 font-bold text-teal-900 dark:text-teal-300">CO2 Avoided (tCO2/mo)</td>
              {comparedData.map((c) => (
                <td key={c.dc.id} className="py-3 px-4 font-black text-teal-700 dark:text-teal-400 text-sm">
                  {c.calc.co2_avoided_tons.toLocaleString()} tCO2
                </td>
              ))}
            </tr>

            {/* Grid Carbon Intensity */}
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Local Grid Intensity</td>
              {comparedData.map((c) => (
                <td key={c.dc.id} className="py-3 px-4 font-medium">
                  {c.dc.grid_emission_factor_g_per_kwh} gCO2/kWh
                </td>
              ))}
            </tr>

            {/* Tree Equivalent */}
            <tr>
              <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Tree Equivalents</td>
              {comparedData.map((c) => (
                <td key={c.dc.id} className="py-3 px-4 font-medium">
                  {c.calc.equivalent_trees.toLocaleString()} trees
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Comparison Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">
          Direct Metric Benchmark Chart
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="metric" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend verticalAlign="top" height={36} />
              {selectedDcs.map((dc, i) => (
                <Bar
                  key={dc.id}
                  dataKey={dc.name}
                  fill={colors[i % colors.length]}
                  radius={[3, 3, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
