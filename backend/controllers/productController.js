// backend/controllers/productController.js
const { getOracleConnection } = require('../config/oracle');
const oracledb = require('oracledb');
const ActivityLog = require('../models/ActivityLog');

const getTopProducts = async (req, res) => {
    let connection;
    try {
        connection = await getOracleConnection();
        
        const result = await connection.execute(
            `BEGIN Get_Top_Selling_Products(:limit, :cursor); END;`,
            {
                limit: 10,
                cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
            }
        );

        const resultSet = result.outBinds.cursor;
        const products = await resultSet.getRows();
        await resultSet.close();

        await ActivityLog.create({
            eventType: 'PRODUCT_VIEW',
            details: { report: 'Top Products Accessed' },
            status: 'SUCCESS'
        });

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        await ActivityLog.create({
            eventType: 'PRODUCT_VIEW',
            details: { error: error.message },
            status: 'FAILED'
        });
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// Fetch all products for the catalog
const getAllProducts = async (req, res) => {
    let connection;
    try {
        connection = await getOracleConnection();
        
        // Fetch all products from Oracle DB
        const result = await connection.execute(
            `SELECT product_id, name, price, stock, image_url FROM Products ORDER BY product_id DESC`
        );

        // Log this catalog view event in MongoDB
        await ActivityLog.create({
            eventType: 'PRODUCT_VIEW',
            details: { action: 'User viewed the product catalog' },
            status: 'SUCCESS'
        });

        // result.rows contains the data array
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Error fetching all products:", error);
        
        // Log failed attempt
        await ActivityLog.create({
            eventType: 'PRODUCT_VIEW',
            details: { error: error.message },
            status: 'FAILED'
        });
        
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
};


// Search Products and Log the Query in MongoDB
const searchProducts = async (req, res) => {
    const { q } = req.query; 
    let connection;

    try {
        connection = await getOracleConnection();
     
        const result = await connection.execute(
            `SELECT product_id, name, price, stock FROM Products 
             WHERE LOWER(name) LIKE LOWER(:keyword) ORDER BY product_id DESC`,
            { keyword: `%${q}%` }
        );

        if (q && q.trim() !== '') {
            await ActivityLog.create({
                eventType: 'SEARCH',
                details: { action: 'User searched for products', keyword: q, resultsFound: result.rows.length },
                status: 'SUCCESS'
            });
        }

        res.status(200).json({ success: true, data: result.rows });

    } catch (error) {
        console.error("Search Error:", error);
        
        // Log the failed search attempt
        if (q) {
            await ActivityLog.create({
                eventType: 'SEARCH',
                details: { keyword: q, error: error.message },
                status: 'FAILED'
            });
        }
        
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
};

// Get a single product by ID
const getProductById = async (req, res) => {
    const { id } = req.params;
    let connection;

    try {
        connection = await getOracleConnection();
        const result = await connection.execute(
            `SELECT product_id, name, price, stock, image_url FROM Products WHERE product_id = :id`,
            { id: id }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error("Error fetching single product:", error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
};

const addProduct = async (req, res) => {
    const { name, price, stock, sellerId } = req.body;
    
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; 
    let connection;

    try {
        connection = await getOracleConnection();
        
        await connection.execute(
            `INSERT INTO Products (name, price, stock, seller_id, image_url) 
             VALUES (:name, :price, :stock, :sellerId, :imageUrl)`,
            { 
                name, 
                price, 
                stock, 
                sellerId: sellerId || 1,
                imageUrl: imageUrl 
            },
            { autoCommit: true }
        );
        
        res.status(201).json({ success: true, message: 'Product added successfully!' });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, stock } = req.body;
    let connection;

    try {
        connection = await getOracleConnection();
        await connection.execute(
            `UPDATE Products SET name = :name, price = :price, stock = :stock WHERE product_id = :id`,
            { name, price, stock, id },
            { autoCommit: true }
        );
        res.status(200).json({ success: true, message: 'Product updated successfully!' });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    let connection;

    try {
        connection = await getOracleConnection();
        await connection.execute(
            `DELETE FROM Products WHERE product_id = :id`,
            { id },
            { autoCommit: true }
        );
        res.status(200).json({ success: true, message: 'Product deleted successfully!' });
    } catch (error) {
        console.error("Error deleting product:", error);
        if (error.message.includes('ORA-02292')) {
            return res.status(400).json({ success: false, message: 'Cannot delete product because it has active orders. Please edit and set stock to 0 instead.' });
        }
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

const getProductsBySeller = async (req, res) => {
    const { sellerId } = req.params;
    let connection;

    try {
        connection = await getOracleConnection();
        const result = await connection.execute(
            `SELECT product_id, name, price, stock, image_url 
             FROM Products WHERE seller_id = :sellerId ORDER BY product_id DESC`,
            { sellerId: sellerId }
        );
        
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Error fetching seller products:", error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

module.exports = { getTopProducts, getAllProducts, searchProducts, getProductById, addProduct, updateProduct, deleteProduct, getProductsBySeller };
