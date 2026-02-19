
export const metricCalculations: Record<string, string> = {
  // Network Metrics
  otif: "<code>(Σ (Warehouse OTIF * Warehouse Dispatched Units)) / Σ (Total Dispatched Units)</code><br/>A weighted average of each warehouse's OTIF score, weighted by its dispatch volume.",
  networkResilience: "<code>(Avg. Warehouse Resilience * 0.7) + (Avg. Supplier Resilience * 0.3)</code><br/>A weighted average combining the resilience of all warehouses and suppliers.",
  costPerOrder: "<code>Σ (Warehouse Cost per Order) / Number of Warehouses</code><br/>A simple average of the fulfillment cost across all warehouses.",
  inventoryTurnover: "<code>Σ (Warehouse Inventory Turnover) / Number of Warehouses</code><br/>A simple average of the inventory turnover rate.",
  orderAccuracy: "<code>(Σ (Warehouse Accuracy * Dispatched Units)) / Σ (Total Dispatched Units)</code><br/>A weighted average of order accuracy, giving more weight to warehouses with higher volume.",

  // Node-Specific Resilience
  warehouseResilience: "<code>(Inventory Score * 0.6) + (Avg. Supplier Score * 0.4)</code><br/>Based 60% on inventory coverage and 40% on the reliability of its connected suppliers.",
  supplierResilience: "<code>100 - (Avg. Delay Hours * 3)</code><br/>A score that decreases as the average delivery delay increases.",

  // Warehouse-Specific Metrics
  dispatchDelayHours: "<code>(Daily Demand / Dispatch Capacity - 1) * 8</code><br/>Delay is calculated based on capacity strain. Delays occur when demand exceeds dispatch capacity.",
  dispatchedLast24h: "This is a base metric representing recorded operational data, not a calculated field.",

  // Component metrics for OTIF - these are base metrics in the mock data
  pickingSpeed: "This is a base metric representing worker performance, not calculated from other metrics.",
  packingEfficiency: "This is a base metric representing packing accuracy, not calculated from other metrics.",
  dispatchTimeliness: "This is a base metric representing shipping schedule adherence, not calculated from other metrics.",
  
  // Workforce Metrics - these are base metrics
  workforceActive: "",
  workforceOnTrack: "",
  picksPerHour: "",
  errorRate: "",
  rework: "",
  overtime: "",
};
