// backend/config/oracle.js
const oracledb = require('oracledb');

async function getOracleConnection() {
    try {
        return await oracledb.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STRING
        });
    } catch (error) {
        console.error("Oracle DB Connection Error: ", error);
        throw error;
    }
}

module.exports = { getOracleConnection };