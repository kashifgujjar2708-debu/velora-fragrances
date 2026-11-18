import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  DollarSign,
  Eye,
  FolderTree,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  MessageSquareQuote,
  PackagePlus,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  Trash2,
  Truck,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { AdminAnalyticsPanel } from '../../components/admin/AdminAnalyticsPanel';
import { CustomerDetailsDrawer, OrderDetailsDrawer } from '../../components/admin/AdminDrawers';
import { VeloraLogo } from '../../components/brand/VeloraBrandMarks';
import { SafeImage } from '../../components/common/SafeImage';
import { useStore } from '../../context/StoreContext';
import { PRODUCT_IMAGES } from '../../data/categories';
import {
  DATABASE_COLLECTIONS,
  INTEGRATION_READINESS,
  REFERENCE_FIRESTORE_RULES,
  REFERENCE_STORAGE_RULES,
} from '../../services/firebaseConfig';
import type {
  CategoryItem,
  CategorySlug,
  Coupon,
  CustomerAccount,
  FragranceSizeOption,
  GenderCategory,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
} from '../../types';
import {
  formatDateShort,
  formatPkr,
  getProductTotalStock,
  isCouponExpired,
  maskEmail,
  maskPhone,
  slugify,
} from '../../utils/format';

type AdminTab =
  | 'overview'
  | 'orders'
  | 'products'
  | 'categories'
  | 'prices'
  | 'stock'
  | 'customers'
  | 'payments'
  | 'coupons'
  | 'reviews'
  | 'reports'
  | 'order-status'
  | 'settings';

const ADMIN_MENU: {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'overview', label: '1. Dashboard Overview', icon: LayoutDashboard },
  { id: 'orders', label: '2. View & Manage Orders', icon: ClipboardList },
  { id: 'products', label: '3. Manage Products', icon: PackagePlus },
  { id: 'categories', label: '4. Manage Categories', icon: FolderTree },
  { id: 'prices', label: '5. Product Pricing', icon: DollarSign },
  { id: 'stock', label: '6. Inventory & Stock', icon: Boxes },
  { id: 'customers', label: '7. Customer Management', icon: Users },
  { id: 'payments', label: '8. Payment Status', icon: CreditCard },
  { id: 'coupons', label: '9. Coupon Management', icon: Ticket },
  { id: 'reviews', label: '10. Review Moderation', icon: MessageSquareQuote },
  { id: 'reports', label: '11. Sales Analytics', icon: BarChart3 },
  { id: 'order-status', label: '12. Update Order Status', icon: Truck },
  { id: 'settings', label: '13. Settings & Security', icon: Settings },
];

const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const PAYMENT_STATUSES: PaymentStatus[] = ['Pending', 'Paid (Demo)', 'Failed', 'Refunded'];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

