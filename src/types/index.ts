export type GenderCategory = 'Men' | 'Women' | 'Unisex';

export type CategorySlug =
  | 'luxury-perfumes'
  | 'long-lasting-perfumes'
  | 'oud-collection'
  | 'arabic-perfumes'
  | 'french-perfumes'
  | 'fresh-daily-wear'
  | 'attar-oil-perfumes'
  | 'gift-sets'
  | 'mini-travel-perfumes';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus = 'Pending' | 'Paid (Demo)' | 'Failed' | 'Refunded';

export type PaymentMethod =
  | 'Cash on Delivery'
  | 'JazzCash (Demo)'
  | 'EasyPaisa (Demo)'
  | 'Debit / Credit Card (Demo)'
  | 'Demo Online Payment'
  | 'Bank Transfer (Demo)';

export type DeliveryMethod = 'standard' | 'express';

export interface FragranceSizeOption {
  ml: string;
  pricePkr: number;
  originalPricePkr?: number;
  stock: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  city: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  approved: boolean;
  isSampleDemo: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: CategorySlug;
  secondaryCategories?: CategorySlug[];
  gender: GenderCategory;
  concentration: string;
  pricePkr: number;
  originalPricePkr?: number;
  description: string;
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  longevity: string;
  sillage: string;
  sizes: FragranceSizeOption[];
  images: string[];
  rating: number;
  reviewCount: number;
  featured?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  isSampleDemo: boolean;
}

export interface CategoryItem {
  id: string;
  slug: CategorySlug;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  visible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  sizeMl: string;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrderPkr: number;
  active: boolean;
  expiresAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  brand: string;
  sizeMl: string;
  quantity: number;
  unitPricePkr: number;
  image: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  items: OrderItemSnapshot[];
  subtotalPkr: number;
  discountPkr: number;
  couponCode?: string;
  deliveryMethod: DeliveryMethod;
  deliveryFeePkr: number;
  totalPkr: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNote: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  updatedAt?: string;
  isSampleDemo: boolean;
}

export interface CustomerAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  joinedAt: string;
  updatedAt?: string;
  isDemoAccount: boolean;
}

export interface InventoryRecord {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  category: string;
  sizeMl: string;
  stock: number;
  lowStockThreshold: number;
  updatedAt: string;
}

export interface AuthUserSession {
  id: string;
  email: string;
  fullName: string;
  role: 'customer' | 'admin';
  customer?: CustomerAccount;
}

export interface SalesAnalyticsSummary {
  ordersByMonth: { month: string; orders: number; revenuePkr: number }[];
  popularProducts: { productId: string; name: string; brand: string; unitsSold: number; revenuePkr: number }[];
  categoryDistribution: { category: string; ordersCount: number; unitsSold: number; revenuePkr: number }[];
  isDemoData: true;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  contactPhone: string;
  contactEmail: string;
  location: string;
  supportHours: string;
  standardDeliveryFeePkr: number;
  standardDeliveryEta: string;
  expressDeliveryFeePkr: number;
  expressDeliveryEta: string;
  freeDeliveryThresholdPkr: number;
  returnPolicySummary: string;
  storefrontNotice: string;
  showStorefrontNotice: boolean;
  updatedAt?: string;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
}
