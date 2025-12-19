import { Measurement } from '../types';

// Define the sql.js types roughly
interface Database {
  run(sql: string, params?: any[]): void;
  exec(sql: string): Array<{ columns: string[]; values: any[][] }>;
  export(): Uint8Array;
  close(): void;
}

interface SqlJsStatic {
  Database: new (data?: Uint8Array) => Database;
}

const DB_STORAGE_KEY = 'body_track_sqlite_db_v1';
const WASM_URL = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm';

let db: Database | null = null;
let SQL: SqlJsStatic | null = null;

// Helper to convert Uint8Array to Base64 string for LocalStorage
const toBase64 = (u8: Uint8Array): string => {
  let binary = '';
  const len = u8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(u8[i]);
  }
  return window.btoa(binary);
};

// Helper to convert Base64 string to Uint8Array from LocalStorage
const fromBase64 = (str: string): Uint8Array => {
  const binaryString = window.atob(str);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const initDB = async (): Promise<void> => {
  if (db) return;

  try {
    // @ts-ignore - window.initSqlJs is loaded via script tag in index.html
    if (typeof window.initSqlJs !== 'function') {
        throw new Error("SQL.js not loaded");
    }

    // @ts-ignore
    const initSqlJs = window.initSqlJs;
    SQL = await initSqlJs({
      locateFile: () => WASM_URL,
    });

    if (!SQL) throw new Error("Failed to initialize SQL.js");

    const savedDb = localStorage.getItem(DB_STORAGE_KEY);
    
    if (savedDb) {
      const u8 = fromBase64(savedDb);
      db = new SQL.Database(u8);
    } else {
      db = new SQL.Database();
      createTable();
      saveDB();
    }
  } catch (err) {
    console.error("Database initialization failed:", err);
    throw err;
  }
};

const createTable = () => {
  if (!db) return;
  const query = `
    CREATE TABLE IF NOT EXISTS measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      weight REAL,
      waist REAL,
      chest REAL,
      arm REAL,
      leg REAL
    );
  `;
  db.run(query);
};

const saveDB = () => {
  if (!db) return;
  const data = db.export();
  const base64 = toBase64(data);
  try {
    localStorage.setItem(DB_STORAGE_KEY, base64);
  } catch (e) {
    console.error("Failed to save to localStorage (quota exceeded?)", e);
  }
};

export const getMeasurements = async (): Promise<Measurement[]> => {
  if (!db) await initDB();
  if (!db) return [];

  const result = db.exec("SELECT * FROM measurements ORDER BY date DESC");
  
  if (result.length === 0) return [];

  const columns = result[0].columns;
  const values = result[0].values;

  return values.map((row) => {
    const entry: any = {};
    columns.forEach((col, index) => {
      entry[col] = row[index];
    });
    return entry as Measurement;
  });
};

export const addMeasurement = async (m: Omit<Measurement, 'id'>): Promise<void> => {
  if (!db) await initDB();
  if (!db) return;

  const stmt = `INSERT INTO measurements (date, weight, waist, chest, arm, leg) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(stmt, [m.date, m.weight, m.waist, m.chest, m.arm, m.leg]);
  saveDB();
};

export const updateMeasurement = async (m: Measurement): Promise<void> => {
  if (!db) await initDB();
  if (!db) return;

  const stmt = `UPDATE measurements SET date=?, weight=?, waist=?, chest=?, arm=?, leg=? WHERE id=?`;
  db.run(stmt, [m.date, m.weight, m.waist, m.chest, m.arm, m.leg, m.id]);
  saveDB();
};

export const deleteMeasurement = async (id: number): Promise<void> => {
  if (!db) await initDB();
  if (!db) return;
  
  db.run("DELETE FROM measurements WHERE id = ?", [id]);
  saveDB();
};

export const resetDatabase = async (): Promise<void> => {
    localStorage.removeItem(DB_STORAGE_KEY);
    db = null;
    await initDB();
};