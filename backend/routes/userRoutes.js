// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();

const { loginUser, registerUser } = require('../controllers/userController');

// Route: POST /api/users/login
router.post('/login', loginUser);

// Route: POST /api/users/register 
router.post('/register', registerUser);

module.exports = router;