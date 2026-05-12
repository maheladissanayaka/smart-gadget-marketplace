// frontend/src/pages/ProductCatalog.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import Header from '../components/layout/Header'; 

const ProductCatalog = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(''); 
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isSeller = user?.role?.toLowerCase() === 'seller';

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/products');
            setProducts(response.data.data);
        } catch (error) {
            console.error("Error fetching products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!searchTerm.trim()) {
            fetchProducts(); 
            return;
        }

        setLoading(true);
        try {
            const response = await api.get(`/products/search?q=${searchTerm}`);
            setProducts(response.data.data);
        } catch (error) {
            console.error("Search error", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary">
            
            <Header 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                handleSearch={handleSearch} 
            />

            <div className="max-w-7xl mx-auto px-4 pb-10">
                
                {isSeller && (
                    <div className="flex justify-end mt-6 mb-2">
                        <button
                            onClick={() => navigate('/seller-dashboard')}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
                        >
                            <span className="text-xl">🏪</span> Go to Seller Dashboard
                        </button>
                    </div>
                )}
                {/* ------------------------------------------------ */}

                {loading ? (
                    <div className="flex justify-center mt-20">
                        <p className="text-xl text-gray-500 animate-pulse">Loading amazing gadgets...</p>
                    </div>
                ) : (
                    <>
                        {products.length === 0 ? (
                            <div className="text-center mt-20 p-10 bg-white rounded-xl shadow border border-gray-200">
                                <p className="text-2xl text-gray-600">No products found for "{searchTerm}"</p>
                                <button onClick={fetchProducts} className="mt-4 text-blue-600 font-semibold hover:underline">View All Products</button>
                            </div>
                        ) : (
                            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 ${!isSeller ? 'mt-8' : 'mt-4'}`}>
                                {products.map((product, index) => (
                                    <div 
                                        key={index} 
                                        onClick={() => navigate(`/product/${product[0]}`)} 
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all duration-300 flex flex-col cursor-pointer group"
                                    >
                                        
                                        <div className="h-48 bg-gray-50 border-b border-gray-200 flex items-center justify-center group-hover:bg-blue-50 transition-colors overflow-hidden relative">
                                            {product[4] ? (
                                                <img 
                                                    src={`http://localhost:5000${product[4]}`} 
                                                    alt={product[1]} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <span className="text-gray-400 text-6xl group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">📱</span>
                                            )}
                                        </div>
                                        
                                        {/* Content Area */}
                                        <div className="p-5 flex flex-col flex-grow">
                                            
                                            {/* Product Name */}
                                            <h3 className="text-lg font-extrabold text-gray-800 mb-1 truncate group-hover:text-blue-700 transition-colors">
                                                {product[1]} 
                                            </h3>
                                            
                                            <hr className="my-3 border-t-2 border-gray-100" />

                                            {/* Price & Stock Section with Vertical Line */}
                                            <div className="flex justify-between items-center mb-5">
                                                
                                                {/* Price Section */}
                                                <div className="flex-1 pr-3 border-r-2 border-gray-100">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Unit Price</p>
                                                    <p className="text-lg text-blue-700 font-extrabold truncate">
                                                        Rs. {product[2].toLocaleString()} 
                                                    </p>
                                                </div>

                                                {/* Stock Section */}
                                                <div className="flex-1 pl-3 text-right">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Availability</p>
                                                    <span className={`text-xs font-extrabold px-2 py-1 rounded-md inline-block shadow-sm ${product[3] > 0 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                                        {product[3] > 0 ? `${product[3]} in stock` : 'Sold Out'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Add to Cart Button */}
                                            <div className="mt-auto">
                                                <button 
                                                    disabled={product[3] <= 0}
                                                    onClick={(e) => {
                                                        e.stopPropagation(); 
                                                        addToCart(product);
                                                        alert(`${product[1]} added to cart successfully!`); 
                                                    }}
                                                    className={`w-full py-2.5 px-4 rounded-lg font-bold text-white shadow-md transition-all duration-300 flex justify-center items-center gap-2 border border-transparent ${
                                                        product[3] > 0 
                                                        ? 'bg-gray-800 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-1' 
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-200 shadow-none'
                                                    }`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    {product[3] > 0 ? 'Add to Cart' : 'Out of Stock'} 
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductCatalog;