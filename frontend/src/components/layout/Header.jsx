// frontend/src/components/layout/Header.jsx
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Header = ({ searchTerm, setSearchTerm, handleSearch }) => {
    const navigate = useNavigate();
    const { cart } = useCart();

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isAdmin = user && user.role && user.role.toLowerCase() === 'admin';

    useEffect(() => {
        const checkAuthTime = () => {
            const loginTime = localStorage.getItem('loginTime');
            if (user && loginTime) {
                const currentTime = Date.now();
                const oneHour = 60 * 60 * 1000; 

                if (currentTime - parseInt(loginTime) > oneHour) {
                    handleLogout();
                    alert("Your session has expired after 1 hour. Please login again.");
                }
            } else if (user && !loginTime) {
                localStorage.setItem('loginTime', Date.now().toString());
            }
        };

        checkAuthTime();
        const interval = setInterval(checkAuthTime, 60000); 
        return () => clearInterval(interval);
    }, [user, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('loginTime'); 
        navigate('/');
    };

    return (
        <div className="bg-white shadow-sm border-b border-gray-200 py-4 px-6 mb-8">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
                
                {/* Logo Section */}
                <Link to="/" className="text-3xl font-extrabold text-gray-900 hover:text-blue-700 transition-colors whitespace-nowrap">
                    Smart Gadgets <span className="text-blue-600">Catalog</span>
                </Link>

                {handleSearch && (
                    <form onSubmit={handleSearch} className="flex w-full lg:w-1/3 shadow-inner rounded-full overflow-hidden border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                        <input 
                            type="text" 
                            placeholder="Search gadgets (e.g., Mouse, Samsung)..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-5 py-2 border-none focus:outline-none focus:ring-0 text-gray-800 bg-gray-50"
                        />
                        <button 
                            type="submit" 
                            style={{ backgroundColor: '#2563eb', color: 'white' }}
                            className="px-6 py-2 font-semibold transition duration-200 cursor-pointer hover:opacity-90"
                        >
                            Search
                        </button>
                    </form>
                )}

                {/* Navigation & User Actions Container */}
                <div className="flex items-center gap-3">
                    
                    <button 
                        onClick={() => navigate('/cart')} 
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-sm hover:shadow transition-all whitespace-nowrap font-medium flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Cart ({cart?.length || 0})
                    </button>

                    {!user && (
                        <div className="flex items-center gap-2 border-l pl-3 border-gray-200 ml-1">
                            <button 
                                onClick={() => navigate('/login')} 
                                className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded-full font-bold transition-colors text-sm"
                            >
                                Login
                            </button>
                            <button 
                                onClick={() => navigate('/register')} 
                                className="bg-blue-600 text-white hover:bg-blue-800 px-4 py-2 rounded-full font-bold transition-colors shadow-sm text-sm"
                            >
                                Register
                            </button>
                        </div>
                    )}

                    {user && (
                        <div className="flex items-center gap-3 border-l pl-3 border-gray-200 ml-1">
                            <button 
                                onClick={() => navigate('/dashboard')} 
                                className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                            >
                                My Dashboard
                            </button>

                            {isAdmin && (
                                <button 
                                    onClick={() => navigate('/admin')} 
                                    className="bg-gray-800 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                                >
                                    Admin Area
                                </button>
                            )}

                            <div className="flex items-center gap-3 p-1.5 border border-gray-200 rounded-xl bg-gray-50 shadow-inner">
                                <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 border-2 border-white shadow-sm shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="flex flex-col items-start leading-none pr-1">
                                    <span className="font-extrabold text-gray-800 text-sm whitespace-nowrap">{user.name}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleLogout} 
                                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2.5 rounded-lg font-bold transition-colors text-sm whitespace-nowrap"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;