
import React from 'react';
// FIX: Corrected import to include newly added icons.
import { FlowIcon, PerformanceIcon, SummaryIcon, ControlsIcon, ForecastIcon } from './Icons';

interface TabsProps {
  tabs: string[];
  activeTab: string;
  onTabClick: (tab: string) => void;
}

const tabIcons: { [key: string]: React.ReactNode } = {
    'Chain Flow': <FlowIcon />,
    'Overall Performance': <PerformanceIcon />,
    'Data Summary': <SummaryIcon />,
    'Live Controls': <ControlsIcon />,
    'Analytics & Forecasts': <ForecastIcon />,
};

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div className="bg-slate-100 p-1 rounded-xl">
      <nav className="flex flex-wrap sm:flex-nowrap space-x-1" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabClick(tab)}
            className={`${
              activeTab === tab
                ? 'bg-white text-emerald-600 shadow'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-800'
            } flex-1 whitespace-nowrap py-2.5 px-4 text-sm font-semibold rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100 flex items-center justify-center gap-2`}
            aria-current={activeTab === tab ? 'page' : undefined}
          >
            {tabIcons[tab]}
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;