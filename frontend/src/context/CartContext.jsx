// frontend/src/context/CartContext.jsx
import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const addToCart = (product, quantityToAdd = 1) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(item => item.product[0] === product[0]);
            
            if (existingItem) {
                return prevCart.map(item =>
                    item.product[0] === product[0] 
                    ? { ...item, quantity: item.quantity + quantityToAdd } 
                    : item
                );
            }
            return [...prevCart, { product, quantity: quantityToAdd }];
        });
    };

    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter(item => item.product[0] !== productId));
    };

    const updateItemQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return; 
        
        setCart(prevCart => prevCart.map(item =>
            item.product[0] === productId
            ? { ...item, quantity: newQuantity }
            : item
        ));
    };

    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateItemQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};