import React, { useState, useMemo } from 'react';
import { DataCenter } from '../types';
import { DataCenterCard } from '../components/DataCenter/DataCenterCard';
import { LeafletMap } from '../components/Map/LeafletMap';
import { MapLegend } from '../components/Map/MapLegend';
import { searchNominatim, GeocodingResult } from '../lib/geocoding';
import {
  Search,
  Filter,
  Flame,
  Globe,
  SlidersHorizontal,
  PlusCircle,
  Building,
  MapPin,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface HomePageProps {
  dataCenters: DataCenter[];
  onOpenAddModal: (initialData?: Partial<DataCenter>) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ dataCenters, onOpenAddModal }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCooling, setSelectedCooling] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [minCapacity, setMinCapacity] = useState<number>(0);
  const [previewDc, setPreviewDc] = useState<DataCenter | null>(dataCenters[0] || null);

  // Nominatim web geocoding search state
  const [isSearchingNominatim, setIsSearchingNominatim] = useState(false);
  const [nominatimResults, setNominatimResults] = useState<GeocodingResult[]>([]);
  const [hasSearchedNominatim, setHasSearchedNominatim] = useState(false);

  // Autocomplete / Filtered Data Centers
  const filteredDataCenters = useMemo(() => {
    return dataCenters.filter((dc) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        dc.name.toLowerCase().includes(q) ||
        dc.operator.toLowerCase().includes(q) ||
        dc.city.toLowerCase().includes(q) ||
        dc.country.toLowerCase().includes(q);

      const matchesRegion = selectedRegion === 'all' || dc.region === selectedRegion;
      const matchesCooling = selectedCooling === 'all' || dc.cooling_type === selectedCooling;
      const matchesStatus = selectedStatus === 'all' || dc.status === selectedStatus;
      const matchesCapacity = dc.capacity_mw >= minCapacity;

      return matchesSearch && matchesRegion && matchesCooling && matchesStatus && matchesCapacity;
    });
  }, [dataCenters, searchQuery, selectedRegion, selectedCooling, selectedStatus, minCapacity]);

  // Handle Nominatim external search
  const handleNominatimSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingNominatim(true);
    setHasSearchedNominatim(true);
    const results = await searchNominatim(searchQuery);
    setNominatimResults(results);
    setIsSearchingNominatim(false);
  };

  const handleSelectNominatimResult = (item: GeocodingResult) => {
    onOpenAddModal({
      name: item.name || item.displayName.split(',')[0],
      operator: 'New Operator',
      city: item.city || item.displayName.split(',')[0],
      country: item.country || 'Global',
      latitude: item.latitude,
      longitude: item.longitude,
      capacity_mw: 50,
      pue: 1.25,
      cooling_type: 'liquid',
      data_quality: 'User-submitted',
      sources: [`https://www.openstreetmap.org/search?query=${encodeURIComponent(item.displayName)}`],
    });
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative pt-8 pb-4 text-center max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-4 border border-emerald-300 dark:border-emerald-800 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Earth Forward Hackathon • AI Clean Energy & Heat Recovery</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
          Discover How Much Energy Your Local AI Data Center Can Return
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          AI servers generate gigawatt-hours of uncaptured heat. OORJA AI models recoverable waste heat and electricity, matching data centers with nearby agricultural and rural communities within district piping reach.
        </p>

        {/* Global Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <div className="relative flex items-center shadow-lg rounded-2xl overflow-hidden border-2 border-emerald-600/40 dark:border-emerald-500/40 bg-white dark:bg-slate-900 focus-within:border-emerald-600 transition">
            <Search className="w-5 h-5 ml-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHasSearchedNominatim(false);
              }}
              placeholder="Search by data center name, operator (e.g. Yotta, Google, AWS), or city..."
              className="w-full py-3.5 px-3 text-sm text-slate-900 dark:text-white bg-transparent outline-none placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setHasSearchedNominatim(false);
                }}
                className="px-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* If no exact match in database, offer Nominatim search */}
          {searchQuery && filteredDataCenters.length === 0 && (
            <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left text-xs shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    "{searchQuery}" not found in current local database.
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    Search global OpenStreetMap (Nominatim) for this location or facility to create an entry.
                  </p>
                </div>
                <button
                  onClick={handleNominatimSearch}
                  disabled={isSearchingNominatim}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shrink-0 transition"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{isSearchingNominatim ? 'Searching OSM...' : 'Search Web Map'}</span>
                </button>
              </div>

              {/* Nominatim Results */}
              {hasSearchedNominatim && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
                    OpenStreetMap Locations Found:
                  </div>
                  {nominatimResults.length === 0 ? (
                    <div className="text-slate-500 italic">
                      No web map matches found. Click below to enter coordinates manually.
                    </div>
                  ) : (
                    nominatimResults.map((item) => (
                      <div
                        key={item.placeId}
                        className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition"
                      >
                        <div className="truncate pr-2">
                          <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{item.displayName}</div>
                        </div>
                        <button
                          onClick={() => handleSelectNominatimResult(item)}
                          className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 rounded hover:bg-emerald-100 transition"
                        >
                          + Create Entry
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-xs">
          {/* Region */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">All Regions</option>
            <option value="Asia Pacific">Asia Pacific (India / Asia)</option>
            <option value="North America">North America</option>
            <option value="Europe">Europe</option>
          </select>

          {/* Cooling Type */}
          <select
            value={selectedCooling}
            onChange={(e) => setSelectedCooling(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">All Cooling Systems</option>
            <option value="liquid">Liquid Cooled (High Delta)</option>
            <option value="hybrid">Hybrid Cooled</option>
            <option value="air">Air Cooled</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">All Operational Statuses</option>
            <option value="operational">Operational</option>
            <option value="under construction">Under Construction</option>
          </select>

          {/* Capacity Slider chip */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            <span>Min Capacity: <b>{minCapacity} MW</b></span>
            <input
              type="range"
              min="0"
              max="150"
              step="10"
              value={minCapacity}
              onChange={(e) => setMinCapacity(parseInt(e.target.value))}
              className="w-16 accent-emerald-600 cursor-pointer"
            />
          </div>

          {(selectedRegion !== 'all' || selectedCooling !== 'all' || selectedStatus !== 'all' || minCapacity > 0) && (
            <button
              onClick={() => {
                setSelectedRegion('all');
                setSelectedCooling('all');
                setSelectedStatus('all');
                setMinCapacity(0);
              }}
              className="px-2.5 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-white underline text-[11px]"
            >
              Reset filters
            </button>
          )}
        </div>
      </section>

      {/* World Map Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Global Data Centers World Preview Map
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any cluster marker on the map to preview its energy profile and jump straight into its nearby community thermal recovery plan.
            </p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            <span>Open Dedicated Full-Screen Explore Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Map Surface */}
          <div className="lg:col-span-2 relative">
            <LeafletMap
              mode="preview"
              dataCenters={filteredDataCenters}
              selectedDcId={previewDc?.id}
              onSelectDataCenter={(dc) => setPreviewDc(dc)}
              heightClass="h-[460px]"
            />
            <div className="absolute bottom-4 left-4 z-20 hidden sm:block">
              <MapLegend showRadiusLegend={false} />
            </div>
          </div>

          {/* Interactive Selected Data Center Preview Card */}
          <div className="lg:col-span-1">
            {previewDc ? (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    Selected Data Center
                  </span>
                  <span className="text-xs font-semibold text-slate-500 capitalize">
                    {previewDc.cooling_type} Cooling
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {previewDc.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {previewDc.operator} • {previewDc.city}, {previewDc.country}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Total Capacity</span>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{previewDc.capacity_mw} MW</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Design PUE</span>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{previewDc.pue}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Renewables</span>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{previewDc.renewable_share_pct}%</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Grid Intensity</span>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{previewDc.grid_emission_factor_g_per_kwh} g/kWh</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {previewDc.description || 'Hyperscale AI training infrastructure candidate for local agricultural and residential waste heat distribution.'}
                </p>

                <Link
                  to={`/datacenter/${previewDc.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md transition"
                >
                  <span>Open Full Recovery Engine</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
                Click a marker on the map to preview facility details.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Data Centers Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Featured AI Data Centers ({filteredDataCenters.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select any facility to calculate monthly waste heat output and examine nearby village matching.
            </p>
          </div>
          <button
            onClick={() => onOpenAddModal()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Custom Facility</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDataCenters.map((dc) => (
            <DataCenterCard key={dc.id} dc={dc} />
          ))}
        </div>
      </section>
    </div>
  );
};
