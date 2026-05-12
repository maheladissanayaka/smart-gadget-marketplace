// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AdminOrderDetailsModal from '../components/admin/AdminOrderDetailsModal';
import AddProductModal from '../components/admin/AddProductModal'; 
import EditProductModal from '../components/admin/EditProductModal';

const AdminDashboard = () => {
    const [topProducts, setTopProducts] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [activityLogs, setActivityLogs] = useState([]);
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [sellers, setSellers] = useState([]); 
    const [users, setUsers] = useState([]); 
    const [logStats, setLogStats] = useState({ failedTransactions: 0, peakUsageTime: 'N/A' });
    const [loading, setLoading] = useState(true);
    
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isAddProductOpen, setIsAddProductOpen] = useState(false); 
    const [editingProduct, setEditingProduct] = useState(null);

    const navigate = useNavigate();
    const API_BASE_URL = 'http://localhost:5000';

    const fetchDashboardData = async () => {
        try {
            const [productsRes, revenueRes, logsRes, statsRes, ordersRes, inventoryRes, sellersRes, usersRes] = await Promise.all([
                api.get('/products/top'),
                api.get('/reports/revenue'),
                api.get('/logs/recent'),
                api.get('/logs/stats'),
                api.get('/orders'),
                api.get('/products'),
                api.get('/auth/sellers').catch(() => ({ data: { data: [] } })),
                api.get('/auth/users').catch(() => ({ data: { data: [] } })) 
            ]);

            setTopProducts(productsRes.data.data);
            setTotalRevenue(revenueRes.data.totalRevenue);
            setActivityLogs(logsRes.data.data);
            setLogStats(statsRes.data.data); 
            setOrders(ordersRes.data.data);
            setInventory(inventoryRes.data.data);
            setSellers(sellersRes.data.data); 
            setUsers(usersRes.data.data); 
            setLoading(false);
        } catch (error) {
            console.error("Error fetching dashboard data", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            alert(`Order #${orderId} status updated to ${newStatus}`);
            fetchDashboardData(); 
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const handleDeleteProduct = async (productId, productName) => {
        if(window.confirm(`Are you sure you want to delete "${productName}"?`)) {
            try {
                await api.delete(`/products/${productId}`);
                alert('🗑️ Product deleted successfully!');
                fetchDashboardData();
            } catch (error) {
                alert("Failed to delete product.");
            }
        }
    };

    const handleToggleUserStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
        if(window.confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) {
            try {
                await api.put(`/auth/users/${userId}/status`, { status: newStatus });
                fetchDashboardData();
            } catch (error) {
                alert("Failed to update user status.");
            }
        }
    };

    const handleDeleteUser = async (userId, name) => {
        if(window.confirm(`WARNING: Are you sure you want to permanently delete "${name}"?`)) {
            try {
                await api.delete(`/auth/users/${userId}`);
                alert('User deleted successfully!');
                fetchDashboardData();
            } catch (error) {
                alert(error.response?.data?.message || "Failed to delete user. They might have related data.");
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('loginTime'); 
        navigate('/login');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-secondary"><p className="text-xl animate-pulse">Loading Dashboard...</p></div>;

    return (
        <div className="min-h-screen p-8 bg-secondary relative">
            <div className="max-w-7xl mx-auto space-y-8">
                
                <div className="flex justify-between items-center border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800 hover:underline font-semibold flex items-center gap-1">
                            ← View Store
                        </button>
                        <button onClick={handleLogout} className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 px-5 py-2 rounded-lg font-bold transition-colors text-sm shadow-sm">
                            Logout
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                        <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Revenue (Oracle DB)</h3>
                        <p className="text-3xl font-bold text-gray-800">Rs. {totalRevenue ? totalRevenue.toLocaleString() : '0'}.00</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                        <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Failed Transactions</h3>
                        <p className="text-3xl font-bold text-red-600">{logStats.failedTransactions}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                        <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Peak Usage Time</h3>
                        <p className="text-2xl font-bold text-purple-700 mt-2">{logStats.peakUsageTime}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-500">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
                        <span>👥</span> System User Management
                    </h2>
                    <div className="overflow-x-auto overflow-y-auto max-h-72 border border-gray-100 rounded-lg relative">
                        <table className="min-w-full text-left text-sm whitespace-nowrap">
                            <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-600">ID</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Name</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Email</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Role</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Status</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u, index) => (
                                    <tr key={index} className="border-b hover:bg-orange-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-500 font-bold">#{u[0]}</td>
                                        <td className="px-4 py-3 text-gray-800 font-bold">{u[1]}</td>
                                        <td className="px-4 py-3 text-gray-600">{u[2]}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-md ${u[3]?.toLowerCase() === 'admin' ? 'bg-purple-100 text-purple-700' : u[3]?.toLowerCase() === 'seller' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {u[3]?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-md ${u[4] === 'Active' || !u[4] ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {u[4] || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 flex justify-center gap-2">
                                            {u[3]?.toLowerCase() !== 'admin' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleToggleUserStatus(u[0], u[4] || 'Active')}
                                                        className={`px-3 py-1.5 rounded-md font-semibold text-xs border transition-colors flex items-center gap-1 ${u[4] === 'Active' || !u[4] ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}
                                                    >
                                                        {u[4] === 'Active' || !u[4] ? '⏸️ Suspend' : '▶️ Activate'}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteUser(u[0], u[1])}
                                                        className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md font-semibold text-xs border border-red-200 transition-colors flex items-center gap-1"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end mt-2 -mb-2">
                    <button 
                        onClick={() => setIsAddProductOpen(true)}
                        className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-extrabold flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add New Product
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Recent Orders & Delivery Status</h2>
                    <div className="overflow-x-auto overflow-y-auto max-h-96 border border-gray-100 rounded-lg relative">
                        <table className="min-w-full text-left text-sm whitespace-nowrap">
                            <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Order ID</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Customer ID</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Amount</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Current Status</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Update Action</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-700 font-bold">#{order[0]}</td>
                                        <td className="px-4 py-3 text-gray-600">{order[1]}</td>
                                        <td className="px-4 py-3 text-gray-800">Rs. {order[2]}.00</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded ${order[3] === 'Delivered' ? 'bg-green-100 text-green-700' : order[3] === 'Shipped' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-800'}`}>{order[3] || 'Pending'}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select className="border border-gray-300 rounded p-1 text-sm bg-white cursor-pointer" onChange={(e) => handleStatusUpdate(order[0], e.target.value)} value={order[3] || 'Completed'}>
                                                <option value="Completed">Completed / Pending</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => setSelectedOrder(order)} className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-md font-semibold text-xs border border-indigo-200 transition-colors">View Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
                        <span>📦</span> Manage Full Inventory
                    </h2>
                    <div className="overflow-x-auto overflow-y-auto max-h-[400px] border border-gray-100 rounded-lg relative">
                        <table className="min-w-full text-left text-sm whitespace-nowrap">
                            <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-600">ID</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Image</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Product Name</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Unit Price</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Current Stock</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map((item, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-500 font-bold">#{item[0]}</td>
                                        <td className="px-4 py-2">
                                            <div className="w-10 h-10 bg-white rounded flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
                                                {item[4] ? (
                                                    <img src={`${API_BASE_URL}${item[4]}`} alt={item[1]} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-lg">📱</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-800 font-bold">{item[1]}</td>
                                        <td className="px-4 py-3 text-blue-700 font-extrabold text-right">Rs. {item[2].toLocaleString()}.00</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-md ${item[3] > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {item[3] > 0 ? `${item[3]} in stock` : 'Sold Out'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 flex justify-center gap-2">
                                            <button 
                                                onClick={() => setEditingProduct(item)}
                                                className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-md font-semibold text-xs border border-indigo-200 transition-colors flex items-center gap-1 mt-1"
                                            >
                                                ✎ Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteProduct(item[0], item[1])}
                                                className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md font-semibold text-xs border border-red-200 transition-colors flex items-center gap-1 mt-1"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
                        <span>🏪</span> Registered Sellers
                    </h2>
                    <div className="overflow-x-auto overflow-y-auto max-h-72 border border-gray-100 rounded-lg relative">
                        <table className="min-w-full text-left text-sm whitespace-nowrap">
                            <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Owner Name</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Shop Name</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Email</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">NIC / ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sellers.length > 0 ? sellers.map((seller, index) => (
                                    <tr key={index} className="border-b hover:bg-purple-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-800 font-bold">{seller[0]}</td>
                                        <td className="px-4 py-3 text-purple-700 font-extrabold">{seller[2]}</td>
                                        <td className="px-4 py-3 text-gray-600">{seller[1]}</td>
                                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{seller[3]}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-gray-500">No sellers registered yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-indigo-500">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Top Selling Products</h2>
                        <ul className="space-y-3">
                            {topProducts.map((product, index) => (
                                <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded border transition-colors">
                                    <span className="font-medium text-gray-700">{product[1]}</span>
                                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-bold">{product[2]} Sold</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Recent Activity Logs (MongoDB)</h2>
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                            {activityLogs.map((log, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100 transition-colors">
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{log.eventType}</p>
                                        <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{log.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {selectedOrder && <AdminOrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
            {isAddProductOpen && <AddProductModal onClose={() => setIsAddProductOpen(false)} onProductAdded={() => fetchDashboardData()} />}
            {editingProduct && <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onProductUpdated={() => fetchDashboardData()} />}
        </div>
    );
};

export default AdminDashboard;