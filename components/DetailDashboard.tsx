
import React from 'react';
import type { Warehouse, Scenario, StorageItem, Company, Metrics } from '../types';
import type { CurrentUser } from '../App';
import MetricTree from './MetricTree';
import { WarehouseIcon, BackArrowIcon, InfoIcon } from './Icons';
import { useExplanation } from './ExplanationProvider';

interface DetailDashboardProps {
  company: Company;
  warehouse: Warehouse;
  onBack: () => void;
  scenario: Scenario;
  dispatch: React.Dispatch<any>;
  currentUser?: CurrentUser;
}

const ProcessFlowchart: React.FC<{ scenario: Scenario, warehouse: Warehouse }> = ({ scenario, warehouse }) => {
    const isProblem = (metricValue: number, threshold: number, direction: 'up' | 'down') => {
        if (scenario === 'normal') return false;
        return direction === 'up' ? metricValue > threshold : metricValue < threshold;
    }
    const inboundProblem = isProblem(warehouse.metrics.dockToStockTime.value, 8, 'up');
    
    const FlowStep = ({ label, isProblem }: {label: string, isProblem: boolean}) => (
        <div className={`text-center font-semibold rounded-lg px-4 py-3 transition-all duration-300 text-sm ${isProblem ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'}`}>
            {label}
        </div>
    );
    const Arrow = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )
  
    return (
    <div className="flex items-center justify-between gap-2 sm:gap-4 my-4 p-4 bg-white rounded-lg border border-slate-200">
        <div className="flex-1"><FlowStep label="Inbound" isProblem={inboundProblem} /></div>
        <Arrow />
        <div className="flex-1"><FlowStep label="Picking" isProblem={false} /></div>
        <Arrow />
        <div className="flex-1"><FlowStep label="Shipping" isProblem={false} /></div>
    </div>
    );
};

const InventoryDetails: React.FC<{ storage: StorageItem[] }> = ({ storage }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Inventory Details</h3>
        <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
            <ul className="divide-y divide-slate-200">
                {storage.map(item => (
                    <li key={item.item} className="py-2.5 flex justify-between items-center">
                        <span className="text-slate-600 font-medium text-sm">{item.item}</span>
                        <span className="font-mono font-semibold text-slate-800">{item.quantity.toLocaleString()} units</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

const DispatchAnalytics: React.FC<{ dispatched: number, delay: number }> = ({ dispatched, delay }) => {
    const { showExplanation } = useExplanation();

    return (
     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Dispatch Analytics</h3>
        <div className="grid grid-cols-2 gap-4">
            <div 
                className="bg-slate-50 p-3 rounded-md border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => showExplanation('dispatchedLast24h', 'Dispatched (24h)')}
            >
                <p className="text-sm text-slate-500 font-medium flex items-center gap-1">Dispatched (24h) <InfoIcon className="w-3 h-3 text-slate-400" /></p>
                <p className="text-2xl font-bold text-slate-800">{dispatched.toLocaleString()}</p>
            </div>
            <div 
                className={`p-3 rounded-md border cursor-pointer transition-colors ${delay > 0 ? 'bg-red-50 border-red-200 hover:bg-red-100' : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'}`}
                onClick={() => showExplanation('dispatchDelayHours', 'Avg. Dispatch Delay')}
            >
                <p className={`text-sm font-medium flex items-center gap-1 ${delay > 0 ? 'text-red-600' : 'text-emerald-600'}`}>Avg. Dispatch Delay <InfoIcon className="w-3 h-3" /></p>
                <p className={`text-2xl font-bold ${delay > 0 ? 'text-red-700' : 'text-emerald-700'}`}>{delay.toFixed(1)} hrs</p>
            </div>
        </div>
    </div>
    );
};


const DetailDashboard: React.FC<DetailDashboardProps> = ({ company, warehouse, onBack, scenario, dispatch, currentUser }) => {
  const handleWarehouseTargetChange = (metricKey: string, newValue: number) => {
    dispatch({
        type: 'UPDATE_WAREHOUSE_METRIC_TARGET',
        payload: {
            companyId: company.id,
            warehouseId: warehouse.id,
            metricKey: metricKey as keyof Metrics,
            newValue: newValue
        }
    });
  };
  const isWarehouseUser = currentUser?.role === 'warehouse';

  return (
    <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3 tracking-tight">
                <div className="bg-amber-100 p-2 rounded-lg border border-amber-200 shadow-sm">
                    <WarehouseIcon className="w-7 h-7 text-amber-700" />
                </div>
                {warehouse.name} Dashboard
            </h2>
            <button onClick={onBack} className="bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-lg border border-slate-300 transition-all duration-200 shadow-sm flex items-center gap-2 self-start sm:self-center hover:shadow-md hover:border-slate-400">
              { !isWarehouseUser && <BackArrowIcon />}
              {isWarehouseUser ? 'Logout' : 'Back to Network'}
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 flex flex-col gap-6">
                <MetricTree 
                    metrics={warehouse.metrics} 
                    scenario={scenario} 
                    title="Warehouse KPIs" 
                    onTargetChange={handleWarehouseTargetChange}
                />
                <InventoryDetails storage={warehouse.storage} />
                <DispatchAnalytics dispatched={warehouse.dispatchedLast24h} delay={warehouse.dispatchDelayHours} />
            </div>

            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Process Flow</h3>
                    <ProcessFlowchart scenario={scenario} warehouse={warehouse} />
                </div>
            </div>
        </div>
    </div>
  );
};

export default DetailDashboard;
