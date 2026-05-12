// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, loginUser, getAllSellers, getAllUsers, toggleUserStatus, deleteUser } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', loginUser);
router.get('/sellers', getAllSellers);

router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

module.exports = router;