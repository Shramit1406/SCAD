
import React, { useState, useMemo, useReducer, useEffect } from 'react';
import type { Warehouse, Supplier, Customer, Company, Connection, ScenarioData, Metrics, MetricDetail } from './types';
import Header from './components/Header';
import DetailDashboard from './components/DetailDashboard';
import CompanySelector from './components/CompanySelector';
import WarehouseDecisionHub from './components/WarehouseDecisionHub';
import Login from './components/Login';
import SupplierDashboard from './components/SupplierDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import { ExplanationProvider } from './components/ExplanationProvider';
import { db, seedDatabase, setRecalculateFunction } from './data/db';

type ViewLevel = 'companySelection' | 'network' | 'detail';
export type Node = Warehouse | Supplier | Customer;
export type NodeType = 'supplier' | 'warehouse' | 'customer';

export type CurrentUser = {
  id: string;
  name: string;
  role: 'admin' | 'supplier' | 'warehouse' | 'customer';
  companyId?: string;
} | null;


// --- Helper Functions ---
const calculateNetworkMetrics = (data: ScenarioData): Metrics => {
    if (data.warehouses.length === 0) {
        return { 
            otif: { value: 100, target: 95 }, 
            orderCycleTime: { value: 0, target: 24 }, 
            orderAccuracy: { value: 100, target: 99 }, 
            dockToStockTime: { value: 0, target: 8 },
            costPerOrder: { value: 0, target: 150, labor: 0, packaging: 0, shipping: 0 },
            inventoryTurnover: { value: 0, target: 10, stockoutRate: 0, overstockRate: 0, shrinkageRate: 0 },
            pickingSpeed: { value: 0, target: 35 },
            packingEfficiency: { value: 100, target: 97 },
            dispatchTimeliness: { value: 100, target: 95 }
        };
    }

    const weightedMetric = (metricKey: keyof Metrics, weightKey: keyof Warehouse) => {
        const totalWeight = data.warehouses.reduce((sum, wh) => sum + (wh[weightKey] as number), 0);
        if (totalWeight === 0) {
            const avg = data.warehouses.reduce((sum, wh) => sum + ((wh.metrics[metricKey] as MetricDetail)?.value || 0), 0) / data.warehouses.length;
            return isNaN(avg) ? 0 : avg;
        }
        const result = data.warehouses.reduce((sum, wh) => sum + ((wh.metrics[metricKey] as MetricDetail)?.value || 0) * (wh[weightKey] as number), 0) / totalWeight;
        return isNaN(result) ? 0 : result;
    }
    
    const simpleAverage = (metricKey: keyof Omit<Metrics, 'costPerOrder' | 'inventoryTurnover'>) => {
        if (data.warehouses.length === 0) return 0;
        const avg = data.warehouses.reduce((sum, wh) => sum + ((wh.metrics[metricKey] as MetricDetail)?.value || 0), 0) / data.warehouses.length;
        return isNaN(avg) ? 0 : avg;
    }
    
    const sumMetric = (subMetricKey: 'labor' | 'packaging' | 'shipping') => {
        if (data.warehouses.length === 0) return 0;
        const avg = data.warehouses.reduce((sum, wh) => sum + wh.metrics.costPerOrder[subMetricKey], 0) / data.warehouses.length;
        return isNaN(avg) ? 0 : avg;
    }

    const otif = { value: weightedMetric('otif', 'dispatchedLast24h'), target: data.networkMetrics.otif.target };
    const orderCycleTime = { value: simpleAverage('orderCycleTime'), target: data.networkMetrics.orderCycleTime.target };
    const orderAccuracy = { value: weightedMetric('orderAccuracy', 'dispatchedLast24h'), target: data.networkMetrics.orderAccuracy.target };
    const dockToStockTime = { value: simpleAverage('dockToStockTime'), target: data.networkMetrics.dockToStockTime.target };

    const costPerOrder = {
        value: data.warehouses.reduce((sum, wh) => sum + wh.metrics.costPerOrder.value, 0) / data.warehouses.length || 0,
        target: data.networkMetrics.costPerOrder.target,
        labor: sumMetric('labor'),
        packaging: sumMetric('packaging'),
        shipping: sumMetric('shipping')
    };
    
    const inventoryTurnover = {
      value: data.warehouses.reduce((sum, wh) => sum + wh.metrics.inventoryTurnover.value, 0) / data.warehouses.length || 0,
      target: data.networkMetrics.inventoryTurnover.target,
      stockoutRate: data.warehouses.reduce((sum, wh) => sum + wh.metrics.inventoryTurnover.stockoutRate, 0) / data.warehouses.length || 0,
      overstockRate: data.warehouses.reduce((sum, wh) => sum + wh.metrics.inventoryTurnover.overstockRate, 0) / data.warehouses.length || 0,
      shrinkageRate: data.warehouses.reduce((sum, wh) => sum + wh.metrics.inventoryTurnover.shrinkageRate, 0) / data.warehouses.length || 0,
    };
    
    const pickingSpeed = { value: simpleAverage('pickingSpeed'), target: data.networkMetrics.pickingSpeed?.target || 35 };
    const packingEfficiency = { value: simpleAverage('packingEfficiency'), target: data.networkMetrics.packingEfficiency?.target || 97 };
    const dispatchTimeliness = { value: simpleAverage('dispatchTimeliness'), target: data.networkMetrics.dispatchTimeliness?.target || 95 };


    return { otif, orderCycleTime, orderAccuracy, dockToStockTime, costPerOrder, inventoryTurnover, pickingSpeed, packingEfficiency, dispatchTimeliness };
};

