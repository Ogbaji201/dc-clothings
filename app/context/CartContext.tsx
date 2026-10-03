    "use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type CartItem = {
  cartItemId: string;
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  imageUrl?: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartItemId: string) => void;
  increaseQuantity: (cartItemId: string) => void;
  decreaseQuantity: (cartItemId: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext =
  createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = "dcclothings-cart";

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>(
    []
  );

  const [isLoaded, setIsLoaded] =
    useState(false);

  /*
   * Load cart from localStorage
   */
  useEffect(() => {
    try {
      const storedCart =
        localStorage.getItem(
          CART_STORAGE_KEY
        );

      if (storedCart) {
        const parsedCart =
          JSON.parse(storedCart);

        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        }
      }
    } catch (error) {
      console.error(
        "Could not load cart:",
        error
      );
    } finally {
      setIsLoaded(true);
    }
  }, []);

  /*
   * Save cart to localStorage
   */
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error(
        "Could not save cart:",
        error
      );
    }
  }, [items, isLoaded]);

  /*
   * Add item to cart
   */
  function addToCart(item: CartItem) {
    setItems((currentItems) => {
        const existingItem =
        currentItems.find(
          (existing) =>
            existing.variantId ===
            item.variantId
        );

      if (existingItem) {
        return currentItems.map(
          (existing) =>
            existing.cartItemId ===
            existingItem.cartItemId
              ? {
                  ...existing,
                  quantity:
                    existing.quantity +
                    item.quantity,
                }
              : existing
        );
      }

      return [...currentItems, item];
    });
  }

  /*
   * Remove item
   */
  function removeFromCart(
    cartItemId: string
  ) {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          item.cartItemId !== cartItemId
      )
    );
  }

  /*
   * Increase quantity
   */
  function increaseQuantity(
    cartItemId: string
  ) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }

  /*
   * Decrease quantity
   */
  function decreaseQuantity(
    cartItemId: string
  ) {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )
    );
  }

  /*
   * Clear cart
   */
  const clearCart = useCallback(() => {
    setItems([]);

    if (typeof window !== "undefined") {
    localStorage.removeItem("dcclothings-cart");
  }
  }, []);

  /*
   * Total number of physical items
   */
  const itemCount = items.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  /*
   * Cart subtotal
   */
  const subtotal = items.reduce(
    (total, item) =>
      total +
      Number(item.price) *
        item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}