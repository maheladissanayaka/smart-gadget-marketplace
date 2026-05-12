// frontend/src/pages/CustomerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import OrderDetailsModal from '../components/common/OrderDetailsModal';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null); 

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchMyOrders = async () => {
            try {
                const response = await api.get(`/orders/user/${user.id}`);
                setOrders(response.data.data);
            } catch (error) {
                console.error("Error fetching orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyOrders();
    }, [user?.id, navigate]);

    return (
        <div className="min-h-screen bg-secondary py-10 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">My Purchase History</h1>
                    <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Shop
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 p-6 border-b">
                        <h2 className="text-lg font-extrabold text-gray-700">Orders for {user?.name}</h2>
                    </div>
                    
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500 font-medium">Loading your order history...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20 px-4">
                            <div className="text-6xl mb-4">📦</div>
                            <p className="text-xl text-gray-500 mb-6 font-semibold">You haven't placed any orders yet.</p>
                            <button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-xl font-extrabold shadow-lg transition-all transform hover:-translate-y-1">Start Shopping</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-gray-400 text-[11px] uppercase tracking-[0.2em] font-black border-b bg-gray-50/50">
                                        <th className="p-6">Order ID</th>
                                        <th className="p-6">Total Bill</th>
                                        <th className="p-6">Delivery Status</th>
                                        <th className="p-6 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map((order, index) => (
                                        <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="p-6 font-black text-gray-800">#{order[0]}</td>
                                            <td className="p-6 font-extrabold text-gray-700">Rs. {order[1].toLocaleString()}.00</td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    order[2] === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                                    order[2] === 'Shipped' ? 'bg-blue-100 text-blue-700' : 
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {order[2] || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="p-6 text-center">
                                                <button 
                                                    onClick={() => setSelectedOrder(order)} 
                                                    className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-5 py-2 rounded-xl font-bold text-xs transition-all shadow-sm group-hover:shadow-md"
                                                >
                                                    View Invoice Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {selectedOrder && (
                <OrderDetailsModal 
                    order={selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                />
            )}
        </div>
    );
};

export default CustomerDashboard;