const recalculateAllMetrics = (data: ScenarioData): ScenarioData => {
    const newData = { ...data };

    const supplierMap = new Map(newData.suppliers.map(s => [s.id, s]));

    newData.suppliers = newData.suppliers.map(sup => {
        const delayPenalty = Math.min(sup.averageDelayHours, 24) * 3;
        const resilienceScore = Math.max(0, 100 - delayPenalty);
        return { ...sup, resilienceScore };
    });

    newData.warehouses = newData.warehouses.map(wh => {
        const connectedSupplierIds = newData.connections.filter(c => c.to === wh.id).map(c => c.from);
        const connectedSuppliers = connectedSupplierIds.map(id => supplierMap.get(id)).filter(Boolean) as Supplier[];
        
        const avgInboundDelay = connectedSuppliers.length > 0 
            ? connectedSuppliers.reduce((sum, sup) => sum + sup.averageDelayHours, 0) / connectedSuppliers.length
            : 0;
        const newDockToStockTime = 6 + (avgInboundDelay * 1.5);

        const dailyDemand = newData.connections
            .filter(c => c.from === wh.id)
            .reduce((sum, conn) => sum + (newData.customers.find(cust => cust.id === conn.to)?.demand || 0), 0);
        
        const dispatchCapacity = wh.dispatchedLast24h || 1; // Avoid division by zero
        const capacityStrain = Math.max(0, (dailyDemand / dispatchCapacity) - 1);
        const newDispatchDelayHours = capacityStrain * 8;

        const inventorySafetyStockDays = 3;
        const inventoryCoverageDays = dailyDemand > 0 ? wh.inventoryLevel / dailyDemand : Infinity;
        const inventoryPenalty = inventoryCoverageDays < inventorySafetyStockDays 
            ? (inventorySafetyStockDays - inventoryCoverageDays) * 5
            : 0;
        
        const inventoryScore = Math.min(100, (inventoryCoverageDays / 10) * 100);
        const supplierResilienceAvg = connectedSuppliers.length > 0
            ? connectedSuppliers.reduce((sum, sup) => sum + sup.resilienceScore, 0) / connectedSuppliers.length
            : 100;
        const resilienceScore = Math.round((inventoryScore * 0.6) + (supplierResilienceAvg * 0.4));

        const dockToStockPenalty = Math.max(0, newDockToStockTime - 8) / 2;
        const dispatchDelayPenalty = newDispatchDelayHours / 4;
        const newOtifValue = Math.max(70, 99.5 - dockToStockPenalty - dispatchDelayPenalty - inventoryPenalty);
        const newOrderCycleTimeValue = 20 + newDockToStockTime + newDispatchDelayHours;
        const newOrderAccuracyValue = Math.max(90, 99.5 - (inventoryPenalty / 2) - wh.efficiency.errorRate);
        
        const costPerOrderValue = wh.metrics.costPerOrder.labor + wh.metrics.costPerOrder.packaging + wh.metrics.costPerOrder.shipping + (wh.efficiency.rework * 2);
        const annualDemand = dailyDemand * 365;
        const inventoryTurnoverValue = wh.inventoryLevel > 0 ? annualDemand / wh.inventoryLevel : 0;
        const pickingSpeedTarget = wh.metrics.pickingSpeed?.target || 35;
        const onTrackPercentage = pickingSpeedTarget > 0 ? Math.min(100, Math.round((wh.efficiency.picksPerHour / pickingSpeedTarget) * 100)) : 0;
        
        const newMetrics: Metrics = {
            ...wh.metrics,
            costPerOrder: { ...wh.metrics.costPerOrder, value: costPerOrderValue },
            pickingSpeed: { ...wh.metrics.pickingSpeed, value: wh.efficiency.picksPerHour },
            inventoryTurnover: { ...wh.metrics.inventoryTurnover, value: inventoryTurnoverValue },
            dockToStockTime: { ...wh.metrics.dockToStockTime, value: newDockToStockTime },
            otif: { ...wh.metrics.otif, value: newOtifValue },
            orderCycleTime: { ...wh.metrics.orderCycleTime, value: newOrderCycleTimeValue },
            orderAccuracy: { ...wh.metrics.orderAccuracy, value: newOrderAccuracyValue },
        };

        const newWorkforce = { ...wh.workforce, onTrack: onTrackPercentage };

        return { ...wh, metrics: newMetrics, dispatchDelayHours: newDispatchDelayHours, resilienceScore, workforce: newWorkforce };
    });
    
    newData.connections = newData.connections.map(conn => {
        const supplier = supplierMap.get(conn.from);
        const customer = newData.customers.find(c => c.id === conn.to);
        const warehouseFrom = newData.warehouses.find(w => w.id === conn.from);
        const warehouseTo = newData.warehouses.find(w => w.id === conn.to);

        let throughput = 0;
        if(supplier && warehouseTo) {
            throughput = supplier.supplyCapacity;
        } else if (warehouseFrom && customer) {
            throughput = customer.demand;
        }
        
        const utilization = conn.capacity > 0 ? Math.min(1, throughput / conn.capacity) : 0;
        const status = (supplier && supplier.averageDelayHours > 1) ? 'delayed' : 'normal';

        return { ...conn, status, utilization };
    });

    newData.networkMetrics = calculateNetworkMetrics(newData);
    const avgWarehouseResilience = newData.warehouses.length > 0
      ? newData.warehouses.reduce((sum, wh) => sum + wh.resilienceScore, 0) / newData.warehouses.length
      : 100;
    const avgSupplierResilience = newData.suppliers.length > 0
      ? newData.suppliers.reduce((sum, s) => sum + s.resilienceScore, 0) / newData.suppliers.length
      : 100;
    newData.resilienceScore = Math.round((avgWarehouseResilience * 0.7) + (avgSupplierResilience * 0.3));

    return newData;
};

