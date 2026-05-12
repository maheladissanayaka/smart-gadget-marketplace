// backend/models/ActivityLog.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    eventType: {
        type: String,
        required: true,
        enum: ['LOGIN', 'LOGOUT', 'PRODUCT_VIEW', 'SEARCH', 'ORDER_PLACED', 'ORDER_FAILED', 'ORDER_UPDATE', 'DELIVERY_UPDATE'] 
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILED', 'PENDING'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);