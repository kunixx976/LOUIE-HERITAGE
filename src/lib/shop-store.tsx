import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products, type Product } from "./data";

export type CartLine = {
  productId: string;
  size: string;
  color: string;
  quantity: number;
};

export type Address = {
  id: string;
  label: string;
  name: string;
  line1: string;
  city: string;
  postcode: string;
  country: string;
  isDefault?: boolean;
};

export type Order = {
  id: string;
  date: string;
  status: "Processing" | "In transit" | "Delivered";
  total: number;
  items: { name: string; quantity: number; price: number; image: string }[];
};

export type User = { name: string; email: string } | null;

type State = {
  cart: CartLine[];
  wishlist: string[];
  recentlyViewed: string[];
  user: User;
  addresses: Address[];
  orders: Order[];
};

const STORAGE_KEY = "mishraclothings-state";

const seedOrders: Order[] = [
  {
    id: "AN-24815",
    date: "14 July 2026",
    status: "Delivered",
    total: 660,
    items: [
      { name: "Oversized Drop-Shoulder Tee", quantity: 1, price: 1099, image: products[1]!.images[0]! },
      { name: "Ludhiana Long Cardigan", quantity: 1, price: 2199, image: products[7]!.images[0]! },
    ],
  },
  {
    id: "AN-24102",
    date: "2 May 2026",
    status: "In transit",
    total: 274,
    items: [
      { name: "Elin Oversized Poplin Shirt", quantity: 1, price: 129, image: products[0]!.images[0]! },
      { name: "Kavi Heavyweight Hoodie", quantity: 1, price: 145, image: products[5]!.images[0]! },
    ],
  },
];

const initialState: State = {
  cart: [],
  wishlist: [],
  recentlyViewed: [],
  user: null,
  addresses: [
    {
      id: "a1",
      label: "Home",
      name: "Anmol Mishra",
      line1: "12 Abu Lane, Sadar Bazar",
      city: "Meerut",
      postcode: "250101",
      country: "India",
      isDefault: true,
    },
  ],
  orders: seedOrders,
};

type Ctx = State & {
  hydrated: boolean;
  addToCart: (line: CartLine) => void;
  updateQuantity: (index: number, quantity: number) => void;
  removeLine: (index: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  markViewed: (id: string) => void;
  signIn: (user: NonNullable<User>) => void;
  signOut: () => void;
  addAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
  placeOrder: (total: number) => string;
  cartCount: number;
  subtotal: number;
  cartProducts: { line: CartLine; product: Product }[];
};

const ShopContext = createContext<Ctx | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...JSON.parse(raw) });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const addToCart = useCallback((line: CartLine) => {
    setState((s) => {
      const idx = s.cart.findIndex(
        (l) => l.productId === line.productId && l.size === line.size && l.color === line.color,
      );
      if (idx > -1) {
        const cart = [...s.cart];
        cart[idx] = { ...cart[idx]!, quantity: cart[idx]!.quantity + line.quantity };
        return { ...s, cart };
      }
      return { ...s, cart: [...s.cart, line] };
    });
  }, []);

  const updateQuantity = useCallback((index: number, quantity: number) => {
    setState((s) => {
      const cart = [...s.cart];
      if (quantity <= 0) cart.splice(index, 1);
      else cart[index] = { ...cart[index]!, quantity };
      return { ...s, cart };
    });
  }, []);

  const removeLine = useCallback((index: number) => {
    setState((s) => ({ ...s, cart: s.cart.filter((_, i) => i !== index) }));
  }, []);

  const clearCart = useCallback(() => setState((s) => ({ ...s, cart: [] })), []);

  const toggleWishlist = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      wishlist: s.wishlist.includes(id)
        ? s.wishlist.filter((w) => w !== id)
        : [...s.wishlist, id],
    }));
  }, []);

  const markViewed = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      recentlyViewed: [id, ...s.recentlyViewed.filter((r) => r !== id)].slice(0, 8),
    }));
  }, []);

  const signIn = useCallback((user: NonNullable<User>) => setState((s) => ({ ...s, user })), []);
  const signOut = useCallback(() => setState((s) => ({ ...s, user: null })), []);

  const addAddress = useCallback((address: Address) => {
    setState((s) => ({ ...s, addresses: [...s.addresses, address] }));
  }, []);

  const removeAddress = useCallback((id: string) => {
    setState((s) => ({ ...s, addresses: s.addresses.filter((a) => a.id !== id) }));
  }, []);

  const placeOrder = useCallback((total: number) => {
    const id = `AN-${Math.floor(20000 + Math.random() * 9000)}`;
    setState((s) => {
      const items = s.cart.map((line) => {
        const product = products.find((p) => p.id === line.productId)!;
        return {
          name: product.name,
          quantity: line.quantity,
          price: product.price,
          image: product.images[0]!,
        };
      });
      return {
        ...s,
        cart: [],
        orders: [
          {
            id,
            date: new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            status: "Processing",
            total,
            items,
          },
          ...s.orders,
        ],
      };
    });
    return id;
  }, []);

  const cartProducts = useMemo(
    () =>
      state.cart
        .map((line) => ({ line, product: products.find((p) => p.id === line.productId)! }))
        .filter((entry) => Boolean(entry.product)),
    [state.cart],
  );

  const value: Ctx = {
    ...state,
    hydrated,
    addToCart,
    updateQuantity,
    removeLine,
    clearCart,
    toggleWishlist,
    isWishlisted: (id) => state.wishlist.includes(id),
    markViewed,
    signIn,
    signOut,
    addAddress,
    removeAddress,
    placeOrder,
    cartCount: state.cart.reduce((n, l) => n + l.quantity, 0),
    subtotal: cartProducts.reduce((n, { line, product }) => n + product.price * line.quantity, 0),
    cartProducts,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(value);
}