// Pass the function to the db module
setRecalculateFunction(recalculateAllMetrics);


// --- Reducer Logic ---
type Action =
  | { type: 'SET_COMPANIES'; payload: Company[] }
  | { type: 'UPDATE_COMPANY_DATA'; payload: { companyId: string; updatedData: Partial<ScenarioData> } }
  | { type: 'ADD_NODE'; payload: { companyId: string; nodeType: NodeType; nodeData: Node } }
  | { type: 'UPDATE_NODE'; payload: { companyId: string; nodeType: NodeType; nodeData: Node } }
  | { type: 'DELETE_NODE'; payload: { companyId: string; nodeId: string; nodeType: NodeType } }
  | { type: 'UPDATE_CONNECTION'; payload: { companyId: string; connectionData: Connection } }
  | { type: 'ADD_COMPANY'; payload: { companyData: Company } }
  | { type: 'DELETE_COMPANY'; payload: { companyId: string } }
  | { type: 'APPLY_STRESS_TEST'; payload: { companyId: string; testType: 'SUPPLIER_OUTAGE' | 'DEMAND_SPIKE'; targetId: string } }
  | { type: 'RESET_SCENARIO'; payload: { companyId: string } }
  | { type: 'UPDATE_NETWORK_METRIC_TARGET'; payload: { companyId: string; metricKey: keyof Metrics; newValue: number } }
  | { type: 'UPDATE_WAREHOUSE_METRIC_TARGET'; payload: { companyId: string; warehouseId: string; metricKey: keyof Metrics; newValue: number } };

