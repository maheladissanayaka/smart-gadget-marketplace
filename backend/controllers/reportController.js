const { getOracleConnection } = require('../config/oracle');
const oracledb = require('oracledb');

const getTotalRevenue = async (req, res) => {
    let connection;
    try {
        connection = await getOracleConnection();
        
        const result = await connection.execute(
            `BEGIN :ret := Calculate_Total_Revenue(:start_date, :end_date); END;`,
            {
                ret: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                start_date: new Date('2024-01-01'), 
                end_date: new Date() 
            }
        );

        res.status(200).json({ success: true, totalRevenue: result.outBinds.ret });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

module.exports = { getTotalRevenue };