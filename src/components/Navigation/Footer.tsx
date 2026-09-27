import React from 'react';
import { Flame, Heart, Leaf, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1.5 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
              <Flame className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">OORJA AI</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Earth Forward Hackathon 2025
            </span>
          </div>
          <p className="max-w-md text-slate-500 dark:text-slate-400">
            Open-source thermodynamic decision-support engine connecting AI compute facilities with nearby agricultural, municipal, and rural thermal consumers.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-slate-600 dark:text-slate-400">
          <Link to="/explore" className="hover:text-emerald-600 transition">Explore Map</Link>
          <Link to="/compare" className="hover:text-emerald-600 transition">Compare Facilities</Link>
          <Link to="/methodology" className="hover:text-emerald-600 transition">Methodology & Formulas</Link>
          <Link to="/about" className="hover:text-emerald-600 transition">About the Project</Link>
        </div>

        <div className="flex flex-col items-center md:items-end gap-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              <Leaf className="w-3 h-3" /> Clean Waste Heat
            </span>
          </div>
          <div>Data: OpenStreetMap, Open-Meteo, NASA POWER</div>
        </div>
      </div>
    </footer>
  );
};
