import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { INITIAL_CATEGORIES } from '../data/categories';
import { INITIAL_PRODUCTS } from '../data/products';
import {
  DEFAULT_SITE_SETTINGS,
  INITIAL_COUPONS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
} from '../data/seedData';
import { apiRequest, saveSessionToken } from '../services/apiClient';
import { storageService } from '../services/storageService';
import type {
  AuthUserSession,
  CartItem,
  CategoryItem,
  ContactMessage,
  Coupon,
  CustomerAccount,
  DeliveryMethod,
  InventoryRecord,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Product,
  ProductReview,
  SalesAnalyticsSummary,
  SiteSettings,
} from '../types';
import { isCouponExpired } from '../utils/format';

export interface ToastNotice {
  id: string;
  message: string;
  tone: 'success' | 'info' | 'error';
}

interface PlaceOrderPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  notes?: string;
}

interface DemoCustomerOption {
  id: string;
  fullName: string;
  email: string;
}

interface StoreContextValue {
  products: Product[];
  categories: CategoryItem[];
  orders: Order[];
  coupons: Coupon[];
  reviews: ProductReview[];
  customers: CustomerAccount[];
  inventory: InventoryRecord[];
  analytics: SalesAnalyticsSummary | null;
  demoCustomerProfiles: DemoCustomerOption[];
  sampleOrderNumbers: string[];
  settings: SiteSettings;
  cart: CartItem[];
  wishlist: string[];
  recentlyViewedIds: string[];
  appliedCouponCode: string | null;
  currentCustomer: CustomerAccount | null;
  isAdminAuthenticated: boolean;
  adminEmail: string | null;
  isAuthReady: boolean;
  isCartDrawerOpen: boolean;
  toasts: ToastNotice[];
  contactMessages: ContactMessage[];

  setCartDrawerOpen: (open: boolean) => void;
  notify: (message: string, tone?: ToastNotice['tone']) => void;
  dismissToast: (id: string) => void;

  // Cart & Coupon
  addToCart: (productId: string, sizeMl: string, quantity?: number, openDrawer?: boolean) => void;
  updateCartQuantity: (productId: string, sizeMl: string, quantity: number) => void;
  removeFromCart: (productId: string, sizeMl: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ ok: boolean; message: string }>;
  removeCoupon: () => void;
  cartSubtotalPkr: number;
  cartDiscountPkr: number;
  cartItemCount: number;

  // Checkout & Orders
  placeDemoOrder: (payload: PlaceOrderPayload) => Promise<{ ok: boolean; order?: Order; error?: string }>;
  findOrderByNumber: (orderNumber: string) => Order | undefined;
  trackOrderByNumber: (orderNumber: string) => Promise<Order | null>;

  // Wishlist & Recently Viewed
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  recordRecentlyViewed: (productId: string) => void;

  // Reviews
  addProductReview: (
    review: Omit<ProductReview, 'id' | 'createdAt' | 'approved' | 'isSampleDemo'>
  ) => Promise<{ ok: boolean; message: string }>;

  // Customer Auth (strictly customer role)
  loginCustomer: (email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  loginDemoCustomer: (email: string) => Promise<{ ok: boolean; message: string }>;
  registerCustomer: (data: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    city: string;
    address: string;
  }) => Promise<{ ok: boolean; message: string }>;
  logoutCustomer: () => Promise<void>;

  // Newsletter & Contact
  subscribeNewsletter: (email: string) => Promise<{ ok: boolean; message: string }>;
  submitContactMessage: (msg: Omit<ContactMessage, 'id' | 'createdAt'>) => Promise<{ ok: boolean }>;

