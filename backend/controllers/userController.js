// backend/controllers/userController.js
const { getOracleConnection } = require('../config/oracle');
const ActivityLog = require('../models/ActivityLog');
const jwt = require('jsonwebtoken');
const oracledb = require('oracledb'); 

// User Login Function
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    let connection;

    try {
        connection = await getOracleConnection();

        const result = await connection.execute(
            `SELECT user_id, name, role, password FROM Users WHERE email = :email`,
            { email: email }
        );

        const user = result.rows[0];

        if (!user || user[3] !== password) {
            await ActivityLog.create({
                eventType: 'LOGIN',
                details: { email: email, reason: 'Invalid credentials' },
                status: 'FAILED'
            });

            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user[0], role: user[2] }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        await ActivityLog.create({
            userId: user[0].toString(),
            eventType: 'LOGIN',
            details: { name: user[1], role: user[2] },
            status: 'SUCCESS'
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            user: { id: user[0], name: user[1], role: user[2], email: email }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// User Registration Function
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    let connection;

    try {
        connection = await getOracleConnection();

        const checkResult = await connection.execute(
            `SELECT user_id FROM Users WHERE email = :email`,
            { email: email }
        );

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already exists. Please login.' });
        }

        const insertResult = await connection.execute(
            `INSERT INTO Users (role, name, email, password) 
             VALUES ('Customer', :name, :email, :password) 
             RETURNING user_id INTO :user_id`,
            {
                name: name,
                email: email,
                password: password,
                user_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            },
            { autoCommit: true } 
        );

        const newUserId = insertResult.outBinds.user_id[0];

        await ActivityLog.create({
            userId: newUserId.toString(),
            eventType: 'LOGIN', 
            details: { action: 'New User Registration', name: name, email: email },
            status: 'SUCCESS'
        });

        res.status(201).json({ success: true, message: 'Registration successful! You can now login.' });

    } catch (error) {
        console.error("Registration Error:", error);
        
        await ActivityLog.create({
            eventType: 'LOGIN',
            details: { action: 'Registration Failed', error: error.message },
            status: 'FAILED'
        });

        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

module.exports = { loginUser, registerUser };