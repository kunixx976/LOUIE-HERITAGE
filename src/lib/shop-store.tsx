import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { products, type Product } from "./data";
import { authConfigurationMessage, supabase, supabaseConfigured } from "./supabase";

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
  status: string;
  total: number;
  paymentMethod: "razorpay" | "cod";
  paymentStatus: string;
  trackingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  items: {
    name: string;
    quantity: number;
    price: number;
    image: string | null;
    size: string;
    color: string;
  }[];
};

type OrderRecord = {
  order_number: string;
  status: string;
  total: number;
  payment_method: "razorpay" | "cod";
  payment_status: string;
  tracking_carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  items: {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    size: string;
    color: string;
  }[];
  created_at: string;
};

export type User = { id: string; name: string; email: string } | null;

type State = {
  cart: CartLine[];
  couponCode: string | null;
  wishlist: string[];
  recentlyViewed: string[];
  user: User;
  addresses: Address[];
  orders: Order[];
};

const STORAGE_KEY = "louie-heritage-state";

const initialState: State = {
  cart: [],
  couponCode: null,
  wishlist: [],
  recentlyViewed: [],
  user: null,
  addresses: [],
  orders: [],
};

function getShopUser(user: SupabaseUser): NonNullable<User> {
  const email = user.email ?? "";
  const metadataName = user.user_metadata["full_name"] ?? user.user_metadata["name"];
  const name =
    typeof metadataName === "string" && metadataName.trim()
      ? metadataName.trim()
      : email.split("@")[0] || "there";

  return { id: user.id, name, email };
}

type Ctx = State & {
  hydrated: boolean;
  ordersLoading: boolean;
  ordersError: string | null;
  authConfigured: boolean;
  authError: string | null;
  passwordRecovery: boolean;
  addToCart: (line: CartLine) => void;
  updateQuantity: (index: number, quantity: number) => void;
  removeLine: (index: number) => void;
  clearCart: () => void;
  couponCode: string | null;
  discount: number;
  applyCoupon: (code: string) => boolean;
  clearCoupon: () => void;
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  markViewed: (id: string) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  addAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
  placeOrder: (orderId: string) => string;
  refreshOrders: () => Promise<void>;
  cartCount: number;
  subtotal: number;
  cartProducts: { line: CartLine; product: Product }[];
};

