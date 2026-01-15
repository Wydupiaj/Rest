import db from './db.js';
import { generateParentPop, generateCoProducts } from './utils/popGenerator.js';

console.log('🔍 Checking for orders without Parent POPs...\n');

// Find all orders
const orders = db.prepare('SELECT * FROM orders').all();

console.log(`📋 Found ${orders.length} orders in database\n`);

let generated = 0;
let skipped = 0;

for (const order of orders) {
  // Check if Parent POP exists
  const existingPop = db.prepare('SELECT * FROM related_pops WHERE order_id = ?').get(order.order_id);
  
  if (!existingPop) {
    console.log(`➕ Generating Parent POP for order ${order.order_id}...`);
    
    // Generate Parent POP
    const parentPop = generateParentPop(order);
    
    const popStmt = db.prepare(`
      INSERT INTO related_pops (
        pop_id, order_id, material_produced, quantity, pop_id_ref,
        pop_type, pop_type_desc, pop_status, registration_code,
        registration_desc, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    popStmt.run(
      parentPop.popId,
      parentPop.orderId,
      parentPop.materialProduced,
      parentPop.quantity,
      parentPop.popIdRef,
      parentPop.popType,
      parentPop.popTypeDesc,
      parentPop.popStatus,
      parentPop.registrationCode,
      parentPop.registrationDesc,
      parentPop.timestamp
    );
    
    console.log(`   ✅ Parent POP created: ${parentPop.popId}`);
    generated++;
  } else {
    console.log(`⏭️  Order ${order.order_id} already has Parent POP, skipping...`);
    skipped++;
  }
  
  // Check if co-products exist
  const existingCoProducts = db.prepare('SELECT * FROM co_products WHERE order_id = ?').all(order.order_id);
  
  if (existingCoProducts.length === 0) {
    // Generate co-products
    const coProducts = generateCoProducts(order);
    
    if (coProducts.length > 0) {
      console.log(`➕ Generating ${coProducts.length} co-product(s) for order ${order.order_id}...`);
      
      const coProductStmt = db.prepare(`
        INSERT INTO co_products (order_id, product_number, description)
        VALUES (?, ?, ?)
      `);

      for (const coProduct of coProducts) {
        coProductStmt.run(
          coProduct.orderId,
          coProduct.productNumber,
          coProduct.description
        );
        console.log(`   ✅ Co-product created: ${coProduct.productNumber} - ${coProduct.description}`);
      }
    } else {
      console.log(`   ℹ️  No co-products needed for order ${order.order_id} (ratio < 2:1)`);
    }
  } else {
    console.log(`⏭️  Order ${order.order_id} already has ${existingCoProducts.length} co-product(s), skipping...`);
  }
  
  console.log('');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✅ Process completed!`);
console.log(`   Generated: ${generated} Parent POP(s)`);
console.log(`   Skipped: ${skipped} existing POP(s)`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('💡 Child POPs are generated automatically on the frontend');
console.log('   based on WIP, Completed, and Scrapped values.\n');
