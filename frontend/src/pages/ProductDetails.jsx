// frontend/src/pages/ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const { addToCart, cart } = useCart(); 
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [quantity, setQuantity] = useState(1);

    const API_BASE_URL = 'http://localhost:5000';

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data.data);
            } catch (error) {
                console.error("Error fetching product", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleIncrement = () => {
        if (product && quantity < product[3]) {
            setQuantity(prev => prev + 1);
        }
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center"><p className="text-xl animate-pulse">Loading Details...</p></div>;
    if (!product) return <div className="min-h-screen flex justify-center items-center"><p className="text-xl text-red-500">Product not found!</p></div>;

    return (
        <div className="min-h-screen bg-secondary py-10 px-4">
            <div className="max-w-6xl mx-auto">
                
                {/* Top Bar - Back & Cart Buttons */}
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-blue-600 flex items-center gap-2 font-bold transition-colors">
                        ← Back to Catalog
                    </button>
                    
                    <button 
                        onClick={() => navigate('/cart')} 
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 font-medium flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Cart ({cart?.length || 0})
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
                    
                    <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-10 border-r border-gray-200">
                        {product[4] ? (
                            <img 
                                src={`${API_BASE_URL}${product[4]}`} 
                                alt={product[1]} 
                                className="max-w-full max-h-[400px] object-contain shadow-sm rounded-lg transform hover:scale-105 transition-transform duration-500"
                                onError={(e) => { e.target.src = "https://via.placeholder.com/500?text=Image+Not+Found"; }}
                            />
                        ) : (
                            <span className="text-9xl transform hover:scale-110 transition-transform duration-300">📱</span>
                        )}
                    </div>

                    {/* Product Info Area */}
                    <div className="md:w-1/2 p-10 flex flex-col justify-center">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{product[1]}</h1>
                        <p className="text-3xl text-blue-700 font-bold mb-6">Rs. {product[2].toLocaleString()}.00</p>
                        
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            This is a premium smart gadget available in our marketplace. It comes with industry-leading features and a manufacturer warranty. Perfect for your daily needs.
                        </p>

                        <div className="mb-6 flex items-center gap-4">
                            <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${product[3] > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {product[3] > 0 ? `✓ In Stock` : '✕ Out of Stock'}
                            </span>
                        </div>

                        {/* Quantity Selector */}
                        {product[3] > 0 && (
                            <div className="flex items-center gap-4 mb-8">
                                <span className="font-semibold text-gray-700">Quantity:</span>
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button 
                                        onClick={handleDecrement} 
                                        className="px-4 py-2 hover:bg-gray-100 text-gray-600 rounded-l-lg font-bold transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="px-6 py-2 font-bold text-gray-800 border-l border-r border-gray-300">
                                        {quantity}
                                    </span>
                                    <button 
                                        onClick={handleIncrement} 
                                        className="px-4 py-2 hover:bg-gray-100 text-gray-600 rounded-r-lg font-bold transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                                <span className="text-sm text-gray-500">({product[3]} available)</span>
                            </div>
                        )}

                        {/* Add to Cart & Buy Now Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                disabled={product[3] <= 0}
                                onClick={() => {
                                    addToCart(product, quantity); 
                                    alert(`${quantity} x ${product[1]} added to cart successfully!`); 
                                }}
                                className={`flex-1 py-4 px-6 rounded-lg font-bold text-white shadow-md transition-all duration-300 transform hover:-translate-y-1 flex justify-center items-center gap-2 ${
                                    product[3] > 0 
                                    ? 'bg-gray-800 hover:bg-gray-900 hover:shadow-lg' 
                                    : 'bg-gray-300 cursor-not-allowed'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Add to Cart
                            </button>

                            <button 
                                disabled={product[3] <= 0}
                                onClick={() => {
                                    addToCart(product, quantity); 
                                    navigate('/checkout');
                                }}
                                className={`flex-1 py-4 px-6 rounded-lg font-bold text-white shadow-md transition-all duration-300 transform hover:-translate-y-1 flex justify-center items-center gap-2 ${
                                    product[3] > 0 
                                    ? 'bg-blue-600 hover:bg-blue-800 hover:shadow-lg' 
                                    : 'bg-gray-300 cursor-not-allowed'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Buy it Now
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;