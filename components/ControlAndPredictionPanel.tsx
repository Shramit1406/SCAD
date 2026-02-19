
import React, { useMemo } from 'react';
import type { Company, Warehouse, CostMetric } from '../types';
import { SupplierIcon, WarehouseIcon, CustomerIcon } from './Icons';

interface ControlAndPredictionPanelProps {
  company: Company;
  dispatch: React.Dispatch<any>;
}

const PredictionPanel: React.FC<{ warehouse: Warehouse; company: Company }> = ({ warehouse, company }) => {
    const dailyDemand = useMemo(() => {
        const connectedCustomerIds = company.data.connections
            .filter(c => c.from === warehouse.id)
            .map(c => c.to);
        
        return company.data.customers
            .filter(c => connectedCustomerIds.includes(c.id))
            .reduce((total, c) => total + c.demand, 0);
    }, [warehouse.id, warehouse.inventoryLevel, company.data.connections, company.data.customers]);

    const daysUntilStockout = (dailyDemand > 0)
        ? Math.floor(warehouse.inventoryLevel / dailyDemand)
        : Infinity;
    
    const stockoutStatus = daysUntilStockout < 7 ? 'critical' : daysUntilStockout < 30 ? 'warning' : 'healthy';
    const statusClasses = {
        critical: 'text-red-800 bg-red-100 border-red-200',
        warning: 'text-amber-800 bg-amber-100 border-amber-200',
        healthy: 'text-emerald-800 bg-emerald-100 border-emerald-200',
    };
    
    return (
        <div className={`mt-4 p-4 rounded-lg border ${statusClasses[stockoutStatus]}`}>
            <div className="font-bold text-sm uppercase tracking-wider">Inventory Forecast</div>
            {isFinite(daysUntilStockout) ? (
                <p><span className="text-4xl font-extrabold">{daysUntilStockout}</span> days until stockout</p>
            ) : (
                <p className="font-semibold text-lg mt-1">No outbound demand.</p>
            )}
            <p className="text-xs opacity-80">Based on current demand of {dailyDemand.toLocaleString()} units/day.</p>
        </div>
    );
};


