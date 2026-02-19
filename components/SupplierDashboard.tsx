
import React from 'react';
import type { Supplier, Company } from '../types';
import { SupplierIcon, WarehouseIcon, CheckCircleIcon } from './Icons';

interface SupplierDashboardProps {
  supplier: Supplier;
  company: Company;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="bg-slate-100 p-3 rounded-lg">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);


const SupplierDashboard: React.FC<SupplierDashboardProps> = ({ supplier, company }) => {
    const connectedWarehouses = company.data.connections
        .filter(c => c.from === supplier.id)
        .map(c => company.data.warehouses.find(w => w.id === c.to))
        .filter(Boolean) as Company['data']['warehouses'];

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h2 className="text-4xl font-extrabold text-slate-800 flex items-center gap-4 tracking-tight">
                    <div className="bg-sky-100 p-3 rounded-lg border border-sky-200 shadow-sm">
                        <SupplierIcon className="w-8 h-8 text-sky-700" />
                    </div>
                    <span>{supplier.name} Portal</span>
                </h2>
                <p className="text-slate-500 mt-2">Your central hub for performance metrics and connection details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard 
                    title="Supply Capacity" 
                    value={`${supplier.supplyCapacity.toLocaleString()} u/day`} 
                    icon={<CheckCircleIcon className="w-6 h-6 text-emerald-600" />} 
                />
                <StatCard 
                    title="Average Delay" 
                    value={`${supplier.averageDelayHours.toFixed(1)} hrs`} 
                    icon={<WarehouseIcon className="w-6 h-6 text-amber-600" />} 
                />
                 <StatCard 
                    title="Resilience Score" 
                    value={`${supplier.resilienceScore}`} 
                    icon={<SupplierIcon className="w-6 h-6 text-sky-600" />} 
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-700 mb-4">Materials Supplied</h3>
                    <div className="space-y-2">
                        {supplier.materialsSupplied.map(material => (
                             <div key={material} className="bg-slate-50 p-3 rounded-md border text-slate-700 font-semibold">
                                {material}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-700 mb-4">Connected Warehouses</h3>
                     <div className="space-y-3">
                        {connectedWarehouses.map(wh => (
                             <div key={wh.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-md border">
                                <div className="bg-amber-100 p-2 rounded-md">
                                    <WarehouseIcon className="w-5 h-5 text-amber-700" />
                                </div>
                                <span className="text-slate-700 font-semibold">{wh.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierDashboard;
