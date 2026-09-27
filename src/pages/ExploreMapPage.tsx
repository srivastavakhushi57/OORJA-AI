import React, { useState, useMemo } from 'react';
import { CoolingType, DataCenter } from '../types';
import { LeafletMap } from '../components/Map/LeafletMap';
import { MapLegend } from '../components/Map/MapLegend';
import {
  Search,
  Sliders,
  Filter,
  Layers,
  CircleDot,
  CheckSquare,
  Square,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ExploreMapPageProps {
  dataCenters: DataCenter[];
}

export const ExploreMapPage: React.FC<ExploreMapPageProps> = ({ dataCenters }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDcId, setSelectedDcId] = useState<string | null>(null);
  const [coolingFilters, setCoolingFilters] = useState<Record<CoolingType, boolean>>({
    liquid: true,
    hybrid: true,
    air: true,
  });
  const [minCapacity, setMinCapacity] = useState<number>(0);
  const [showRadius, setShowRadius] = useState<boolean>(true);
  const [radiusKm, setRadiusKm] = useState<number>(25);

  const toggleCooling = (type: CoolingType) => {
    setCoolingFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // Filtered DCs
  const filteredDataCenters = useMemo(() => {
    return dataCenters.filter((dc) => {
      if (!coolingFilters[dc.cooling_type]) return false;
      if (dc.capacity_mw < minCapacity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          dc.name.toLowerCase().includes(q) ||
          dc.operator.toLowerCase().includes(q) ||
          dc.city.toLowerCase().includes(q) ||
          dc.country.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [dataCenters, coolingFilters, minCapacity, searchQuery]);

  // Selected DC
  const activeDc = dataCenters.find((d) => d.id === selectedDcId) || null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative overflow-hidden bg-slate-100 dark:bg-slate-900">
      {/* Top Filter Bar Controls */}
      <div className="z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-3 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Search Box with Fly-to */}
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Fly to data center or city..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {/* Quick autocomplete dropdown if searching */}
            {searchQuery.trim().length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto z-50">
                {filteredDataCenters.map((dc) => (
                  <button
                    key={dc.id}
                    onClick={() => {
                      setSelectedDcId(dc.id);
                      setSearchQuery(dc.name);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 dark:hover:bg-slate-700 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50"
                  >
                    <span className="font-semibold text-slate-900 dark:text-white truncate">{dc.name}</span>
                    <span className="text-[10px] text-slate-400">{dc.capacity_mw} MW</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cooling Type Checkboxes */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider hidden md:inline">
              Cooling Type:
            </span>
            {(['liquid', 'hybrid', 'air'] as CoolingType[]).map((type) => {
              const active = coolingFilters[type];
              const colorClass =
                type === 'liquid'
                  ? 'text-emerald-600'
                  : type === 'hybrid'
                  ? 'text-amber-500'
                  : 'text-sky-500';

              return (
                <button
                  key={type}
                  onClick={() => toggleCooling(type)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold transition ${
                    active
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white'
                      : 'opacity-50 border-transparent text-slate-400'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${colorClass} bg-current`} />
                  <span className="capitalize">{type}</span>
                </button>
              );
            })}
          </div>

          {/* Capacity Range Slider */}
          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              Min Capacity: <b>{minCapacity} MW</b>
            </span>
            <input
              type="range"
              min="0"
              max="150"
              step="10"
              value={minCapacity}
              onChange={(e) => setMinCapacity(parseInt(e.target.value))}
              className="w-20 accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Thermal Radius Circle Toggle & Slider */}
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-3">
            <button
              onClick={() => setShowRadius(!showRadius)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition ${
                showRadius
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>Radius Circle: {radiusKm} km</span>
            </button>
            {showRadius && (
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                className="w-16 accent-emerald-600 cursor-pointer"
                title={`Adjust district thermal delivery radius: ${radiusKm} km`}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Full-Screen Leaflet Map Area */}
      <div className="flex-1 w-full h-full relative">
        <LeafletMap
          mode="explore"
          dataCenters={filteredDataCenters}
          selectedDcId={selectedDcId}
          onSelectDataCenter={(dc) => setSelectedDcId(dc.id)}
          radiusKm={radiusKm}
          showRadius={showRadius}
          heightClass="h-full"
        />

        {/* Floating Legend */}
        <div className="absolute bottom-5 left-5 z-20 hidden sm:block max-w-xs">
          <MapLegend showRadiusLegend={showRadius} radiusKm={radiusKm} />
        </div>

        {/* Selected Facility Floating Card (if any selected) */}
        {activeDc && (
          <div className="absolute top-5 right-5 z-20 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border-2 border-emerald-500/50 p-4 shadow-xl text-xs space-y-2.5 animate-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                Active Selection
              </span>
              <button
                onClick={() => setSelectedDcId(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                {activeDc.name}
              </h4>
              <p className="text-[11px] text-slate-500">
                {activeDc.operator} • {activeDc.city}, {activeDc.country}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-[11px]">
              <div>Capacity: <b>{activeDc.capacity_mw} MW</b></div>
              <div>PUE: <b>{activeDc.pue}</b></div>
              <div>Cooling: <b className="capitalize">{activeDc.cooling_type}</b></div>
              <div>Status: <b>{activeDc.status}</b></div>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Matching thermal radius of <b>{radiusKm} km</b> set for municipal and rural heat transmission.
            </p>

            <Link
              to={`/datacenter/${activeDc.id}`}
              className="flex items-center justify-center gap-1.5 w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-sm transition"
            >
              <span>View Details & Recovery Plan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