  // Admin Auth & CRUD (strictly role === 'admin' verified on backend)
  loginAdmin: (email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  logoutAdmin: () => Promise<void>;
  refreshAdminData: () => Promise<void>;
  uploadAdminImage: (dataUrl: string) => Promise<{ ok: boolean; url?: string; error?: string }>;
  addProduct: (product: Partial<Product>) => Promise<{ ok: boolean; error?: string }>;
  updateProduct: (product: Product) => Promise<{ ok: boolean; error?: string }>;
  deleteProduct: (productId: string) => Promise<{ ok: boolean; error?: string }>;
  updateProductPrice: (
    productId: string,
    newPricePkr: number,
    newOriginalPricePkr?: number
  ) => Promise<void>;
  updateProductSizeStock: (productId: string, sizeMl: string, stock: number) => Promise<void>;
  addCategory: (cat: Partial<CategoryItem>) => Promise<{ ok: boolean; error?: string }>;
  updateCategory: (cat: CategoryItem) => Promise<{ ok: boolean; error?: string }>;
  deleteCategory: (categoryId: string) => Promise<{ ok: boolean; error?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNote?: string) => Promise<void>;
  updateOrderPaymentStatus: (orderId: string, paymentStatus: PaymentStatus) => Promise<void>;
  fetchCustomerDetails: (
    customerId: string
  ) => Promise<{ customer: CustomerAccount; orders: Order[] } | null>;
  addCoupon: (coupon: Partial<Coupon>) => Promise<{ ok: boolean; error?: string }>;
  updateCoupon: (coupon: Coupon) => Promise<{ ok: boolean; error?: string }>;
  toggleCouponActive: (couponId: string) => Promise<void>;
  deleteCoupon: (couponId: string) => Promise<void>;
  toggleReviewApproval: (reviewId: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  updateSettings: (next: SiteSettings) => Promise<void>;
  resetDemoData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() =>
    INITIAL_PRODUCTS.map((p) => ({ ...p, active: true }))
  );
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [reviews, setReviews] = useState<ProductReview[]>(INITIAL_REVIEWS);
  const [customers, setCustomers] = useState<CustomerAccount[]>(INITIAL_CUSTOMERS);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [analytics, setAnalytics] = useState<SalesAnalyticsSummary | null>(null);
  const [demoCustomerProfiles, setDemoCustomerProfiles] = useState<DemoCustomerOption[]>(
    INITIAL_CUSTOMERS.map((c) => ({ id: c.id, fullName: c.fullName, email: c.email }))
  );
  const [sampleOrderNumbers, setSampleOrderNumbers] = useState<string[]>(
    INITIAL_ORDERS.map((o) => o.orderNumber)
  );
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);

