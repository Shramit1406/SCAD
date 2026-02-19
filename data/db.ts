import Dexie, { type Table } from 'dexie';
import type { Company } from '../types';
import { companies as initialCompanies } from './mockData';

export class SupplyChainDB extends Dexie {
  companies!: Table<Company>; 

  constructor() {
    super('supplyChainDatabase');
    // FIX: Cast 'this' to Dexie to ensure 'version' method is found, as type inference from 'extends Dexie' was failing.
    (this as Dexie).version(1).stores({
      companies: 'id, name' // Primary key and indexed properties
    });
  }
}

export const db = new SupplyChainDB();

// Function to populate the database with initial data if it's empty
export async function seedDatabase() {
  const companyCount = await db.companies.count();
  if (companyCount === 0) {
    console.log("Database is empty, seeding with initial data...");
    // Recalculate all metrics before seeding
    const processedCompanies = initialCompanies.map(c => ({
      ...c, 
      data: recalculateAllMetrics(c.data), 
      baseData: structuredClone(recalculateAllMetrics(c.data)) 
    }));
    await db.companies.bulkAdd(processedCompanies);
    console.log("Database seeded successfully.");
    return processedCompanies;
  }
  const companiesFromDB = await db.companies.toArray();
  console.log("Database already contains data.");
  return companiesFromDB;
}

// Simple passthrough to a full recalculation function
// This avoids circular dependency issues by keeping heavy logic out of the DB file.
export function setRecalculateFunction(func: (data: any) => any) {
    recalculateAllMetrics = func;
}

// Placeholder for the actual recalculation function
let recalculateAllMetrics = (data: any) => data;