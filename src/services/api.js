// API service
const API_BASE_URL = 'http://localhost:8000/api';

export const orderAPI = {
  getAllOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  getOrderById: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
    if (!response.ok) throw new Error('Failed to fetch order');
    return response.json();
  },

  createOrder: async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
  },

  updateOrder: async (orderId, orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) throw new Error('Failed to update order');
    return response.json();
  },

  deleteOrder: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete order');
    return response.json();
  },

  // Queue routes
  getQueues: async () => {
    const response = await fetch(`${API_BASE_URL}/queues`);
    if (!response.ok) throw new Error('Failed to fetch queues');
    return response.json();
  },

  getQueueParentPops: async (queueId) => {
    const response = await fetch(`${API_BASE_URL}/queues/${queueId}/parent-pops`);
    if (!response.ok) throw new Error('Failed to fetch queue parent POPs');
    return response.json();
  },

  markBatchCompleted: async (queueId, popId) => {
    const response = await fetch(`${API_BASE_URL}/queues/${queueId}/parent-pops/${popId}/batch-completed`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to mark batch completed');
    return response.json();
  },

  markBatchStarted: async (queueId, popId) => {
    const response = await fetch(`${API_BASE_URL}/queues/${queueId}/parent-pops/${popId}/batch-started`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to mark batch started');
    return response.json();
  },

  togglePopLocked: async (queueId, popId, locked) => {
    const response = await fetch(\`/queues/\/parent-pops/\/locked\, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locked }),
    });
    if (!response.ok) throw new Error('Failed to toggle locked status');
    return response.json();
  },
};