const companyReducer = (state: Company[], action: Action): Company[] => {
  if (action.type === 'SET_COMPANIES') {
    return action.payload;
  }

  const newState = state.map(company => {
    if (action.type === 'ADD_COMPANY') return company;
    if (company.id !== action.payload.companyId) return company;

    let newCompany = { ...company };

    switch (action.type) {
      case 'UPDATE_COMPANY_DATA':
        newCompany.data = { ...newCompany.data, ...action.payload.updatedData };
        break;
      
      case 'RESET_SCENARIO':
        newCompany.data = structuredClone(newCompany.baseData);
        newCompany.data = recalculateAllMetrics(newCompany.data);
        return newCompany;

      case 'APPLY_STRESS_TEST': {
        const tempData = structuredClone(newCompany.baseData);
        if (action.payload.testType === 'SUPPLIER_OUTAGE') {
            tempData.suppliers = tempData.suppliers.map(s => 
                s.id === action.payload.targetId ? { ...s, supplyCapacity: 0, averageDelayHours: 99 } : s
            );
        }
        if (action.payload.testType === 'DEMAND_SPIKE') {
            tempData.customers = tempData.customers.map(c =>
                c.id === action.payload.targetId ? { ...c, demand: c.demand * 1.5 } : c
            );
        }
        newCompany.data = tempData;
        break;
      }
      
      case 'ADD_NODE': {
        const { nodeType, nodeData } = action.payload;
        const newData = { ...newCompany.data };
        if (nodeType === 'supplier') newData.suppliers.push(nodeData as Supplier);
        if (nodeType === 'warehouse') newData.warehouses.push(nodeData as Warehouse);
        if (nodeType === 'customer') newData.customers.push(nodeData as Customer);
        newCompany.data = newData;
        newCompany.baseData = structuredClone(newData);
        break;
      }

      case 'UPDATE_NODE': {
        const { nodeType, nodeData } = action.payload;
        const newData = { ...newCompany.data };
        if (nodeType === 'supplier') newData.suppliers = newData.suppliers.map(s => s.id === nodeData.id ? (nodeData as Supplier) : s);
        if (nodeType === 'warehouse') newData.warehouses = newData.warehouses.map(w => w.id === nodeData.id ? (nodeData as Warehouse) : w);
        if (nodeType === 'customer') newData.customers = newData.customers.map(c => c.id === nodeData.id ? (nodeData as Customer) : c);
        newCompany.data = newData;
        newCompany.baseData = structuredClone(newData);
        break;
      }
      
      case 'UPDATE_CONNECTION': {
        const { connectionData } = action.payload;
        const newData = { ...newCompany.data };
        newData.connections = newData.connections.map(conn => 
            (conn.from === connectionData.from && conn.to === connectionData.to) ? connectionData : conn
        );
        newCompany.data = newData;
        newCompany.baseData = structuredClone(newData);
        break;
      }

      case 'DELETE_NODE': {
        const { nodeId, nodeType } = action.payload;
        const newData = { ...newCompany.data };
        if (nodeType === 'supplier') newData.suppliers = newData.suppliers.filter(s => s.id !== nodeId);
        if (nodeType === 'warehouse') newData.warehouses = newData.warehouses.filter(w => w.id !== nodeId);
        if (nodeType === 'customer') newData.customers = newData.customers.filter(c => c.id !== nodeId);
        newData.connections = newData.connections.filter(c => c.from !== nodeId && c.to !== nodeId);
        newCompany.data = newData;
        newCompany.baseData = structuredClone(newData);
        break;
      }
      case 'UPDATE_NETWORK_METRIC_TARGET': {
        const { metricKey, newValue } = action.payload;
        const metric = newCompany.data.networkMetrics[metricKey] as MetricDetail | undefined;
        if (metric) {
            metric.target = newValue;
            newCompany.baseData.networkMetrics = structuredClone(newCompany.data.networkMetrics);
        }
        break;
      }
      case 'UPDATE_WAREHOUSE_METRIC_TARGET': {
        const { warehouseId, metricKey, newValue } = action.payload;
        const updateMetric = (data: ScenarioData) => {
             data.warehouses = data.warehouses.map(wh => {
                if (wh.id === warehouseId) {
                    const newWh = { ...wh };
                    const metric = newWh.metrics[metricKey] as MetricDetail | undefined;
                    if (metric) {
                        metric.target = newValue;
                    }
                    return newWh;
                }
                return wh;
            });
        }
        updateMetric(newCompany.data);
        updateMetric(newCompany.baseData);
        break;
      }
    }

    if (action.type !== 'DELETE_COMPANY') {
        newCompany.data = recalculateAllMetrics(newCompany.data);
         if (action.type === 'UPDATE_COMPANY_DATA' || action.type === 'APPLY_STRESS_TEST') {
            // do nothing to baseData
         } else {
            newCompany.baseData = structuredClone(newCompany.data);
        }
    }
    
    return newCompany;
  });

  switch (action.type) {
    case 'ADD_COMPANY':
      return [...newState, action.payload.companyData];
    case 'DELETE_COMPANY':
      return state.filter(company => company.id !== action.payload.companyId);
    default:
      return newState;
  }
};


