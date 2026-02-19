
import React from 'react';
import type { Company } from '../types';
import { WarningIcon, InfoIcon } from './Icons';

interface ScenarioControlProps {
  company: Company;
  dispatch: React.Dispatch<any>;
}

const ScenarioControl: React.FC<ScenarioControlProps> = ({ company, dispatch }) => {
    const hasActiveScenario = JSON.stringify(company.data) !== JSON.stringify(company.baseData);

    const handleSupplierOutage = () => {
        // Find the supplier with the highest capacity to make the impact significant
        const targetSupplier = [...company.baseData.suppliers].sort((a, b) => b.supplyCapacity - a.supplyCapacity)[0];
        if (targetSupplier) {
            dispatch({
                type: 'APPLY_STRESS_TEST',
                payload: {
                    companyId: company.id,
                    testType: 'SUPPLIER_OUTAGE',
                    targetId: targetSupplier.id,
                }
            });
        }
    };

    const handleDemandSpike = () => {
        // Find the customer with the highest demand
        const targetCustomer = [...company.baseData.customers].sort((a, b) => b.demand - a.demand)[0];
        if (targetCustomer) {
            dispatch({
                type: 'APPLY_STRESS_TEST',
                payload: {
                    companyId: company.id,
                    testType: 'DEMAND_SPIKE',
                    targetId: targetCustomer.id,
                }
            });
        }
    };

    const handleReset = () => {
        dispatch({ type: 'RESET_SCENARIO', payload: { companyId: company.id } });
    };

    return (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">Scenario Stress Testing</h3>
                    <p className="text-sm text-slate-500 max-w-lg">Apply temporary stress scenarios to test network resilience. The entire dashboard will update to reflect the impact.</p>
                </div>
                 <div className="flex items-center gap-2 mt-3 sm:mt-0 flex-shrink-0">
                    <button onClick={handleSupplierOutage} className="px-3 py-1.5 text-sm font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors flex items-center gap-1.5">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.22 3.001-1.742 3.001H4.42c-1.522 0-2.492-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                        Supplier Outage
                    </button>
                    <button onClick={handleDemandSpike} className="px-3 py-1.5 text-sm font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors flex items-center gap-1.5">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        Demand Spike
                    </button>
                </div>
            </div>
            {hasActiveScenario && (
                 <div className="mt-4 p-3 rounded-lg bg-sky-100 border border-sky-200 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                         <InfoIcon className="text-sky-600" />
                        <span className="font-semibold text-sky-800 text-sm">A temporary stress test is active. All KPIs reflect this simulated state.</span>
                    </div>
                    <button onClick={handleReset} className="px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-200 rounded-md transition-colors border border-slate-300 shadow-sm">
                        Reset to Baseline
                    </button>
                 </div>
            )}
        </div>
    );
};

export default ScenarioControl;