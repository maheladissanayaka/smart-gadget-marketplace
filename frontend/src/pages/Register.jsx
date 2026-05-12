// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const [role, setRole] = useState('Customer');
    
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        confirmPassword: '',
        shopName: '',
        address: '',
        sellerIdNumber: '' 
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: role, // Customer ද Seller ද යන්න
                ...(role === 'Seller' && {
                    shopName: formData.shopName,
                    address: formData.address,
                    sellerIdNumber: formData.sellerIdNumber
                })
            };

            await api.post('/auth/register', payload);
            
            alert(`🎉 ${role} Account created successfully! Please login.`);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className={`max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-6 border-t-8 ${role === 'Customer' ? 'border-green-500' : 'border-purple-600'} transition-all duration-500`}>
                
                {/* Header Section */}
                <div className="text-center">
                    <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 shadow-sm transition-colors ${role === 'Customer' ? 'bg-green-100' : 'bg-purple-100'}`}>
                        <span className="text-3xl">{role === 'Customer' ? '🛒' : '🏪'}</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        {role === 'Customer' ? 'Join us to start shopping' : 'Start selling your gadgets today!'}
                    </p>
                </div>

                {/* Role Selection Tabs (Customer / Seller) */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setRole('Customer')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${role === 'Customer' ? 'bg-white shadow-sm text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        I am a Customer
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('Seller')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${role === 'Seller' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        I am a Seller
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                )}

                {/* Form Section */}
                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                    
                    {/* Common Fields */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{role === 'Seller' ? 'Owner Name' : 'Full Name'}</label>
                        <input 
                            name="name" type="text" required value={formData.name} onChange={handleChange}
                            className={`appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${role === 'Customer' ? 'focus:ring-green-500' : 'focus:ring-purple-500'} transition-colors`} 
                            placeholder={role === 'Seller' ? "John Doe" : "John Doe"} 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                        <input 
                            name="email" type="email" required value={formData.email} onChange={handleChange}
                            className={`appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${role === 'Customer' ? 'focus:ring-green-500' : 'focus:ring-purple-500'} transition-colors`} 
                            placeholder="you@example.com" 
                        />
                    </div>

                    {/* Seller Specific Fields (Animated Entry) */}
                    {role === 'Seller' && (
                        <div className="space-y-5 bg-purple-50 p-4 rounded-xl border border-purple-100 animate-in fade-in slide-in-from-top-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Shop / Business Name</label>
                                <input 
                                    name="shopName" type="text" required value={formData.shopName} onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors" 
                                    placeholder="Smart Electronics" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">NIC or Business ID</label>
                                <input 
                                    name="sellerIdNumber" type="text" required value={formData.sellerIdNumber} onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors" 
                                    placeholder="e.g. 199012345678 or PV12345" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Business Address</label>
                                <textarea 
                                    name="address" required value={formData.address} onChange={handleChange} rows="2"
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors" 
                                    placeholder="123, Main Street, Colombo" 
                                />
                            </div>
                        </div>
                    )}

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                            <input 
                                name="password" type="password" required value={formData.password} onChange={handleChange}
                                className={`appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent ${role === 'Customer' ? 'focus:ring-green-500' : 'focus:ring-purple-500'} transition-colors`} 
                                placeholder="••••••••" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Confirm Password</label>
                            <input 
                                name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange}
                                className={`appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent ${role === 'Customer' ? 'focus:ring-green-500' : 'focus:ring-purple-500'} transition-colors`} 
                                placeholder="••••••••" 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full flex justify-center py-3.5 px-4 mt-2 border border-transparent rounded-lg shadow-md text-sm font-bold text-white transition-all transform hover:-translate-y-0.5 hover:shadow-lg ${
                            loading ? 'opacity-70 cursor-not-allowed' : 
                            role === 'Customer' ? 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700' : 
                            'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                        }`}
                    >
                        {loading ? 'Creating account...' : `Register as ${role}`}
                    </button>
                </form>

                {/* Footer Section */}
                <div className="text-center mt-4 border-t pt-4">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className={`font-bold transition-colors ${role === 'Customer' ? 'text-green-600 hover:text-green-800' : 'text-purple-600 hover:text-purple-800'}`}>
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;