import Dexie, { type Table } from 'dexie';

// Local replacement for the PocketBase backend. Everything is stored in the
// webview's IndexedDB. Records keep the PocketBase shape (id/created/updated)
// so the rest of the app did not need to change.

export type CollectionName =
  | 'projects'
  | 'workhour_details'
  | 'workday_logs'
  | 'signatures'
  | 'companies'
  | 'companies_contract_details';

export const COLLECTIONS: CollectionName[] = [
  'projects',
  'workhour_details',
  'workday_logs',
  'signatures',
  'companies',
  'companies_contract_details',
];

export interface DbRecord {
  id: string;
  created: string;
  updated: string;
  [key: string]: any;
}

class TimeLoggerDb extends Dexie {
  projects!: Table<DbRecord, string>;
  workhour_details!: Table<DbRecord, string>;
  workday_logs!: Table<DbRecord, string>;
  signatures!: Table<DbRecord, string>;
  companies!: Table<DbRecord, string>;
  companies_contract_details!: Table<DbRecord, string>;

  constructor() {
    super('time-logger');

    this.version(1).stores({
      projects: 'id, created',
      workhour_details: 'id, created',
      workday_logs: 'id, created, [year+month]',
      signatures: 'id, created',
      companies: 'id, created',
      companies_contract_details: 'id, created',
    });

    this.on('populate', (tx) => {
      Object.entries(SEED).forEach(([collection, rows]) => {
        tx.table(collection).bulkAdd(rows.map((row) => withTimestamps(row)));
      });
    });
  }
}

const db = new TimeLoggerDb();

// Default work types. Company-specific projects and companies are not bundled;
// load them with Restore from a backup (e.g. LEGACY_DATA.json) instead.
const SEED: Partial<Record<CollectionName, Record<string, any>[]>> = {
  workhour_details: [
    { id: '1', details: 'Development', short: '🔧', isThisWork: true, isReadonly: true },
    { id: '2', details: 'Leave', short: '🏝️', isThisWork: false, isReadonly: true },
    { id: '3', details: 'National Day', short: '🇷🇴', isThisWork: false, isReadonly: true },
  ],
};

// Field rules ported from the old pb_schema.json. PocketBase only checked
// min/max on non-empty values, and `required` meant non-empty.
interface FieldRule {
  required?: boolean;
  min?: number;
  max?: number;
}

const RULES: Record<CollectionName, Record<string, FieldRule>> = {
  projects: {
    name: { required: true, min: 1, max: 64 },
    odooid: { required: true, min: 1, max: 4 },
  },
  workhour_details: {
    details: { required: true, min: 5, max: 124 },
    short: { required: true, min: 1, max: 124 },
  },
  workday_logs: {
    day: { required: true, min: 1, max: 32 },
    month: { required: true, min: 1, max: 13 },
    year: { required: true, min: 1, max: 3000 },
    workedHours: { required: true },
  },
  signatures: {
    name: { required: true, min: 1, max: 40 },
    field: { required: true },
  },
  companies: {
    name: { required: true, min: 1, max: 124 },
    nrRegCom: { required: true, min: 1, max: 124 },
    cui: { required: true, min: 1, max: 20 },
    sediu: { required: true, min: 1, max: 512 },
    iban: { required: true, min: 1, max: 124 },
    bankName: { required: true, min: 1, max: 124 },
    capitalSocial: { max: 124 },
    delegat_nume: { max: 124 },
    delegat_cnp: { max: 124 },
    delegat_ciSerie: { max: 124 },
    delegat_ciNr: { max: 124 },
    delegat_eliberatDe: { max: 124 },
    judet: { max: 50 },
  },
  companies_contract_details: {
    description: { required: true, min: 1, max: 512 },
  },
};

/**
 * Thrown on invalid input. `data` has the same shape as a PocketBase 400
 * response so `dispatchApiValidationResponse` keeps working unchanged.
 */
export class ValidationError extends Error {
  data: {
    code: number;
    message: string;
    data: Record<string, { code: string; message: string }>;
  };

  constructor(fields: Record<string, { code: string; message: string }>) {
    super('Failed to save record.');
    this.data = { code: 400, message: this.message, data: fields };
  }
}

function isBlank(value: unknown) {
  return value === undefined || value === null || value === ''
    || (Array.isArray(value) && value.length === 0);
}

