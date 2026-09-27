import React from 'react';
import { BookOpen, ShieldAlert, Cpu, Flame, Layers, Network, ExternalLink } from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-3 border border-emerald-300 dark:border-emerald-800">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Scientific Transparency & Honesty Guidelines</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          OORJA AI Thermodynamic & Geospatial Methodology
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
          Comprehensive documentation of mathematical models, thermodynamic governing equations, empirical transfer coefficients, and OpenStreetMap spatial matching logic.
        </p>
      </div>

      {/* 1. Core Thermodynamic Equations */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <Flame className="w-5 h-5 text-emerald-600" />
          1. Thermal Generation & Energy Balance
        </h2>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs leading-relaxed">
          <div className="font-semibold text-slate-900 dark:text-white text-sm">
            Effective IT Workload Power (P_IT):
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Data center capacity ratings typically denote total facility power utility connection (P_Facility). Using the Power Usage Effectiveness (PUE) standard defined by The Green Grid:
          </p>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg font-mono text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-slate-700">
            P_IT = (Capacity_MW × Utilization_%) / PUE
          </div>

          <div className="font-semibold text-slate-900 dark:text-white text-sm pt-2">
            Joule Thermal Conversion (Q_IT):
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            By conservation of energy, electrical energy delivered to CMOS microprocessors and memory modules does not leave the chip as mechanical work or chemical potential; over 98% is dissipated as thermal energy:
          </p>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg font-mono text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-slate-700">
            Q_IT = P_IT × 0.98 × 24 × Days_in_Month (MWh)
          </div>

          <div className="font-semibold text-slate-900 dark:text-white text-sm pt-2">
            Cooling Architecture Capture Efficiency (η_capture):
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li>
              <b>Direct Liquid Cooling (DLC):</b> Water/glycol loops directly touch GPU/TPU heatspreaders. Exits at 50°C - 65°C. η_capture ≈ 75% - 90%.
            </li>
            <li>
              <b>Hybrid Cooling (Rear-Door Heat Exchangers):</b> Combines internal fans with closed water coils. Exits at 35°C - 50°C. η_capture ≈ 55% - 75%.
            </li>
            <li>
              <b>Air Cooling (Hot/Cold Aisle Containment):</b> Air transfers heat to CRAH/CRAC units. Exits at 25°C - 35°C. η_capture ≈ 30% - 50%.
            </li>
          </ul>
        </div>
      </section>

      {/* 2. Organic Rankine Cycle & Power Generation */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <Cpu className="w-5 h-5 text-sky-600" />
          2. Low-Temperature Power Generation (ORC)
        </h2>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>
            When direct district heating networks are not viable in summer or tropical climates, low-boiling organic fluids (e.g. R134a, R245fa) in an <b>Organic Rankine Cycle (ORC)</b> can generate secondary electricity:
          </p>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg font-mono text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700">
            E_Electricity = Recoverable_Heat × η_ORC
          </div>
          <p>
            Due to Carnot limitations with low source temperatures (40-60°C) against ambient sinks (20-30°C), practical ORC electrical efficiencies are bounded between <b>3% and 10%</b>.
          </p>
        </div>
      </section>

      {/* 3. Distance Decay & Thermal Pipeline Hydraulics */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <Network className="w-5 h-5 text-amber-600" />
          3. Pipeline Transmission & Distance-Decay Model
        </h2>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>
            District heating pipe networks experience conductive thermal losses through insulation jacket walls. Our engine applies a distance-decay hydraulic model:
          </p>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg font-mono text-amber-700 dark:text-amber-300 border border-slate-200 dark:border-slate-700">
            Loss_% = 2.0% + (Distance_km × 0.50%/km)
          </div>
          <p>
            Piping feasibility is categorized into:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">High Feasibility (&lt; 8 km)</span>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">Capital expenditure payback &lt; 4 years; minimal thermal dissipation (&lt; 6%).</div>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
              <span className="font-bold text-amber-800 dark:text-amber-300">Medium Feasibility (8 - 20 km)</span>
              <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">Requires vacuum-insulated carrier piping; suitable for larger agro-complexes.</div>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800">
              <span className="font-bold text-rose-800 dark:text-rose-300">Challenging (&gt; 20 km)</span>
              <div className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">High transmission friction loss; only viable for extreme sub-zero baseload heat sinks.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Data Sources & Scientific Transparency */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <Layers className="w-5 h-5 text-teal-600" />
          4. Open Public Data Sources
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              OpenStreetMap Overpass API
            </span>
            <p className="text-slate-500 mt-1">
              Extracts spatial polygons and coordinates for villages, hamlets, suburbs, and farmland/greenhouse landuses within the matching perimeter.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              Open-Meteo Climatology
            </span>
            <p className="text-slate-500 mt-1">
              Provides monthly ambient temperatures that modulate space heating demand and cooling tower delta-T.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              NASA POWER API
            </span>
            <p className="text-slate-500 mt-1">
              Provides surface solar irradiance data (GHI) to estimate on-site rooftop renewable generation potential.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              IEA / CEA Carbon Intensity
            </span>
            <p className="text-slate-500 mt-1">
              Regional grid emission factors (gCO2/kWh) from the International Energy Agency and India Central Electricity Authority.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Glossary */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          5. Technical Glossary
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <dt className="font-bold text-slate-900 dark:text-white mb-1">PUE (Power Usage Effectiveness)</dt>
            <dd className="text-slate-500 leading-relaxed">
              Ratio of total facility energy to IT equipment energy. A PUE of 1.2 means 0.2 units of support energy (cooling, lighting, power conversion) are needed for every 1 unit of compute power.
            </dd>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <dt className="font-bold text-slate-900 dark:text-white mb-1">Low-Grade Waste Heat</dt>
            <dd className="text-slate-500 leading-relaxed">
              Thermal energy discharged at temperatures below 65°C. While too low for conventional steam turbines, it is ideal for floor warming, greenhouses, and aquaculture.
            </dd>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <dt className="font-bold text-slate-900 dark:text-white mb-1">District Heating Network (4GDH)</dt>
            <dd className="text-slate-500 leading-relaxed">
              4th-generation low-temperature centralized hot water distribution pipelines operating between 45°C and 70°C, capable of directly integrating industrial waste heat.
            </dd>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <dt className="font-bold text-slate-900 dark:text-white mb-1">Haversine Distance Decay</dt>
            <dd className="text-slate-500 leading-relaxed">
              Great-circle spherical trigonometry calculating geodesic distances on Earth, combined with pipe capital cost scaling to determine economic matching suitability.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
};
