import db from './db.js';

console.log('🔄 Recreating related_pops table with new schema...');

try {
  // Drop the old table
  db.prepare('DROP TABLE IF EXISTS related_pops').run();
  console.log('✅ Dropped old related_pops table');
  
  // Create new table with updated schema
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
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Created new related_pops table with material_produced and quantity columns');
  
} catch (error) {
  console.error('❌ Error recreating table:', error.message);
}

process.exit(0);
