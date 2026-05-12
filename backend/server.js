// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
// Import Database Connection
const connectDB = require('./config/mongo'); 

// Import Controllers
const { getTotalRevenue } = require('./controllers/reportController');
const { getRecentLogs, getLogStats } = require('./controllers/logController'); 

// Import Routes
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize MongoDB Connection
connectDB();

// API Routes
app.use('/api/products', productRoutes);
app.get('/api/reports/revenue', getTotalRevenue);
app.get('/api/logs/recent', getRecentLogs);
app.get('/api/logs/stats', getLogStats); 
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));