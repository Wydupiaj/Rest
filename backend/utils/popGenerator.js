/**
 * Utility functions for generating Parent and Child POPs
 */

/**
 * Generate a Parent POP for an order
 * @param {Object} order - Order data
 * @returns {Object} Parent POP data
 */
export function generateParentPop(order) {
  const popId = `pop_${order.order_id}`
  const popIdRef = String(Math.floor(Math.random() * 900000) + 100000).padStart(7, '0')
  const registrationCode = String(Math.floor(Math.random() * 90000) + 10000).padStart(5, '0')
  
  return {
    popId,
    orderId: order.order_id,
    materialProduced: order.material,
    quantity: order.qty,
    popIdRef,
    popType: registrationCode,
    popTypeDesc: 'Parent POP',
    popStatus: order.status || 'READY',
    registrationCode,
    registrationDesc: `Parent POP for ${order.equip}`,
    timestamp: order.start_time || new Date().toISOString().slice(0, 19).replace('T', ' '),
  }
}

/**
 * Generate Child POPs based on WIP, Completed, and Scrapped counts
 * Distributes Child POPs equally among parent and co-products
 * @param {Object} order - Order data
 * @param {Object} parentPop - Parent POP data
 * @param {Array} coProducts - Array of co-products with productNumber and description
 * @param {String} materialDescription - Material description for parent product
 * @param {Number} startingSerialNumber - Starting serial number for unique IDs
 * @returns {Array} Array of Child POP data
 */
export function generateChildPops(order, parentPop, coProducts = [], materialDescription = '', startingSerialNumber = 100001) {
  const childPops = []
  let serialCounter = startingSerialNumber
  let childSerialNumber = 1
  
  const completedCount = parseInt(order.completed) || 0
  const wipCount = parseInt(order.wip) || 0
  const scrappedCount = parseInt(order.scrapped) || 0
  const totalChildPops = completedCount + wipCount + scrappedCount
  
  // Calculate number of products (parent + co-products)
  const totalProducts = 1 + (coProducts?.length || 0)
  
  // Calculate child POPs per product
  const childPopsPerProduct = Math.floor(totalChildPops / totalProducts)
  
  // Create arrays of part numbers and descriptions
  const partNumbers = [parentPop.materialProduced]
  const descriptions = [materialDescription]
  
  if (coProducts && coProducts.length > 0) {
    coProducts.forEach(cp => {
      partNumbers.push(cp.productNumber)
      descriptions.push(cp.description || '')
    })
  }
  
  // Generate COMPLETED Child POPs
  let productIndex = 0
  let countInCurrentProduct = 0
  
  for (let i = 0; i < completedCount; i++) {
    if (countInCurrentProduct >= childPopsPerProduct && productIndex < partNumbers.length - 1) {
      productIndex++
      countInCurrentProduct = 0
    }
    
    const childPopId = String(serialCounter).padStart(7, '0')
    childPops.push({
      serialNumber: String(childSerialNumber),
      childPopId: childPopId,
      type: parentPop.popType,
      status: 'COMPLETED',
      materialProduced: parentPop.materialProduced,
      quantity: '1',
      orderId: order.order_id,
      parentPopId: parentPop.popId,
      partNumber: partNumbers[productIndex],
      description: descriptions[productIndex],
    })
    serialCounter++
    childSerialNumber++
    countInCurrentProduct++
  }
  
  // Generate WIP (Created) Child POPs
  for (let i = 0; i < wipCount; i++) {
    if (countInCurrentProduct >= childPopsPerProduct && productIndex < partNumbers.length - 1) {
      productIndex++
      countInCurrentProduct = 0
    }
    
    const childPopId = String(serialCounter).padStart(7, '0')
    childPops.push({
      serialNumber: String(childSerialNumber),
      childPopId: childPopId,
      type: parentPop.popType,
      status: 'Created',
      materialProduced: parentPop.materialProduced,
      quantity: '1',
      orderId: order.order_id,
      parentPopId: parentPop.popId,
      partNumber: partNumbers[productIndex],
      description: descriptions[productIndex],
    })
    serialCounter++
    childSerialNumber++
    countInCurrentProduct++
  }
  
  // Generate SCRAPPED Child POPs
  for (let i = 0; i < scrappedCount; i++) {
    if (countInCurrentProduct >= childPopsPerProduct && productIndex < partNumbers.length - 1) {
      productIndex++
      countInCurrentProduct = 0
    }
    
    const childPopId = String(serialCounter).padStart(7, '0')
    childPops.push({
      serialNumber: String(childSerialNumber),
      childPopId: childPopId,
      type: parentPop.popType,
      status: 'Scrapped',
      materialProduced: parentPop.materialProduced,
      quantity: '1',
      orderId: order.order_id,
      parentPopId: parentPop.popId,
      partNumber: partNumbers[productIndex],
      description: descriptions[productIndex],
    })
    serialCounter++
    childSerialNumber++
    countInCurrentProduct++
  }
  
  return childPops
}

/**
 * Calculate total Child POPs count
 * @param {Object} order - Order data
 * @returns {Number} Total child POPs count
 */
export function calculateChildPopsCount(order) {
  const completedCount = parseInt(order.completed) || 0
  const wipCount = parseInt(order.wip) || 0
  const scrappedCount = parseInt(order.scrapped) || 0
  
  return completedCount + wipCount + scrappedCount
}

/**
 * Validate POP vs Child POPs consistency
 * @param {Object} order - Order data
 * @returns {Object} Validation result
 */
export function validatePopConsistency(order) {
  const popValue = parseInt(order.pop) || 0
  const childPopsCount = calculateChildPopsCount(order)
  
  return {
    isValid: popValue >= childPopsCount,
    popValue,
    childPopsCount,
    difference: popValue - childPopsCount,
  }
}

/**
 * Generate co-products based on POP to Quantity ratio
 * @param {Object} order - Order data
 * @returns {Array} Array of co-product data
 */
export function generateCoProducts(order) {
  const popValue = parseInt(order.pop) || 0
  const qtyMatch = order.qty?.match(/(\d+)/)
  const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 0
  
  if (quantity === 0) return []
  
  const ratio = popValue / quantity
  const coProducts = []
  
  // If ratio is 2:1, create 1 co-product
  // If ratio is 3:1, create 2 co-products
  // If ratio is 4:1, create 3 co-products
  const coProductCount = Math.floor(ratio) - 1
  
  if (coProductCount > 0) {
    const baseProductNumber = parseInt(order.material) || 0
    
    for (let i = 1; i <= coProductCount; i++) {
      coProducts.push({
        orderId: order.order_id,
        productNumber: String(baseProductNumber + i),
        description: `${order.material_desc} Co-product ${i}`,
      })
    }
  }
  
  return coProducts
}
