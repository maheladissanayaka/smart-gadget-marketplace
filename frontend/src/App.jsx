// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import ProductCatalog from './pages/ProductCatalog';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import ProductDetails from './pages/ProductDetails';
import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';
import CustomerDashboard from './pages/CustomerDashboard';
import Register from './pages/Register';
import SellerDashboard from './pages/SellerDashboard';

function App() {
  return (
    <CartProvider>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<ProductCatalog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;