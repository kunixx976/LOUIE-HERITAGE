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
import {
  getProductVariant,
  mergeLiveCatalog,
  products,
  type LiveProductRecord,
  type LiveVariantRecord,
  type Product,
} from "./data";
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
  line2?: string;
  city: string;
  state?: string;
  postcode: string;
  country: string;
  phone?: string;
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

type CustomerShopDataRow = {
  cart: unknown;
  wishlist: unknown;
  addresses: unknown;
  coupon_code: string | null;
};

const STORAGE_KEY = "louie-heritage-state";

function getAuthRedirectUrl(path: "/profile" | "/forgot-password") {
  const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
  return new URL(path, siteUrl).toString();
}

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

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line["productId"] === "string" &&
    typeof line["size"] === "string" &&
    typeof line["color"] === "string" &&
    Number.isInteger(line["quantity"]) &&
    Number(line["quantity"]) > 0 &&
    Number(line["quantity"]) <= 10
  );
}

function isAddress(value: unknown): value is Address {
  if (!value || typeof value !== "object") return false;
  const address = value as Record<string, unknown>;
  return (
    typeof address["id"] === "string" &&
    typeof address["label"] === "string" &&
    typeof address["name"] === "string" &&
    typeof address["line1"] === "string" &&
    typeof address["city"] === "string" &&
    typeof address["postcode"] === "string" &&
    typeof address["country"] === "string" &&
    (address["line2"] === undefined || typeof address["line2"] === "string") &&
    (address["state"] === undefined || typeof address["state"] === "string") &&
    (address["phone"] === undefined || typeof address["phone"] === "string") &&
    (address["isDefault"] === undefined || typeof address["isDefault"] === "boolean")
  );
}

type Ctx = State & {
  hydrated: boolean;
  ordersLoading: boolean;
  ordersError: string | null;
  authConfigured: boolean;
  authError: string | null;
  customerDataLoading: boolean;
  customerDataError: string | null;
  retryCustomerData: () => Promise<void>;
  catalogProducts: Product[];
  catalogError: string | null;
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
  placeOrder: (total: number) => string;
  cartCount: number;
  subtotal: number;
  cartProducts: { line: CartLine; product: Product }[];
};