function validate(collection: CollectionName, record: Record<string, any>) {
  const errors: Record<string, { code: string; message: string }> = {};

  Object.entries(RULES[collection]).forEach(([field, rule]) => {
    const value = record[field];

    if (isBlank(value)) {
      if (rule.required) {
        errors[field] = { code: 'validation_required', message: 'Missing required value.' };
      }
      return;
    }

    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors[field] = { code: 'validation_min_number_constraint', message: `Must be larger than ${rule.min}.` };
      } else if (rule.max !== undefined && value > rule.max) {
        errors[field] = { code: 'validation_max_number_constraint', message: `Must be less than ${rule.max}.` };
      }
    } else if (typeof value === 'string') {
      const length = [...value].length;
      if (rule.min !== undefined && length < rule.min) {
        errors[field] = { code: 'validation_min_text_constraint', message: `Must be at least ${rule.min} character(s).` };
      } else if (rule.max !== undefined && length > rule.max) {
        errors[field] = { code: 'validation_max_text_constraint', message: `Must be less than ${rule.max} character(s).` };
      }
    }
  });

  if (Object.keys(errors).length) {
    throw new ValidationError(errors);
  }
}

function now() {
  return new Date().toISOString();
}

function withTimestamps(row: Record<string, any>): DbRecord {
  const timestamp = now();
  return { created: timestamp, updated: timestamp, ...row } as DbRecord;
}

function newId() {
  return crypto.randomUUID();
}

export const records = {
  /** All records of a collection, newest first. */
  async list<T = DbRecord>(collection: CollectionName): Promise<T[]> {
    const rows = await db.table<DbRecord, string>(collection).orderBy('created').reverse().toArray();
    return rows as unknown as T[];
  },

  async create<T = DbRecord>(collection: CollectionName, data: Record<string, any>): Promise<T> {
    validate(collection, data);
    const record = withTimestamps({ ...data, id: newId() });
    await db.table(collection).add(record);
    return record as unknown as T;
  },

  async update<T = DbRecord>(collection: CollectionName, id: string, data: Record<string, any>): Promise<T> {
    const table = db.table<DbRecord, string>(collection);
    const existing = await table.get(id);
    if (!existing) {
      throw new Error(`Record ${id} not found in ${collection}`);
    }

    const record = { ...existing, ...data, id, created: existing.created, updated: now() };
    validate(collection, record);
    await table.put(record);
    return record as unknown as T;
  },

  async delete(collection: CollectionName, id: string): Promise<void> {
    await db.table(collection).delete(id);
  },
};

/** Work day logs for the given months. */
export async function listWorkDays<T = DbRecord>(months: { month: number; year: number }[]): Promise<T[]> {
  const rows = await db.workday_logs
    .where('[year+month]')
    .anyOf(months.map(({ month, year }) => [year, month]))
    .toArray();
  return rows as unknown as T[];
}

export interface Backup {
  app: 'time-logger';
  version: 1;
  exportedAt: string;
  collections: Record<CollectionName, DbRecord[]>;
}

export async function exportBackup(): Promise<Backup> {
  const collections = {} as Record<CollectionName, DbRecord[]>;

  await db.transaction('r', COLLECTIONS, async () => {
    for (const name of COLLECTIONS) {
      collections[name] = await db.table<DbRecord, string>(name).toArray();
    }
  });

  return { app: 'time-logger', version: 1, exportedAt: now(), collections };
}

/** Replaces all local data with the contents of a backup. */
export async function importBackup(backup: unknown): Promise<void> {
  const parsed = backup as Partial<Backup> | null;
  if (!parsed || parsed.app !== 'time-logger' || parsed.version !== 1 || typeof parsed.collections !== 'object') {
    throw new Error('This file is not a Time logger backup.');
  }

  await db.transaction('rw', COLLECTIONS, async () => {
    for (const name of COLLECTIONS) {
      const rows = (parsed.collections?.[name] || []).map((row) => ({
        ...row,
        // PocketBase timestamps use a space instead of "T"; normalise so sorting stays consistent.
        created: String(row.created || now()).replace(' ', 'T'),
        updated: String(row.updated || now()).replace(' ', 'T'),
      }));

      await db.table(name).clear();
      await db.table(name).bulkAdd(rows);
    }
  });
}
