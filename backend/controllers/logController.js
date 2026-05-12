// backend/controllers/logController.js
const ActivityLog = require('../models/ActivityLog');

const getRecentLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(10);
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getLogStats = async (req, res) => {
    try {
        const failedCount = await ActivityLog.countDocuments({ status: 'FAILED' });

        const peakUsage = await ActivityLog.aggregate([
            {
                $group: {
                    _id: { $hour: "$timestamp" }, 
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }, 
            { $limit: 1 } 
        ]);

        let peakHourStr = "N/A";
        if (peakUsage.length > 0) {
            const hour = peakUsage[0]._id;
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            peakHourStr = `${hour12}:00 ${ampm} - ${peakUsage[0].count} interactions`;
        }

        res.status(200).json({ 
            success: true, 
            data: {
                failedTransactions: failedCount,
                peakUsageTime: peakHourStr
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { getRecentLogs, getLogStats };