// frontend/src/components/admin/EditProductModal.jsx
import React, { useState } from 'react';
import api from '../../services/api';

const EditProductModal = ({ product, onClose, onProductUpdated }) => {
    const [formData, setFormData] = useState({
        name: product[1],
        price: product[2], 
        stock: product[3]  
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put(`/products/${product[0]}`, {
                name: formData.name,
                price: Number(formData.price),
                stock: Number(formData.stock)
            });
            
            alert('✨ Product updated successfully!');
            onProductUpdated(); 
            onClose(); 
        } catch (error) {
            console.error("Failed to update product", error);
            alert("Error updating product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 flex flex-col">
                <div className="bg-indigo-600 p-5 flex justify-between items-center text-white">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-2xl">✏️</span> Edit Product
                    </h3>
                    <button onClick={onClose} className="text-indigo-200 hover:text-white text-3xl font-bold leading-none">&times;</button>
                </div>
                
                <div className="p-6">
                    <form id="edit-product-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                            <input 
                                type="text" name="name" required value={formData.name} onChange={handleChange} 
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Price (Rs.)</label>
                                <input 
                                    type="number" name="price" required min="0" value={formData.price} onChange={handleChange} 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Stock Amount</label>
                                <input 
                                    type="number" name="stock" required min="0" value={formData.stock} onChange={handleChange} 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                                />
                            </div>
                        </div>
                    </form>
                </div>
                
                <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg font-bold transition-colors">Cancel</button>
                    <button type="submit" form="edit-product-form" disabled={loading} className={`px-6 py-2 rounded-lg font-bold text-white shadow-md transition-all ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-800'}`}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProductModal;