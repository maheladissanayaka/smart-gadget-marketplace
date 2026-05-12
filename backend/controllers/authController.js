// backend/controllers/authController.js
const { getOracleConnection } = require('../config/oracle');
const bcrypt = require('bcryptjs'); 
const oracledb = require('oracledb');

const register = async (req, res) => {
    const { name, email, password, role, shopName, address, sellerIdNumber } = req.body;
    let connection;

    try {
        connection = await getOracleConnection();

        const checkUser = await connection.execute(
            `SELECT email FROM Users WHERE email = :email`, 
            [email]
        );
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Email is already registered!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const userRole = role === 'Seller' ? 'Seller' : 'Customer';

        const result = await connection.execute(
            `INSERT INTO Users (name, email, password, role) 
             VALUES (:name, :email, :password, :role) 
             RETURNING user_id INTO :userId`,
            {
                name: name,
                email: email,
                password: hashedPassword,
                role: userRole,
                userId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            },
            { autoCommit: false } 
        );

        const newUserId = result.outBinds.userId[0]; 

        if (role === 'Seller') {
            await connection.execute(
                `INSERT INTO Sellers (user_id, shop_name, business_address, seller_nic) 
                 VALUES (:userId, :shopName, :address, :sellerNic)`,
                {
                    userId: newUserId,
                    shopName: shopName,
                    address: address,
                    sellerNic: sellerIdNumber
                },
                { autoCommit: false } 
            );
        }

        await connection.commit(); 
        
        res.status(201).json({ success: true, message: 'Account created successfully!' });

    } catch (error) {
        console.error("Register Error:", error);
        if (connection) await connection.rollback(); 
        res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    let connection;

    try {
        connection = await getOracleConnection();
         
        const result = await connection.execute(
            `SELECT user_id, name, email, role, password, status 
             FROM Users 
             WHERE email = :email`,
            { email: email }
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid email or password!" });
        }

        const user = result.rows[0];
        const storedHashedPassword = user[4]; 
        const userStatus = user[5] || 'Active'; 

        if (userStatus === 'Suspended') {
            return res.status(403).json({ success: false, message: "Your account is suspended. Please contact Admin." });
        }

        const isMatch = await bcrypt.compare(password, storedHashedPassword);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password!" });
        }
        
        res.status(200).json({
            success: true,
            user: { 
                id: user[0], 
                name: user[1], 
                email: user[2], 
                role: user[3],
                status: userStatus
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

const getAllSellers = async (req, res) => {
    let connection;
    try {
        connection = await getOracleConnection();
        const result = await connection.execute(
            `SELECT u.name, u.email, s.shop_name, s.seller_nic, s.business_address
             FROM Users u
             JOIN Sellers s ON u.user_id = s.user_id
             ORDER BY s.seller_id DESC`
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Error fetching sellers:", error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

const getAllUsers = async (req, res) => {
    let connection;
    try {
        connection = await getOracleConnection();
        const result = await connection.execute(
            `SELECT user_id, name, email, role, status FROM Users ORDER BY user_id DESC`
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

const toggleUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    let connection;
    try {
        connection = await getOracleConnection();
        await connection.execute(
            `UPDATE Users SET status = :status WHERE user_id = :id`,
            { status: status, id: id },
            { autoCommit: true }
        );
        res.status(200).json({ success: true, message: `User status changed to ${status}` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await getOracleConnection();
        await connection.execute(`DELETE FROM Users WHERE user_id = :id`, { id: id }, { autoCommit: true });
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Cannot delete user. They might have related orders/products." });
    } finally {
        if (connection) await connection.close();
    }
};

module.exports = { register, loginUser, getAllSellers, getAllUsers, toggleUserStatus, deleteUser };