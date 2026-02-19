
import type { Company, ScenarioData } from '../types';

const innovateIncData: ScenarioData = {
    networkName: "Innovate Inc. Network",
    networkMetrics: {
        otif: { value: 98.5, target: 95 },
        orderCycleTime: { value: 22, target: 24 },
        orderAccuracy: { value: 99.2, target: 99 },
        dockToStockTime: { value: 6, target: 8 },
        costPerOrder: { value: 135, target: 140, labor: 65, packaging: 20, shipping: 50 },
        inventoryTurnover: { value: 8.5, target: 9, stockoutRate: 1.5, overstockRate: 4, shrinkageRate: 0.8 },
        pickingSpeed: { value: 36, target: 35 },
        packingEfficiency: { value: 98, target: 97 },
        dispatchTimeliness: { value: 96, target: 95 },
    },
    resilienceScore: 92,
    suppliers: [
        { id: 'sup-detroit', name: 'Detroit Parts Co.', location: { x: 10, y: 25 }, supplyCapacity: 5000, materialsSupplied: ['Engine Blocks', 'Chassis'], averageDelayHours: 0.5, deliveryTimeVariance: 0.5, resilienceScore: 95, username: 'detroit', password: 'detroit123' },
        { id: 'sup-sf', name: 'SF Electronics', location: { x: 10, y: 75 }, supplyCapacity: 8000, materialsSupplied: ['Microchips', 'Wiring Harness'], averageDelayHours: 0.2, deliveryTimeVariance: 0.2, resilienceScore: 98 },
    ],
    warehouses: [
        {
            id: 'wh-chicago',
            name: 'Chicago, IL',
            location: { x: 40, y: 25 },
            inventoryLevel: 15000,
            username: 'chicago',
            password: 'chicago123',
            metrics: {
                otif: { value: 98.8, target: 95 },
                orderCycleTime: { value: 21, target: 24 },
                orderAccuracy: { value: 99.5, target: 99 },
                dockToStockTime: { value: 5.5, target: 8 },
                costPerOrder: { value: 130, target: 140, labor: 60, packaging: 20, shipping: 50 },
                inventoryTurnover: { value: 8, target: 9, stockoutRate: 2, overstockRate: 5, shrinkageRate: 1 },
                pickingSpeed: { value: 37, target: 35 },
                packingEfficiency: { value: 98, target: 97 },
                dispatchTimeliness: { value: 97, target: 95 },
            },
            storage: [{ item: 'Engine Blocks', quantity: 7000 }, { item: 'Chassis', quantity: 8000 }],
            dispatchedLast24h: 4800,
            dispatchDelayHours: 0,
            resilienceScore: 90,
            workforce: { active: 124, onTrack: 91 },
            efficiency: { picksPerHour: 41, errorRate: 1.5, rework: 6.5, overtime: 4 },
        },
    ],
    customers: [
        { id: 'cust-nyc', name: 'NYC Retail', location: { x: 85, y: 25 }, demand: 4500, requirements: ['Daily Restock'], currentOrder: { id: 'ORD-NYC-001', status: 'In Transit' }, username: 'nyc', password: 'nyc123' },
        { id: 'cust-dallas', name: 'Dallas Hub', location: { x: 85, y: 75 }, demand: 7000, requirements: ['Just-in-Time'], currentOrder: { id: 'ORD-DAL-001', status: 'Delivered' } },
    ],
    connections: [
        { from: 'sup-detroit', to: 'wh-chicago', status: 'normal', transitTime: 12, capacity: 6000 },
        { from: 'sup-sf', to: 'wh-la', status: 'normal', transitTime: 18, capacity: 9000 },
        { from: 'wh-chicago', to: 'cust-nyc', status: 'normal', transitTime: 24, capacity: 5000 },
    ]
};

const legacyLogisticsData: ScenarioData = {
    networkName: "Legacy Logistics Network",
    networkMetrics: {
        otif: { value: 85.2, target: 95 },
        orderCycleTime: { value: 38, target: 24 },
        orderAccuracy: { value: 99.1, target: 99 },
        dockToStockTime: { value: 18, target: 8 },
        costPerOrder: { value: 180, target: 140, labor: 90, packaging: 30, shipping: 60 },
        inventoryTurnover: { value: 4, target: 9, stockoutRate: 15, overstockRate: 10, shrinkageRate: 3 },
        pickingSpeed: { value: 28, target: 35 },
        packingEfficiency: { value: 94, target: 97 },
        dispatchTimeliness: { value: 88, target: 95 },
    },
    resilienceScore: 45,
    suppliers: [
        { id: 'sup-legacy-a', name: 'Global Parts Corp', location: { x: 10, y: 50 }, supplyCapacity: 6000, materialsSupplied: ['Industrial Gears', 'Bearings'], averageDelayHours: 12, deliveryTimeVariance: 4.5, resilienceScore: 30 },
    ],
    warehouses: [
        {
            id: 'wh-newark',
            name: 'Newark, NJ',
            location: { x: 40, y: 50 },
            inventoryLevel: 28000,
            metrics: {
                otif: { value: 75.6, target: 95 },
                orderCycleTime: { value: 45, target: 24 },
                orderAccuracy: { value: 99.4, target: 99 },
                dockToStockTime: { value: 28, target: 8 },
                costPerOrder: { value: 180, target: 140, labor: 90, packaging: 30, shipping: 60 },
                inventoryTurnover: { value: 4, target: 9, stockoutRate: 15, overstockRate: 10, shrinkageRate: 3 },
                pickingSpeed: { value: 28, target: 35 },
                packingEfficiency: { value: 94, target: 97 },
                dispatchTimeliness: { value: 88, target: 95 },
            },
            storage: [{ item: 'Industrial Gears', quantity: 15000 }, { item: 'Bearings', quantity: 13000 }],
            dispatchedLast24h: 5300,
            dispatchDelayHours: 8,
            resilienceScore: 60,
             workforce: { active: 105, onTrack: 78 },
            efficiency: { picksPerHour: 35, errorRate: 3.2, rework: 9.1, overtime: 12 },
        }
    ],
    customers: [
        { id: 'cust-east-coast', name: 'East Coast Distribution', location: { x: 85, y: 50 }, demand: 5500, requirements: ['Bulk Shipments', 'Quality Inspection'], currentOrder: { id: 'ORD-EC-001', status: 'Delayed' } },
    ],
    connections: [
        { from: 'sup-legacy-a', to: 'wh-newark', status: 'delayed', transitTime: 32, capacity: 6000 },
        { from: 'wh-newark', to: 'cust-east-coast', status: 'normal', transitTime: 16, capacity: 5500 },
    ]
};

export const companies: Company[] = [
    {
        id: 'innovate-inc',
        name: 'Innovate Inc.',
        description: 'A modern, high-efficiency logistics network operating at peak performance.',
        scenario: 'normal',
        data: structuredClone(innovateIncData),
        baseData: structuredClone(innovateIncData),
    },
    {
        id: 'legacy-logistics',
        name: 'Legacy Logistics',
        description: 'An older network experiencing significant inbound delays affecting overall performance.',
        scenario: 'problem',
        data: structuredClone(legacyLogisticsData),
        baseData: structuredClone(legacyLogisticsData),
    }
];
