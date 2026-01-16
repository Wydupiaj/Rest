import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'database.db');

const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  // Create orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT UNIQUE NOT NULL,
      start_time TEXT NOT NULL,
      assembly_seq TEXT,
      material TEXT NOT NULL,
      material_desc TEXT NOT NULL,
      qty TEXT,
      equip TEXT,
      order_type TEXT,
      order_identifier TEXT,
      order_type_desc TEXT,
      status TEXT DEFAULT 'RELEASED',
      pop INTEGER DEFAULT 0,
      wip INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      scrapped INTEGER DEFAULT 0,
      last_modified TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create related_pops table
  db.exec(`
    CREATE TABLE IF NOT EXISTS related_pops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pop_id TEXT UNIQUE NOT NULL,
      order_id TEXT,
      material_produced TEXT,
      quantity TEXT,
      pop_id_ref TEXT,
      pop_type TEXT,
      pop_type_desc TEXT,
      pop_status TEXT,
      registration_code TEXT,
      registration_desc TEXT,
      timestamp TEXT,
      part_number TEXT,
      description TEXT,
      serial_number TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
    )
  `);

  // Create production_parameters table
  db.exec(`
    CREATE TABLE IF NOT EXISTS production_parameters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      param_id TEXT UNIQUE NOT NULL,
      order_id TEXT,
      parameter TEXT NOT NULL,
      value TEXT,
      data_type TEXT,
      uom TEXT,
      description TEXT,
      last_modified_by TEXT,
      last_modified_date TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
    )
  `);

  // Create consumed_materials table
  db.exec(`
    CREATE TABLE IF NOT EXISTS consumed_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT,
      material_consumed TEXT NOT NULL,
      material_description TEXT,
      segment_id TEXT,
      equipment_id TEXT,
      equipment_level TEXT,
      quantity TEXT,
      last_modified_date TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
    )
  `);

  // Create co_products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS co_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT,
      product_number TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
    )
  `);

  // Check if part_number column exists in related_pops table
  try {
    db.prepare('SELECT part_number FROM related_pops LIMIT 1').get();
  } catch (err) {
    // Column doesn't exist, add it
    if (err.message.includes('no such column')) {
      console.log('Adding part_number column to related_pops table...');
      db.exec('ALTER TABLE related_pops ADD COLUMN part_number TEXT');
      console.log('✅ part_number column added');
    }
  }

  // Check if description column exists in related_pops table
  try {
    db.prepare('SELECT description FROM related_pops LIMIT 1').get();
  } catch (err) {
    // Column doesn't exist, add it
    if (err.message.includes('no such column')) {
      console.log('Adding description column to related_pops table...');
      db.exec('ALTER TABLE related_pops ADD COLUMN description TEXT');
      console.log('✅ description column added');
    }
  }

  // Check if serial_number column exists in related_pops table
  try {
    db.prepare('SELECT serial_number FROM related_pops LIMIT 1').get();
  } catch (err) {
    // Column doesn't exist, add it
    if (err.message.includes('no such column')) {
      console.log('Adding serial_number column to related_pops table...');
      db.exec('ALTER TABLE related_pops ADD COLUMN serial_number TEXT');
      console.log('✅ serial_number column added');
    }
  }

  // Check if batch_completed column exists in related_pops table
  try {
    db.prepare('SELECT batch_completed FROM related_pops LIMIT 1').get();
  } catch (err) {
    if (err.message.includes('no such column')) {
      console.log('Adding batch_completed column to related_pops table...');
      db.exec('ALTER TABLE related_pops ADD COLUMN batch_completed INTEGER DEFAULT 0');
      console.log('✅ batch_completed column added');
    }
  }

  console.log('✅ Database initialized');
}

export default db;
