"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from "react";
import { encryptData, decryptData } from "@/lib/crypto-utils";

// Types
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  categorySlug: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  image: string | null;
  printPosition: "BACK" | "FRONT" | "BOTH";
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "id"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "CLOSE_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  isLoading: boolean;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingIndex = state.items.findIndex(
        (item) =>
          item.productId === action.payload.productId &&
          item.color === action.payload.color &&
          item.size === action.payload.size
      );

      if (existingIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + action.payload.quantity,
        };
        return { ...state, items: updatedItems, isOpen: true };
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, id: generateId() }],
        isOpen: true,
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }

    case "CLEAR_CART":
      return { ...state, items: [] };

    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };

    case "CLOSE_CART":
      return { ...state, isOpen: false };

    case "LOAD_CART":
      return { ...state, items: action.payload };

    default:
      return state;
  }
}

// Provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });
  const [isLoading, setIsLoading] = useState(true);
  const [pendingSave, setPendingSave] = useState<CartItem[] | null>(null);

  // Load cart from encrypted localStorage on mount and validate prices
  useEffect(() => {
    const loadCart = async () => {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        try {
          // Try to decrypt the cart data
          const items = await decryptData<CartItem[]>(savedCart);
          
          if (items && Array.isArray(items) && items.length > 0) {
            // Fetch fresh prices from server to validate
            fetch("/api/products/prices", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                productIds: items.map((item: CartItem) => item.productId) 
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.prices) {
                  // Validate and update prices from server
                  const validatedItems = items.map((item: CartItem) => {
                    const serverPrice = data.prices[item.productId];
                    if (serverPrice && serverPrice.price !== item.price) {
                      // Price was manipulated, use server price
                      console.warn(`Price mismatch for ${item.name}: stored ${item.price}, server ${serverPrice.price}. Using server price.`);
                      return { ...item, price: serverPrice.price, name: serverPrice.name };
                    }
                    return item;
                  });
                  dispatch({ type: "LOAD_CART", payload: validatedItems });
                } else {
                  // No price data returned, use items as-is (fallback)
                  dispatch({ type: "LOAD_CART", payload: items });
                }
              })
              .catch((error) => {
                console.error("Failed to validate cart prices:", error);
                // On error, still load the cart but log it
                dispatch({ type: "LOAD_CART", payload: items });
              });
            return; // Will dispatch after validation
          }
        } catch (error) {
          console.error("Failed to load cart from localStorage:", error);
        }
      }
      setIsLoading(false);
    };

    loadCart();
  }, []);

  // Save cart to encrypted localStorage on change
  useEffect(() => {
    const saveCart = async () => {
      if (!isLoading && state.items.length >= 0) {
        const encryptedCart = await encryptData(state.items);
        localStorage.setItem("cart", encryptedCart);
      }
    };

    saveCart();
  }, [state.items, isLoading]);

  // Computed values
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Actions
  const addItem = (item: Omit<CartItem, "id">) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" });
  };

  const closeCart = () => {
    dispatch({ type: "CLOSE_CART" });
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalItems,
        subtotal,
        isOpen: state.isOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        closeCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
