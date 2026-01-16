import db from '../db.js';
import { 
  generateParentPop, 
  generateCoProducts, 
  validatePopConsistency 
} from '../utils/popGenerator.js';

// Helper function to get complete order data
function getCompleteOrderData(orderId) {
  const order = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId);
  
  if (!order) {
    return null;
  }

  const relatedPops = db.prepare('SELECT * FROM related_pops WHERE order_id = ?').all(orderId);
  const productionParameters = db.prepare('SELECT * FROM production_parameters WHERE order_id = ?').all(orderId);
  const consumedMaterials = db.prepare('SELECT * FROM consumed_materials WHERE order_id = ?').all(orderId);
  const coProducts = db.prepare('SELECT * FROM co_products WHERE order_id = ?').all(orderId);

  return {
    ...order,
    relatedPops,
    productionParameters,
    consumedMaterials,
    coProducts,
  };
}

// Get all orders
export function getAllOrders(req, res) {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    res.json(orders);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

// Get single order by ID with all related data
export function getOrderById(req, res) {
  try {
    const { orderId } = req.params;

    const order = db
      .prepare('SELECT * FROM orders WHERE order_id = ?')
      .get(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get related POPs (all POPs including parent and children)
    const allPops = db
      .prepare('SELECT * FROM related_pops WHERE order_id = ?')
      .all(orderId);

    // Separate parent POP and child POPs
    // Parent POPs have pop_type_desc = 'Parent POP', others are Child POPs
    const parentPops = allPops.filter(pop => pop.pop_type_desc === 'Parent POP');
    const childPops = allPops.filter(pop => pop.pop_type_desc !== 'Parent POP');

    // Get production parameters
    const productionParameters = db
      .prepare('SELECT * FROM production_parameters WHERE order_id = ?')
      .all(orderId);

    // Get consumed materials
    const consumedMaterials = db
      .prepare('SELECT * FROM consumed_materials WHERE order_id = ?')
      .all(orderId);

    // Get co-products
    const coProducts = db
      .prepare('SELECT * FROM co_products WHERE order_id = ?')
      .all(orderId);

    const completeOrder = {
      ...order,
      relatedPops: parentPops,
      childPops: childPops,
      productionParameters,
      consumedMaterials,
      coProducts,
    };

    res.json(completeOrder);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}

// Create new order
export function createOrder(req, res) {
  try {
    const {
      orderId,
      startTime,
      assemblySeq,
      material,
      materialDesc,
      qty,
      equip,
      orderType,
      orderIdentifier,
      orderTypeDesc,
      status,
      pop,
      wip,
      completed,
      scrapped,
    } = req.body;

    // Validate POP consistency
    const validation = validatePopConsistency({ pop, wip, completed, scrapped });
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'POP value must be greater than or equal to WIP + Completed + Scrapped',
        details: validation
      });
    }

    // Insert order
    const orderStmt = db.prepare(`
      INSERT INTO orders (
        order_id, start_time, assembly_seq, material, material_desc,
        qty, equip, order_type, order_identifier, order_type_desc,
        status, pop, wip, completed, scrapped
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    orderStmt.run(
      orderId,
      startTime,
      assemblySeq,
      material,
      materialDesc,
      qty,
      equip,
      orderType,
      orderIdentifier,
      orderTypeDesc,
      status || 'READY',
      pop,
      wip,
      completed,
      scrapped
    );

    const newOrder = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId);

    // Generate and insert Parent POP
    const parentPop = generateParentPop(newOrder);
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

    // Generate and insert co-products
    const coProducts = generateCoProducts(newOrder);
    if (coProducts.length > 0) {
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
      }
    }

    // Fetch complete order with all relations
    const completeOrder = getCompleteOrderData(orderId);
    res.status(201).json(completeOrder);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
}

// Update order
export function updateOrder(req, res) {
  try {
    const { orderId } = req.params;
    const {
      startTime,
      assemblySeq,
      material,
      materialDesc,
      qty,
      equip,
      orderType,
      orderIdentifier,
      orderTypeDesc,
      status,
      pop,
      wip,
      completed,
      scrapped,
    } = req.body;

    // Get existing order
    const existingOrder = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Validate POP consistency if values are being updated
    if (pop !== undefined || wip !== undefined || completed !== undefined || scrapped !== undefined) {
      const validation = validatePopConsistency({
        pop: pop ?? existingOrder.pop,
        wip: wip ?? existingOrder.wip,
        completed: completed ?? existingOrder.completed,
        scrapped: scrapped ?? existingOrder.scrapped,
      });
      
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: 'POP value must be greater than or equal to WIP + Completed + Scrapped',
          details: validation
        });
      }
    }

    // Update order
    const stmt = db.prepare(`
      UPDATE orders SET 
        start_time = COALESCE(?, start_time),
        assembly_seq = COALESCE(?, assembly_seq),
        material = COALESCE(?, material),
        material_desc = COALESCE(?, material_desc),
        qty = COALESCE(?, qty),
        equip = COALESCE(?, equip),
        order_type = COALESCE(?, order_type),
        order_identifier = COALESCE(?, order_identifier),
        order_type_desc = COALESCE(?, order_type_desc),
        status = COALESCE(?, status),
        pop = COALESCE(?, pop),
        wip = COALESCE(?, wip),
        completed = COALESCE(?, completed),
        scrapped = COALESCE(?, scrapped),
        last_modified = CURRENT_TIMESTAMP
      WHERE order_id = ?
    `);

    stmt.run(
      startTime,
      assemblySeq,
      material,
      materialDesc,
      qty,
      equip,
      orderType,
      orderIdentifier,
      orderTypeDesc,
      status,
      pop,
      wip,
      completed,
      scrapped,
      orderId
    );

    const updatedOrder = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId);

    // Update Parent POP if status changed
    if (status !== undefined) {
      db.prepare(`
        UPDATE related_pops 
        SET pop_status = ?
        WHERE order_id = ?
      `).run(status, orderId);
    }

    // Regenerate co-products if POP or qty changed
    if (pop !== undefined || qty !== undefined) {
      // Delete existing co-products
      db.prepare('DELETE FROM co_products WHERE order_id = ?').run(orderId);
      
      // Generate new co-products
      const coProducts = generateCoProducts(updatedOrder);
      if (coProducts.length > 0) {
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
        }
      }
    }

    // Fetch complete order with all relations
    const completeOrder = getCompleteOrderData(orderId);
    res.json(completeOrder);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update order', details: error.message });
  }
}

// Delete order
export function deleteOrder(req, res) {
  try {
    const { orderId } = req.params;

    const stmt = db.prepare('DELETE FROM orders WHERE order_id = ?');
    const result = stmt.run(orderId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
}

// Get all queues
export function getQueues(req, res) {
  try {
    // For now, return a sample queue structure
    // In a real system, this would come from a queues table
    const queues = [
      {
        id: 'WR000001',
        description: 'Rotor Substacks - Build Start Queue',
        type: 'PART',
        subassembly: 'WR000001',
        equipmentLocationName: 'WR000001',
        items: 199,
        maxPopsToPrestart: 0,
        popCreationAllowed: true,
        lastModifiedBy: 'MADEVAG',
        lastModifiedDate: '2026-01-14 10:14'
      }
    ];
    
    res.json(queues);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch queues' });
  }
}

// Get parent POPs for a queue (not completed)
export function getQueueParentPops(req, res) {
  try {
    const { queueId } = req.params;

    // Get all parent POPs that are not completed
    const parentPops = db
      .prepare(`
        SELECT * FROM related_pops 
        WHERE pop_status != 'COMPLETED' 
        ORDER BY timestamp DESC
      `)
      .all();

    // Filter and transform the data
    const transformedPops = parentPops.map(pop => ({
      popId: pop.pop_id,
      orderId: pop.order_id,
      materialProduced: pop.material_produced,
      quantity: pop.quantity,
      popStatus: pop.pop_status,
      partNumber: pop.part_number,
      description: pop.description,
      serialNumber: pop.serial_number,
      timestamp: pop.timestamp,
    }));

    res.json(transformedPops);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch queue parent POPs' });
  }
}