export const AdminDashboardPage: React.FC = () => {
  const {
    isAdminAuthenticated,
    isAuthReady,
    adminEmail: authenticatedAdminEmail,
    currentCustomer,
    loginAdmin,
    logoutAdmin,
    products,
    categories,
    orders,
    coupons,
    reviews,
    customers,
    inventory,
    analytics,
    settings,
    notify,
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
  } = useStore();

  // Login Gate State (never hardcoded password)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Navigation & Mobile Drawer
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Orders Filters & Drawer
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [confirmCancelOrderId, setConfirmCancelOrderId] = useState<string | null>(null);

  // Product Form Modal/Drawer State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('Velora Atelier');
  const [prodCategorySlug, setProdCategorySlug] = useState<CategorySlug>('luxury-perfumes');
  const [prodGender, setProdGender] = useState<GenderCategory>('Unisex');
  const [prodPrice, setProdPrice] = useState('12500');
  const [prodOrigPrice, setProdOrigPrice] = useState('');
  const [prodConc, setProdConc] = useState('Eau de Parfum');
  const [prodDesc, setProdDesc] = useState('');
  const [prodActive, setProdActive] = useState(true);
  const [prodImageUrl, setProdImageUrl] = useState<string>(PRODUCT_IMAGES.frenchAmber);
  const [prodSizes, setProdSizes] = useState<FragranceSizeOption[]>([
    { ml: '100ml', pricePkr: 12500, stock: 15 },
  ]);
  const [prodUploading, setProdUploading] = useState(false);

  // Category Form State (Add + Edit)
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [catName, setCatName] = useState('');
  const [catSubtitle, setCatSubtitle] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catImageUrl, setCatImageUrl] = useState<string>(PRODUCT_IMAGES.frenchAmber);
  const [catVisible, setCatVisible] = useState(true);
  const [catUploading, setCatUploading] = useState(false);

  // Inventory Filters
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'low' | 'out'>('all');

  // Customer Search & Drawer
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<{
    customer: CustomerAccount;
    orders: Order[];
  } | null>(null);

  // Coupon Form State (Create + Edit)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDesc, setCouponDesc] = useState('');
  const [couponType, setCouponType] = useState<'percent' | 'fixed'>('percent');
  const [couponValue, setCouponValue] = useState('15');
  const [couponMin, setCouponMin] = useState('5000');
  const [couponExpiry, setCouponExpiry] = useState('2027-12-31');

  // Review Filter
  const [reviewFilter, setReviewFilter] = useState<'all' | 'sample' | 'visitor' | 'pending'>('all');

  // Settings Draft & Rules Preview
  const [settingsDraft, setSettingsDraft] = useState(settings);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Order Status Note Drafts
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    setSettingsDraft(settings);
  }, [settings]);

  // Metrics
  const totalDemoRevenue = useMemo(
    () => orders.reduce((sum, o) => (o.orderStatus !== 'Cancelled' ? sum + o.totalPkr : sum), 0),
    [orders]
  );

  const pendingOrdersCount = useMemo(
    () =>
      orders.filter((o) =>
        ['Pending', 'Confirmed', 'Preparing'].includes(o.orderStatus)
      ).length,
    [orders]
  );

  const activeProductsCount = useMemo(
    () => products.filter((p) => p.active !== false).length,
    [products]
  );

  const lowStockProducts = useMemo(
    () => products.filter((p) => getProductTotalStock(p) <= 10),
    [products]
  );

  const outOfStockProductsCount = useMemo(
    () => products.filter((p) => getProductTotalStock(p) <= 0).length,
    [products]
  );

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((o) => {
      if (orderStatusFilter !== 'all' && o.orderStatus !== orderStatusFilter) return false;
      if (!q) return true;
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q)
      );
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const filteredInventoryProducts = useMemo(() => {
    const q = inventorySearch.trim().toLowerCase();
    return products.filter((p) => {
      const total = getProductTotalStock(p);
      const hasOutSize = p.sizes.some((s) => s.stock <= 0);
      const hasLowSize = p.sizes.some((s) => s.stock > 0 && s.stock <= 10);

      if (inventoryFilter === 'out' && total > 0 && !hasOutSize) return false;
      if (inventoryFilter === 'low' && total > 10 && !hasLowSize) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sizes.some((s) => s.ml.toLowerCase().includes(q))
      );
    });
  }, [products, inventorySearch, inventoryFilter]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [customers, customerSearch]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (reviewFilter === 'sample') return r.isSampleDemo;
      if (reviewFilter === 'visitor') return !r.isSampleDemo;
      if (reviewFilter === 'pending') return !r.approved;
      return true;
    });
  }, [reviews, reviewFilter]);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  );

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);
    const res = await loginAdmin(loginEmail, loginPassword);
    setAuthSubmitting(false);
    if (!res.ok) {
      setAuthError(res.message);
    } else {
      setLoginPassword('');
    }
  };

  // --- Product Form Handlers ---
  const openNewProductForm = () => {
    setEditingProduct(null);
    setProdName('');
    setProdBrand('Velora Atelier');
    setProdCategorySlug((categories[0]?.slug as CategorySlug) ?? 'luxury-perfumes');
    setProdGender('Unisex');
    setProdPrice('12500');
    setProdOrigPrice('');
    setProdConc('Eau de Parfum');
    setProdDesc('Sample luxury composition added via Admin Dashboard.');
    setProdActive(true);
    setProdImageUrl(PRODUCT_IMAGES.frenchAmber);
    setProdSizes([{ ml: '100ml', pricePkr: 12500, stock: 15 }]);
    setShowProductForm(true);
  };

  const openEditProductForm = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdBrand(p.brand);
    setProdCategorySlug(p.categorySlug);
    setProdGender(p.gender);
    setProdPrice(String(p.pricePkr));
    setProdOrigPrice(p.originalPricePkr ? String(p.originalPricePkr) : '');
    setProdConc(p.concentration);
    setProdDesc(p.description);
    setProdActive(p.active !== false);
    setProdImageUrl(p.images[0] ?? PRODUCT_IMAGES.frenchAmber);
    setProdSizes(p.sizes.length > 0 ? p.sizes.map((s) => ({ ...s })) : [{ ml: '100ml', pricePkr: p.pricePkr, stock: 10 }]);
    setShowProductForm(true);
  };

  const handleProductFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProdUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await uploadAdminImage(dataUrl);
      if (res.ok && res.url) {
        setProdImageUrl(res.url);
        notify('Product image uploaded.', 'success');
      } else {
        notify(res.error ?? 'Could not upload image.', 'error');
      }
    } catch {
      notify('Could not read selected file.', 'error');
    } finally {
      setProdUploading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const categoryObj = categories.find((c) => c.slug === prodCategorySlug) ?? categories[0];
    const basePriceNum = Math.max(500, Number(prodPrice) || 5000);
    const origNum = prodOrigPrice ? Number(prodOrigPrice) : undefined;
    const cleanSizes =
      prodSizes.length > 0
        ? prodSizes.map((s) => ({
            ml: s.ml.trim() || '100ml',
            pricePkr: Math.max(100, Number(s.pricePkr) || basePriceNum),
            originalPricePkr: s.originalPricePkr,
            stock: Math.max(0, Math.floor(Number(s.stock) || 0)),
          }))
        : [{ ml: '100ml', pricePkr: basePriceNum, stock: 15 }];

    if (editingProduct) {
      const res = await updateProduct({
        ...editingProduct,
        name: prodName.trim(),
        brand: prodBrand.trim(),
        category: categoryObj?.name ?? editingProduct.category,
        categorySlug: (categoryObj?.slug ?? prodCategorySlug) as CategorySlug,
        gender: prodGender,
        concentration: prodConc,
        pricePkr: basePriceNum,
        originalPricePkr: origNum,
        description: prodDesc.trim(),
        active: prodActive,
        sizes: cleanSizes,
        images: [prodImageUrl, ...editingProduct.images.filter((img, i) => i > 0 && img !== prodImageUrl)],
      });
      if (res.ok) setShowProductForm(false);
    } else {
      const res = await addProduct({
        name: prodName.trim(),
        brand: prodBrand.trim(),
        category: categoryObj?.name ?? 'Luxury Perfumes',
        categorySlug: (categoryObj?.slug ?? 'luxury-perfumes') as CategorySlug,
        gender: prodGender,
        concentration: prodConc,
        pricePkr: basePriceNum,
        originalPricePkr: origNum,
        description: prodDesc.trim(),
        active: prodActive,
        sizes: cleanSizes,
        images: [prodImageUrl],
      });
      if (res.ok) setShowProductForm(false);
    }
  };

  // --- Category Form Handlers ---
  const openNewCategoryForm = () => {
    setEditingCategory(null);
    setCatName('');
    setCatSubtitle('');
    setCatDescription('');
    setCatImageUrl(PRODUCT_IMAGES.frenchAmber);
    setCatVisible(true);
    setShowCategoryForm(true);
  };

  const openEditCategoryForm = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatSubtitle(cat.subtitle);
    setCatDescription(cat.description);
    setCatImageUrl(cat.image);
    setCatVisible(cat.visible);
    setShowCategoryForm(true);
  };

  const handleCategoryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCatUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await uploadAdminImage(dataUrl);
      if (res.ok && res.url) {
        setCatImageUrl(res.url);
        notify('Category image uploaded.', 'success');
      } else {
        notify(res.error ?? 'Could not upload category image.', 'error');
      }
    } catch {
      notify('Could not read selected file.', 'error');
    } finally {
      setCatUploading(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    if (editingCategory) {
      const res = await updateCategory({
        ...editingCategory,
        name: catName.trim(),
        subtitle: catSubtitle.trim() || 'Curated Selection',
        description: catDescription.trim() || editingCategory.description,
        image: catImageUrl,
        visible: catVisible,
      });
      if (res.ok) setShowCategoryForm(false);
    } else {
      const res = await addCategory({
        slug: slugify(catName) as CategorySlug,
        name: catName.trim(),
        subtitle: catSubtitle.trim() || 'Curated Selection',
        description: catDescription.trim() || 'Custom category added via Admin Dashboard.',
        image: catImageUrl,
        visible: catVisible,
      });
      if (res.ok) setShowCategoryForm(false);
    }
  };

  // --- Coupon Handlers ---
  const resetCouponForm = () => {
    setEditingCoupon(null);
    setCouponCode('');
    setCouponDesc('');
    setCouponType('percent');
    setCouponValue('15');
    setCouponMin('5000');
    setCouponExpiry('2027-12-31');
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const val = Math.max(1, Number(couponValue) || 10);
    const min = Math.max(0, Number(couponMin) || 0);

    if (editingCoupon) {
      const res = await updateCoupon({
        ...editingCoupon,
        code: couponCode.trim().toUpperCase(),
        description:
          couponDesc.trim() ||
          (couponType === 'percent' ? `${val}% Demo Discount` : `Flat Rs. ${val} Demo Discount`),
        type: couponType,
        value: val,
        minOrderPkr: min,
        expiresAt: couponExpiry || '2027-12-31',
      });
      if (res.ok) resetCouponForm();
    } else {
      const res = await addCoupon({
        code: couponCode.trim().toUpperCase(),
        description:
          couponDesc.trim() ||
          (couponType === 'percent' ? `${val}% Demo Discount` : `Flat Rs. ${val} Demo Discount`),
        type: couponType,
        value: val,
        minOrderPkr: min,
        active: true,
        expiresAt: couponExpiry || '2027-12-31',
      });
      if (res.ok) resetCouponForm();
    }
  };

  const handleExportCsv = () => {
    const header = 'OrderNumber,Customer,City,Status,PaymentMethod,PaymentStatus,TotalPKR\n';
    const rows = orders
      .map(
        (o) =>
          `${o.orderNumber},"${o.customerName}",${o.city},${o.orderStatus},"${o.paymentMethod}","${o.paymentStatus}",${o.totalPkr}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'velora-demo-sales-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#F6EFE6] flex items-center justify-center px-4">
        <div className="bg-white border border-[#EAE0D2] px-8 py-6 text-center">
          <p className="font-display text-2xl text-[#252525]">Verifying Admin Session...</p>
          <p className="mt-1 text-xs text-[#66635D]">Connecting to Velora secure backend.</p>
        </div>
      </div>
    );
  }

  // Protected Admin Gate — never accessible to unauthenticated visitors or ordinary customer role
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F6EFE6] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md border border-[#B76E79]/35 bg-[#FCFBF9] p-8 shadow-sm">
          <div className="mb-6 flex justify-center border-b border-[#EAE0D2] pb-5">
            <VeloraLogo layout="horizontal" tone="rosegold-light" size="sm" />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center bg-[#252525] text-[#B76E79]">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#8E4D57] font-semibold">
                Role-Protected Admin Portal
              </p>
              <h1 className="font-display text-2xl font-medium text-[#252525]">
                Administrator Sign In
              </h1>
            </div>
          </div>

          {currentCustomer && (
            <div className="mb-4 border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900">
              Currently signed in as customer <strong>{currentCustomer.email}</strong>. Ordinary
              customer accounts do not have permission to access Admin routes.
            </div>
          )}

          <p className="text-xs leading-relaxed text-[#66635D] mb-5">
            Protected by server-side <code className="font-mono">scrypt</code> password verification
            and role-checked <code className="font-mono">/api/admin/*</code> authorization.
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-[#66635D] mb-1">Administrator Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@velorafragrances.com"
                className="w-full border border-[#252525]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-[#66635D] mb-1">Administrator Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter administrator password"
                className="w-full border border-[#252525]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
              />
            </div>

            {authError && (
              <p className="border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full bg-[#252525] py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#B76E79] transition-colors disabled:opacity-50"
            >
              {authSubmitting ? 'Verifying Credentials...' : 'Sign In to Admin Console'}
            </button>
          </form>

          <div className="mt-6 border-t border-[#EAE0D2] pt-4 flex items-center justify-between text-xs text-[#66635D]">
            <span>Customer Accounts: separate login</span>
            <Link to="/" className="font-medium text-[#8E4D57] hover:underline">
              ← Back to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeMenuObj = ADMIN_MENU.find((m) => m.id === activeTab) ?? ADMIN_MENU[0];

  const renderSidebarLinks = (closeMobile?: () => void) => (
    <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
      {ADMIN_MENU.map((item) => {
        const Icon = item.icon;
        const active = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setActiveTab(item.id);
              closeMobile?.();
            }}
            className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-xs transition-colors ${
              active
                ? 'bg-[#252525] text-white font-medium'
                : 'text-[#66635D] hover:bg-[#F6EFE6] hover:text-[#252525]'
            }`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#B76E79]' : ''}`} />
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#252525] flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 bg-[#FCFBF9] border-r border-[#EAE0D2] flex-col">
        <div className="px-6 py-5 border-b border-[#EAE0D2]">
          <VeloraLogo layout="horizontal" tone="rosegold-light" size="sm" />
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#8E4D57] font-semibold mt-3">
            Admin Console · Demo Data
          </p>
          {authenticatedAdminEmail && (
            <p className="text-[11px] text-[#66635D] truncate mt-0.5">{authenticatedAdminEmail}</p>
          )}
        </div>

        {renderSidebarLinks()}

        <div className="border-t border-[#EAE0D2] p-4 space-y-2">
          <Link
            to="/"
            className="flex w-full items-center justify-center gap-2 border border-[#252525]/20 bg-white py-2 text-xs font-medium hover:border-[#B76E79] hover:text-[#8E4D57]"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>View Public Storefront</span>
          </Link>
          <button
            type="button"
            onClick={() => void logoutAdmin()}
            className="flex w-full items-center justify-center gap-2 bg-[#F6EFE6] border border-[#EAE0D2] py-2 text-xs text-rose-700 hover:bg-rose-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-[#FCFBF9] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-[#EAE0D2] px-5 py-4">
              <VeloraLogo layout="horizontal" tone="rosegold-light" size="sm" />
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close admin menu"
                className="flex h-9 w-9 items-center justify-center text-[#252525]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderSidebarLinks(() => setMobileNavOpen(false))}
            <div className="border-t border-[#EAE0D2] p-4 space-y-2">
              <Link
                to="/"
                className="flex w-full items-center justify-center gap-2 border border-[#252525]/20 bg-white py-2 text-xs font-medium"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>View Public Storefront</span>
              </Link>
              <button
                type="button"
                onClick={() => void logoutAdmin()}
                className="flex w-full items-center justify-center gap-2 bg-[#F6EFE6] border border-[#EAE0D2] py-2 text-xs text-rose-700"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out Admin</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-[#FCFBF9] border-b border-[#EAE0D2] px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open admin navigation"
              className="flex h-10 w-10 items-center justify-center border border-[#EAE0D2] bg-white text-[#252525] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs text-[#66635D]">
                Velora Admin /{' '}
                <span className="text-[#8E4D57] font-medium">{activeMenuObj.label}</span>
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-medium text-[#252525]">
                {activeMenuObj.label.replace(/^\d+\.\s*/, '')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => void resetDemoData()}
              className="inline-flex items-center gap-1.5 border border-[#EAE0D2] bg-white px-3.5 py-2 text-xs font-medium text-[#252525] hover:border-[#B76E79]"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#8E4D57]" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* 1. OVERVIEW (6 KPI CARDS) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white border border-[#EAE0D2] p-5">
                  <p className="text-xs uppercase tracking-wider text-[#66635D]">Total Products</p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums text-[#252525]">
                    {products.length}
                  </p>
                  <p className="mt-1 text-xs text-[#8E4D57]">
                    {activeProductsCount} active · {products.length - activeProductsCount} inactive
                  </p>
                </div>

                <div className="bg-white border border-[#EAE0D2] p-5">
                  <p className="text-xs uppercase tracking-wider text-[#66635D]">
                    Total Demo Orders
                  </p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums text-[#252525]">
                    {orders.length}
                  </p>
                  <p className="mt-1 text-xs text-[#66635D]">Sample & simulated records only</p>
                </div>

                <div className="bg-white border border-[#EAE0D2] p-5">
                  <p className="text-xs uppercase tracking-wider text-[#66635D]">
                    Total Customers
                  </p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums text-[#252525]">
                    {customers.length}
                  </p>
                  <p className="mt-1 text-xs text-[#66635D]">Registered customer profiles</p>
                </div>

                <div className="bg-white border border-[#EAE0D2] p-5">
                  <p className="text-xs uppercase tracking-wider text-[#66635D]">
                    Total Revenue (Demo Data)
                  </p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums text-[#8E4D57]">
                    {formatPkr(totalDemoRevenue)}
                  </p>
                  <p className="mt-1 text-xs text-[#66635D]">
                    Demo data only — excludes cancelled orders
                  </p>
                </div>

                <div className="bg-white border border-[#EAE0D2] p-5">
                  <p className="text-xs uppercase tracking-wider text-[#66635D]">
                    Pending Orders
                  </p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums text-[#252525]">
                    {pendingOrdersCount}
                  </p>
                  <p className="mt-1 text-xs text-[#66635D]">
                    Pending, Confirmed, or Preparing
                  </p>
                </div>

                <div className="bg-white border border-[#EAE0D2] p-5">
                  <p className="text-xs uppercase tracking-wider text-[#66635D]">
                    Low Stock Products
                  </p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums text-amber-700">
                    {lowStockProducts.length}
                  </p>
                  <p className="mt-1 text-xs text-[#66635D]">
                    ≤10 total units ({outOfStockProductsCount} out of stock)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="bg-white border border-[#EAE0D2] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl font-medium">Recent Demo Orders</h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-medium text-[#8E4D57] hover:underline"
                    >
                      Manage Orders →
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-[#EAE0D2] text-[#66635D]">
                        <tr>
                          <th className="py-2 pr-3">Order</th>
                          <th className="py-2 pr-3">Customer</th>
                          <th className="py-2 pr-3">Status</th>
                          <th className="py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAE0D2]/70">
                        {orders.slice(0, 6).map((o) => (
                          <tr key={o.id}>
                            <td className="py-2.5 pr-3 font-mono font-medium">{o.orderNumber}</td>
                            <td className="py-2.5 pr-3">{o.customerName}</td>
                            <td className="py-2.5 pr-3">{o.orderStatus}</td>
                            <td className="py-2.5 text-right font-medium tabular-nums">
                              {formatPkr(o.totalPkr)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white border border-[#EAE0D2] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl font-medium">Low Stock Watchlist</h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('stock')}
                      className="text-xs font-medium text-[#8E4D57] hover:underline"
                    >
                      Open Inventory →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {lowStockProducts.slice(0, 6).map((p) => {
                      const stock = getProductTotalStock(p);
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-xs border-b border-[#EAE0D2]/70 pb-2"
                        >
                          <div>
                            <p className="font-medium text-[#252525]">{p.name}</p>
                            <p className="text-[#66635D]">{p.brand}</p>
                          </div>
                          <span
                            className={`font-mono font-medium tabular-nums ${
                              stock <= 0 ? 'text-rose-700' : 'text-amber-700'
                            }`}
                          >
                            {stock <= 0 ? 'Out of Stock' : `${stock} left`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. VIEW & MANAGE ORDERS (SEARCH + DETAILS DRAWER + CANCEL) */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-[#EAE0D2] p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#66635D]" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by order #, customer name, phone, or city..."
                    className="w-full border border-[#252525]/20 bg-white pl-9 pr-3 py-2 text-xs focus:border-[#B76E79] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#66635D] tabular-nums">
                    {filteredOrders.length} demo order{filteredOrders.length === 1 ? '' : 's'}
                  </span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="border border-[#252525]/20 px-3 py-2 text-xs bg-white"
                  >
                    <option value="all">All Statuses</option>
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#EAE0D2] text-[#66635D]">
                    <tr>
                      <th className="py-2.5 pr-4">Order #</th>
                      <th className="py-2.5 pr-4">Customer & Delivery</th>
                      <th className="py-2.5 pr-4">Payment</th>
                      <th className="py-2.5 pr-4">Status</th>
                      <th className="py-2.5 pr-4 text-right">Total</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE0D2]/70">
                    {filteredOrders.map((o) => (
                      <tr key={o.id}>
                        <td className="py-3 pr-4 font-mono font-semibold text-[#252525]">
                          {o.orderNumber}
                          <p className="font-sans font-normal text-[11px] text-[#66635D] mt-0.5">
                            {formatDateShort(o.createdAt)}
                          </p>
                        </td>
                        <td className="py-3 pr-4">
                          <p className="font-medium text-[#252525]">{o.customerName}</p>
                          <p className="text-[#66635D]">
                            {o.city} · {o.customerPhone}
                          </p>
                        </td>
                        <td className="py-3 pr-4">
                          <p>{o.paymentMethod}</p>
                          <p className="text-[11px] font-medium text-[#8E4D57]">{o.paymentStatus}</p>
                        </td>
                        <td className="py-3 pr-4">
                          <select
                            value={o.orderStatus}
                            onChange={(e) =>
                              void updateOrderStatus(o.id, e.target.value as OrderStatus)
                            }
                            className="border border-[#252525]/20 bg-white px-2.5 py-1 text-xs font-medium"
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 pr-4 text-right font-semibold tabular-nums">
                          {formatPkr(o.totalPkr)}
                        </td>
                        <td className="py-3 text-right whitespace-nowrap space-x-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderId(o.id)}
                            className="inline-flex items-center gap-1 border border-[#252525]/20 px-2.5 py-1 hover:border-[#B76E79] hover:text-[#8E4D57]"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Details</span>
                          </button>

                          {o.orderStatus !== 'Cancelled' &&
                            (confirmCancelOrderId === o.id ? (
                              <span className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await updateOrderStatus(
                                      o.id,
                                      'Cancelled',
                                      'Demo order cancelled by Admin'
                                    );
                                    setConfirmCancelOrderId(null);
                                  }}
                                  className="bg-rose-700 px-2 py-1 text-white"
                                >
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmCancelOrderId(null)}
                                  className="border border-[#EAE0D2] px-2 py-1 text-[#66635D]"
                                >
                                  No
                                </button>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmCancelOrderId(o.id)}
                                className="border border-rose-200 px-2.5 py-1 text-rose-700 hover:bg-rose-50"
                              >
                                Cancel
                              </button>
                            ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. MANAGE PRODUCTS (IMAGE UPLOAD, MULTI-SIZE, ACTIVE/INACTIVE) */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <p className="text-xs text-[#66635D]">
                  Active products are displayed on the storefront; Inactive products are hidden from
                  public catalog & search.
                </p>
                <button
                  type="button"
                  onClick={openNewProductForm}
                  className="bg-[#252525] px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-white hover:bg-[#B76E79] transition-colors"
                >
                  + Add New Product
                </button>
              </div>

              {showProductForm && (
                <form
                  onSubmit={handleSaveProduct}
                  className="bg-white border border-[#B76E79] p-6 space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-2xl font-medium">
                      {editingProduct ? `Edit: ${editingProduct.name}` : 'Add Sample Fragrance'}
                    </h2>
                    <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodActive}
                        onChange={(e) => setProdActive(e.target.checked)}
                      />
                      <span>{prodActive ? 'Active on Storefront' : 'Inactive (Hidden)'}</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-[#66635D] mb-1">Product Name *</label>
                      <input
                        type="text"
                        required
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        placeholder="Product Name"
                        className="w-full border border-[#252525]/20 px-3.5 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#66635D] mb-1">Brand *</label>
                      <input
                        type="text"
                        required
                        value={prodBrand}
                        onChange={(e) => setProdBrand(e.target.value)}
                        placeholder="Brand"
                        className="w-full border border-[#252525]/20 px-3.5 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#66635D] mb-1">Category</label>
                      <select
                        value={prodCategorySlug}
                        onChange={(e) => setProdCategorySlug(e.target.value as CategorySlug)}
                        className="w-full border border-[#252525]/20 bg-white px-3.5 py-2 text-sm"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-[#66635D] mb-1">Audience</label>
                      <select
                        value={prodGender}
                        onChange={(e) => setProdGender(e.target.value as GenderCategory)}
                        className="w-full border border-[#252525]/20 bg-white px-3 py-2 text-sm"
                      >
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#66635D] mb-1">Base Price (PKR)</label>
                      <input
                        type="number"
                        required
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        className="w-full border border-[#252525]/20 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#66635D] mb-1">Original PKR (Opt)</label>
                      <input
                        type="number"
                        value={prodOrigPrice}
                        onChange={(e) => setProdOrigPrice(e.target.value)}
                        placeholder="None"
                        className="w-full border border-[#252525]/20 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#66635D] mb-1">Concentration</label>
                      <input
                        type="text"
                        value={prodConc}
                        onChange={(e) => setProdConc(e.target.value)}
                        placeholder="Eau de Parfum"
                        className="w-full border border-[#252525]/20 px-3.5 py-2 text-sm"
                      />
                    </div>
                  </div>

                  {/* Image Upload + Studio Presets */}
                  <div className="border border-[#EAE0D2] bg-[#F6EFE6]/50 p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-2">
                      <div className="aspect-square w-20 bg-white border border-[#EAE0D2] overflow-hidden">
                        <SafeImage src={prodImageUrl} alt="Product preview" />
                      </div>
                    </div>
                    <div className="md:col-span-5 space-y-2">
                      <label className="block text-xs font-medium text-[#252525]">
                        Upload Product Image (PNG/JPG/WebP)
                      </label>
                      <label className="inline-flex items-center gap-2 border border-[#252525]/25 bg-white px-3.5 py-2 text-xs cursor-pointer hover:border-[#B76E79]">
                        <Upload className="h-3.5 w-3.5 text-[#8E4D57]" />
                        <span>{prodUploading ? 'Uploading...' : 'Choose Image File'}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={(e) => void handleProductFileUpload(e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="md:col-span-5 space-y-1">
                      <label className="block text-xs text-[#66635D]">
                        Or Pick Studio Photography Preset
                      </label>
                      <select
                        value={
                          Object.values(PRODUCT_IMAGES).includes(
                            prodImageUrl as (typeof PRODUCT_IMAGES)[keyof typeof PRODUCT_IMAGES]
                          )
                            ? prodImageUrl
                            : ''
                        }
                        onChange={(e) => {
                          if (e.target.value) setProdImageUrl(e.target.value);
                        }}
                        className="w-full border border-[#252525]/20 bg-white px-3 py-2 text-xs"
                      >
                        <option value="">Custom Uploaded Image</option>
                        <option value={PRODUCT_IMAGES.frenchAmber}>French Amber Flacon</option>
                        <option value={PRODUCT_IMAGES.oudObsidian}>Oud Obsidian Bottle</option>
                        <option value={PRODUCT_IMAGES.floralIvory}>Floral Crystal Bottle</option>
                        <option value={PRODUCT_IMAGES.freshAzure}>Fresh Unisex Bottle</option>
                        <option value={PRODUCT_IMAGES.attarCrystal}>Pure Attar Decanter</option>
                        <option value={PRODUCT_IMAGES.giftCoffret}>Gift Coffret Box</option>
                      </select>
                    </div>
                  </div>

                  {/* Product Sizes & Stock Manager */}
                  <div className="border border-[#EAE0D2] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#252525]">
                        Sizes, Variant Prices & Stock Quantities
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setProdSizes((prev) => [
                            ...prev,
                            { ml: '50ml', pricePkr: Number(prodPrice) || 9500, stock: 10 },
                          ])
                        }
                        className="inline-flex items-center gap-1 border border-[#B76E79]/50 px-2.5 py-1 text-xs text-[#8E4D57] hover:bg-[#F6EFE6]"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Size</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {prodSizes.map((sz, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                          <input
                            type="text"
                            value={sz.ml}
                            onChange={(e) =>
                              setProdSizes((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, ml: e.target.value } : item
                                )
                              )
                            }
                            placeholder="Size (e.g. 100ml)"
                            className="col-span-4 border border-[#252525]/20 px-2.5 py-1.5 text-xs"
                          />
                          <input
                            type="number"
                            value={sz.pricePkr}
                            onChange={(e) =>
                              setProdSizes((prev) =>
                                prev.map((item, i) =>
                                  i === idx
                                    ? { ...item, pricePkr: Number(e.target.value) || 0 }
                                    : item
                                )
                              )
                            }
                            placeholder="Price PKR"
                            className="col-span-4 border border-[#252525]/20 px-2.5 py-1.5 text-xs"
                          />
                          <input
                            type="number"
                            min={0}
                            value={sz.stock}
                            onChange={(e) =>
                              setProdSizes((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, stock: Number(e.target.value) || 0 } : item
                                )
                              )
                            }
                            placeholder="Stock"
                            className="col-span-3 border border-[#252525]/20 px-2.5 py-1.5 text-xs"
                          />
                          {prodSizes.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setProdSizes((prev) => prev.filter((_, i) => i !== idx))
                              }
                              aria-label="Remove size"
                              className="col-span-1 text-rose-700 hover:underline text-xs text-center"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#66635D] mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      placeholder="Product description"
                      className="w-full border border-[#252525]/20 px-3.5 py-2 text-sm"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="bg-[#252525] px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-white hover:bg-[#B76E79]"
                    >
                      Save Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProductForm(false)}
                      className="border border-[#252525]/20 px-6 py-2.5 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-white border border-[#EAE0D2] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#EAE0D2] text-[#66635D]">
                    <tr>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Sizes & Price</th>
                      <th className="p-3.5">Stock</th>
                      <th className="p-3.5">Visibility</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE0D2]/70">
                    {products.map((p) => {
                      const isActive = p.active !== false;
                      const totalStock = getProductTotalStock(p);
                      return (
                        <tr key={p.id}>
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 shrink-0 bg-[#F6EFE6] border border-[#EAE0D2] overflow-hidden">
                                <SafeImage src={p.images[0]} alt={p.name} />
                              </div>
                              <div>
                                <p className="font-medium text-[#252525]">{p.name}</p>
                                <p className="text-[#66635D]">{p.brand}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">{p.category}</td>
                          <td className="p-3.5 tabular-nums">
                            <p className="font-medium">{formatPkr(p.pricePkr)}</p>
                            <p className="text-[#66635D]">
                              {p.sizes.map((s) => s.ml).join(' · ')}
                            </p>
                          </td>
                          <td className="p-3.5 tabular-nums">{totalStock}</td>
                          <td className="p-3.5">
                            <button
                              type="button"
                              onClick={() => void updateProduct({ ...p, active: !isActive })}
                              className={`border px-2.5 py-1 font-medium ${
                                isActive
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                  : 'border-[#252525]/20 bg-[#F6EFE6] text-[#66635D]'
                              }`}
                            >
                              {isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => openEditProductForm(p)}
                              className="inline-flex items-center gap-1 border border-[#252525]/20 px-2.5 py-1 hover:border-[#B76E79]"
                            >
                              <Pencil className="h-3 w-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteProduct(p.id)}
                              className="inline-flex items-center gap-1 border border-rose-200 text-rose-700 px-2.5 py-1 hover:bg-rose-50"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. MANAGE CATEGORIES (ADD, EDIT, DELETE, UPLOAD IMAGE, DESCRIPTION) */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-xs text-[#66635D]">
                  Manage olfactive categories, descriptions, category photography, and storefront
                  visibility.
                </p>
                <button
                  type="button"
                  onClick={openNewCategoryForm}
                  className="bg-[#252525] px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-white hover:bg-[#B76E79]"
                >
                  + Add Category
                </button>
              </div>

              {showCategoryForm && (
                <form
                  onSubmit={handleSaveCategory}
                  className="bg-white border border-[#B76E79] p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-2xl font-medium">
                      {editingCategory
                        ? `Edit Category: ${editingCategory.name}`
                        : 'Create Category'}
                    </h2>
                    <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={catVisible}
                        onChange={(e) => setCatVisible(e.target.checked)}
                      />
                      <span>{catVisible ? 'Visible on Storefront' : 'Hidden'}</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#66635D] mb-1">Category Name *</label>
                      <input
                        type="text"
                        required
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        placeholder="e.g. Evening Extraits"
                        className="w-full border border-[#252525]/20 px-3.5 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#66635D] mb-1">Subtitle</label>
                      <input
                        type="text"
                        value={catSubtitle}
                        onChange={(e) => setCatSubtitle(e.target.value)}
                        placeholder="e.g. 12+ Hour Sillage"
                        className="w-full border border-[#252525]/20 px-3.5 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#66635D] mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={catDescription}
                      onChange={(e) => setCatDescription(e.target.value)}
                      placeholder="Short category description..."
                      className="w-full border border-[#252525]/20 px-3.5 py-2 text-sm"
                    />
                  </div>

                  <div className="border border-[#EAE0D2] bg-[#F6EFE6]/50 p-4 flex flex-wrap items-center gap-4">
                    <div className="h-16 w-20 bg-white border border-[#EAE0D2] overflow-hidden">
                      <SafeImage src={catImageUrl} alt="Category preview" />
                    </div>
                    <label className="inline-flex items-center gap-2 border border-[#252525]/25 bg-white px-3.5 py-2 text-xs cursor-pointer hover:border-[#B76E79]">
                      <Upload className="h-3.5 w-3.5 text-[#8E4D57]" />
                      <span>{catUploading ? 'Uploading...' : 'Upload Category Image'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => void handleCategoryFileUpload(e)}
                        className="hidden"
                      />
                    </label>
                    <select
                      value={
                        Object.values(PRODUCT_IMAGES).includes(
                          catImageUrl as (typeof PRODUCT_IMAGES)[keyof typeof PRODUCT_IMAGES]
                        )
                          ? catImageUrl
                          : ''
                      }
                      onChange={(e) => {
                        if (e.target.value) setCatImageUrl(e.target.value);
                      }}
                      className="border border-[#252525]/20 bg-white px-3 py-2 text-xs"
                    >
                      <option value="">Custom Uploaded Image</option>
                      <option value={PRODUCT_IMAGES.frenchAmber}>French Amber Flacon</option>
                      <option value={PRODUCT_IMAGES.oudObsidian}>Oud Obsidian Bottle</option>
                      <option value={PRODUCT_IMAGES.floralIvory}>Floral Crystal Bottle</option>
                      <option value={PRODUCT_IMAGES.freshAzure}>Fresh Unisex Bottle</option>
                      <option value={PRODUCT_IMAGES.attarCrystal}>Pure Attar Decanter</option>
                      <option value={PRODUCT_IMAGES.giftCoffret}>Gift Coffret Box</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="bg-[#252525] px-6 py-2 text-xs font-medium uppercase tracking-wider text-white hover:bg-[#B76E79]"
                    >
                      {editingCategory ? 'Update Category' : 'Create Category'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCategoryForm(false)}
                      className="border border-[#252525]/20 px-5 py-2 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-white border border-[#EAE0D2] divide-y divide-[#EAE0D2]">
                {categories.map((c) => {
                  const count = products.filter(
                    (p) =>
                      p.categorySlug === c.slug ||
                      (p.secondaryCategories ?? []).includes(c.slug)
                  ).length;
                  return (
                    <div
                      key={c.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-14 w-16 shrink-0 bg-[#F6EFE6] border border-[#EAE0D2] overflow-hidden">
                          <SafeImage src={c.image} alt={c.name} />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-[#252525]">{c.name}</p>
                          <p className="text-[#8E4D57] font-medium">
                            {c.subtitle} · {count} fragrance{count === 1 ? '' : 's'}
                          </p>
                          <p className="text-[#66635D] mt-0.5 max-w-xl">{c.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => void updateCategory({ ...c, visible: !c.visible })}
                          className={`border px-3 py-1.5 font-medium ${
                            c.visible
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                              : 'border-[#252525]/20 text-[#66635D]'
                          }`}
                        >
                          {c.visible ? 'Visible' : 'Hidden'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditCategoryForm(c)}
                          className="inline-flex items-center gap-1 border border-[#252525]/20 px-2.5 py-1.5 hover:border-[#B76E79]"
                        >
                          <Pencil className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteCategory(c.id)}
                          className="inline-flex items-center gap-1 border border-rose-200 px-2.5 py-1.5 text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. MANAGE PRODUCT PRICES */}
          {activeTab === 'prices' && (
            <div className="bg-white border border-[#EAE0D2] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#EAE0D2] text-[#66635D]">
                  <tr>
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Brand</th>
                    <th className="p-3.5">Current Price (PKR)</th>
                    <th className="p-3.5">Original Price (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE0D2]/70">
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="p-3.5 font-medium">{p.name}</td>
                      <td className="p-3.5 text-[#66635D]">{p.brand}</td>
                      <td className="p-3.5">
                        <input
                          type="number"
                          defaultValue={p.pricePkr}
                          onBlur={(e) =>
                            void updateProductPrice(
                              p.id,
                              Math.max(100, Number(e.target.value) || p.pricePkr),
                              p.originalPricePkr
                            )
                          }
                          className="w-32 border border-[#252525]/20 px-2.5 py-1.5 tabular-nums"
                        />
                      </td>
                      <td className="p-3.5">
                        <input
                          type="number"
                          defaultValue={p.originalPricePkr ?? ''}
                          placeholder="None"
                          onBlur={(e) => {
                            const val = e.target.value ? Number(e.target.value) : undefined;
                            void updateProductPrice(p.id, p.pricePkr, val);
                          }}
                          className="w-32 border border-[#252525]/20 px-2.5 py-1.5 tabular-nums"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 6. INVENTORY MANAGEMENT (SEARCH, LOW STOCK ALERTS, OUT OF STOCK STATUS) */}
          {activeTab === 'stock' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#EAE0D2] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#66635D]" />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Search inventory by perfume, brand, category, or size..."
                    className="w-full border border-[#252525]/20 bg-white pl-9 pr-3 py-2 text-xs focus:border-[#B76E79] focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {(
                    [
                      { id: 'all', label: `All (${products.length})` },
                      { id: 'low', label: `Low Stock Alerts (${lowStockProducts.length})` },
                      { id: 'out', label: `Out of Stock (${outOfStockProductsCount})` },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setInventoryFilter(f.id)}
                      className={`border px-3 py-1.5 font-medium transition-colors ${
                        inventoryFilter === f.id
                          ? 'border-[#252525] bg-[#252525] text-white'
                          : 'border-[#EAE0D2] bg-[#FCFBF9] text-[#66635D] hover:border-[#B76E79]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#EAE0D2] divide-y divide-[#EAE0D2]">
                {filteredInventoryProducts.map((p) => {
                  const total = getProductTotalStock(p);
                  const hasOut = p.sizes.some((s) => s.stock <= 0);
                  const statusLabel =
                    total <= 0
                      ? 'Out of Stock'
                      : hasOut || total <= 10
                      ? 'Low Stock Alert'
                      : 'In Stock';

                  return (
                    <div
                      key={p.id}
                      className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-[#252525]">{p.name}</p>
                            <span
                              className={`border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                total <= 0
                                  ? 'border-rose-300 bg-rose-50 text-rose-800'
                                  : statusLabel === 'Low Stock Alert'
                                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                                  : 'border-emerald-300 bg-emerald-50 text-emerald-800'
                              }`}
                            >
                              {statusLabel}
                            </span>
                          </div>
                          <p className="text-[#66635D] mt-0.5">
                            {p.brand} · {p.category} · Total: <strong className="tabular-nums">{total}</strong> units
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {p.sizes.map((s) => (
                          <label
                            key={s.ml}
                            className={`flex items-center gap-2 border px-3 py-1.5 ${
                              s.stock <= 0
                                ? 'border-rose-300 bg-rose-50/50'
                                : s.stock <= 6
                                ? 'border-amber-300 bg-amber-50/40'
                                : 'border-[#EAE0D2]'
                            }`}
                          >
                            <span className="font-medium">{s.ml}:</span>
                            <input
                              type="number"
                              min={0}
                              value={s.stock}
                              onChange={(e) =>
                                void updateProductSizeStock(
                                  p.id,
                                  s.ml,
                                  Math.max(0, Number(e.target.value) || 0)
                                )
                              }
                              className="w-16 border border-[#252525]/20 bg-white px-2 py-1 text-center tabular-nums"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {filteredInventoryProducts.length === 0 && (
                  <p className="p-6 text-xs text-[#66635D]">
                    No inventory records match your current search/filter ({inventory.length} SKU
                    records tracked).
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 7. CUSTOMER MANAGEMENT (MASKED LIST + AUTHORIZED DETAILS DRAWER) */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#EAE0D2] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#66635D]" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customers by name, email, or city..."
                    className="w-full border border-[#252525]/20 bg-white pl-9 pr-3 py-2 text-xs focus:border-[#B76E79] focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#66635D]">
                  Personal contact details are masked in table view; click Details for authorized
                  order inspection.
                </p>
              </div>

              <div className="bg-white border border-[#EAE0D2] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#EAE0D2] text-[#66635D]">
                    <tr>
                      <th className="p-3.5">Customer Name</th>
                      <th className="p-3.5">Email (Masked)</th>
                      <th className="p-3.5">Phone (Masked)</th>
                      <th className="p-3.5">City</th>
                      <th className="p-3.5">Demo Orders</th>
                      <th className="p-3.5 text-right">Total Spend</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE0D2]/70">
                    {filteredCustomers.map((c) => {
                      const custOrders = orders.filter(
                        (o) =>
                          o.customerId === c.id ||
                          o.customerEmail.toLowerCase() === c.email.toLowerCase()
                      );
                      const totalSpend = custOrders.reduce(
                        (s, o) => (o.orderStatus !== 'Cancelled' ? s + o.totalPkr : s),
                        0
                      );
                      return (
                        <tr key={c.id}>
                          <td className="p-3.5 font-medium text-[#252525]">{c.fullName}</td>
                          <td className="p-3.5 font-mono text-[#66635D]">{maskEmail(c.email)}</td>
                          <td className="p-3.5 font-mono tabular-nums text-[#66635D]">
                            {maskPhone(c.phone)}
                          </td>
                          <td className="p-3.5">{c.city}</td>
                          <td className="p-3.5 tabular-nums">{custOrders.length}</td>
                          <td className="p-3.5 text-right font-medium tabular-nums">
                            {formatPkr(totalSpend)}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={async () => {
                                const detail = await fetchCustomerDetails(c.id);
                                if (detail) {
                                  setSelectedCustomerDetail(detail);
                                } else {
                                  setSelectedCustomerDetail({ customer: c, orders: custOrders });
                                }
                              }}
                              className="inline-flex items-center gap-1 border border-[#252525]/20 px-2.5 py-1 hover:border-[#B76E79] hover:text-[#8E4D57]"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Details & History</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. MANAGE PAYMENT STATUS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="border border-[#B76E79]/35 bg-white px-4 py-3 text-xs text-[#66635D]">
                Portfolio Integrity Notice: Live JazzCash/EasyPaisa/card verification is disabled.
                New checkout orders start as <strong className="text-[#252525]">Pending</strong> and
                can only be toggled as demo payment states by Admin.
              </div>
              <div className="bg-white border border-[#EAE0D2] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#EAE0D2] text-[#66635D]">
                    <tr>
                      <th className="p-3.5">Order #</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Payment Method</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE0D2]/70">
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td className="p-3.5 font-mono">{o.orderNumber}</td>
                        <td className="p-3.5">{o.customerName}</td>
                        <td className="p-3.5">{o.paymentMethod}</td>
                        <td className="p-3.5 font-medium tabular-nums">{formatPkr(o.totalPkr)}</td>
                        <td className="p-3.5">
                          <select
                            value={o.paymentStatus}
                            onChange={(e) =>
                              void updateOrderPaymentStatus(
                                o.id,
                                e.target.value as PaymentStatus
                              )
                            }
                            className="border border-[#252525]/20 bg-white px-2.5 py-1.5"
                          >
                            {PAYMENT_STATUSES.map((ps) => (
                              <option key={ps} value={ps}>
                                {ps}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. COUPON MANAGEMENT (CREATE, EDIT, EXPIRY DATE, MIN ORDER, DISABLE) */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <form
                onSubmit={handleSaveCoupon}
                className="bg-white border border-[#EAE0D2] p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-medium text-[#252525]">
                    {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create Demo Coupon'}
                  </h2>
                  {editingCoupon && (
                    <button
                      type="button"
                      onClick={resetCouponForm}
                      className="text-xs text-[#66635D] hover:text-[#252525]"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                  <input
                    type="text"
                    required
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Code (e.g. EID20)"
                    className="border border-[#252525]/20 px-3 py-2 text-xs uppercase"
                  />
                  <select
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value as 'percent' | 'fixed')}
                    className="border border-[#252525]/20 bg-white px-3 py-2 text-xs"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed PKR</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={couponValue}
                    onChange={(e) => setCouponValue(e.target.value)}
                    placeholder="Discount Value"
                    className="border border-[#252525]/20 px-3 py-2 text-xs"
                  />
                  <input
                    type="number"
                    min={0}
                    value={couponMin}
                    onChange={(e) => setCouponMin(e.target.value)}
                    placeholder="Min Order PKR"
                    className="border border-[#252525]/20 px-3 py-2 text-xs"
                  />
                  <input
                    type="date"
                    value={couponExpiry}
                    onChange={(e) => setCouponExpiry(e.target.value)}
                    aria-label="Expiry Date"
                    className="border border-[#252525]/20 px-3 py-2 text-xs"
                  />
                  <button
                    type="submit"
                    className="bg-[#252525] px-4 py-2 text-xs font-medium uppercase tracking-wider text-white hover:bg-[#B76E79]"
                  >
                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                </div>

                <input
                  type="text"
                  value={couponDesc}
                  onChange={(e) => setCouponDesc(e.target.value)}
                  placeholder="Optional coupon description (e.g. Eid Celebration 20% Off)"
                  className="w-full border border-[#252525]/20 px-3 py-2 text-xs"
                />
              </form>

              <div className="bg-white border border-[#EAE0D2] divide-y divide-[#EAE0D2]">
                {coupons.map((c) => {
                  const expired = isCouponExpired(c.expiresAt);
                  return (
                    <div
                      key={c.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-semibold text-sm text-[#252525]">{c.code}</p>
                          {expired && (
                            <span className="border border-rose-300 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-rose-700">
                              Expired
                            </span>
                          )}
                        </div>
                        <p className="text-[#66635D] mt-0.5">
                          {c.description} · Min order {formatPkr(c.minOrderPkr)} · Expires{' '}
                          <span className="font-mono">{c.expiresAt}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCoupon(c);
                            setCouponCode(c.code);
                            setCouponDesc(c.description);
                            setCouponType(c.type);
                            setCouponValue(String(c.value));
                            setCouponMin(String(c.minOrderPkr));
                            setCouponExpiry(c.expiresAt);
                          }}
                          className="inline-flex items-center gap-1 border border-[#252525]/20 px-2.5 py-1.5 hover:border-[#B76E79]"
                        >
                          <Pencil className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleCouponActive(c.id)}
                          className={`border px-3 py-1.5 ${
                            c.active
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                              : 'border-[#252525]/20 text-[#66635D]'
                          }`}
                        >
                          {c.active ? 'Enabled' : 'Disabled'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteCoupon(c.id)}
                          className="border border-rose-200 px-2.5 py-1.5 text-rose-700 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 10. REVIEW MODERATION (SAMPLE DEMO VS VISITOR FEEDBACK) */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#EAE0D2] p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: 'all', label: `All Reviews (${reviews.length})` },
                      {
                        id: 'sample',
                        label: `Sample Demo Reviews (${reviews.filter((r) => r.isSampleDemo).length})`,
                      },
                      {
                        id: 'visitor',
                        label: `Visitor Feedback (${reviews.filter((r) => !r.isSampleDemo).length})`,
                      },
                      {
                        id: 'pending',
                        label: `Pending Approval (${reviews.filter((r) => !r.approved).length})`,
                      },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setReviewFilter(f.id)}
                      className={`border px-3 py-1.5 font-medium ${
                        reviewFilter === f.id
                          ? 'border-[#252525] bg-[#252525] text-white'
                          : 'border-[#EAE0D2] bg-[#FCFBF9] text-[#66635D] hover:border-[#B76E79]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <span className="text-[#66635D]">
                  Visitor submissions require Admin approval before public display.
                </span>
              </div>

              <div className="bg-white border border-[#EAE0D2] divide-y divide-[#EAE0D2]">
                {filteredReviews.map((r) => {
                  const prod = products.find((p) => p.id === r.productId);
                  return (
                    <div
                      key={r.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 text-xs"
                    >
                      <div className="max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              r.isSampleDemo
                                ? 'border-[#EAE0D2] bg-[#F6EFE6] text-[#8E4D57]'
                                : 'border-[#252525]/25 bg-white text-[#252525]'
                            }`}
                          >
                            {r.isSampleDemo ? 'Sample Demo Review' : 'Visitor Feedback'}
                          </span>
                          <span className="font-medium text-[#252525]">
                            {r.title} · {r.rating}/5 Stars ({prod?.name ?? 'Catalog Item'})
                          </span>
                        </div>
                        <p className="text-[#66635D]">{r.comment}</p>
                        <p className="text-[#66635D] mt-1">
                          By <strong className="text-[#252525]">{r.authorName}</strong> ({r.city}) ·{' '}
                          {r.createdAt}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => void toggleReviewApproval(r.id)}
                          className={`border px-3 py-1.5 font-medium ${
                            r.approved
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                              : 'border-amber-300 bg-amber-50 text-amber-800'
                          }`}
                        >
                          {r.approved ? 'Approved (Visible)' : 'Rejected / Pending'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteReview(r.id)}
                          className="border border-rose-200 px-2.5 py-1.5 text-rose-700 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
                {filteredReviews.length === 0 && (
                  <p className="p-6 text-xs text-[#66635D]">
                    No reviews match the selected filter.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 11. SALES ANALYTICS (DEMO DATA CHARTS) */}
          {activeTab === 'reports' && (
            <AdminAnalyticsPanel
              analytics={analytics}
              totalDemoRevenue={totalDemoRevenue}
              totalOrdersCount={orders.length}
              onExportCsv={handleExportCsv}
            />
          )}

          {/* 12. UPDATE ORDER STATUS */}
          {activeTab === 'order-status' && (
            <div className="bg-white border border-[#EAE0D2] divide-y divide-[#EAE0D2]">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 text-xs"
                >
                  <div>
                    <p className="font-mono font-semibold text-sm text-[#252525]">
                      {o.orderNumber} — {o.customerName}
                    </p>
                    <p className="text-[#66635D] mt-0.5">
                      {formatDateShort(o.createdAt)} · Current: <strong>{o.orderStatus}</strong> ·{' '}
                      {o.trackingNote}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={noteDrafts[o.id] ?? ''}
                      onChange={(e) =>
                        setNoteDrafts((prev) => ({ ...prev, [o.id]: e.target.value }))
                      }
                      placeholder="Tracking note (optional)"
                      className="border border-[#252525]/20 px-3 py-1.5 text-xs w-52"
                    />
                    <select
                      value={o.orderStatus}
                      onChange={(e) =>
                        void updateOrderStatus(
                          o.id,
                          e.target.value as OrderStatus,
                          noteDrafts[o.id] || undefined
                        )
                      }
                      className="border border-[#252525]/20 bg-white px-3 py-1.5 text-xs font-medium"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 13. WEBSITE SETTINGS & SECURITY ARCHITECTURE */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void updateSettings(settingsDraft);
                }}
                className="xl:col-span-7 bg-white border border-[#EAE0D2] p-6 space-y-5"
              >
                <h2 className="font-display text-2xl font-medium text-[#252525]">
                  Storefront Configuration
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#66635D] mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={settingsDraft.brandName}
                      onChange={(e) =>
                        setSettingsDraft((s) => ({ ...s, brandName: e.target.value }))
                      }
                      className="w-full border border-[#252525]/20 px-3.5 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#66635D] mb-1">Tagline</label>
                    <input
                      type="text"
                      value={settingsDraft.tagline}
                      onChange={(e) =>
                        setSettingsDraft((s) => ({ ...s, tagline: e.target.value }))
                      }
                      className="w-full border border-[#252525]/20 px-3.5 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#66635D] mb-1">
                      Standard Delivery (PKR)
                    </label>
                    <input
                      type="number"
                      value={settingsDraft.standardDeliveryFeePkr}
                      onChange={(e) =>
                        setSettingsDraft((s) => ({
                          ...s,
                          standardDeliveryFeePkr: Number(e.target.value) || 0,
                        }))
                      }
                      className="w-full border border-[#252525]/20 px-3.5 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#66635D] mb-1">
                      Express Delivery (PKR)
                    </label>
                    <input
                      type="number"
                      value={settingsDraft.expressDeliveryFeePkr}
                      onChange={(e) =>
                        setSettingsDraft((s) => ({
                          ...s,
                          expressDeliveryFeePkr: Number(e.target.value) || 0,
                        }))
                      }
                      className="w-full border border-[#252525]/20 px-3.5 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#66635D] mb-1">
                      Free Shipping Threshold (PKR)
                    </label>
                    <input
                      type="number"
                      value={settingsDraft.freeDeliveryThresholdPkr}
                      onChange={(e) =>
                        setSettingsDraft((s) => ({
                          ...s,
                          freeDeliveryThresholdPkr: Number(e.target.value) || 0,
                        }))
                      }
                      className="w-full border border-[#252525]/20 px-3.5 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#66635D] mb-1">Demo Contact Phone</label>
                    <input
                      type="text"
                      value={settingsDraft.contactPhone}
                      onChange={(e) =>
                        setSettingsDraft((s) => ({ ...s, contactPhone: e.target.value }))
                      }
                      className="w-full border border-[#252525]/20 px-3.5 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#66635D] mb-1">Demo Email</label>
                    <input
                      type="email"
                      value={settingsDraft.contactEmail}
                      onChange={(e) =>
                        setSettingsDraft((s) => ({ ...s, contactEmail: e.target.value }))
                      }
                      className="w-full border border-[#252525]/20 px-3.5 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#66635D] mb-1">Return Policy Summary</label>
                  <textarea
                    rows={2}
                    value={settingsDraft.returnPolicySummary}
                    onChange={(e) =>
                      setSettingsDraft((s) => ({ ...s, returnPolicySummary: e.target.value }))
                    }
                    className="w-full border border-[#252525]/20 px-3.5 py-2 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-[#252525] px-6 py-3 text-xs font-medium uppercase tracking-wider text-white hover:bg-[#B76E79]"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save Website Settings</span>
                </button>
              </form>

              {/* Backend Architecture & Security Panel */}
              <div className="xl:col-span-5 bg-white border border-[#EAE0D2] p-6 space-y-5 text-xs">
                <div className="flex items-center gap-2 text-[#8E4D57] font-semibold uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Backend & Database Security</span>
                </div>

                <div className="space-y-2.5">
                  {INTEGRATION_READINESS.map((mod) => (
                    <div key={mod.id} className="border border-[#EAE0D2] bg-[#FCFBF9] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-[#252525]">{mod.name}</span>
                        <span
                          className={`text-[10px] font-semibold uppercase ${
                            mod.mode === 'active-backend' ? 'text-emerald-700' : 'text-[#8E4D57]'
                          }`}
                        >
                          {mod.mode === 'active-backend' ? 'Active' : 'Blueprint'}
                        </span>
                      </div>
                      <p className="text-[#66635D] mt-1 leading-relaxed">{mod.description}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#EAE0D2] pt-4">
                  <p className="font-medium text-[#252525] mb-2">
                    8 Persistent Collections ({DATABASE_COLLECTIONS.join(', ')})
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowRulesModal((v) => !v)}
                    className="border border-[#B76E79]/50 bg-[#F6EFE6] px-3.5 py-2 font-medium text-[#8E4D57] hover:bg-[#B76E79] hover:text-white transition-colors"
                  >
                    {showRulesModal
                      ? 'Hide Reference Firebase Rules'
                      : 'View Reference Firestore & Storage Rules'}
                  </button>
                </div>

                {showRulesModal && (
                  <div className="space-y-3 border-t border-[#EAE0D2] pt-4">
                    <div>
                      <p className="font-mono font-semibold text-[#252525] mb-1">
                        firestore.rules (Reference Blueprint)
                      </p>
                      <pre className="max-h-48 overflow-auto bg-[#252525] p-3 text-[10px] text-[#F6EFE6] font-mono">
                        {REFERENCE_FIRESTORE_RULES}
                      </pre>
                    </div>
                    <div>
                      <p className="font-mono font-semibold text-[#252525] mb-1">
                        storage.rules (Reference Blueprint)
                      </p>
                      <pre className="max-h-36 overflow-auto bg-[#252525] p-3 text-[10px] text-[#F6EFE6] font-mono">
                        {REFERENCE_STORAGE_RULES}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Authorized Order Details Drawer */}
      {selectedOrder && (
        <OrderDetailsDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrderId(null)}
          onUpdateStatus={updateOrderStatus}
          onUpdatePayment={updateOrderPaymentStatus}
        />
      )}

      {/* Authorized Customer Details & Order History Drawer */}
      {selectedCustomerDetail && (
        <CustomerDetailsDrawer
          customer={selectedCustomerDetail.customer}
          orders={selectedCustomerDetail.orders}
          onClose={() => setSelectedCustomerDetail(null)}
          onInspectOrder={(order) => {
            setSelectedCustomerDetail(null);
            setSelectedOrderId(order.id);
          }}
        />
      )}
    </div>
  );
};
