import db from './db.js'

const result = db.prepare('SELECT COUNT(*) as count FROM co_products').get()
console.log(`\n✅ Co-products in database: ${result.count}`)

const allProducts = db.prepare('SELECT order_id, product_number, description FROM co_products ORDER BY order_id').all()
console.log('\n📦 All co-products:')
allProducts.forEach(product => {
  console.log(`   Order: ${product.order_id}, Product: ${product.product_number} - ${product.description}`)
})
console.log('')
