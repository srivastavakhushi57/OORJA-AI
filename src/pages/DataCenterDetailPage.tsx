import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Community, DataCenter, EnergyAssumptions, OtherDataCenterResult } from '../types';
import { calculateEnergyRecovery, getScenarioAssumptions, MONTH_NAMES } from '../lib/energy';
import { getOtherDataCenters } from '../lib/nearbyDataCenters';
import { getNearbyCommunities } from '../lib/communities';
import { getWeatherData, MonthlyWeatherData } from '../lib/weather';
import { getSolarPotential, SolarIrradianceData } from '../lib/solar';
import { exportDataCenterPdfReport, exportCommunitiesCsv } from '../lib/pdfExport';
import { DataQualityBadge } from '../components/UI/DataQualityBadge';
import { COOLING_COLORS, LeafletMap } from '../components/Map/LeafletMap';
import { EnergyCalculator } from '../components/DataCenter/EnergyCalculator';
import { CommunityTable } from '../components/DataCenter/CommunityTable';
import { OtherDataCentersTable } from '../components/DataCenter/OtherDataCentersTable';
import { ImpactPanel } from '../components/DataCenter/ImpactPanel';
import { ExplainEstimateModal } from '../components/DataCenter/ExplainEstimateModal';
import { AddEditDataCenterModal } from '../components/DataCenter/AddEditDataCenterModal';
import {
  Building2,
  MapPin,
  Calendar,
  Droplets,
  Zap,
  Globe2,
  ExternalLink,
  Edit3,
  Download,
  Share2,
  HelpCircle,
  Sun,
  Flame,
  Network,
  RefreshCw,
  Check,
  Map,
} from 'lucide-react';

interface DataCenterDetailPageProps {
  dataCenters: DataCenter[];
  onUpdateDataCenter: (dc: DataCenter) => void;
}

