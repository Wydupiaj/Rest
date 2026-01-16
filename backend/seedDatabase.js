import db, { initializeDatabase } from './db.js';
import sampleOrders from '../src/data/sampleOrders.js';
import { generateParentPop, generateChildPops, generateCoProducts } from './utils/popGenerator.js';

// Initialize database
initializeDatabase();

console.log('🌱 Starting database seed...');

let ordersInserted = 0;
let popsInserted = 0;
let childPopsInserted = 0;
let paramsInserted = 0;
let materialsInserted = 0;
let currentSerialNumber = 100001;

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

    // Insert related POPs (Parent POP)
    if (order.relatedPops && order.relatedPops.length > 0) {
      for (const pop of order.relatedPops) {
        const popStmt = db.prepare(`
          INSERT OR IGNORE INTO related_pops (
            pop_id, order_id, material_produced, quantity, pop_id_ref, pop_type,
            pop_type_desc, pop_status, registration_code, registration_desc, timestamp, part_number, description, serial_number
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          pop.timestamp,
          pop.materialProduced,
          `Blank Type ${ordersInserted}`, // Description with Blank Type
          `SN-${order.orderId}-${pop.popId}` // Serial number
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

    // Insert consumed materials - only one Blank material per order
    const equipmentMap = {
      'WR00001': 'EQ-BLANK-01',
      'WR00002': 'EQ-BLANK-02',
      'WR00003': 'EQ-BLANK-03',
      'WR00004': 'EQ-BLANK-04',
      'WR00005': 'EQ-BLANK-05',
      'WR00006': 'EQ-BLANK-06',
    };

    const equipId = equipmentMap[order.equip] || `EQ-BLANK-${ordersInserted}`;
    
    const materialStmt = db.prepare(`
      INSERT INTO consumed_materials (
        order_id, material_consumed, material_description,
        segment_id, equipment_id, equipment_level, quantity, last_modified_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const materialResult = materialStmt.run(
      order.orderId,
      'Blank',
      `Blank Type ${ordersInserted}`,
      'SEG-BLANK',
      equipId,
      'Level 1',
      '2 pcs',
      new Date().toISOString().slice(0, 19).replace('T', ' ')
    );

    if (materialResult.changes > 0) {
      materialsInserted++;
    }

    // Insert co-products and generate Child POPs
    const coProducts = order.coProducts || [];
    if (coProducts.length > 0) {
      for (const coProduct of coProducts) {
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

    // Generate and insert Child POPs
    if (order.relatedPops && order.relatedPops.length > 0) {
      const parentPop = order.relatedPops[0]; // Get parent POP
      const childPops = generateChildPops(
        {
          order_id: order.orderId,
          wip: order.wip,
          completed: order.completed,
          scrapped: order.scrapped,
        },
        {
          popType: parentPop.popType,
          materialProduced: parentPop.materialProduced,
          popId: parentPop.id,
        },
        coProducts.map(cp => ({ 
          productNumber: cp.number, 
          description: cp.description 
        })),
        order.materialDesc, // Pass material description
        currentSerialNumber // Pass current serial number
      );

      const childPopStmt = db.prepare(`
        INSERT INTO related_pops (
          pop_id, order_id, material_produced, quantity, pop_id_ref, pop_type,
          pop_type_desc, pop_status, registration_code, registration_desc, timestamp, 
          part_number, description, serial_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const childPop of childPops) {
        childPopStmt.run(
          childPop.childPopId,
          childPop.orderId,
          childPop.materialProduced,
          childPop.quantity,
          childPop.childPopId,
          childPop.type,
          childPop.status,
          childPop.status,
          childPop.type,
          childPop.status,
          new Date().toISOString().slice(0, 19).replace('T', ' '),
          childPop.partNumber,
          childPop.description,
          childPop.serialNumber
        );
        childPopsInserted++;
      }

      // Update serial number for next order
      currentSerialNumber += childPops.length;
    }
  } catch (error) {
    console.error(`❌ Error inserting order ${order.orderId}:`, error.message);
  }
}

console.log('✅ Database seed completed successfully!');
console.log(`📊 Orders inserted: ${ordersInserted}`);
console.log(`📍 Related POPs (Parent + Child) inserted: ${popsInserted + childPopsInserted}`);
console.log(`👶 Child POPs inserted: ${childPopsInserted}`);
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
