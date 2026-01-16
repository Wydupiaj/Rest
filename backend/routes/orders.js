import express from 'express';
import * as orderController from '../controllers/orderController.js';

const router = express.Router();

// Order routes
router.get('/orders', orderController.getAllOrders);
router.get('/orders/:orderId', orderController.getOrderById);
router.post('/orders', orderController.createOrder);
router.put('/orders/:orderId', orderController.updateOrder);
router.delete('/orders/:orderId', orderController.deleteOrder);

// Queue routes
router.get('/queues', orderController.getQueues);
router.get('/queues/:queueId/parent-pops', orderController.getQueueParentPops);
router.patch('/queues/:queueId/parent-pops/:popId/batch-completed', orderController.markBatchCompleted);
router.patch('/queues/:queueId/parent-pops/:popId/batch-started', orderController.markBatchStarted);
router.patch('/queues/:queueId/parent-pops/:popId/locked', orderController.togglePopLocked);

// Child POP routes
router.patch('/orders/:orderId/child-pops/:popId/scrapped', orderController.markChildPopScrapped);

// Order completion
router.patch('/orders/:orderId/complete', orderController.completeOrder);

export default router;
