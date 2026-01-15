import db from './db.js';

console.log('🗑️  Clearing all data from database...');

try {
  // Delete all data from tables (in correct order due to foreign keys)
  db.prepare('DELETE FROM consumed_materials').run();
  db.prepare('DELETE FROM production_parameters').run();
  db.prepare('DELETE FROM related_pops').run();
  db.prepare('DELETE FROM orders').run();
  
  console.log('✅ All data cleared successfully!');
  
  // Verify
  const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get();
  const popCount = db.prepare('SELECT COUNT(*) as count FROM related_pops').get();
  const paramCount = db.prepare('SELECT COUNT(*) as count FROM production_parameters').get();
  const materialCount = db.prepare('SELECT COUNT(*) as count FROM consumed_materials').get();
  
  console.log('\n📊 Database after clearing:');
  console.log(`   Orders: ${orderCount.count}`);
  console.log(`   Related POPs: ${popCount.count}`);
  console.log(`   Production Parameters: ${paramCount.count}`);
  console.log(`   Consumed Materials: ${materialCount.count}`);
} catch (error) {
  console.error('❌ Error clearing database:', error.message);
}

process.exit(0);