const ShopContext = createContext<Ctx | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const stateRef = useRef(state);
  const [catalogProducts, setCatalogProducts] = useState(products);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(Boolean(supabase));
  const [hydrated, setHydrated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [customerDataOwner, setCustomerDataOwner] = useState<string | null>(null);
  const [customerDataLoading, setCustomerDataLoading] = useState(false);
  const [customerDataError, setCustomerDataError] = useState<string | null>(null);
  const [customerDataRetry, setCustomerDataRetry] = useState(0);
  const orderRequestId = useRef(0);
  const customerSaveQueue = useRef(Promise.resolve());

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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
          addresses: [],
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
        ...(event === "SIGNED_OUT"
          ? { cart: [], couponCode: null, wishlist: [], addresses: [] }
          : {}),
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
    if (!supabase) return;
    let active = true;

    async function loadCatalog() {
      try {
        const [productResult, variantResult] = await Promise.all([
          supabase!
            .from("products")
            .select("id,slug,name,price,active")
            .order("id"),
          supabase!
            .from("product_variants")
            .select("id,product_id,sku,size,color,color_hex,stock_count")
            .order("product_id"),
        ]);
        if (productResult.error) throw productResult.error;
        if (variantResult.error) throw variantResult.error;

        const liveProducts = mergeLiveCatalog(
          productResult.data as LiveProductRecord[],
          variantResult.data as LiveVariantRecord[],
        );
        if (liveProducts.length !== productResult.data.length) {
          throw new Error("The live catalog contains products without storefront details.");
        }
        if (active) {
          setCatalogProducts(liveProducts);
          setCatalogError(null);
        }
      } catch (error) {
        console.error("Unable to load the live product catalog.", error);
        if (active) {
          setCatalogError(
            error instanceof Error ? error.message : "Unable to load the live product catalog.",
          );
        }
      } finally {
        if (active) setCatalogLoading(false);
      }
    }

    void loadCatalog();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const userId = state.user?.id;
    if (!userId || !supabase) {
      setCustomerDataOwner(null);
      setCustomerDataLoading(false);
      setCustomerDataError(null);
      return;
    }
    const customerId = userId;

    let active = true;
    setCustomerDataOwner(null);
    setCustomerDataLoading(true);
    setCustomerDataError(null);

    async function loadCustomerData() {
      try {
        const client = supabase!;
        const { data, error } = await client
          .from("customer_shop_data")
          .select("cart,wishlist,addresses,coupon_code")
          .eq("user_id", customerId)
          .maybeSingle();
        if (error) throw error;

        if (data) {
          const saved = data as CustomerShopDataRow;
          if (active) {
            setState((current) =>
              current.user?.id === customerId
                ? {
                    ...current,
                    cart: Array.isArray(saved.cart) ? saved.cart.filter(isCartLine) : [],
                    wishlist: Array.isArray(saved.wishlist)
                      ? saved.wishlist.filter((id): id is string => typeof id === "string")
                      : [],
                    addresses: Array.isArray(saved.addresses)
                      ? saved.addresses.filter(isAddress)
                      : [],
                    couponCode: saved.coupon_code === "STUDIO10" ? "STUDIO10" : null,
                  }
                : current,
            );
          }
        } else {
          const current = stateRef.current;
          const { error: saveError } = await client.from("customer_shop_data").upsert(
            {
              user_id: customerId,
              cart: current.cart,
              wishlist: current.wishlist,
              addresses: current.addresses,
              coupon_code: current.couponCode,
            },
            { onConflict: "user_id" },
          );
          if (saveError) throw saveError;
        }

        if (active) {
          setCustomerDataOwner(customerId);
          setCustomerDataError(null);
        }
      } catch (error) {
        console.error("Unable to load or save customer shopping data.", error);
        if (active) {
          setCustomerDataError(
            error instanceof Error ? error.message : "Unable to sync your saved shopping data.",
          );
        }
      } finally {
        if (active) setCustomerDataLoading(false);
      }
    }

    void loadCustomerData();
    return () => {
      active = false;
    };
  }, [customerDataRetry, hydrated, state.user?.id]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...state,
          cart: state.user ? [] : state.cart,
          wishlist: state.user ? [] : state.wishlist,
          addresses: [],
          user: null,
          orders: [],
        }),
      );
    } catch (error) {
      console.error("Unable to save the shopping state.", error);
    }
  }, [state, hydrated]);

  useEffect(() => {
    const userId = state.user?.id;
    if (!userId || customerDataOwner !== userId || !supabase) return;
    const snapshot = {
      user_id: userId,
      cart: state.cart,
      wishlist: state.wishlist,
      addresses: state.addresses,
      coupon_code: state.couponCode,
      updated_at: new Date().toISOString(),
    };
    const timer = window.setTimeout(() => {
      customerSaveQueue.current = customerSaveQueue.current
        .then(async () => {
          const { error } = await supabase!.from("customer_shop_data").upsert(snapshot, {
            onConflict: "user_id",
          });
          if (error) throw error;
          if (stateRef.current.user?.id === userId) setCustomerDataError(null);
        })
        .catch((error: unknown) => {
          console.error("Unable to save customer shopping data.", error);
          if (stateRef.current.user?.id === userId) {
            setCustomerDataError(
              error instanceof Error ? error.message : "Unable to save your shopping data.",
            );
          }
        });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [customerDataOwner, state.addresses, state.cart, state.couponCode, state.user?.id, state.wishlist]);

  const requireSupabase = useCallback(() => {
    if (!supabase) throw new Error(authConfigurationMessage);
    return supabase;
  }, []);

  const retryCustomerData = useCallback(async () => {
    const userId = state.user?.id;
    if (!userId || !supabase) return;
    if (customerDataOwner !== userId) {
      setCustomerDataRetry((attempt) => attempt + 1);
      return;
    }

    setCustomerDataLoading(true);
    setCustomerDataError(null);
    try {
      const current = stateRef.current;
      const { error } = await supabase.from("customer_shop_data").upsert(
        {
          user_id: userId,
          cart: current.cart,
          wishlist: current.wishlist,
          addresses: current.addresses,
          coupon_code: current.couponCode,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
      if (error) throw error;
    } catch (error) {
      console.error("Unable to retry customer shopping data sync.", error);
      if (stateRef.current.user?.id === userId) {
        setCustomerDataError(
          error instanceof Error ? error.message : "Unable to sync your saved shopping data.",
        );
      }
    } finally {
      if (stateRef.current.user?.id === userId) setCustomerDataLoading(false);
    }
  }, [customerDataOwner, state.user?.id]);

  const addToCart = useCallback((line: CartLine) => {
    setState((s) => {
      const product = catalogProducts.find((item) => item.id === line.productId);
      const variant = product ? getProductVariant(product, line.size, line.color) : null;
      if (!variant || variant.stockCount <= 0 || line.quantity <= 0) return s;

      const idx = s.cart.findIndex(
        (l) => l.productId === line.productId && l.size === line.size && l.color === line.color,
      );
      const cart = [...s.cart];
      const currentQuantity = idx > -1 ? cart[idx]!.quantity : 0;
      const quantity = Math.min(variant.stockCount, 10, currentQuantity + Math.floor(line.quantity));
      if (idx > -1) cart[idx] = { ...cart[idx]!, quantity };
      else cart.push({ ...line, quantity });
      return { ...s, cart };
    });
  }, [catalogProducts]);

  const updateQuantity = useCallback((index: number, quantity: number) => {
    setState((s) => {
      if (!s.cart[index]) return s;
      const cart = [...s.cart];
      const line = cart[index]!;
      const product = catalogProducts.find((item) => item.id === line.productId);
      const variant = product ? getProductVariant(product, line.size, line.color) : null;
      if (quantity <= 0 || !variant || variant.stockCount <= 0) cart.splice(index, 1);
      else cart[index] = { ...line, quantity: Math.min(Math.floor(quantity), variant.stockCount, 10) };
      return { ...s, cart };
    });
  }, [catalogProducts]);

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
        redirectTo: getAuthRedirectUrl("/profile"),
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
          emailRedirectTo: getAuthRedirectUrl("/profile"),
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
    setState((current) => ({
      ...current,
      cart: [],
      couponCode: null,
      wishlist: [],
      addresses: [],
      user: null,
    }));
  }, [requireSupabase]);

  const requestPasswordReset = useCallback(
    async (email: string) => {
      const client = requireSupabase();
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: getAuthRedirectUrl("/forgot-password"),
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
    setState((s) => {
      const isDefault = address.isDefault || s.addresses.length === 0;
      const addresses = s.addresses.map((savedAddress) =>
        isDefault ? { ...savedAddress, isDefault: false } : savedAddress,
      );
      return { ...s, addresses: [...addresses, { ...address, isDefault }] };
    });
  }, []);

  const removeAddress = useCallback((id: string) => {
    setState((s) => {
      const addresses = s.addresses.filter((address) => address.id !== id);
      if (s.addresses.find((address) => address.id === id)?.isDefault && addresses[0]) {
        addresses[0] = { ...addresses[0], isDefault: true };
      }
      return { ...s, addresses };
    });
  }, []);

  const placeOrder = useCallback((total: number) => {
    const id = `AN-${Math.floor(20000 + Math.random() * 9000)}`;
    setState((s) => {
      const items = s.cart.map((line) => {
        const product = catalogProducts.find((p) => p.id === line.productId)!;
        return {
          name: product.name,
          quantity: line.quantity,
          price: product.price,
          image: product.images[0]!,
          size: line.size,
          color: line.color,
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
            paymentMethod: "cod",
            paymentStatus: "cod_due",
            trackingCarrier: null,
            trackingNumber: null,
            trackingUrl: null,
            items,
          },
          ...s.orders,
        ],
      };
    });
    return id;
  }, [catalogProducts]);

  const cartProducts = useMemo(
    () =>
      state.cart
        .map((line) => ({
          line,
          product: catalogProducts.find((p) => p.id === line.productId)!,
        }))
        .filter((entry) => Boolean(entry.product)),
    [state.cart, catalogProducts],
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
    customerDataLoading:
      customerDataLoading ||
      Boolean(state.user && customerDataOwner !== state.user.id && !customerDataError),
    customerDataError,
    retryCustomerData,
    catalogProducts,
    catalogError: catalogLoading ? null : catalogError,
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