const App: React.FC = () => {
  const [companies, dispatch] = useReducer(companyReducer, []);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [viewLevel, setViewLevel] = useState<ViewLevel>('companySelection');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Load from DB on mount
  useEffect(() => {
    const loadData = async () => {
        const data = await seedDatabase();
        dispatch({ type: 'SET_COMPANIES', payload: data });
        setIsLoading(false);
        setTimeout(() => setIsInitialLoad(false), 100); // Allow initial render before enabling sync
    };
    loadData();
  }, []);
  
  // Sync to DB on change
  useEffect(() => {
    if (!isInitialLoad && !isLoading) {
        db.companies.clear().then(() => {
            db.companies.bulkAdd(companies);
        });
    }
  }, [companies, isInitialLoad, isLoading]);


  const selectedCompany = useMemo(() => {
    return companies.find(c => c.id === selectedCompanyId) || null;
  }, [selectedCompanyId, companies]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId || !selectedCompany) return null;
    const allNodes: Node[] = [...selectedCompany.data.warehouses, ...selectedCompany.data.suppliers, ...selectedCompany.data.customers];
    return allNodes.find(n => n.id === selectedNodeId) || null;
  }, [selectedNodeId, selectedCompany]);

  const handleLogin = (username: string, password) => {
    setLoginError(null);
    if (username === 'admin' && password === 'admin123') {
        setCurrentUser({ id: 'admin', name: 'Admin', role: 'admin' });
        return;
    }
    
    for (const company of companies) {
        const nodes: (Supplier | Warehouse | Customer)[] = [
            ...company.data.suppliers, 
            ...company.data.warehouses, 
            ...company.data.customers
        ];
        
        for (const node of nodes) {
            if (node.username === username && node.password === password) {
                let role: CurrentUser['role'] = 'supplier';
                if ('metrics' in node) role = 'warehouse';
                else if ('demand' in node) role = 'customer';

                setCurrentUser({ id: node.id, name: node.name, role, companyId: company.id });
                return;
            }
        }
    }
    setLoginError("Invalid username or password.");
  }

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedCompanyId(null);
    setSelectedNodeId(null);
    setViewLevel('companySelection');
  }

  const handleSelectCompany = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
        setSelectedCompanyId(companyId);
        setViewLevel('network');
    }
  };

  const handleSelectNode = (node: Node) => {
    if ('metrics' in node) { // Only warehouses are selectable for detail view
        setSelectedNodeId(node.id);
        setViewLevel('detail');
    }
  };

  const handleBackToNetwork = () => {
    setSelectedNodeId(null);
    setViewLevel('network');
  };
  
  const handleBackToCompanySelection = () => {
    if (selectedCompanyId) {
        dispatch({ type: 'RESET_SCENARIO', payload: { companyId: selectedCompanyId } });
    }
    setSelectedCompanyId(null);
    setSelectedNodeId(null);
    setViewLevel('companySelection');
  };
  
  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <svg className="animate-spin h-10 w-10 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="ml-4 text-lg font-semibold text-slate-600">Loading Supply Chain Data...</p>
            </div>
        );
    }
    
    if (!currentUser) {
        return <Login onLogin={handleLogin} error={loginError} />;
    }
    
    // --- Admin View ---
    if (currentUser.role === 'admin') {
      switch(viewLevel) {
          case 'companySelection':
              return <CompanySelector companies={companies} onSelect={handleSelectCompany} dispatch={dispatch} />;
          case 'network':
              if (selectedCompany) {
                  return <WarehouseDecisionHub
                    company={selectedCompany}
                    onSelectNode={handleSelectNode}
                    onBack={handleBackToCompanySelection}
                    dispatch={dispatch}
                  />;
              }
              handleBackToCompanySelection();
              return null;
          case 'detail':
              if (selectedNode && 'metrics' in selectedNode && selectedCompany) { // Ensures it's a Warehouse
                  return <DetailDashboard
                    company={selectedCompany}
                    warehouse={selectedNode}
                    onBack={handleBackToNetwork}
                    scenario={selectedCompany.scenario}
                    dispatch={dispatch}
                  />;
              }
              handleBackToNetwork(); 
              return null;
      }
    }

    // --- Role-Based Views ---
    const company = companies.find(c => c.id === currentUser.companyId);
    if (!company) {
        return <div>Error: Company data not found for user.</div>;
    }

    switch(currentUser.role) {
      case 'warehouse': {
        const warehouse = company.data.warehouses.find(w => w.id === currentUser.id);
        if (!warehouse) return <div>Error: Warehouse data not found.</div>;
        return <DetailDashboard company={company} warehouse={warehouse} onBack={handleLogout} scenario={company.scenario} dispatch={dispatch} />;
      }
      case 'supplier': {
        const supplier = company.data.suppliers.find(s => s.id === currentUser.id);
        if (!supplier) return <div>Error: Supplier data not found.</div>;
        return <SupplierDashboard company={company} supplier={supplier} />;
      }
      case 'customer': {
        const customer = company.data.customers.find(c => c.id === currentUser.id);
        if (!customer) return <div>Error: Customer data not found.</div>;
        return <CustomerDashboard company={company} customer={customer} />;
      }
    }

    return null; // Should not be reached
  }

  return (
    <ExplanationProvider>
      <div className="min-h-screen bg-slate-100 text-slate-800" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Header currentUser={currentUser} onLogout={handleLogout} />
        <main className="p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </ExplanationProvider>
  );
};

export default App;
