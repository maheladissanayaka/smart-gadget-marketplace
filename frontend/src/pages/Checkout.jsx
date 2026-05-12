// frontend/src/pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext'; 

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, updateItemQuantity, removeFromCart, clearCart } = useCart(); 

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // Form States
    const [formData, setFormData] = useState({
        fullName: user ? user.name : '', 
        address: '',
        phone: '',
        paymentMethod: 'Cash on Delivery'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            alert("🔒 Please login to continue your checkout process.");
            navigate('/login');
        }
    }, [user, navigate]);

    const totalAmount = cart.reduce((total, item) => total + (item.product[2] * item.quantity), 0);

    if (!user) return null;

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
                <div className="text-7xl mb-6">🛒</div>
                <p className="text-3xl text-gray-800 font-extrabold mb-4">No items to checkout!</p>
                <button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-bold shadow-md transition-all duration-300 transform hover:-translate-y-1">Return to Shop</button>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const customerId = user.id;

            const formattedItems = cart.map(item => ({
                productId: item.product[0],
                quantity: item.quantity,
                price: item.product[2]
            }));

            await api.post('/orders', {
                customerId: customerId,
                totalAmount: totalAmount,
                items: formattedItems,
                address: formData.address,
                phone: formData.phone,
                paymentMethod: formData.paymentMethod
            });

            clearCart();
            
            alert('🎉 Order Placed Successfully!');
            navigate('/'); 

        } catch (error) {
            console.error("Checkout Error:", error);
            alert("Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Secure Checkout
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Column: Billing Details & Payment */}
                    <div className="lg:w-2/3 space-y-6">
                        <form id="checkout-form" onSubmit={handlePlaceOrder} className="bg-white rounded-xl shadow-md p-8 space-y-6 border border-gray-100">
                            
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Billing Details</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                                    <textarea name="address" required value={formData.address} onChange={handleChange} rows="3" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="123 Main Street, Kurunegala"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="07X XXX XXXX" />
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 pt-4">Payment Method</h2>
                            <div className="space-y-3">
                                <label className="flex items-center p-4 border border-blue-300 rounded-lg cursor-pointer bg-blue-50 border-blue-500 shadow-sm transition-colors">
                                    <input type="radio" name="paymentMethod" value="Cash on Delivery" checked={formData.paymentMethod === 'Cash on Delivery'} onChange={handleChange} className="h-4 w-4 text-blue-700 focus:ring-blue-700 border-gray-300" />
                                    <span className="ml-3 font-medium text-gray-700">Cash on Delivery (COD)</span>
                                    <span className="ml-auto text-2xl">💵</span>
                                </label>
                                <p className="text-sm text-gray-500 italic pl-2">Note: Temporarily disabled Card payment for maintenance.</p>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Order Summary with Quantity Controls */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-6 border-t-4 border-blue-700 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Order Summary</h2>
                            
                            <div className="space-y-6 max-h-96 overflow-y-auto mb-6 pr-2">
                                {cart.map((item, index) => (
                                    <div key={index} className="flex gap-4 items-start text-sm border-b pb-4 last:border-b-0 last:pb-0">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-4xl shrink-0 border border-gray-200">
                                            📱
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col">
                                                    <p className="font-semibold text-gray-800 line-clamp-2">{item.product[1]}</p>
                                                    <p className="text-blue-700 font-extrabold text-xs">Rs. {item.product[2].toLocaleString()}.00 each</p>
                                                </div>
                                                <p className="font-extrabold text-gray-900 text-right whitespace-nowrap pl-2">
                                                    Rs. {(item.product[2] * item.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center border border-gray-300 rounded-md">
                                                    <button 
                                                        onClick={() => updateItemQuantity(item.product[0], item.quantity - 1)} 
                                                        className="px-2.5 py-1 hover:bg-gray-100 text-gray-600 rounded-l-md font-bold transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-3.5 py-1 font-bold text-gray-800 border-l border-r border-gray-300">
                                                        {item.quantity}
                                                    </span>
                                                    <button 
                                                        onClick={() => updateItemQuantity(item.product[0], item.quantity + 1)} 
                                                        className="px-2.5 py-1 hover:bg-gray-100 text-gray-600 rounded-r-md font-bold transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button onClick={() => removeFromCart(item.product[0])} className="text-red-500 hover:text-red-700 hover:underline font-semibold text-xs transition-colors">Remove</button>
                                            </div>
                                        </div>
                                    </div>
                                )).reverse()}
                            </div>

                            <div className="border-t pt-4 space-y-3">
                                <div className="flex justify-between text-gray-600 font-medium">
                                    <span>Subtotal</span>
                                    <span>Rs. {totalAmount.toLocaleString()}.00</span>
                                </div>
                                <div className="flex justify-between text-gray-600 font-medium">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-semibold">Free</span>
                                </div>
                                <div className="flex justify-between items-center text-xl font-extrabold text-gray-900 border-t-2 border-gray-200 pt-4 mt-2">
                                    <span>Total</span>
                                    <span className="text-blue-700">Rs. {totalAmount.toLocaleString()}.00</span>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                form="checkout-form"
                                disabled={loading}
                                className={`w-full mt-8 py-4 rounded-xl font-bold text-white shadow-md transition-all duration-300 transform hover:-translate-y-1 flex justify-center items-center gap-2 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-800'}`}
                            >
                                {loading ? 'Processing...' : 'Confirm Order'}
                                {!loading && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;