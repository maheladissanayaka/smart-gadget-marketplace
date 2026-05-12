// frontend/src/components/common/OrderDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const OrderDetailsModal = ({ order, onClose }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = 'http://localhost:5000';

    useEffect(() => {
        const fetchItems = async () => {
            if (!order || !order[0]) return; 
            
            setLoading(true);
            try {
                const response = await api.get(`/orders/${order[0]}/items`);
                
                if (response.data.success && response.data.data.items) {
                    setItems(response.data.data.items);
                } else {
                    setItems([]);
                }
            } catch (error) {
                console.error("Failed to load order items", error);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [order]);

    if (!order) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-gray-900 p-5 flex justify-between items-center text-white shrink-0">
                    <h3 className="text-xl font-bold">📦 Order #{order[0]} Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold leading-none">&times;</button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-grow space-y-6">
                    {/* Summary */}
                    <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Status</p>
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800 uppercase tracking-wider">
                                {order[2] || 'Pending'}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Total Bill</p>
                            <p className="font-extrabold text-blue-700 text-lg">Rs. {order[1]?.toLocaleString()}.00</p>
                        </div>
                    </div>

                    <h4 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Purchased Items
                    </h4>
                    
                    {loading ? (
                        <div className="text-center py-10 flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Loading...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-400 text-sm italic">No items found for this order.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
                                    {/* Image Display - Index 3 හි image_url තිබේ නම් */}
                                    <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center border shrink-0 overflow-hidden shadow-sm">
                                        {item[3] ? (
                                            <img 
                                                src={`${API_BASE_URL}${item[3]}`} 
                                                alt={item[0]} 
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            <span className="text-2xl opacity-40">📱</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-gray-800 text-sm leading-tight mb-1">{item[0]}</h5>
                                        <div className="flex justify-between items-center">
                                            <p className="text-[11px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded border">
                                                {item[1]} x Rs. {item[2]?.toLocaleString()}
                                            </p>
                                            <p className="font-black text-gray-900 text-sm">
                                                Rs. {(item[1] * item[2])?.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="p-4 bg-gray-50 border-t flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="bg-gray-800 hover:bg-black text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
                    >
                        Close Window
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;