export const DataCenterDetailPage: React.FC<DataCenterDetailPageProps> = ({
  dataCenters,
  onUpdateDataCenter,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find active DC
  const dc = useMemo(() => {
    return dataCenters.find((item) => item.id === id) || dataCenters[0];
  }, [dataCenters, id]);

  // Current month default
  const defaultMonth = new Date().getMonth() + 1;

  // Assumptions state
  const [assumptions, setAssumptions] = useState<EnergyAssumptions>(() => {
    const preset = getScenarioAssumptions(
      dc?.cooling_type || 'liquid',
      'base',
      dc?.typical_utilization_pct || 70,
      dc?.pue || 1.25
    );
    return {
      month: defaultMonth,
      scenario: 'base',
      heat_reuse_mode: 'direct_heat',
      ...preset,
    };
  });

  // Re-sync assumptions if DC changes
  useEffect(() => {
    if (dc) {
      const preset = getScenarioAssumptions(
        dc.cooling_type,
        'base',
        dc.typical_utilization_pct,
        dc.pue
      );
      setAssumptions((prev) => ({
        ...prev,
        ...preset,
      }));
    }
  }, [dc?.id]);

  // Weather & Solar async state
  const [weatherData, setWeatherData] = useState<MonthlyWeatherData | null>(null);
  const [solarData, setSolarData] = useState<SolarIrradianceData | null>(null);

  // Communities state
  const [communities, setCommunities] = useState<Community[]>(dc?.preseeded_communities || []);
  const [communitySource, setCommunitySource] = useState<string>('seed_data');
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(false);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Load weather & solar data
  useEffect(() => {
    if (!dc) return;
    let isMounted = true;

    getWeatherData(dc.latitude, dc.longitude).then((w) => {
      if (isMounted) setWeatherData(w);
    });

    getSolarPotential(dc.latitude, dc.longitude, dc.capacity_mw).then((s) => {
      if (isMounted) setSolarData(s);
    });

    return () => {
      isMounted = false;
    };
  }, [dc?.id, dc?.latitude, dc?.longitude]);

  // Load Overpass / Seed communities
  useEffect(() => {
    if (!dc) return;
    let isMounted = true;
    setIsLoadingCommunities(true);

    getNearbyCommunities(dc, 25).then((res) => {
      if (isMounted) {
        setCommunities(res.communities);
        setCommunitySource(res.source);
        setIsLoadingCommunities(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [dc?.id]);

  // Other Data Centers via Haversine
  const otherDataCenters: OtherDataCenterResult[] = useMemo(() => {
    if (!dc) return [];
    return getOtherDataCenters(dc, dataCenters);
  }, [dc, dataCenters]);

  // Thermodynamic Energy Calculation
  const calculationResult = useMemo(() => {
    if (!dc) return null;
    const externalTemp = weatherData?.monthlyTemps?.[assumptions.month - 1];
    return calculateEnergyRecovery(dc, assumptions, externalTemp);
  }, [dc, assumptions, weatherData]);

  if (!dc || !calculationResult) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold mb-2">Data center not found</h2>
        <Link to="/" className="text-emerald-600 hover:underline">
          Return to search
        </Link>
      </div>
    );
  }

  const coolingInfo = COOLING_COLORS[dc.cooling_type] || COOLING_COLORS.liquid;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-emerald-500 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Direct share link copied to clipboard!</span>
        </div>
      )}

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-semibold text-white ${coolingInfo.bg}`}
            >
              {coolingInfo.label}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize border border-slate-200 dark:border-slate-700">
              {dc.status}
            </span>
            <DataQualityBadge quality={dc.data_quality} />
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {dc.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {dc.operator}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {dc.city}{dc.state ? `, ${dc.state}` : ''}, {dc.country} ({dc.latitude.toFixed(3)}°N, {dc.longitude.toFixed(3)}°E)
            </span>
            <span>•</span>
            <span>Updated: {dc.last_updated}</span>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Specifications</span>
          </button>

          <button
            onClick={() => setIsExplainModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Explain This Estimate</span>
          </button>

          <button
            onClick={() => exportDataCenterPdfReport(dc, calculationResult, assumptions.month - 1, communities)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => exportCommunitiesCsv(dc, communities)}
            className="p-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition"
            title="Export CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={handleShare}
            className="p-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition"
            title="Share Link"
          >
            <Share2 className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* 2. Specifications Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Capacity</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{dc.capacity_mw} MW</div>
          <span className="text-[10px] text-slate-500">Facility connection</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Design PUE</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{dc.pue}</div>
          <span className="text-[10px] text-slate-500">Power Usage Eff.</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Supply / Return</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {dc.cooling_supply_temp_c || (dc.cooling_type === 'liquid' ? 52 : 35)}°C
          </div>
          <span className="text-[10px] text-slate-500">Thermal fluid grade</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Water Use (WUE)</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{dc.approx_water_use_l_per_kwh} L</div>
          <span className="text-[10px] text-slate-500">Per kWh delivered</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Renewables Share</span>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{dc.renewable_share_pct}%</div>
          <span className="text-[10px] text-slate-500">Clean power PPA</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Grid Intensity</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{dc.grid_emission_factor_g_per_kwh}</div>
          <span className="text-[10px] text-slate-500">gCO2 / kWh</span>
        </div>
      </div>

      {/* Description & Sources Pill */}
      {(dc.description || (dc.sources && dc.sources.length > 0)) && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
            {dc.description}
          </p>
          {dc.sources && dc.sources.length > 0 && dc.sources[0] && (
            <a
              href={dc.sources[0]}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
            >
              <span>Audit Source Disclosures</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* 3 & 4. Monthly Energy Recovery Estimate & Charts Engine */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Thermodynamic Energy Recovery Simulator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live thermodynamic model calculating usable waste heat and optional ORC electricity generation for {MONTH_NAMES[assumptions.month - 1]}.
            </p>
          </div>
        </div>

        <EnergyCalculator
          dataCenter={dc}
          assumptions={assumptions}
          onAssumptionsChange={setAssumptions}
          calculationResult={calculationResult}
          communitiesCount={communities.length}
        />
      </section>

      {/* 5. Nearby Communities Map and Table */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Nearby Settlements & Thermal Consumers ({communities.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identified via OpenStreetMap Overpass within 25 km district heating piping radius. Ranked by distance, population heat demand, and pipeline feasibility.
            </p>
          </div>
          <div className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            Data Source: <b className="capitalize">{communitySource.replace('_', ' ')}</b>
          </div>
        </div>

        {/* Communities Map */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <LeafletMap
            mode="communities"
            activeDataCenter={dc}
            communities={communities}
            showRadius={true}
            radiusKm={25}
            heightClass="h-80 sm:h-96"
          />
        </div>

        {/* Communities Table */}
        <CommunityTable communities={communities} />
      </section>

      {/* 6. Other Data Centers Map & Sortable Table (Section 4.2.6 & Section 6b) */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Other Global Data Centers & Haversine Distance
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Great-circle Haversine distances to every other data center in the dataset. Faint connector lines illustrate network proximity with distance-decay opacity.
            </p>
          </div>
          <span className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {otherDataCenters.length} Other Facilities
          </span>
        </div>

        {/* Other Data Centers Map */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <LeafletMap
            mode="other_dcs"
            activeDataCenter={dc}
            otherDataCenters={otherDataCenters}
            heightClass="h-80 sm:h-96"
            zoom={3}
          />
        </div>

        {/* Other Data Centers Table */}
        <OtherDataCentersTable otherDataCenters={otherDataCenters} />
      </section>

      {/* 7. Environmental Impact Panel */}
      <section className="pt-4">
        <ImpactPanel calc={calculationResult} gridFactor={dc.grid_emission_factor_g_per_kwh} />
      </section>

      {/* Optional Rooftop Solar Potential Section (NASA POWER) */}
      {solarData && (
        <section className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Optional On-Site Rooftop Solar Potential (NASA POWER)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              NASA Climatology
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Based on NASA POWER surface solar irradiance at this location (annual average: <b>{solarData.annualAvgKwhM2Day} kWh/m²/day</b>), an estimated <b>{solarData.estimatedRooftopPvCapacityMw} MWp</b> rooftop solar array could generate approximately <b>{solarData.annualSolarGenerationMwh.toLocaleString()} MWh/year</b> of zero-carbon electricity to supplement cooling and heat-pump boost operations.
          </p>
        </section>
      )}

      {/* Edit Modal */}
      <AddEditDataCenterModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={dc}
        mode="edit"
        onSaved={(updated) => onUpdateDataCenter(updated)}
      />

      {/* Explain Estimate Modal */}
      <ExplainEstimateModal
        isOpen={isExplainModalOpen}
        onClose={() => setIsExplainModalOpen(false)}
        dc={dc}
        calc={calculationResult}
        assumptions={assumptions}
      />
    </div>
  );
};
