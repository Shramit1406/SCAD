
import React from 'react';

const LegendItem: React.FC<{
  colorClass?: string;
  label: string;
  isDashed?: boolean;
  isPulsing?: boolean;
  isLine?: boolean;
  lineThickness?: number;
}> = ({ colorClass, label, isDashed, isPulsing, isLine, lineThickness }) => (
  <div className="flex items-center gap-2.5 text-xs text-slate-600">
    <div className="w-5 h-6 flex items-center justify-center">
      {isDashed ? (
        <div className="w-4 h-px border-t-2 border-dashed border-orange-500"></div>
      ) : isPulsing ? (
        <div className="w-4 h-4 rounded-full border-2 border-red-500 animate-[pulse_2s_ease-in-out_infinite]"></div>
      ) : isLine ? (
          <div className="w-4 h-full flex items-center">
              <div className={`w-full bg-slate-400`} style={{ height: `${lineThickness}px` }}></div>
          </div>
      ) : (
        <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
      )}
    </div>
    <span>{label}</span>
  </div>
);

const ColorKey: React.FC = () => {
  return (
    <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-lg z-20 w-80">
      <h5 className="font-bold text-sm text-slate-700 mb-2">Legend</h5>
      
      <h6 className="font-semibold text-xs text-slate-600 mb-1">Node Status</h6>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <LegendItem colorClass="bg-emerald-500" label="High Resilience" />
        <LegendItem colorClass="bg-amber-500" label="Medium Resilience" />
        <LegendItem colorClass="bg-red-500" label="Low Resilience" />
        <LegendItem isPulsing={true} label="Critical Supplier Delay" />
      </div>

      <h6 className="font-semibold text-xs text-slate-600 mb-1 mt-2">Connection Status</h6>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <LegendItem colorClass="bg-sky-500" label="Normal Utilization" />
        <LegendItem colorClass="bg-purple-500" label="High Utilization" />
        <LegendItem colorClass="bg-red-500" label="Critical Utilization" />
        <LegendItem isDashed={true} label="Delayed" />
      </div>
      
      <div className="mt-2 pt-2 border-t border-slate-200">
        <h6 className="font-semibold text-xs text-slate-600 mb-1">Connection Capacity</h6>
        <div className="space-y-1">
            <LegendItem isLine={true} lineThickness={2} label="Lower Capacity" />
            <LegendItem isLine={true} lineThickness={6} label="Higher Capacity" />
        </div>
      </div>
    </div>
  );
};

export default ColorKey;