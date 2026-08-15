import React, { createContext, useContext, useEffect, useState } from 'react';
import type { productsType } from '../type/producttype';

export interface CartItem {
  product: productsType;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: productsType, size?: string, color?: string) => void;
  decrementItem: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number) => number;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'nexora_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);

  const addToCart = (product: productsType, size?: string, color?: string) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product.id === product.id);

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
          selectedSize: size || updated[existingIndex].selectedSize,
          selectedColor: color || updated[existingIndex].selectedColor,
        };
        return updated;
      } else {
        return [...prevItems, { product, quantity: 1, selectedSize: size, selectedColor: color }];
      }
    });
  };

  const decrementItem = (productId: number) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === productId);

      if (!existingItem) return prevItems;

      if (existingItem.quantity <= 1) {
        return prevItems.filter((item) => item.product.id !== productId);
      } else {
        return prevItems.map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getItemQuantity = (productId: number): number => {
    const item = cartItems.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const totalPrice = cartItems.reduce((acc, item) => {
    const price = item.product.discount
      ? item.product.price - (item.product.price * item.product.discount) / 100
      : item.product.price;
    return acc + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        decrementItem,
        removeFromCart,
        clearCart,
        getItemQuantity,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