const ControlAndPredictionPanel: React.FC<ControlAndPredictionPanelProps> = ({ company, dispatch }) => {
    
    const onUpdate = (updatedData: Partial<Company['data']>) => {
        dispatch({
            type: 'UPDATE_COMPANY_DATA',
            payload: { companyId: company.id, updatedData }
        });
    };
    
    const handleWarehouseChange = (id: string, field: keyof Warehouse | `efficiency.${keyof Warehouse['efficiency']}` | `workforce.${keyof Warehouse['workforce']}` | `cost.${keyof CostMetric}`, value: any) => {
        const updatedWarehouses = company.data.warehouses.map(wh => {
            if (wh.id !== id) return wh;
            
            const newWh = { ...wh };
            const parts = field.split('.');
            if (parts.length === 2) {
                const [category, subField] = parts;
                if(category === 'efficiency') newWh.efficiency = { ...newWh.efficiency, [subField]: value };
                if(category === 'workforce') newWh.workforce = { ...newWh.workforce, [subField]: value };
                if(category === 'cost') newWh.metrics.costPerOrder = { ...newWh.metrics.costPerOrder, [subField]: value };
            } else {
                (newWh as any)[field] = value;
            }
            return newWh;
        });
        onUpdate({ warehouses: updatedWarehouses });
    };

    const handleSupplierChange = (id: string, field: string, value: any) => {
        const updatedSuppliers = company.data.suppliers.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        );
        onUpdate({ suppliers: updatedSuppliers });
    };

    const handleCustomerChange = (id: string, value: any) => {
        const updatedCustomers = company.data.customers.map(c =>
            c.id === id ? { ...c, demand: value } : c
        );
        onUpdate({ customers: updatedCustomers });
    };

    const sliderClass = `w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer 
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
        [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md 
        [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-500 
        [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white 
        [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border-2 
        [&::-moz-range-thumb]:border-emerald-500`;
    
    const inputClass = "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm";


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <div className="md:col-span-2 lg:col-span-2 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="text-2xl font-bold text-slate-800 mb-1 tracking-tight">Live Network Controls</h3>
                <p className="text-slate-500 max-w-2xl">Adjust parameters below to simulate changes and see their impact across the dashboard in real-time. This is a powerful way to conduct 'what-if' analysis.</p>
            </div>
            {/* Warehouses */}
            <div className="space-y-4">
                <h4 className="text-xl font-semibold text-slate-700 flex items-center gap-2 tracking-tight"><WarehouseIcon className="w-6 h-6 text-amber-700"/> Warehouses</h4>
                {company.data.warehouses.map(wh => (
                    <div key={wh.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <strong className="font-bold text-slate-700">{wh.name}</strong>
                        <div className="mt-2 space-y-3">
                            <div>
                                <div className="flex justify-between items-center text-sm">
                                    <label className="font-medium text-slate-600">Inventory Level</label>
                                    <span className="font-mono font-semibold text-emerald-600">{wh.inventoryLevel.toLocaleString()} units</span>
                                </div>
                                <input type="range" min="5000" max="50000" step="500" value={wh.inventoryLevel} onChange={(e) => handleWarehouseChange(wh.id, 'inventoryLevel', parseInt(e.target.value))} className={sliderClass}/>
                            </div>
                             <div>
                                <div className="flex justify-between items-center text-sm">
                                    <label className="font-medium text-slate-600">Active Workforce</label>
                                    <span className="font-mono font-semibold text-emerald-600">{wh.workforce.active}</span>
                                </div>
                                <input type="range" min="0" max="200" step="1" value={wh.workforce.active} onChange={(e) => handleWarehouseChange(wh.id, 'workforce.active', parseInt(e.target.value))} className={sliderClass}/>
                            </div>
                             <div>
                                <div className="flex justify-between items-center text-sm">
                                    <label className="font-medium text-slate-600">Picks per Hour</label>
                                    <span className="font-mono font-semibold text-emerald-600">{wh.efficiency.picksPerHour}</span>
                                </div>
                                <input type="range" min="0" max="100" step="1" value={wh.efficiency.picksPerHour} onChange={(e) => handleWarehouseChange(wh.id, 'efficiency.picksPerHour', parseInt(e.target.value))} className={sliderClass}/>
                            </div>
                             <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500">Labor Cost</label>
                                    <input type="number" value={wh.metrics.costPerOrder.labor} onChange={(e) => handleWarehouseChange(wh.id, 'cost.labor', parseInt(e.target.value))} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500">Packaging</label>
                                    <input type="number" value={wh.metrics.costPerOrder.packaging} onChange={(e) => handleWarehouseChange(wh.id, 'cost.packaging', parseInt(e.target.value))} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500">Shipping</label>
                                    <input type="number" value={wh.metrics.costPerOrder.shipping} onChange={(e) => handleWarehouseChange(wh.id, 'cost.shipping', parseInt(e.target.value))} className={inputClass} />
                                </div>
                             </div>
                        </div>
                        <PredictionPanel warehouse={wh} company={company} />
                    </div>
                ))}
            </div>
             {/* Suppliers */}
            <div className="space-y-4">
                <h4 className="text-xl font-semibold text-slate-700 flex items-center gap-2 tracking-tight"><SupplierIcon className="w-6 h-6 text-sky-700" /> Suppliers</h4>
                {company.data.suppliers.map(sup => (
                    <div key={sup.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <strong className="font-bold text-slate-700">{sup.name}</strong>
                        <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <label className="font-medium text-slate-600">Average Delay</label>
                                <span className="font-mono font-semibold text-emerald-600">{sup.averageDelayHours.toFixed(1)} hrs</span>
                            </div>
                            <input type="range" min="0" max="24" step="0.5" value={sup.averageDelayHours} onChange={(e) => handleSupplierChange(sup.id, 'averageDelayHours', parseFloat(e.target.value))} className={sliderClass} />
                        </div>
                         <div className="mt-4 space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <label className="font-medium text-slate-600">Supply Capacity</label>
                                <span className="font-mono font-semibold text-emerald-600">{sup.supplyCapacity.toLocaleString()} u/day</span>
                            </div>
                            <input type="range" min="1000" max="15000" step="100" value={sup.supplyCapacity} onChange={(e) => handleSupplierChange(sup.id, 'supplyCapacity', parseInt(e.target.value))} className={sliderClass} />
                        </div>
                    </div>
                ))}
            </div>
             {/* Customers */}
            <div className="space-y-4 md:col-span-2">
                <h4 className="text-xl font-semibold text-slate-700 flex items-center gap-2 tracking-tight"><CustomerIcon className="w-6 h-6 text-purple-700" /> Customers</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.data.customers.map(cust => (
                        <div key={cust.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <strong className="font-bold text-slate-700">{cust.name}</strong>
                            <div className="mt-2 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <label className="font-medium text-slate-600">Daily Demand</label>
                                    <span className="font-mono font-semibold text-emerald-600">{cust.demand.toLocaleString()} u/day</span>
                                </div>
                                <input type="range" min="1000" max="15000" step="100" value={cust.demand} onChange={(e) => handleCustomerChange(cust.id, parseInt(e.target.value))} className={sliderClass} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ControlAndPredictionPanel;
