
import React, { useState, useMemo, useEffect } from 'react';
import type { Company, Warehouse, Metrics } from '../types';
import { Node } from '../App';
import MetricTree from './MetricTree';
import { DashboardIcon, MapIcon, ReportsIcon, ControlsIcon, ForecastIcon, WarehouseIcon as SelectorIcon, InfoIcon } from './Icons';
import { useExplanation } from './ExplanationProvider';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

import NetworkGraph from './NetworkGraph';
import ScenarioControl from './ScenarioControl';
import SummaryView from './SummaryView';
import ControlAndPredictionPanel from './ControlAndPredictionPanel';
import ForecastView from './ForecastView';


interface WarehouseDecisionHubProps {
  company: Company;
  onSelectNode: (node: Node) => void;
  onBack: () => void;
  dispatch: React.Dispatch<any>;
}

const NavTab: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex flex-shrink-0 items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                isActive 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-200'
            }`}
        >
            {icon}
            {label}
        </button>
    )
}

const OperationsWidget: React.FC<{ company: Company, selectedWarehouse: Warehouse | null }> = ({ company, selectedWarehouse }) => {
    const { showExplanation } = useExplanation();
    const cost = company.data.networkMetrics.costPerOrder.value;
    const isCostProblem = cost > company.data.networkMetrics.costPerOrder.target;

    return (
        <div className="bg-white p-5 h-full rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <h3 className="font-bold text-slate-700">Operations</h3>
            <div className="space-y-4 mt-2">
                <div 
                    className="flex items-center gap-3 p-2 -m-2 rounded-lg cursor-pointer hover:bg-slate-50/70 transition-colors"
                    onClick={() => showExplanation('costPerOrder', 'Cost-to-Serve (Network)')}
                >
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.133 0V7.151c.22.07.412.164.567.267zM11.567 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 01-1.133 0V7.151c.22.07.412.164.567.267z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.5 4.5 0 00-1.876.662C6.168 6.23 5.5 7.085 5.5 8.002v.004a.5.5 0 00.5.5h.292a.5.5 0 00.434-.252c.16-.266.386-.5.672-.693a.5.5 0 01.62-.033c.224.133.42.3.58.488a.5.5 0 00.62.033c.16-.266.386-.5.672-.693a.5.5 0 01.62-.033c.224.133.42.3.58.488a.5.5 0 00.62.033c.16-.266.386-.5.672-.693a.5.5 0 01.434-.252H14.5a.5.5 0 00.5-.5v-.004c0-.917-.668-1.772-1.624-2.234A4.5 4.5 0 0011 5.092V5zM8.5 12a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5h-3z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">Cost-to-Serve (Network) <InfoIcon className="w-3 h-3 text-slate-300" /></div>
                        <div className={`font-bold text-lg ${isCostProblem ? 'text-red-500' : 'text-slate-800'}`}>₹{cost.toFixed(0)}/order</div>
                    </div>
                </div>
                 <div 
                    className="flex items-center gap-3 p-2 -m-2 rounded-lg cursor-pointer hover:bg-slate-50/70 transition-colors"
                    onClick={() => showExplanation('workforceActive', 'Active Workforce')}
                >
                    <div className="p-2 bg-green-100 text-green-600 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">Workforce <InfoIcon className="w-3 h-3 text-slate-300" /></div>
                        <div className="font-bold text-lg text-slate-800">{selectedWarehouse?.workforce.active || 0} active</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const WorkforceEfficiencyWidget: React.FC<{ selectedWarehouse: Warehouse | null }> = ({ selectedWarehouse }) => {
    const { showExplanation } = useExplanation();
    const onTrack = selectedWarehouse?.workforce.onTrack || 0;
    const efficiency = selectedWarehouse?.efficiency || { picksPerHour: 0, errorRate: 0, rework: 0, overtime: 0 };
    const chartData = [{ name: 'On Track', value: onTrack, fill: '#10b981' }];

    const MetricRow: React.FC<{label: string, value: string | number, metricKey: string, valueClass?: string}> = ({label, value, metricKey, valueClass=""}) => (
        <div 
            className="flex justify-between items-center p-1 -m-1 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => showExplanation(metricKey, label)}
        >
            <span className="text-slate-500 flex items-center gap-1">{label} <InfoIcon className="w-3 h-3 text-slate-300" /></span>
            <span className={`font-bold ${valueClass}`}>{value}</span>
        </div>
    );

    return (
        <div className="bg-white p-5 h-full rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-700">Workforce Efficiency</h3>
            <div className="flex-grow flex items-center my-2 gap-6">
                <div className="w-32 h-32 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                            innerRadius="80%" 
                            outerRadius="100%" 
                            data={chartData} 
                            startAngle={90} 
                            endAngle={-270}
                            barSize={10}
                        >
                            <PolarAngleAxis
                                type="number"
                                domain={[0, 100]}
                                angleAxisId={0}
                                tick={false}
                            />
                            <RadialBar
                                background={{ fill: '#f1f5f9' }}
                                dataKey="value"
                                cornerRadius={5}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>
                 <div 
                    className="cursor-pointer"
                    onClick={() => showExplanation('workforceOnTrack', 'On Track Workforce')}
                 >
                    <div className="text-5xl font-extrabold text-slate-800 tracking-tight">{onTrack}<span className="text-3xl text-slate-500">%</span></div>
                    <div className="font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                        On Track 
                        <InfoIcon className="w-4 h-4" />
                    </div>
                </div>
            </div>
            <div className="space-y-2 text-sm">
                <MetricRow label="Picks/Hour" value={efficiency.picksPerHour} metricKey="picksPerHour" />
                <MetricRow label="Error Rate" value={`${efficiency.errorRate}%`} metricKey="errorRate" valueClass="text-amber-600" />
                <MetricRow label="Rework" value={`${efficiency.rework}%`} metricKey="rework" />
                <MetricRow label="Overtime" value={`${efficiency.overtime}%`} metricKey="overtime" />
            </div>
        </div>
    );
};

const WarehouseDecisionHub: React.FC<WarehouseDecisionHubProps> = ({ company, onSelectNode, onBack, dispatch }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(company.data.warehouses[0]?.id || null);

  useEffect(() => {
    // If there's no selected warehouse but warehouses exist, select the first one.
    // This handles the case of adding the very first warehouse.
    if (!selectedWarehouseId && company.data.warehouses.length > 0) {
      setSelectedWarehouseId(company.data.warehouses[0].id);
    }
    
    // If a warehouse is selected, but it no longer exists in the list (e.g., deleted),
    // reset the selection to the first available warehouse or null if none exist.
    if (selectedWarehouseId) {
        const warehouseExists = company.data.warehouses.some(wh => wh.id === selectedWarehouseId);
        if (!warehouseExists) {
            setSelectedWarehouseId(company.data.warehouses[0]?.id || null);
        }
    }
  }, [company.data.warehouses, selectedWarehouseId]);

  const selectedWarehouse = useMemo(() => 
    company.data.warehouses.find(wh => wh.id === selectedWarehouseId),
    [company.data.warehouses, selectedWarehouseId]
  );
  
  const tabs = [
      { label: 'Dashboard', icon: <DashboardIcon /> },
      { label: 'Map View', icon: <MapIcon /> },
      { label: 'Reports', icon: <ReportsIcon /> },
      { label: 'Controls', icon: <ControlsIcon /> },
      { label: 'Forecasts', icon: <ForecastIcon /> }
    ];

  const handleNetworkTargetChange = (metricKey: string, newValue: number) => {
    dispatch({
        type: 'UPDATE_NETWORK_METRIC_TARGET',
        payload: {
            companyId: company.id,
            metricKey: metricKey as keyof Metrics,
            newValue: newValue,
        }
    });
  };

  const renderDashboard = () => {
    if (!selectedWarehouse) {
        return (
            <div className="text-center py-20 bg-white mt-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-700">No Warehouse Selected</h3>
                <p className="text-slate-500 mt-2">Please add a warehouse to view dashboard analytics.</p>
            </div>
        );
    }
    return (
        <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <OperationsWidget company={company} selectedWarehouse={selectedWarehouse} />
                <WorkforceEfficiencyWidget selectedWarehouse={selectedWarehouse} />
            </div>
            <div>
                <MetricTree 
                    metrics={company.data.networkMetrics} 
                    scenario={company.scenario} 
                    title="Network Metric Tree" 
                    onTargetChange={handleNetworkTargetChange} 
                />
            </div>
        </div>
    );
  }

  const renderContent = () => {
    const animationWrapperClass = "mt-6";
    switch(activeTab) {
        case 'Dashboard':
            return renderDashboard();
        case 'Map View':
            return (
                <div className={animationWrapperClass}>
                    <ScenarioControl company={company} dispatch={dispatch} />
                    <div className="mt-6">
                         <NetworkGraph
                            company={company}
                            onSelectNode={onSelectNode}
                            dispatch={dispatch}
                        />
                    </div>
                </div>
            );
        case 'Reports':
            return (
                <div className={animationWrapperClass}>
                    <SummaryView data={company.data} />
                </div>
            );
        case 'Controls':
             return (
                <div className={animationWrapperClass}>
                    <ControlAndPredictionPanel company={company} dispatch={dispatch} />
                </div>
            );
        case 'Forecasts':
            return (
                <div className={animationWrapperClass}>
                    <ForecastView company={company} />
                </div>
            );
        default:
            return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{company.name}</h2>
              <p className="text-slate-500 mt-1 max-w-2xl">{company.description}</p>
            </div>
            <div className="flex items-center gap-4 self-start sm:self-center">
                 {activeTab === 'Dashboard' && company.data.warehouses.length > 0 && (
                    <div className="relative">
                        <SelectorIcon className="w-5 h-5 absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                            value={selectedWarehouseId || ''}
                            onChange={(e) => setSelectedWarehouseId(e.target.value)}
                            className="pl-10 pr-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {company.data.warehouses.map(wh => (
                                <option key={wh.id} value={wh.id}>{wh.name}</option>
                            ))}
                        </select>
                    </div>
                 )}
                <button onClick={onBack} className="bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-lg border border-slate-300 transition-all duration-200 shadow-sm flex items-center gap-2">
                  Change Company
                </button>
            </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg p-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
            {tabs.map(tab => (
                <NavTab 
                    key={tab.label}
                    label={tab.label}
                    icon={tab.icon}
                    isActive={activeTab === tab.label}
                    onClick={() => setActiveTab(tab.label)}
                />
            ))}
        </div>

        {renderContent()}
    </div>
  );
};

export default WarehouseDecisionHub;