const ShopContext = createContext<Ctx | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const orderRequestId = useRef(0);

  useEffect(() => {
    let active = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<State>;
        setState({
          ...initialState,
          ...saved,
          user: null,
          orders: [],
          addresses: saved.addresses?.filter((address) => address.id !== "a1") ?? [],
        });
      }
    } catch (error) {
      console.error("Unable to restore the saved shopping state.", error);
    }
    setHydrated(true);

    if (!supabase) {
      return () => {
        active = false;
      };
    }

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      setState((current) => ({
        ...current,
        user: session ? getShopUser(session.user) : null,
      }));
      setPasswordRecovery(event === "PASSWORD_RECOVERY");
    });

    void supabase.auth
      .getSession()
      .then(({ data: sessionData, error }) => {
        if (!active) return;
        if (error) {
          console.error("Unable to restore the Supabase session.", error);
          setAuthError(error.message);
        } else {
          setState((current) => ({
            ...current,
            user: sessionData.session ? getShopUser(sessionData.session.user) : null,
          }));
          setAuthError(null);
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error("Unable to restore the Supabase session.", error);
        setAuthError(error instanceof Error ? error.message : "Unable to restore your session.");
      });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...state, user: null, orders: [] }),
      );
    } catch (error) {
      console.error("Unable to save the shopping state.", error);
    }
  }, [state, hydrated]);

  const requireSupabase = useCallback(() => {
    if (!supabase) throw new Error(authConfigurationMessage);
    return supabase;
  }, []);

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
      return { ...s, cart, couponCode: cart.length > 0 ? s.couponCode : null };
    });
  }, []);

  const removeLine = useCallback((index: number) => {
    setState((s) => {
      const cart = s.cart.filter((_, i) => i !== index);
      return { ...s, cart, couponCode: cart.length > 0 ? s.couponCode : null };
    });
  }, []);

  const clearCart = useCallback(() => setState((s) => ({ ...s, cart: [], couponCode: null })), []);

  const applyCoupon = useCallback((code: string) => {
    const normalized = code.trim().toUpperCase();
    if (normalized !== "STUDIO10") return false;
    setState((s) => ({ ...s, couponCode: normalized }));
    return true;
  }, []);

  const clearCoupon = useCallback(() => {
    setState((s) => ({ ...s, couponCode: null }));
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      wishlist: s.wishlist.includes(id) ? s.wishlist.filter((w) => w !== id) : [...s.wishlist, id],
    }));
  }, []);

  const markViewed = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      recentlyViewed: [id, ...s.recentlyViewed.filter((r) => r !== id)].slice(0, 8),
    }));
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const client = requireSupabase();
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setState((current) => ({ ...current, user: getShopUser(data.user) }));
      setAuthError(null);
    },
    [requireSupabase],
  );

  const signInWithGoogle = useCallback(async () => {
    const client = requireSupabase();
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/profile`,
      },
    });
    if (error) throw error;
  }, [requireSupabase]);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const client = requireSupabase();
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/profile`,
        },
      });
      if (error) throw error;
      const user = data.user;
      if (user && data.session) {
        setState((current) => ({ ...current, user: getShopUser(user) }));
      }
      setAuthError(null);
      return Boolean(data.session);
    },
    [requireSupabase],
  );

  const signOut = useCallback(async () => {
    const client = requireSupabase();
    const { error } = await client.auth.signOut();
    if (error) throw error;
    setState((current) => ({ ...current, user: null }));
  }, [requireSupabase]);

  const requestPasswordReset = useCallback(
    async (email: string) => {
      const client = requireSupabase();
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/forgot-password`,
      });
      if (error) throw error;
    },
    [requireSupabase],
  );

  const updatePassword = useCallback(
    async (password: string) => {
      const client = requireSupabase();
      const { error } = await client.auth.updateUser({ password });
      if (error) throw error;
      setPasswordRecovery(false);
    },
    [requireSupabase],
  );

  const addAddress = useCallback((address: Address) => {
    setState((s) => ({ ...s, addresses: [...s.addresses, address] }));
  }, []);

  const removeAddress = useCallback((id: string) => {
    setState((s) => ({ ...s, addresses: s.addresses.filter((a) => a.id !== id) }));
  }, []);

  const placeOrder = useCallback((orderId: string) => {
    setState((current) => ({ ...current, cart: [], couponCode: null }));
    return orderId;
  }, []);

  const refreshOrders = useCallback(async () => {
    if (!state.user) {
      orderRequestId.current += 1;
      setState((current) => ({ ...current, orders: [] }));
      setOrdersError(null);
      setOrdersLoading(false);
      return;
    }

    const requestId = ++orderRequestId.current;
    if (!supabase) {
      setOrdersError(authConfigurationMessage);
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const { data, error } = await supabase.functions.invoke<{ orders: OrderRecord[] }>(
        "list-orders",
      );
      if (error) throw error;
      if (!data || !Array.isArray(data.orders)) {
        throw new Error("The order service returned an invalid response.");
      }
      if (requestId !== orderRequestId.current) return;

      const orders = data.orders.map((record) => ({
        id: record.order_number,
        date: new Intl.DateTimeFormat("en-IN", {
          dateStyle: "medium",
        }).format(new Date(record.created_at)),
        status: record.status,
        total: record.total,
        paymentMethod: record.payment_method,
        paymentStatus: record.payment_status,
        trackingCarrier: record.tracking_carrier,
        trackingNumber: record.tracking_number,
        trackingUrl: record.tracking_url?.startsWith("https://") ? record.tracking_url : null,
        items: record.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.unitPrice,
          image: products.find((product) => product.id === item.productId)?.images[0] ?? null,
          size: item.size,
          color: item.color,
        })),
      }));
      setState((current) => ({ ...current, orders }));
    } catch (error) {
      if (requestId === orderRequestId.current) {
        setOrdersError(error instanceof Error ? error.message : "Unable to load your orders.");
      }
    } finally {
      if (requestId === orderRequestId.current) setOrdersLoading(false);
    }
  }, [state.user]);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.user) {
      orderRequestId.current += 1;
      setState((current) => ({ ...current, orders: [] }));
      setOrdersError(null);
      setOrdersLoading(false);
      return;
    }
    void refreshOrders();
  }, [hydrated, state.user, refreshOrders]);

  const cartProducts = useMemo(
    () =>
      state.cart
        .map((line) => ({ line, product: products.find((p) => p.id === line.productId)! }))
        .filter((entry) => Boolean(entry.product)),
    [state.cart],
  );
  const subtotal = cartProducts.reduce(
    (n, { line, product }) => n + product.price * line.quantity,
    0,
  );
  const discount = state.couponCode === "STUDIO10" ? Math.round(subtotal * 0.1) : 0;

  const value: Ctx = {
    ...state,
    hydrated,
    ordersLoading,
    ordersError,
    authConfigured: supabaseConfigured,
    authError,
    passwordRecovery,
    addToCart,
    updateQuantity,
    removeLine,
    clearCart,
    couponCode: state.couponCode,
    discount,
    applyCoupon,
    clearCoupon,
    toggleWishlist,
    isWishlisted: (id) => state.wishlist.includes(id),
    markViewed,
    signIn,
    signInWithGoogle,
    register,
    signOut,
    requestPasswordReset,
    updatePassword,
    addAddress,
    removeAddress,
    placeOrder,
    refreshOrders,
    cartCount: state.cart.reduce((n, l) => n + l.quantity, 0),
    subtotal,
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
