// backend/controllers/orderController.js
const { getOracleConnection } = require('../config/oracle');
const oracledb = require('oracledb');
const ActivityLog = require('../models/ActivityLog');

const placeOrder = async (req, res) => {
    const { customerId, items, totalAmount, address, phone, paymentMethod } = req.body;
    let connection;

    try {
        connection = await getOracleConnection();
        
        const orderResult = await connection.execute(
            `BEGIN 
                CREATE_ORDER(:customerId, :totalAmount, :address, :phone, :paymentMethod, :order_id); 
             END;`,
            {
                customerId: customerId,
                totalAmount: totalAmount,
                address: address || 'N/A',
                phone: phone || 'N/A',
                paymentMethod: paymentMethod || 'Cash on Delivery',
                order_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            },
            { autoCommit: false }
        );

        const newOrderId = orderResult.outBinds.order_id;

        for (let item of items) {
            await connection.execute(
                `BEGIN 
                    ADD_ORDER_ITEM(:orderId, :productId, :qty, :price); 
                 END;`,
                { 
                    orderId: newOrderId, 
                    productId: item.productId, 
                    qty: item.quantity, 
                    price: item.price 
                },
                { autoCommit: false }
            );
        }

        await connection.commit();
        
        await ActivityLog.create({
            eventType: 'ORDER_PLACED',
            details: { customerId, orderId: newOrderId, totalAmount },
            status: 'SUCCESS'
        });

        res.status(200).json({ success: true, message: 'Order placed successfully!', orderId: newOrderId });

    } catch (error) {
        console.error("Order processing error:", error);
        if (connection) await connection.rollback();

        await ActivityLog.create({
            eventType: 'ORDER_FAILED',
            details: { customerId, error: error.message },
            status: 'FAILED'
        });

        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// Get all orders for Admin Dashboard
const getAllOrders = async (req, res) => {
    let connection;
    try {
        connection = await getOracleConnection();
        // Fetch latest 10 orders
        const result = await connection.execute(
            `SELECT order_id, customer_id, total_amount, status 
             FROM Orders ORDER BY order_id DESC FETCH FIRST 10 ROWS ONLY`
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// Update Order Delivery Status and Log in MongoDB
const updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    let connection;

    try {
        connection = await getOracleConnection();
        
        // 1. Update Oracle Database
        await connection.execute(
            `UPDATE Orders SET status = :status WHERE order_id = :orderId`,
            { status: status, orderId: orderId },
            { autoCommit: true }
        );

        // 2. Log this delivery update in MongoDB
        await ActivityLog.create({
            eventType: 'ORDER_UPDATE',
            details: { action: 'Delivery status updated', orderId: orderId, newStatus: status },
            status: 'SUCCESS'
        });

        res.status(200).json({ success: true, message: 'Status updated successfully' });

    } catch (error) {
        console.error("Update Status Error:", error);
        await ActivityLog.create({
            eventType: 'ORDER_UPDATE',
            details: { orderId: orderId, error: error.message },
            status: 'FAILED'
        });
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// Get orders for a specific user
const getUserOrders = async (req, res) => {
    const { userId } = req.params;
    let connection;

    try {
        connection = await getOracleConnection();
        const result = await connection.execute(
            `SELECT order_id, total_amount, status 
             FROM Orders WHERE customer_id = :userId ORDER BY order_id DESC`,
            { userId: userId }
        );
        
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
};

const getOrderItems = async (req, res) => {
    const { orderId } = req.params;
    let connection;

    try {
        connection = await getOracleConnection();

        const itemsResult = await connection.execute(
            `SELECT p.name, oi.quantity, oi.unit_price, p.image_url 
             FROM OrderItems oi 
             JOIN Products p ON oi.product_id = p.product_id 
             WHERE oi.order_id = :orderId`,
            { orderId: orderId }
        );
        
        const detailsResult = await connection.execute(
            `SELECT u.name, u.email, o.delivery_address, o.contact_number, o.payment_method
             FROM Orders o
             JOIN Users u ON o.customer_id = u.user_id
             WHERE o.order_id = :orderId`,
            { orderId: orderId }
        );
        
        res.status(200).json({ 
            success: true, 
            data: {
                items: itemsResult.rows,
                customerDetails: detailsResult.rows[0] 
            } 
        });
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

module.exports = { placeOrder, getAllOrders, updateOrderStatus, getUserOrders, getOrderItems };