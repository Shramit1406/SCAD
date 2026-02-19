
export type Scenario = 'normal' | 'problem';

export interface MetricDetail {
  value: number;
  target: number;
}

export interface CostMetric extends MetricDetail {
  labor: number;
  packaging: number;
  shipping: number;
}

export interface InventoryMetric extends MetricDetail {
  stockoutRate: number;
  overstockRate: number;
  shrinkageRate: number;
}

export interface Metrics {
  otif: MetricDetail;
  orderCycleTime: MetricDetail;
  orderAccuracy: MetricDetail;
  dockToStockTime: MetricDetail;
  costPerOrder: CostMetric;
  inventoryTurnover: InventoryMetric;
  pickingSpeed?: MetricDetail;
  packingEfficiency?: MetricDetail;
  dispatchTimeliness?: MetricDetail;
}

export interface Location {
    x: number;
    y: number;
}

export interface StorageItem {
    item: string;
    quantity: number;
}

export interface Warehouse {
  id:string;
  name: string;
  location: Location;
  metrics: Metrics;
  inventoryLevel: number;
  storage: StorageItem[];
  dispatchedLast24h: number;
  dispatchDelayHours: number;
  resilienceScore: number;
  username?: string;
  password?: string;
  workforce: {
    active: number;
    onTrack: number; // percentage
  };
  efficiency: {
    picksPerHour: number;
    errorRate: number; // percentage
    rework: number; // percentage
    overtime: number; // percentage
  };
}

export interface Supplier {
    id: string;
    name: string;
    location: Location;
    supplyCapacity: number; // units per day
    materialsSupplied: string[];
    averageDelayHours: number;
    deliveryTimeVariance: number; // in days
    resilienceScore: number; // 0-100
    username?: string;
    password?: string;
}

export interface Customer {
    id: string;
    name: string;
    location: Location;
    demand: number; // units per day
    requirements: string[];
    currentOrder: {
        id: string;
        status: string;
    };
    username?: string;
    password?: string;
}

export interface Connection {
    from: string;
    to: string;
    status: 'normal' | 'delayed';
    transitTime: number;
    capacity: number;
    utilization?: number;
}

export interface ScenarioData {
  networkName: string;
  networkMetrics: Metrics;
  warehouses: Warehouse[];
  suppliers: Supplier[];
  customers: Customer[];
  connections: Connection[];
  resilienceScore: number;
}

export interface Company {
    id: string;
    name: string;
    description: string;
    scenario: Scenario;
    data: ScenarioData;
    baseData: ScenarioData;
}
