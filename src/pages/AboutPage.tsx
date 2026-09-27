import React from 'react';
import { Flame, Leaf, Globe2, ShieldCheck, Heart, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-slate-800 dark:text-slate-200">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Earth Forward Environmental Hackathon 2025</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          About OORJA AI
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Turning artificial intelligence's largest thermal footprint into clean warmth, electricity, and local prosperity for neighboring rural and municipal communities.
        </p>
      </div>

      {/* The Core Challenge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 dark:text-amber-300">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            The AI Waste Heat Paradox
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Every gigawatt poured into training AI models transforms into gigawatts of heat. Today, vast evaporative cooling towers and chillers dump this heat straight into the atmosphere, consuming billions of liters of potable water in the process.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
            <Leaf className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            The OORJA AI Vision
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Meanwhile, villages, greenhouses, food processing centers, and social housing mere kilometers away burn firewood, diesel, and coal for space heating and agricultural drying. OORJA AI bridges this gap with transparent thermodynamic simulation and geospatial routing.
          </p>
        </div>
      </div>

      {/* The 4 Principles of Scientific Honesty */}
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Our Scientific Honesty Pledge
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-semibold text-slate-900 dark:text-white">1. Transparent Uncertainty Bounds</div>
            <p className="text-slate-500 leading-relaxed">
              Every estimate provides Low, Base, and High scenarios, reflecting fluctuating server loads and seasonal weather variability.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-slate-900 dark:text-white">2. Clear Quality Badges</div>
            <p className="text-slate-500 leading-relaxed">
              We visibly separate audited measured data from empirical simulations and user submissions.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-slate-900 dark:text-white">3. Distance-Decay Accountability</div>
            <p className="text-slate-500 leading-relaxed">
              We never assume 100% heat transfer; pipeline friction and conductive cooling losses are rigorously factored in.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-slate-900 dark:text-white">4. Zero Paid Paywalls</div>
            <p className="text-slate-500 leading-relaxed">
              Engineered entirely on free, open public APIs: OpenStreetMap, Nominatim, Open-Meteo, and NASA POWER.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center p-8 rounded-2xl bg-emerald-950 text-white space-y-4 border border-emerald-800">
        <h3 className="text-xl font-bold">Ready to Explore Waste Heat Reuse?</h3>
        <p className="text-xs text-emerald-200/80 max-w-lg mx-auto">
          Start exploring global facilities, adjust thermodynamic sliders, and discover which villages can benefit today.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md"
          >
            Search Data Centers
          </Link>
          <Link
            to="/explore"
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white transition border border-white/20"
          >
            Open Explore Map
          </Link>
        </div>
      </div>
    </div>
  );
};
