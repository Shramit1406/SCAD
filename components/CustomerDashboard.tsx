
import React from 'react';
import type { Customer, Company, Warehouse } from '../types';
import { CustomerIcon, WarehouseIcon, CheckCircleIcon, TruckIcon, AlertTriangleIcon, InfoIcon } from './Icons';

interface CustomerDashboardProps {
  customer: Customer;
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

const OrderStatusCard: React.FC<{ status: string }> = ({ status }) => {
    let colorClass = 'text-slate-700 bg-slate-100';
    let icon = <InfoIcon className="w-8 h-8" />;
    
    switch (status.toLowerCase()) {
        case 'delivered':
            colorClass = 'text-emerald-700 bg-emerald-100';
            icon = <CheckCircleIcon className="w-8 h-8" />;
            break;
        case 'in transit':
            colorClass = 'text-sky-700 bg-sky-100';
            icon = <TruckIcon className="w-8 h-8" />;
            break;
        case 'delayed':
            colorClass = 'text-red-700 bg-red-100';
            icon = <AlertTriangleIcon className="w-8 h-8" />;
            break;
    }

    return (
        <div className={`p-6 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center ${colorClass}`}>
            <p className="text-sm font-medium opacity-80 mb-2">Current Order Status</p>
            {icon}
            <p className="text-2xl font-bold mt-2">{status}</p>
        </div>
    );
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ customer, company }) => {
    const supplyingWarehouses = company.data.connections
        .filter(c => c.to === customer.id)
        .map(c => company.data.warehouses.find(w => w.id === c.from))
        .filter(Boolean) as Warehouse[];

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h2 className="text-4xl font-extrabold text-slate-800 flex items-center gap-4 tracking-tight">
                     <div className="bg-purple-100 p-3 rounded-lg border border-purple-200 shadow-sm">
                        <CustomerIcon className="w-8 h-8 text-purple-700" />
                    </div>
                    <span>{customer.name} Portal</span>
                </h2>
                 <p className="text-slate-500 mt-2">Your hub for order tracking and supply chain information.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <StatCard 
                    title="Daily Demand" 
                    value={`${customer.demand.toLocaleString()} units`} 
                    icon={<CheckCircleIcon className="w-6 h-6 text-emerald-600" />} 
                />
                <OrderStatusCard status={customer.currentOrder.status} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-700 mb-4">Item Requirements</h3>
                    <div className="space-y-2">
                        {customer.requirements.map(item => (
                             <div key={item} className="bg-slate-50 p-3 rounded-md border text-slate-700 font-semibold">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-700 mb-4">Supplying Warehouses</h3>
                     <div className="space-y-3">
                        {supplyingWarehouses.map(wh => (
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

export default CustomerDashboard;
