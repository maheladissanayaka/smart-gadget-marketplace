// frontend/src/components/admin/AdminOrderDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminOrderDetailsModal = ({ order, onClose }) => {
    const [items, setItems] = useState([]);
    const [customerDetails, setCustomerDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                const response = await api.get(`/orders/${order[0]}/items`);
                setItems(response.data.data.items);
                setCustomerDetails(response.data.data.customerDetails);
            } catch (error) {
                console.error("Failed to load order data", error);
            } finally {
                setLoading(false);
            }
        };

        if (order) {
            fetchOrderData();
        }
    }, [order]);

    if (!order) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all scale-100 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-gray-900 p-5 flex justify-between items-center text-white shrink-0">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Admin View: Order #{order[0]}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold leading-none">&times;</button>
                </div>
                
                {/* Content Body */}
                <div className="p-6 overflow-y-auto flex-grow bg-gray-50">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        
                        {/* Customer & Shipping Details Card */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                            <h4 className="text-sm text-indigo-700 font-extrabold uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Customer & Shipping Info</h4>
                            
                            {loading ? (
                                <p className="text-sm text-gray-500 animate-pulse">Loading details...</p>
                            ) : customerDetails ? (
                                <div className="space-y-3 text-sm">
                                    <div className="flex">
                                        <span className="w-1/3 text-gray-500 font-semibold">Name:</span>
                                        <span className="w-2/3 font-bold text-gray-800">{customerDetails[0]}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-1/3 text-gray-500 font-semibold">Email:</span>
                                        <span className="w-2/3 text-gray-800">{customerDetails[1]}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-1/3 text-gray-500 font-semibold">Phone:</span>
                                        <span className="w-2/3 text-gray-800">{customerDetails[3] || 'N/A'}</span>
                                    </div>
                                    <div className="flex pt-2 mt-2 border-t border-dashed border-gray-200">
                                        <span className="w-1/3 text-gray-500 font-semibold">Address:</span>
                                        <span className="w-2/3 text-gray-800 font-medium leading-relaxed">{customerDetails[2] || 'N/A'}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-red-500">Details unavailable for legacy orders.</p>
                            )}
                        </div>

                        {/* Payment & Order Summary Card */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                            <h4 className="text-sm text-gray-600 font-extrabold uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Payment Summary</h4>
                            
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                    <span className="text-gray-500 font-semibold">Payment Method:</span>
                                    <span className="font-bold text-gray-800">{customerDetails ? customerDetails[4] : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-semibold">Order Status:</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        order[3] === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                        order[3] === 'Shipped' ? 'bg-blue-100 text-blue-700' : 
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {order[3] || 'Pending'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                    <span className="text-gray-600 font-bold text-base">Total Amount Paid:</span>
                                    <span className="font-extrabold text-blue-700 text-xl">Rs. {order[2].toLocaleString()}.00</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h4 className="font-extrabold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4 text-lg">Purchased Items</h4>
                    
                    {/* Items List */}
                    {loading ? (
                        <div className="flex justify-center py-6">
                            <p className="text-gray-500 animate-pulse text-sm font-semibold">Loading items from Database...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <p className="text-red-500 py-4 text-center text-sm font-semibold">No items found for this order.</p>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 text-gray-600 uppercase">
                                    <tr>
                                        <th className="px-4 py-3 font-bold">Product Name</th>
                                        <th className="px-4 py-3 font-bold text-center">Unit Price</th>
                                        <th className="px-4 py-3 font-bold text-center">Qty</th>
                                        <th className="px-4 py-3 font-bold text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-bold text-gray-800 flex items-center gap-3">
                                                <span className="text-2xl">📱</span> {item[0]}
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-600 font-medium">Rs. {item[2].toLocaleString()}</td>
                                            <td className="px-4 py-3 text-center font-extrabold text-gray-800">{item[1]}</td>
                                            <td className="px-4 py-3 text-right font-extrabold text-indigo-700">Rs. {(item[1] * item[2]).toLocaleString()}.00</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                <div className="p-4 bg-white border-t flex justify-end shrink-0">
                    <button 
                        onClick={onClose} 
                        className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-2.5 rounded-lg font-bold transition-all shadow-md"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetailsModal;