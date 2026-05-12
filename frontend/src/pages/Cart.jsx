// frontend/src/pages/Cart.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const { cart, removeFromCart } = useCart();
    const navigate = useNavigate();

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.product[2] * item.quantity), 0);
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
                <div className="text-7xl mb-6">🛒</div>
                <h2 className="text-3xl font-extrabold text-gray-800 mb-4">Your cart is empty</h2>
                <p className="text-gray-500 mb-8 text-lg text-center">Looks like you haven't added anything to your cart yet.</p>
                <button 
                    onClick={() => navigate('/')} 
                    className="bg-blue-600 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-bold shadow-md transition-all duration-300 transform hover:-translate-y-1"
                >
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary py-10 px-4">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                    <span className="text-4xl">🛒</span> Your Shopping Cart
                </h1>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 bg-gray-50 p-5 border-b text-sm font-bold text-gray-600 uppercase tracking-wider">
                        <div className="col-span-6 md:col-span-6">Product Details</div>
                        <div className="col-span-3 md:col-span-2 text-center">Unit Price</div>
                        <div className="col-span-3 md:col-span-2 text-center">Quantity</div>
                        <div className="hidden md:block col-span-2 text-right">Total</div>
                    </div>

                    {/* Cart Items List */}
                    <div className="divide-y divide-gray-100">
                        {cart.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 p-5 items-center gap-4 hover:bg-gray-50 transition-colors">
                                
                                {/* Product Image & Name */}
                                <div className="col-span-6 md:col-span-6 flex items-center gap-4">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg flex items-center justify-center text-4xl shrink-0 border">
                                        📱
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-gray-800 text-base md:text-lg line-clamp-2">{item.product[1]}</h3>
                                        <button 
                                            onClick={() => removeFromCart(item.product[0])}
                                            className="text-red-500 text-sm hover:text-red-700 hover:underline mt-1 font-semibold text-left w-max"
                                        >
                                            Remove Item
                                        </button>
                                    </div>
                                </div>

                                {/* Unit Price */}
                                <div className="col-span-3 md:col-span-2 text-center text-gray-600 font-medium text-sm md:text-base">
                                    Rs. {item.product[2].toLocaleString()}
                                </div>

                                {/* Quantity */}
                                <div className="col-span-3 md:col-span-2 text-center">
                                    <span className="bg-gray-100 border border-gray-200 text-gray-800 px-4 py-1.5 rounded-lg font-bold">
                                        {item.quantity}
                                    </span>
                                </div>

                                {/* Total Price for Item */}
                                <div className="hidden md:block col-span-2 text-right text-blue-700 font-extrabold text-lg">
                                    Rs. {(item.product[2] * item.quantity).toLocaleString()}.00
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Cart Summary Footer */}
                    <div className="bg-gray-50 p-6 md:p-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
                        <button 
                            onClick={() => navigate('/')} 
                            className="text-gray-600 hover:text-blue-600 font-bold flex items-center gap-2 transition-colors order-2 md:order-1"
                        >
                            ← Continue Shopping
                        </button>

                        <div className="flex flex-col items-end gap-4 w-full md:w-auto order-1 md:order-2">
                            <div className="flex items-end gap-3">
                                <span className="text-lg text-gray-600 font-medium mb-1">Subtotal:</span>
                                <span className="text-4xl font-extrabold text-gray-900">
                                    Rs. {calculateTotal().toLocaleString()}.00
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">Taxes and shipping calculated at checkout</p>
                            
                            {/* Proceed to Checkout */}
                            <button 
                                onClick={() => navigate('/checkout', { state: { cartItems: cart, total: calculateTotal() } })}
                                className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 text-lg flex justify-center items-center gap-2"
                            >
                                Proceed to Checkout
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;