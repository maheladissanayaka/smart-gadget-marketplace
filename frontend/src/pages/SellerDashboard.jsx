// frontend/src/pages/SellerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AddProductModal from '../components/admin/AddProductModal'; 
import EditProductModal from '../components/admin/EditProductModal';

const SellerDashboard = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const API_BASE_URL = 'http://localhost:5000';

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const fetchMyProducts = async () => {
        if (!user) return;
        try {
            const response = await api.get(`/products/seller/${user.id}`);
            setProducts(response.data.data);
        } catch (error) {
            console.error("Error fetching products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.role.toLowerCase() !== 'seller') {
            navigate('/login');
            return;
        }
        fetchMyProducts();
    }, [user, navigate]);

    const handleDeleteProduct = async (productId, productName) => {
        if(window.confirm(`Are you sure you want to delete "${productName}"?`)) {
            try {
                await api.delete(`/products/${productId}`);
                alert('🗑️ Product deleted successfully!');
                fetchMyProducts();
            } catch (error) {
                alert(error.response?.data?.message || "Failed to delete product.");
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-secondary p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-purple-100">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
                            <span className="text-4xl">🏪</span> {user?.name}'s Shop
                        </h1>
                        <p className="text-gray-500 mt-1 font-medium">Manage your products and inventory</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="text-purple-600 hover:text-purple-800 font-bold transition-colors">
                            View Live Store
                        </button>
                        <button onClick={handleLogout} className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-colors shadow-sm">
                            Logout
                        </button>
                    </div>
                </div>

                {/* Add Product Button */}
                <div className="flex justify-end">
                    <button 
                        onClick={() => setIsAddProductOpen(true)}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all font-extrabold flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add New Product
                    </button>
                </div>

                {/* Inventory Table */}
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">My Inventory</h2>
                    
                    {loading ? (
                        <p className="text-center py-10 text-gray-500 font-semibold animate-pulse">Loading your products...</p>
                    ) : products.length === 0 ? (
                        <div className="text-center py-16">
                            <span className="text-6xl">📦</span>
                            <p className="text-xl text-gray-500 mt-4 font-semibold">Your shop is empty!</p>
                            <p className="text-gray-400 text-sm mt-1">Click "Add New Product" to start selling.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto overflow-y-auto max-h-[500px] rounded-lg border border-gray-100 relative">
                            <table className="min-w-full text-left text-sm whitespace-nowrap">
                                <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-gray-600">Image</th>
                                        <th className="px-6 py-4 font-bold text-gray-600">Product Name</th>
                                        <th className="px-6 py-4 font-bold text-gray-600 text-right">Price</th>
                                        <th className="px-6 py-4 font-bold text-gray-600 text-center">Stock</th>
                                        <th className="px-6 py-4 font-bold text-gray-600 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.map((item, index) => (
                                        <tr key={index} className="hover:bg-purple-50/30 transition-colors group">
                                            <td className="px-6 py-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center border">
                                                    {item[4] ? (
                                                        <img src={`${API_BASE_URL}${item[4]}`} alt={item[1]} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xl">📱</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-gray-800 font-bold text-base">{item[1]}</td>
                                            <td className="px-6 py-3 text-purple-700 font-extrabold text-right text-base">Rs. {item[2].toLocaleString()}.00</td>
                                            <td className="px-6 py-3 text-center">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${item[3] > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {item[3] > 0 ? `${item[3]} left` : 'Sold Out'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 flex justify-center gap-3 mt-1.5">
                                                <button onClick={() => setEditingProduct(item)} className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-sm">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDeleteProduct(item[0], item[1])} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-sm">
                                                    Delete
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

            {/* Modals */}
            {isAddProductOpen && <AddProductModal onClose={() => setIsAddProductOpen(false)} onProductAdded={fetchMyProducts} />}
            {editingProduct && <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onProductUpdated={fetchMyProducts} />}
        </div>
    );
};

export default SellerDashboard;