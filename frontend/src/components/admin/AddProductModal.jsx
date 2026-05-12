// frontend/src/components/admin/AddProductModal.jsx
import React, { useState } from 'react';
import api from '../../services/api';

const AddProductModal = ({ onClose, onProductAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: ''
    });
    const [image, setImage] = useState(null); 
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('stock', formData.stock);
        if (image) {
            data.append('image', image);
        }

        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (user && user.id) {
            data.append('sellerId', user.id); 
        }

        try {
            await api.post('/products', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            alert('🎉 Product added successfully with image!');
            onProductAdded();
            onClose();
        } catch (error) {
            console.error("Failed to add product", error);
            alert("Error adding product.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="bg-indigo-600 p-5 flex justify-between items-center text-white">
                    <h3 className="text-xl font-bold flex items-center gap-2">📦 Add New Product</h3>
                    <button onClick={onClose} className="text-white text-2xl font-bold">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Price (Rs.)</label>
                            <input type="number" name="price" required value={formData.price} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Stock</label>
                            <input type="number" name="stock" required value={formData.stock} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                    </div>
                    {/* Image Upload Input */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Product Image</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="text-gray-500 font-bold">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">
                            {loading ? 'Uploading...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;