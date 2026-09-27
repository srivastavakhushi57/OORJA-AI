import React from 'react';
import { DataQuality } from '../../types';
import { ShieldCheck, HelpCircle, UserCheck, AlertTriangle } from 'lucide-react';

interface DataQualityBadgeProps {
  quality: DataQuality;
  showTooltip?: boolean;
}

export const DataQualityBadge: React.FC<DataQualityBadgeProps> = ({ quality }) => {
  let color = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let icon = <HelpCircle className="w-3 h-3" />;
  let explanation = 'Unverified or default baseline estimates.';

  switch (quality) {
    case 'Measured':
      color = 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      icon = <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />;
      explanation = 'Verified from official corporate sustainability reports, environmental disclosures, or audited PUE filings.';
      break;
    case 'Estimated':
      color = 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800';
      icon = <HelpCircle className="w-3 h-3 text-sky-600 dark:text-sky-400" />;
      explanation = 'Derived through thermodynamic simulation and industry-standard empirical benchmarks.';
      break;
    case 'User-submitted':
      color = 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
      icon = <UserCheck className="w-3 h-3 text-purple-600 dark:text-purple-400" />;
      explanation = 'Added by community user; awaiting primary source verification or peer review.';
      break;
    case 'Dummy':
      color = 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      icon = <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />;
      explanation = 'Placeholder demonstration data for prototyping purposes.';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${color} shadow-2xs group relative cursor-help`}
      title={explanation}
    >
      {icon}
      <span>{quality}</span>
    </span>
  );
};