  const [cart, setCart] = useState<CartItem[]>(() => storageService.read('cart', []));
  const [wishlist, setWishlist] = useState<string[]>(() =>
    storageService.read('wishlist', ['prod-02', 'prod-04'])
  );
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() =>
    storageService.read('recently_viewed', ['prod-01', 'prod-08', 'prod-21'])
  );
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(() =>
    storageService.read('applied_coupon', null)
  );

  const [currentCustomer, setCurrentCustomer] = useState<CustomerAccount | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [isCartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastNotice[]>([]);

  useEffect(() => storageService.write('cart', cart), [cart]);
  useEffect(() => storageService.write('wishlist', wishlist), [wishlist]);
  useEffect(() => storageService.write('recently_viewed', recentlyViewedIds), [recentlyViewedIds]);
  useEffect(() => storageService.write('applied_coupon', appliedCouponCode), [appliedCouponCode]);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const notify = useCallback((message: string, tone: ToastNotice['tone'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const loadStorefrontData = useCallback(async () => {
    const res = await apiRequest<{
      products: Product[];
      categories: CategoryItem[];
      reviews: ProductReview[];
      coupons: Coupon[];
      settings: SiteSettings;
      demoCustomerProfiles: DemoCustomerOption[];
      sampleOrderNumbers: string[];
    }>('/api/storefront');

    if (res.ok && res.data) {
      setProducts(res.data.products);
      setCategories(res.data.categories);
      setReviews(res.data.reviews);
      setCoupons(res.data.coupons);
      setSettings(res.data.settings);
      setDemoCustomerProfiles(res.data.demoCustomerProfiles);
      setSampleOrderNumbers(res.data.sampleOrderNumbers);
    }
  }, []);

  const refreshAdminData = useCallback(async () => {
    const res = await apiRequest<{
      products: Product[];
      categories: CategoryItem[];
      orders: Order[];
      coupons: Coupon[];
      reviews: ProductReview[];
      customers: CustomerAccount[];
      inventory: InventoryRecord[];
      settings: SiteSettings;
      contactMessages: ContactMessage[];
      analytics: SalesAnalyticsSummary;
    }>('/api/admin/bootstrap');

    if (res.ok && res.data) {
      setProducts(res.data.products);
      setCategories(res.data.categories);
      setOrders(res.data.orders);
      setCoupons(res.data.coupons);
      setReviews(res.data.reviews);
      setCustomers(res.data.customers);
      setInventory(res.data.inventory);
      setSettings(res.data.settings);
      setContactMessages(res.data.contactMessages);
      setAnalytics(res.data.analytics);
    }
  }, []);

  const loadCustomerOrders = useCallback(async () => {
    const res = await apiRequest<{ orders: Order[] }>('/api/customer/orders');
    if (res.ok && res.data) {
      setOrders(res.data.orders);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      await loadStorefrontData();
      const meRes = await apiRequest<{ user: AuthUserSession | null }>('/api/auth/me');
      if (!active) return;

      const user = meRes.data?.user;
      if (user?.role === 'admin') {
        setIsAdminAuthenticated(true);
        setAdminEmail(user.email);
        setCurrentCustomer(null);
        await refreshAdminData();
      } else if (user?.role === 'customer' && user.customer) {
        setCurrentCustomer(user.customer);
        setIsAdminAuthenticated(false);
        setAdminEmail(null);
        await loadCustomerOrders();
      } else {
        setCurrentCustomer(null);
        setIsAdminAuthenticated(false);
        setAdminEmail(null);
      }
      if (active) setIsAuthReady(true);
    })();
    return () => {
      active = false;
    };
  }, [loadStorefrontData, refreshAdminData, loadCustomerOrders]);

  const cartItemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartSubtotalPkr = useMemo(() => {
    return cart.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId && p.active !== false);
      if (!product) return sum;
      const sizeOpt = product.sizes.find((s) => s.ml === item.sizeMl) ?? product.sizes[0];
      const unitPrice = sizeOpt ? sizeOpt.pricePkr : product.pricePkr;
      return sum + unitPrice * item.quantity;
    }, 0);
  }, [cart, products]);

  const cartDiscountPkr = useMemo(() => {
    if (!appliedCouponCode) return 0;
    const coupon = coupons.find(
      (c) =>
        c.code.toUpperCase() === appliedCouponCode.toUpperCase() &&
        c.active &&
        !isCouponExpired(c.expiresAt)
    );
    if (!coupon || cartSubtotalPkr < coupon.minOrderPkr) return 0;
    if (coupon.type === 'percent') {
      return Math.round((cartSubtotalPkr * coupon.value) / 100);
    }
    return Math.min(coupon.value, cartSubtotalPkr);
  }, [appliedCouponCode, coupons, cartSubtotalPkr]);

  const addToCart = (
    productId: string,
    sizeMl: string,
    quantity = 1,
    openDrawer = true
  ) => {
    const product = products.find((p) => p.id === productId && p.active !== false);
    if (!product) return;
    const sizeObj = product.sizes.find((s) => s.ml === sizeMl) ?? product.sizes[0];
    if (!sizeObj || sizeObj.stock <= 0) {
      notify('Selected size is currently out of stock.', 'error');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId && i.sizeMl === sizeObj.ml);
      if (existing) {
        const nextQty = Math.min(sizeObj.stock, existing.quantity + quantity);
        return prev.map((i) =>
          i.productId === productId && i.sizeMl === sizeObj.ml ? { ...i, quantity: nextQty } : i
        );
      }
      return [
        ...prev,
        { productId, sizeMl: sizeObj.ml, quantity: Math.min(sizeObj.stock, quantity) },
      ];
    });

    notify(`Added ${product.name} (${sizeObj.ml}) to your bag.`, 'success');
    if (openDrawer) setCartDrawerOpen(true);
  };

  const updateCartQuantity = (productId: string, sizeMl: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, sizeMl);
      return;
    }
    const product = products.find((p) => p.id === productId);
    const maxStock = product?.sizes.find((s) => s.ml === sizeMl)?.stock ?? 20;
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId && item.sizeMl === sizeMl
          ? { ...item, quantity: Math.min(maxStock, quantity) }
          : item
      )
    );
  };

  const removeFromCart = (productId: string, sizeMl: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.productId === productId && item.sizeMl === sizeMl))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCouponCode(null);
  };

  const applyCoupon = async (code: string): Promise<{ ok: boolean; message: string }> => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      return { ok: false, message: 'Enter a coupon code to apply.' };
    }
    const res = await apiRequest<{ ok: boolean; code: string; discountPkr: number; message: string }>(
      '/api/coupons/validate',
      {
        method: 'POST',
        body: JSON.stringify({ code: normalized, items: cart }),
      }
    );
    if (!res.ok || !res.data?.ok) {
      return { ok: false, message: res.data?.message || res.error || 'Invalid coupon code.' };
    }
    setAppliedCouponCode(res.data.code);
    notify(`Coupon ${res.data.code} verified & applied.`, 'success');
    return { ok: true, message: res.data.message };
  };

  const removeCoupon = () => {
    setAppliedCouponCode(null);
  };

  const toggleWishlist = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        notify(`Removed ${product?.name ?? 'item'} from wishlist.`, 'info');
        return prev.filter((id) => id !== productId);
      }
      notify(`Saved ${product?.name ?? 'item'} to wishlist.`, 'success');
      return [...prev, productId];
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const recordRecentlyViewed = (productId: string) => {
    setRecentlyViewedIds((prev) => [productId, ...prev.filter((id) => id !== productId)].slice(0, 8));
  };

  const placeDemoOrder = async (
    payload: PlaceOrderPayload
  ): Promise<{ ok: boolean; order?: Order; error?: string }> => {
    if (cart.length === 0) {
      return { ok: false, error: 'Your shopping bag is empty.' };
    }

    // Never send client prices or totals — server computes authoritative pricing & stock
    const res = await apiRequest<{ order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone,
        shippingAddress: payload.shippingAddress,
        city: payload.city,
        postalCode: payload.postalCode,
        deliveryMethod: payload.deliveryMethod,
        paymentMethod: payload.paymentMethod,
        couponCode: appliedCouponCode ?? undefined,
        items: cart,
      }),
    });

    if (!res.ok || !res.data?.order) {
      return { ok: false, error: res.error ?? 'Could not place demo order.' };
    }

    const created = res.data.order;
    setOrders((prev) => [created, ...prev]);
    setSampleOrderNumbers((prev) => [created.orderNumber, ...prev]);
    clearCart();
    await loadStorefrontData();
    notify(`Demo Order ${created.orderNumber} recorded.`, 'success');
    return { ok: true, order: created };
  };

  const findOrderByNumber = (orderNumber: string) => {
    const clean = orderNumber.trim().toUpperCase();
    return orders.find((o) => o.orderNumber.toUpperCase() === clean);
  };

  const trackOrderByNumber = async (orderNumber: string): Promise<Order | null> => {
    const clean = orderNumber.trim().toUpperCase();
    if (!clean) return null;
    const res = await apiRequest<{ order: Order }>(`/api/orders/track/${encodeURIComponent(clean)}`);
    if (res.ok && res.data?.order) {
      return res.data.order;
    }
    return null;
  };

  const addProductReview = async (
    review: Omit<ProductReview, 'id' | 'createdAt' | 'approved' | 'isSampleDemo'>
  ): Promise<{ ok: boolean; message: string }> => {
    const res = await apiRequest<{ review: ProductReview; message: string }>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    });
    if (!res.ok) {
      notify(res.error ?? 'Could not submit review.', 'error');
      return { ok: false, message: res.error ?? 'Could not submit review.' };
    }
    notify(res.data?.message ?? 'Review submitted for admin approval.', 'success');
    return {
      ok: true,
      message: res.data?.message ?? 'Submitted for administrator review.',
    };
  };

  const loginCustomer = async (
    email: string,
    password: string
  ): Promise<{ ok: boolean; message: string }> => {
    const res = await apiRequest<{ token: string; user: AuthUserSession }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok || !res.data?.user?.customer) {
      return { ok: false, message: res.error ?? 'Invalid email or password.' };
    }
    saveSessionToken(res.data.token);
    setCurrentCustomer(res.data.user.customer);
    setIsAdminAuthenticated(false);
    setAdminEmail(null);
    await loadCustomerOrders();
    notify(`Signed in as ${res.data.user.customer.fullName}`, 'success');
    return { ok: true, message: 'Signed in successfully.' };
  };

  const loginDemoCustomer = async (email: string): Promise<{ ok: boolean; message: string }> => {
    const res = await apiRequest<{ token: string; user: AuthUserSession }>(
      '/api/auth/demo-customer',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    );
    if (!res.ok || !res.data?.user?.customer) {
      return { ok: false, message: res.error ?? 'Demo customer sign-in failed.' };
    }
    saveSessionToken(res.data.token);
    setCurrentCustomer(res.data.user.customer);
    setIsAdminAuthenticated(false);
    setAdminEmail(null);
    await loadCustomerOrders();
    notify(`Signed in as ${res.data.user.customer.fullName}`, 'success');
    return { ok: true, message: 'Signed in successfully.' };
  };

  const registerCustomer = async (data: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    city: string;
    address: string;
  }): Promise<{ ok: boolean; message: string }> => {
    const res = await apiRequest<{ token: string; user: AuthUserSession }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok || !res.data?.user?.customer) {
      return { ok: false, message: res.error ?? 'Registration failed.' };
    }
    saveSessionToken(res.data.token);
    setCurrentCustomer(res.data.user.customer);
    setIsAdminAuthenticated(false);
    setAdminEmail(null);
    await loadCustomerOrders();
    notify(`Welcome to Velora Fragrances, ${res.data.user.customer.fullName}.`, 'success');
    return { ok: true, message: 'Account created.' };
  };

  const logoutCustomer = async () => {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    saveSessionToken(null);
    setCurrentCustomer(null);
    setOrders(INITIAL_ORDERS);
    notify('Signed out of customer account.', 'info');
  };

  const subscribeNewsletter = async (
    email: string
  ): Promise<{ ok: boolean; message: string }> => {
    const res = await apiRequest<{ ok: boolean; message: string }>('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      return { ok: false, message: res.error ?? 'Subscription failed.' };
    }
    return {
      ok: true,
      message: res.data?.message ?? 'Subscribed to Velora Atelier dispatches (Demo).',
    };
  };

  const submitContactMessage = async (
    msg: Omit<ContactMessage, 'id' | 'createdAt'>
  ): Promise<{ ok: boolean }> => {
    const res = await apiRequest<{ ok: boolean; entry: ContactMessage }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(msg),
    });
    if (!res.ok) {
      notify(res.error ?? 'Failed to record message.', 'error');
      return { ok: false };
    }
    if (res.data?.entry) {
      setContactMessages((prev) => [res.data!.entry, ...prev]);
    }
    notify('Message recorded in demo inbox. Our Lahore desk responds Mon–Sat.', 'success');
    return { ok: true };
  };

  // --- ADMIN AUTH & CRUD (Role-Protected Server Endpoints) ---
  const loginAdmin = async (
    email: string,
    password: string
  ): Promise<{ ok: boolean; message: string }> => {
    const res = await apiRequest<{ token: string; user: AuthUserSession }>(
      '/api/auth/admin/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    if (!res.ok || !res.data?.user || res.data.user.role !== 'admin') {
      return { ok: false, message: res.error ?? 'Invalid administrator credentials.' };
    }
    saveSessionToken(res.data.token);
    setCurrentCustomer(null);
    setIsAdminAuthenticated(true);
    setAdminEmail(res.data.user.email);
    await refreshAdminData();
    notify('Administrator session authenticated.', 'success');
    return { ok: true, message: 'Authenticated' };
  };

  const logoutAdmin = async () => {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    saveSessionToken(null);
    setIsAdminAuthenticated(false);
    setAdminEmail(null);
    setAnalytics(null);
    setInventory([]);
    await loadStorefrontData();
    notify('Signed out of Admin Portal.', 'info');
  };

  const uploadAdminImage = async (
    dataUrl: string
  ): Promise<{ ok: boolean; url?: string; error?: string }> => {
    const res = await apiRequest<{ url: string }>('/api/admin/upload', {
      method: 'POST',
      body: JSON.stringify({ dataUrl }),
    });
    if (!res.ok || !res.data?.url) {
      return { ok: false, error: res.error ?? 'Image upload failed.' };
    }
    return { ok: true, url: res.data.url };
  };

  const addProduct = async (
    product: Partial<Product>
  ): Promise<{ ok: boolean; error?: string }> => {
    const res = await apiRequest<{ product: Product; inventory: InventoryRecord[] }>(
      '/api/admin/products',
      {
        method: 'POST',
        body: JSON.stringify(product),
      }
    );
    if (!res.ok || !res.data?.product) {
      notify(res.error ?? 'Failed to add product.', 'error');
      return { ok: false, error: res.error };
    }
    setProducts((prev) => [res.data!.product, ...prev]);
    setInventory(res.data.inventory);
    notify(`Product "${res.data.product.name}" added to catalog.`, 'success');
    return { ok: true };
  };

  const updateProduct = async (product: Product): Promise<{ ok: boolean; error?: string }> => {
    const res = await apiRequest<{ product: Product; inventory: InventoryRecord[] }>(
      `/api/admin/products/${product.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(product),
      }
    );
    if (!res.ok || !res.data?.product) {
      notify(res.error ?? 'Failed to update product.', 'error');
      return { ok: false, error: res.error };
    }
    setProducts((prev) => prev.map((p) => (p.id === product.id ? res.data!.product : p)));
    setInventory(res.data.inventory);
    notify(`Updated "${res.data.product.name}".`, 'success');
    return { ok: true };
  };

  const deleteProduct = async (productId: string): Promise<{ ok: boolean; error?: string }> => {
    const res = await apiRequest<{ ok: boolean; inventory: InventoryRecord[] }>(
      `/api/admin/products/${productId}`,
      { method: 'DELETE' }
    );
    if (!res.ok) {
      notify(res.error ?? 'Failed to delete product.', 'error');
      return { ok: false, error: res.error };
    }
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (res.data?.inventory) setInventory(res.data.inventory);
    notify('Product removed from catalog.', 'info');
    return { ok: true };
  };

  const updateProductPrice = async (
    productId: string,
    newPricePkr: number,
    newOriginalPricePkr?: number
  ) => {
    const res = await apiRequest<{ product: Product }>(
      `/api/admin/products/${productId}/price`,
      {
        method: 'PATCH',
        body: JSON.stringify({ pricePkr: newPricePkr, originalPricePkr: newOriginalPricePkr ?? null }),
      }
    );
    if (res.ok && res.data?.product) {
      setProducts((prev) => prev.map((p) => (p.id === productId ? res.data!.product : p)));
    }
  };

  const updateProductSizeStock = async (productId: string, sizeMl: string, stock: number) => {
    const res = await apiRequest<{ product: Product; inventory: InventoryRecord[] }>(
      '/api/admin/inventory',
      {
        method: 'PATCH',
        body: JSON.stringify({ productId, sizeMl, stock }),
      }
    );
    if (res.ok && res.data?.product) {
      setProducts((prev) => prev.map((p) => (p.id === productId ? res.data!.product : p)));
      setInventory(res.data.inventory);
    }
  };

  const addCategory = async (
    cat: Partial<CategoryItem>
  ): Promise<{ ok: boolean; error?: string }> => {
    const res = await apiRequest<{ category: CategoryItem }>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(cat),
    });
    if (!res.ok || !res.data?.category) {
      notify(res.error ?? 'Failed to create category.', 'error');
      return { ok: false, error: res.error };
    }
    setCategories((prev) => [...prev, res.data!.category]);
    notify(`Category "${res.data.category.name}" created.`, 'success');
    return { ok: true };
  };

  const updateCategory = async (cat: CategoryItem): Promise<{ ok: boolean; error?: string }> => {
    const res = await apiRequest<{ category: CategoryItem }>(`/api/admin/categories/${cat.id}`, {
      method: 'PATCH',
      body: JSON.stringify(cat),
    });
    if (!res.ok || !res.data?.category) {
      notify(res.error ?? 'Failed to update category.', 'error');
      return { ok: false, error: res.error };
    }
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? res.data!.category : c)));
    await refreshAdminData();
    notify(`Category "${res.data.category.name}" updated.`, 'success');
    return { ok: true };
  };

  const deleteCategory = async (categoryId: string): Promise<{ ok: boolean; error?: string }> => {
    const res = await apiRequest<{ ok: boolean }>(`/api/admin/categories/${categoryId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      notify(res.error ?? 'Could not delete category.', 'error');
      return { ok: false, error: res.error };
    }
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    notify('Category deleted.', 'info');
    return { ok: true };
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    trackingNote?: string
  ) => {
    const res = await apiRequest<{
      order: Order;
      analytics: SalesAnalyticsSummary;
      inventory: InventoryRecord[];
    }>(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, trackingNote }),
    });
    if (res.ok && res.data?.order) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data!.order : o)));
      setAnalytics(res.data.analytics);
      setInventory(res.data.inventory);
      await refreshAdminData();
      notify(`Order updated to ${status}.`, 'success');
    } else {
      notify(res.error ?? 'Failed to update order status.', 'error');
    }
  };

  const updateOrderPaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    const res = await apiRequest<{ order: Order }>(`/api/admin/orders/${orderId}/payment`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus }),
    });
    if (res.ok && res.data?.order) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data!.order : o)));
      notify(`Payment status updated to ${paymentStatus}.`, 'success');
    } else {
      notify(res.error ?? 'Failed to update payment status.', 'error');
    }
  };

  const fetchCustomerDetails = async (
    customerId: string
  ): Promise<{ customer: CustomerAccount; orders: Order[] } | null> => {
    const res = await apiRequest<{ customer: CustomerAccount; orders: Order[] }>(
      `/api/admin/customers/${customerId}`
    );
    if (res.ok && res.data) {
      return res.data;
    }
    return null;
  };

  const addCoupon = async (coupon: Partial<Coupon>): Promise<{ ok: boolean; error?: string }> => {
    const res = await apiRequest<{ coupon: Coupon }>('/api/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(coupon),
    });
    if (!res.ok || !res.data?.coupon) {
      notify(res.error ?? 'Failed to create coupon.', 'error');
      return { ok: false, error: res.error };
    }
    setCoupons((prev) => [res.data!.coupon, ...prev]);
    notify(`Coupon ${res.data.coupon.code} created.`, 'success');
    return { ok: true };
  };

  const updateCoupon = async (coupon: Coupon): Promise<{ ok: boolean; error?: string }> => {
    const res = await apiRequest<{ coupon: Coupon }>(`/api/admin/coupons/${coupon.id}`, {
      method: 'PATCH',
      body: JSON.stringify(coupon),
    });
    if (!res.ok || !res.data?.coupon) {
      notify(res.error ?? 'Failed to update coupon.', 'error');
      return { ok: false, error: res.error };
    }
    setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? res.data!.coupon : c)));
    notify(`Coupon ${res.data.coupon.code} updated.`, 'success');
    return { ok: true };
  };

  const toggleCouponActive = async (couponId: string) => {
    const current = coupons.find((c) => c.id === couponId);
    if (!current) return;
    const res = await apiRequest<{ coupon: Coupon }>(`/api/admin/coupons/${couponId}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: !current.active }),
    });
    if (res.ok && res.data?.coupon) {
      setCoupons((prev) => prev.map((c) => (c.id === couponId ? res.data!.coupon : c)));
      notify(
        `Coupon ${res.data.coupon.code} ${res.data.coupon.active ? 'enabled' : 'disabled'}.`,
        'info'
      );
    }
  };

  const deleteCoupon = async (couponId: string) => {
    const res = await apiRequest<{ ok: boolean }>(`/api/admin/coupons/${couponId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setCoupons((prev) => prev.filter((c) => c.id !== couponId));
      notify('Coupon deleted.', 'info');
    }
  };

  const toggleReviewApproval = async (reviewId: string) => {
    const current = reviews.find((r) => r.id === reviewId);
    if (!current) return;
    const res = await apiRequest<{ review: ProductReview }>(`/api/admin/reviews/${reviewId}`, {
      method: 'PATCH',
      body: JSON.stringify({ approved: !current.approved }),
    });
    if (res.ok && res.data?.review) {
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? res.data!.review : r)));
      notify(
        res.data.review.approved ? 'Review approved for storefront.' : 'Review hidden/rejected.',
        'info'
      );
    }
  };

  const deleteReview = async (reviewId: string) => {
    const res = await apiRequest<{ ok: boolean }>(`/api/admin/reviews/${reviewId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      notify('Review removed permanently.', 'info');
    }
  };

  const updateSettings = async (next: SiteSettings) => {
    const res = await apiRequest<{ settings: SiteSettings }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(next),
    });
    if (res.ok && res.data?.settings) {
      setSettings(res.data.settings);
      notify('Website settings saved.', 'success');
    } else {
      notify(res.error ?? 'Failed to save settings.', 'error');
    }
  };

  const resetDemoData = async () => {
    const res = await apiRequest<{
      products: Product[];
      categories: CategoryItem[];
      orders: Order[];
      coupons: Coupon[];
      reviews: ProductReview[];
      customers: CustomerAccount[];
      inventory: InventoryRecord[];
      settings: SiteSettings;
      analytics: SalesAnalyticsSummary;
    }>('/api/admin/reset-demo', { method: 'POST' });

    if (res.ok && res.data) {
      setProducts(res.data.products);
      setCategories(res.data.categories);
      setOrders(res.data.orders);
      setCoupons(res.data.coupons);
      setReviews(res.data.reviews);
      setCustomers(res.data.customers);
      setInventory(res.data.inventory);
      setSettings(res.data.settings);
      setAnalytics(res.data.analytics);
      notify('Demo catalog and orders restored to initial portfolio defaults.', 'info');
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        orders,
        coupons,
        reviews,
        customers,
        inventory,
        analytics,
        demoCustomerProfiles,
        sampleOrderNumbers,
        settings,
        cart,
        wishlist,
        recentlyViewedIds,
        appliedCouponCode,
        currentCustomer,
        isAdminAuthenticated,
        adminEmail,
        isAuthReady,
        isCartDrawerOpen,
        toasts,
        contactMessages,
        setCartDrawerOpen,
        notify,
        dismissToast,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        cartSubtotalPkr,
        cartDiscountPkr,
        cartItemCount,
        toggleWishlist,
        isWishlisted,
        recordRecentlyViewed,
        placeDemoOrder,
        findOrderByNumber,
        trackOrderByNumber,
        addProductReview,
        loginCustomer,
        loginDemoCustomer,
        registerCustomer,
        logoutCustomer,
        subscribeNewsletter,
        submitContactMessage,
        loginAdmin,
        logoutAdmin,
        refreshAdminData,
        uploadAdminImage,
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductPrice,
        updateProductSizeStock,
        addCategory,
        updateCategory,
        deleteCategory,
        updateOrderStatus,
        updateOrderPaymentStatus,
        fetchCustomerDetails,
        addCoupon,
        updateCoupon,
        toggleCouponActive,
        deleteCoupon,
        toggleReviewApproval,
        deleteReview,
        updateSettings,
        resetDemoData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
