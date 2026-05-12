// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();

// Import the new functions
const { placeOrder, getAllOrders, updateOrderStatus, getUserOrders, getOrderItems } = require('../controllers/orderController');

// Route: POST /api/orders (Customer places order)
router.post('/', placeOrder);

// Route: GET /api/orders (Admin views orders)
router.get('/', getAllOrders);

// Route: PUT /api/orders/:orderId/status (Admin updates delivery status)
router.put('/:orderId/status', updateOrderStatus);

router.get('/user/:userId', getUserOrders);

router.get('/:orderId/items', getOrderItems);

module.exports = router;