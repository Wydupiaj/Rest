import db, { initializeDatabase } from './db.js';
import sampleOrders from '../src/data/sampleOrders.js';

// Initialize database
initializeDatabase();

console.log('🌱 Starting database seed...');

let ordersInserted = 0;
let popsInserted = 0;
let paramsInserted = 0;
let materialsInserted = 0;

for (const order of sampleOrders) {
  try {
    // Insert main order
    const orderStmt = db.prepare(`
      INSERT OR IGNORE INTO orders (
        order_id, start_time, assembly_seq, material, material_desc,
        qty, equip, order_type, order_identifier, order_type_desc,
        status, pop, wip, completed, scrapped
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = orderStmt.run(
      order.orderId,
      order.startTime,
      order.assemblySeq,
      order.material,
      order.materialDesc,
      order.qty,
      order.equip,
      order.orderType,
      order.orderIdentifier,
      order.orderTypeDesc,
      order.status,
      order.pop,
      order.wip,
      order.completed,
      order.scrapped
    );

    if (result.changes > 0) {
      ordersInserted++;
    }

    // Insert related POPs
    if (order.relatedPops && order.relatedPops.length > 0) {
      for (const pop of order.relatedPops) {
        const popStmt = db.prepare(`
          INSERT OR IGNORE INTO related_pops (
            pop_id, order_id, material_produced, quantity, pop_id_ref, pop_type,
            pop_type_desc, pop_status, registration_code, registration_desc, timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const popResult = popStmt.run(
          pop.id,
          order.orderId,
          pop.materialProduced,
          pop.quantity,
          pop.popId,
          pop.popType,
          pop.popTypeDesc,
          pop.popStatus,
          pop.registrationCode,
          pop.registrationDesc,
          pop.timestamp
        );

        if (popResult.changes > 0) {
          popsInserted++;
        }
      }
    }

    // Insert production parameters
    if (order.productionParameters && order.productionParameters.length > 0) {
      for (const param of order.productionParameters) {
        const paramStmt = db.prepare(`
          INSERT OR IGNORE INTO production_parameters (
            param_id, order_id, parameter, value, data_type,
            uom, description, last_modified_by, last_modified_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const paramResult = paramStmt.run(
          param.paramId,
          order.orderId,
          param.parameter,
          param.value,
          param.dataType,
          param.uom,
          param.description,
          param.lastModifiedBy,
          param.lastModifiedDate
        );

        if (paramResult.changes > 0) {
          paramsInserted++;
        }
      }
    }

    // Insert consumed materials
    if (order.consumedMaterials && order.consumedMaterials.length > 0) {
      for (const material of order.consumedMaterials) {
        const materialStmt = db.prepare(`
          INSERT INTO consumed_materials (
            order_id, material_consumed, material_description,
            segment_id, equipment_id, equipment_level, quantity, last_modified_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const materialResult = materialStmt.run(
          order.orderId,
          material.materialConsumed,
          material.materialDescription,
          material.segmentId,
          material.equipmentId,
          material.equipmentLevel,
          material.quantity,
          material.lastModifiedDate
        );

        if (materialResult.changes > 0) {
          materialsInserted++;
        }
      }
    }

    // Insert co-products
    if (order.coProducts && order.coProducts.length > 0) {
      for (const coProduct of order.coProducts) {
        const coProductStmt = db.prepare(`
          INSERT INTO co_products (
            order_id, product_number, description
          ) VALUES (?, ?, ?)
        `);

        coProductStmt.run(
          order.orderId,
          coProduct.number,
          coProduct.description
        );
      }
    }
  } catch (error) {
    console.error(`❌ Error inserting order ${order.orderId}:`, error.message);
  }
}

console.log('✅ Database seed completed successfully!');
console.log(`📊 Orders inserted: ${ordersInserted}`);
console.log(`📍 Related POPs inserted: ${popsInserted}`);
console.log(`⚙️  Production parameters inserted: ${paramsInserted}`);
console.log(`📦 Consumed materials inserted: ${materialsInserted}`);

// Verify data
const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get();
const popCount = db.prepare('SELECT COUNT(*) as count FROM related_pops').get();
const paramCount = db.prepare('SELECT COUNT(*) as count FROM production_parameters').get();
const materialCount = db.prepare('SELECT COUNT(*) as count FROM consumed_materials').get();

console.log('\n📈 Database statistics:');
console.log(`   Orders: ${orderCount.count}`);
console.log(`   Related POPs: ${popCount.count}`);
console.log(`   Production Parameters: ${paramCount.count}`);
console.log(`   Consumed Materials: ${materialCount.count}`);

process.exit(0);
