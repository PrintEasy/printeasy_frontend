"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const savedCount = localStorage.getItem("count");
    if (savedCount) setCartCount(Number(savedCount));
  }, []);

  const updateCart = (newCount) => {
    setCartCount(newCount);
    localStorage.setItem("count", newCount);
  };

  return (
    <CartContext.Provider value={{ cartCount, updateCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
