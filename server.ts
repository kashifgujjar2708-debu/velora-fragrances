import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import http from 'http';
import path from 'path';
import express, { type Request, type Response } from 'express';
import {
  attachAuth,
  clearSessionCookie,
  createSessionToken,
  hashPassword,
  requireAdmin,
  requireAuth,
  setSessionCookie,
  verifyPassword,
  type AuthenticatedRequest,
} from './server/auth.ts';
import {
  computeSalesAnalytics,
  loadDatabase,
  resetDatabaseToDemoDefaults,
  saveDatabase,
  toCustomerAccount,
} from './server/db.ts';
import type {
  CategoryItem,
  CategorySlug,
  Coupon,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Product,
  ProductReview,
  SiteSettings,
} from './src/types/index.ts';
import {
  calculateDeliveryFee,
  isCouponExpired,
  isValidEmail,
  isValidPakistanPhone,
  slugify,
} from './src/utils/format.ts';

const PORT = Number(process.env.PORT) || 3000;
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');

const VALID_ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const VALID_PAYMENT_STATUSES: PaymentStatus[] = ['Pending', 'Paid (Demo)', 'Failed', 'Refunded'];

const VALID_PAYMENT_METHODS: PaymentMethod[] = [
  'Cash on Delivery',
  'JazzCash (Demo)',
  'EasyPaisa (Demo)',
  'Debit / Credit Card (Demo)',
  'Demo Online Payment',
  'Bank Transfer (Demo)',
];

function formatDisplayTimestamp(date = new Date()): string {
  return date.toLocaleString('en-PK', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function evaluateCartWithServerCatalog(
  db: ReturnType<typeof loadDatabase>,
  items: { productId: string; sizeMl: string; quantity: number }[]
) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: 'Your shopping bag is empty.' };
  }

  const snapshots: Order['items'] = [];
  for (const item of items) {
    const qty = Math.floor(Number(item.quantity));
    if (!item.productId || !Number.isFinite(qty) || qty < 1 || qty > 50) {
      return { error: 'Invalid item quantity requested.' };
    }
    const product = db.products.find((p) => p.id === item.productId);
    if (!product || product.active === false) {
      return { error: 'One or more selected fragrances are unavailable or inactive.' };
    }
    const sizeOpt = product.sizes.find((s) => s.ml === item.sizeMl) ?? product.sizes[0];
    if (!sizeOpt) {
      return { error: `Volume option not found for ${product.name}.` };
    }
    if (sizeOpt.stock < qty) {
      return {
        error: `Insufficient stock for ${product.name} (${sizeOpt.ml}). Available: ${sizeOpt.stock}.`,
      };
    }

    snapshots.push({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      sizeMl: sizeOpt.ml,
      quantity: qty,
      unitPricePkr: sizeOpt.pricePkr,
      image: product.images[0] ?? '',
    });
  }

  const subtotalPkr = snapshots.reduce((sum, s) => sum + s.unitPricePkr * s.quantity, 0);
  return { snapshots, subtotalPkr };
}

function evaluateCouponForSubtotal(
  coupons: Coupon[],
  code: string | undefined,
  subtotalPkr: number
): { ok: boolean; discountPkr: number; coupon?: Coupon; message: string } {
  const clean = (code ?? '').trim().toUpperCase();
  if (!clean) {
    return { ok: true, discountPkr: 0, message: '' };
  }
  const found = coupons.find((c) => c.code.toUpperCase() === clean);
  if (!found) {
    return { ok: false, discountPkr: 0, message: `Coupon "${clean}" was not found.` };
  }
  if (!found.active) {
    return { ok: false, discountPkr: 0, message: `Coupon "${clean}" is currently disabled.` };
  }
  if (isCouponExpired(found.expiresAt)) {
    return { ok: false, discountPkr: 0, message: `Coupon "${clean}" expired on ${found.expiresAt}.` };
  }
  if (subtotalPkr < found.minOrderPkr) {
    return {
      ok: false,
      discountPkr: 0,
      message: `Requires minimum subtotal of Rs. ${found.minOrderPkr.toLocaleString('en-PK')}.`,
    };
  }
  const discountPkr =
    found.type === 'percent'
      ? Math.round((subtotalPkr * Math.min(90, Math.max(0, found.value))) / 100)
      : Math.min(Math.max(0, found.value), subtotalPkr);
  return {
    ok: true,
    discountPkr,
    coupon: found,
    message: `Applied ${found.code}: ${found.description}`,
  };
}

export async function createApp(httpServer?: http.Server) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '6mb' }));
  app.use(attachAuth);

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));

  // Initialize DB at startup
  loadDatabase();

  // --- HEALTH ---
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'velora-fragrances-api', mode: 'demo-portfolio' });
  });

  // --- AUTHENTICATION ---
  app.get('/api/auth/me', (req: AuthenticatedRequest, res: Response) => {
    if (!req.auth) {
      res.json({ user: null });
      return;
    }
    const db = loadDatabase();
    const user = db.users.find((u) => u.id === req.auth?.sub);
    if (!user) {
      clearSessionCookie(res);
      res.json({ user: null });
      return;
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        customer: user.role === 'customer' ? toCustomerAccount(user) : undefined,
      },
    });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    const db = loadDatabase();
    const user = db.users.find((u) => u.email.toLowerCase() === email);
    if (!user || !verifyPassword(password, user.passwordHash, user.passwordSalt)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }
    if (user.role === 'admin') {
      res.status(403).json({ error: 'Please sign in via the restricted Admin Portal.' });
      return;
    }
    const token = createSessionToken({ id: user.id, email: user.email, role: user.role });
    setSessionCookie(res, token);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        customer: toCustomerAccount(user),
      },
    });
  });

  app.post('/api/auth/demo-customer', (req: Request, res: Response) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const db = loadDatabase();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email && u.role === 'customer' && u.isDemoAccount
    );
    if (!user) {
      res.status(404).json({ error: 'Sample customer profile not found.' });
      return;
    }
    const token = createSessionToken({ id: user.id, email: user.email, role: 'customer' });
    setSessionCookie(res, token);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: 'customer',
        customer: toCustomerAccount(user),
      },
    });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const fullName = String(req.body?.fullName ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const phone = String(req.body?.phone ?? '').trim() || '03000000000';
    const city = String(req.body?.city ?? '').trim() || 'Lahore';
    const address = String(req.body?.address ?? '').trim() || 'Lahore, Pakistan';

    if (!fullName || fullName.length < 2) {
      res.status(400).json({ error: 'Full name is required.' });
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Valid email address is required.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters.' });
      return;
    }

    const db = loadDatabase();
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
      return;
    }

    const now = new Date().toISOString();
    const creds = hashPassword(password);
    const createdUser = {
      id: `cust-${Date.now()}`,
      email,
      fullName,
      role: 'customer' as const, // Never trust client-supplied role
      passwordHash: creds.hash,
      passwordSalt: creds.salt,
      phone,
      city,
      address,
      joinedAt: now.slice(0, 10),
      updatedAt: now,
      isDemoAccount: true,
    };

    db.users.unshift(createdUser);
    saveDatabase(db);

    const token = createSessionToken({ id: createdUser.id, email: createdUser.email, role: 'customer' });
    setSessionCookie(res, token);
    res.status(201).json({
      token,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        fullName: createdUser.fullName,
        role: 'customer',
        customer: toCustomerAccount(createdUser),
      },
    });
  });

  app.post('/api/auth/admin/login', (req: Request, res: Response) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    if (!email || !password) {
      res.status(400).json({ error: 'Admin email and password are required.' });
      return;
    }
    const db = loadDatabase();
    const user = db.users.find((u) => u.email.toLowerCase() === email);
    if (!user || !verifyPassword(password, user.passwordHash, user.passwordSalt)) {
      res.status(401).json({ error: 'Invalid administrator credentials.' });
      return;
    }
    if (user.role !== 'admin') {
      res.status(403).json({ error: 'Access denied: customer accounts cannot access Admin Portal.' });
      return;
    }
    const token = createSessionToken({ id: user.id, email: user.email, role: 'admin' });
    setSessionCookie(res, token);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: 'admin',
      },
    });
  });

  app.post('/api/auth/logout', (_req: Request, res: Response) => {
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  // --- PUBLIC STOREFRONT ENDPOINTS ---
  app.get('/api/storefront', (_req: Request, res: Response) => {
    const db = loadDatabase();
    const activeProducts = db.products.filter((p) => p.active !== false);
    const visibleCategories = db.categories.filter((c) => c.visible !== false);
    const approvedReviews = db.reviews.filter((r) => r.approved);
    const publicCoupons = db.coupons
      .filter((c) => c.active && !isCouponExpired(c.expiresAt))
      .map((c) => ({
        id: c.id,
        code: c.code,
        description: c.description,
        type: c.type,
        value: c.value,
        minOrderPkr: c.minOrderPkr,
        active: c.active,
        expiresAt: c.expiresAt,
      }));
    const demoCustomerProfiles = db.users
      .filter((u) => u.role === 'customer' && u.isDemoAccount)
      .slice(0, 3)
      .map((u) => ({ id: u.id, fullName: u.fullName, email: u.email }));

    res.json({
      products: activeProducts,
      categories: visibleCategories,
      reviews: approvedReviews,
      coupons: publicCoupons,
      settings: db.settings,
      demoCustomerProfiles,
      sampleOrderNumbers: db.orders.slice(0, 4).map((o) => o.orderNumber),
    });
  });

  app.post('/api/coupons/validate', (req: Request, res: Response) => {
    const db = loadDatabase();
    const code = String(req.body?.code ?? '');
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const evalCart = evaluateCartWithServerCatalog(db, items);
    if ('error' in evalCart) {
      res.status(400).json({ ok: false, message: evalCart.error });
      return;
    }
    const result = evaluateCouponForSubtotal(db.coupons, code, evalCart.subtotalPkr);
    if (!result.ok) {
      res.status(400).json({ ok: false, message: result.message, discountPkr: 0 });
      return;
    }
    res.json({
      ok: true,
      code: result.coupon?.code ?? '',
      discountPkr: result.discountPkr,
      subtotalPkr: evalCart.subtotalPkr,
      message: result.message,
    });
  });

  app.post('/api/orders', (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const customerName = String(req.body?.customerName ?? '').trim();
    const customerEmail = String(req.body?.customerEmail ?? '').trim().toLowerCase();
    const customerPhone = String(req.body?.customerPhone ?? '').trim();
    const shippingAddress = String(req.body?.shippingAddress ?? '').trim();
    const city = String(req.body?.city ?? '').trim();
    const postalCode = String(req.body?.postalCode ?? '').trim();
    const deliveryMethod = req.body?.deliveryMethod === 'express' ? 'express' : 'standard';
    const paymentMethod = VALID_PAYMENT_METHODS.includes(req.body?.paymentMethod)
      ? (req.body.paymentMethod as PaymentMethod)
      : 'Cash on Delivery';
    const couponCode = req.body?.couponCode ? String(req.body.couponCode).trim() : undefined;
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (customerName.length < 2) {
      res.status(400).json({ error: 'Recipient full name is required.' });
      return;
    }
    if (!isValidEmail(customerEmail)) {
      res.status(400).json({ error: 'Valid email address is required.' });
      return;
    }
    if (!isValidPakistanPhone(customerPhone)) {
      res.status(400).json({ error: 'Valid Pakistani mobile number is required.' });
      return;
    }
    if (!shippingAddress || !city || !postalCode) {
      res.status(400).json({ error: 'Complete shipping address, city, and postal code are required.' });
      return;
    }

    // Never trust client-sent prices, discounts, or totals — compute strictly from DB!
    const evalCart = evaluateCartWithServerCatalog(db, items);
    if ('error' in evalCart) {
      res.status(400).json({ error: evalCart.error });
      return;
    }

    const couponResult = evaluateCouponForSubtotal(db.coupons, couponCode, evalCart.subtotalPkr);
    if (couponCode && !couponResult.ok) {
      res.status(400).json({ error: couponResult.message });
      return;
    }

    const discountPkr = couponResult.discountPkr;
    const afterDiscount = Math.max(0, evalCart.subtotalPkr - discountPkr);
    const deliveryFeePkr = calculateDeliveryFee(afterDiscount, deliveryMethod, db.settings);
    const totalPkr = afterDiscount + deliveryFeePkr;

    // Decrement stock in products & synced inventory
    for (const snap of evalCart.snapshots) {
      const prod = db.products.find((p) => p.id === snap.productId);
      if (prod) {
        prod.sizes = prod.sizes.map((s) =>
          s.ml === snap.sizeMl ? { ...s, stock: Math.max(0, s.stock - snap.quantity) } : s
        );
        prod.updatedAt = new Date().toISOString();
      }
    }

    const nextSeq = 1042 + db.orders.length;
    const orderNumber = `VLR-2026-${nextSeq}`;
    const nowIso = new Date().toISOString();
    const displayTimestamp = formatDisplayTimestamp();

    // Never fake payment gateway verification: simulated orders start Pending
    const newOrder: Order = {
      id: `ord-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      orderNumber,
      customerId: req.auth?.role === 'customer' ? req.auth.sub : undefined,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      postalCode,
      items: evalCart.snapshots,
      subtotalPkr: evalCart.subtotalPkr,
      discountPkr,
      couponCode: couponResult.coupon?.code,
      deliveryMethod,
      deliveryFeePkr,
      totalPkr,
      paymentMethod,
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      trackingNote:
        paymentMethod === 'Cash on Delivery'
          ? 'Demo COD order recorded — awaiting confirmation.'
          : `Simulated ${paymentMethod} recorded (no live payment verification).`,
      timeline: [
        {
          status: 'Pending',
          timestamp: displayTimestamp,
          note: 'Demo order created and verified against server catalog pricing.',
        },
      ],
      createdAt: nowIso,
      updatedAt: nowIso,
      isSampleDemo: true,
    };

    db.orders.unshift(newOrder);
    saveDatabase(db);

    res.status(201).json({ order: newOrder });
  });

  app.get('/api/orders/track/:orderNumber', (req: Request, res: Response) => {
    const code = String(req.params.orderNumber ?? '').trim().toUpperCase();
    const db = loadDatabase();
    const order = db.orders.find((o) => o.orderNumber.toUpperCase() === code);
    if (!order) {
      res.status(404).json({ error: 'Order number not found.' });
      return;
    }
    // Strip street address, email, and phone from public tracking endpoint to protect customer PII
    res.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        city: order.city,
        items: order.items,
        subtotalPkr: order.subtotalPkr,
        discountPkr: order.discountPkr,
        couponCode: order.couponCode,
        deliveryMethod: order.deliveryMethod,
        deliveryFeePkr: order.deliveryFeePkr,
        totalPkr: order.totalPkr,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        trackingNote: order.trackingNote,
        timeline: order.timeline,
        createdAt: order.createdAt,
        isSampleDemo: order.isSampleDemo,
      },
    });
  });

  app.get('/api/customer/orders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const email = req.auth?.email.toLowerCase();
    const sub = req.auth?.sub;
    const customerOrders = db.orders.filter(
      (o) => o.customerId === sub || o.customerEmail.toLowerCase() === email
    );
    res.json({ orders: customerOrders });
  });

  app.post('/api/reviews', (req: Request, res: Response) => {
    const productId = String(req.body?.productId ?? '').trim();
    const authorName = String(req.body?.authorName ?? '').trim();
    const city = String(req.body?.city ?? '').trim() || 'Pakistan';
    const title = String(req.body?.title ?? '').trim() || 'Fragrance Impression';
    const comment = String(req.body?.comment ?? '').trim();
    const rating = Math.min(5, Math.max(1, Math.round(Number(req.body?.rating) || 5)));

    if (!productId || authorName.length < 2 || comment.length < 5) {
      res.status(400).json({ error: 'Product, your name, and review comment are required.' });
      return;
    }

    const db = loadDatabase();
    const product = db.products.find((p) => p.id === productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const now = new Date().toISOString();
    const review: ProductReview = {
      id: `rev-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      productId,
      authorName,
      city,
      rating,
      title,
      comment,
      createdAt: now.slice(0, 10),
      updatedAt: now,
      approved: false, // Visitor feedback awaits Admin moderation
      isSampleDemo: false, // Explicitly distinguished from seeded sample reviews
    };

    db.reviews.unshift(review);
    saveDatabase(db);
    res.status(201).json({
      review,
      message: 'Thank you — your feedback has been submitted for administrator approval.',
    });
  });

  app.post('/api/newsletter', (req: Request, res: Response) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    if (!isValidEmail(email)) {
      res.status(400).json({ ok: false, message: 'Please enter a valid email address.' });
      return;
    }
    const db = loadDatabase();
    if (db.newsletterEmails.includes(email)) {
      res.json({ ok: true, message: 'This email is already on our demo journal list.' });
      return;
    }
    db.newsletterEmails.push(email);
    saveDatabase(db);
    res.status(201).json({ ok: true, message: 'Subscribed to Velora Atelier dispatches (Demo).' });
  });

  app.post('/api/contact', (req: Request, res: Response) => {
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim();
    const phone = String(req.body?.phone ?? '').trim();
    const subject = String(req.body?.subject ?? '').trim() || 'General Inquiry';
    const message = String(req.body?.message ?? '').trim();
    if (!name || !isValidEmail(email) || !message) {
      res.status(400).json({ error: 'Name, valid email, and message are required.' });
      return;
    }
    const db = loadDatabase();
    const entry = {
      id: `msg-${Date.now()}`,
      name,
      email,
      phone,
      subject,
      message,
      createdAt: new Date().toISOString(),
    };
    db.contactMessages.unshift(entry);
    saveDatabase(db);
    res.status(201).json({ ok: true, entry });
  });

  // --- ADMIN ROUTES (STRICTLY PROTECTED BY requireAdmin) ---
  app.get('/api/admin/bootstrap', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const customers = db.users
      .filter((u) => u.role === 'customer')
      .map(toCustomerAccount);
    res.json({
      products: db.products,
      categories: db.categories,
      orders: db.orders,
      coupons: db.coupons,
      reviews: db.reviews,
      customers,
      inventory: db.inventory,
      settings: db.settings,
      contactMessages: db.contactMessages,
      analytics: computeSalesAnalytics(db),
    });
  });

  app.post('/api/admin/upload', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const dataUrl = String(req.body?.dataUrl ?? '');
    const match = /^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!match) {
      res.status(400).json({ error: 'Invalid image format. Upload PNG, JPG, or WebP.' });
      return;
    }
    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const buf = Buffer.from(match[2], 'base64');
    if (buf.byteLength > 2.5 * 1024 * 1024) {
      res.status(400).json({ error: 'Image size exceeds 2.5 MB limit.' });
      return;
    }
    const filename = `velora-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), buf);
    res.status(201).json({ url: `/uploads/${filename}` });
  });

  app.post('/api/admin/products', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const body = req.body as Partial<Product>;
    const name = String(body.name ?? '').trim();
    const brand = String(body.brand ?? '').trim() || 'Velora Atelier';
    if (!name) {
      res.status(400).json({ error: 'Product name is required.' });
      return;
    }
    const category = db.categories.find((c) => c.slug === body.categorySlug) ?? db.categories[0];
    const sizes =
      Array.isArray(body.sizes) && body.sizes.length > 0
        ? body.sizes.map((s) => ({
            ml: String(s.ml || '100ml').trim(),
            pricePkr: Math.max(100, Number(s.pricePkr) || 5000),
            originalPricePkr: s.originalPricePkr ? Number(s.originalPricePkr) : undefined,
            stock: Math.max(0, Math.floor(Number(s.stock) || 0)),
          }))
        : [{ ml: '100ml', pricePkr: Math.max(100, Number(body.pricePkr) || 12500), stock: 15 }];

    const now = new Date().toISOString();
    const created: Product = {
      id: `prod-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      slug: `${slugify(name) || 'fragrance'}-${Date.now().toString().slice(-4)}`,
      name,
      brand,
      category: category?.name ?? 'Luxury Perfumes',
      categorySlug: (category?.slug ?? 'luxury-perfumes') as CategorySlug,
      secondaryCategories: Array.isArray(body.secondaryCategories) ? body.secondaryCategories : undefined,
      gender: body.gender === 'Men' || body.gender === 'Women' ? body.gender : 'Unisex',
      concentration: String(body.concentration ?? 'Eau de Parfum').trim(),
      pricePkr: Math.max(100, Number(body.pricePkr) || sizes[0].pricePkr),
      originalPricePkr: body.originalPricePkr ? Number(body.originalPricePkr) : undefined,
      description: String(body.description ?? '').trim() || 'Sample fragrance entry.',
      notes: body.notes ?? {
        top: ['Bergamot', 'Saffron'],
        heart: ['Damask Rose', 'Jasmine'],
        base: ['Aged Oud', 'Ambergris Accord'],
      },
      longevity: String(body.longevity ?? '10–12 Hours'),
      sillage: String(body.sillage ?? 'Moderate to Strong'),
      sizes,
      images:
        Array.isArray(body.images) && body.images.length > 0
          ? body.images
          : ['/src/assets/images/perfume_french_amber_1794933708739.jpg'],
      rating: Number(body.rating) || 4.8,
      reviewCount: Number(body.reviewCount) || 0,
      featured: Boolean(body.featured),
      active: body.active !== false,
      createdAt: now,
      updatedAt: now,
      isSampleDemo: true,
    };

    db.products.unshift(created);
    saveDatabase(db);
    res.status(201).json({ product: created, inventory: db.inventory });
  });

  app.patch('/api/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const idx = db.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    const existing = db.products[idx];
    const body = req.body as Partial<Product>;
    const cat = body.categorySlug
      ? db.categories.find((c) => c.slug === body.categorySlug)
      : undefined;

    const sizes =
      Array.isArray(body.sizes) && body.sizes.length > 0
        ? body.sizes.map((s) => ({
            ml: String(s.ml || '100ml').trim(),
            pricePkr: Math.max(100, Number(s.pricePkr) || existing.pricePkr),
            originalPricePkr: s.originalPricePkr ? Number(s.originalPricePkr) : undefined,
            stock: Math.max(0, Math.floor(Number(s.stock) || 0)),
          }))
        : existing.sizes;

    const updated: Product = {
      ...existing,
      name: body.name !== undefined ? String(body.name).trim() : existing.name,
      brand: body.brand !== undefined ? String(body.brand).trim() : existing.brand,
      category: cat ? cat.name : body.category ?? existing.category,
      categorySlug: cat ? cat.slug : body.categorySlug ?? existing.categorySlug,
      gender: body.gender ?? existing.gender,
      concentration: body.concentration ?? existing.concentration,
      pricePkr:
        body.pricePkr !== undefined ? Math.max(100, Number(body.pricePkr) || existing.pricePkr) : existing.pricePkr,
      originalPricePkr:
        body.originalPricePkr === undefined
          ? existing.originalPricePkr
          : body.originalPricePkr
          ? Number(body.originalPricePkr)
          : undefined,
      description: body.description !== undefined ? String(body.description).trim() : existing.description,
      sizes,
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : existing.images,
      featured: body.featured !== undefined ? Boolean(body.featured) : existing.featured,
      active: body.active !== undefined ? Boolean(body.active) : existing.active !== false,
      updatedAt: new Date().toISOString(),
    };

    db.products[idx] = updated;
    saveDatabase(db);
    res.json({ product: updated, inventory: db.inventory });
  });

  app.patch('/api/admin/products/:id/price', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const prod = db.products.find((p) => p.id === req.params.id);
    if (!prod) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    const pricePkr = Math.max(100, Number(req.body?.pricePkr) || prod.pricePkr);
    const originalPricePkr = req.body?.originalPricePkr ? Number(req.body.originalPricePkr) : undefined;
    prod.pricePkr = pricePkr;
    prod.originalPricePkr = originalPricePkr;
    prod.sizes = prod.sizes.map((s, idx) =>
      idx === prod.sizes.length - 1 ? { ...s, pricePkr } : s
    );
    prod.updatedAt = new Date().toISOString();
    saveDatabase(db);
    res.json({ product: prod });
  });

  app.delete('/api/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const before = db.products.length;
    db.products = db.products.filter((p) => p.id !== req.params.id);
    if (db.products.length === before) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    saveDatabase(db);
    res.json({ ok: true, inventory: db.inventory });
  });

  app.post('/api/admin/categories', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const name = String(req.body?.name ?? '').trim();
    if (!name) {
      res.status(400).json({ error: 'Category name is required.' });
      return;
    }
    const slug = (slugify(req.body?.slug || name) || `category-${Date.now()}`) as CategorySlug;
    if (db.categories.some((c) => c.slug === slug)) {
      res.status(409).json({ error: 'A category with a similar slug already exists.' });
      return;
    }
    const now = new Date().toISOString();
    const created: CategoryItem = {
      id: `cat-${Date.now()}`,
      slug,
      name,
      subtitle: String(req.body?.subtitle ?? '').trim() || 'Curated Selection',
      description:
        String(req.body?.description ?? '').trim() ||
        'Custom category added via Admin Dashboard.',
      image:
        String(req.body?.image ?? '').trim() ||
        '/src/assets/images/perfume_french_amber_1794933708739.jpg',
      visible: req.body?.visible !== false,
      createdAt: now,
      updatedAt: now,
    };
    db.categories.push(created);
    saveDatabase(db);
    res.status(201).json({ category: created });
  });

  app.patch('/api/admin/categories/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const idx = db.categories.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Category not found.' });
      return;
    }
    const existing = db.categories[idx];
    const body = req.body as Partial<CategoryItem>;
    const updated: CategoryItem = {
      ...existing,
      name: body.name !== undefined ? String(body.name).trim() || existing.name : existing.name,
      subtitle: body.subtitle !== undefined ? String(body.subtitle).trim() : existing.subtitle,
      description:
        body.description !== undefined ? String(body.description).trim() : existing.description,
      image: body.image !== undefined ? String(body.image).trim() || existing.image : existing.image,
      visible: body.visible !== undefined ? Boolean(body.visible) : existing.visible,
      updatedAt: new Date().toISOString(),
    };
    db.categories[idx] = updated;
    // Sync category display name on products referencing this slug
    db.products.forEach((p) => {
      if (p.categorySlug === updated.slug) {
        p.category = updated.name;
      }
    });
    saveDatabase(db);
    res.json({ category: updated });
  });

  app.delete('/api/admin/categories/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const target = db.categories.find((c) => c.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Category not found.' });
      return;
    }
    const assignedCount = db.products.filter((p) => p.categorySlug === target.slug).length;
    if (assignedCount > 0) {
      res.status(400).json({
        error: `Cannot delete "${target.name}" while ${assignedCount} product(s) still belong to it. Reassign those products first.`,
      });
      return;
    }
    db.categories = db.categories.filter((c) => c.id !== target.id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  app.patch('/api/admin/inventory', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const productId = String(req.body?.productId ?? '').trim();
    const sizeMl = String(req.body?.sizeMl ?? '').trim();
    const stock = Math.max(0, Math.floor(Number(req.body?.stock) || 0));

    const db = loadDatabase();
    const prod = db.products.find((p) => p.id === productId);
    if (!prod) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    prod.sizes = prod.sizes.map((s) => (s.ml === sizeMl ? { ...s, stock } : s));
    prod.updatedAt = new Date().toISOString();
    saveDatabase(db);
    res.json({ product: prod, inventory: db.inventory });
  });

  app.patch('/api/admin/orders/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const status = req.body?.status as OrderStatus;
    const trackingNote = req.body?.trackingNote ? String(req.body.trackingNote).trim() : undefined;
    if (!VALID_ORDER_STATUSES.includes(status)) {
      res.status(400).json({ error: 'Invalid order status.' });
      return;
    }
    const db = loadDatabase();
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const wasCancelled = order.orderStatus === 'Cancelled';
    if (status === 'Cancelled' && !wasCancelled) {
      // Restore stock when cancelling a demo order
      for (const item of order.items) {
        const prod = db.products.find((p) => p.id === item.productId);
        if (prod) {
          prod.sizes = prod.sizes.map((s) =>
            s.ml === item.sizeMl ? { ...s, stock: s.stock + item.quantity } : s
          );
        }
      }
    }

    const nowIso = new Date().toISOString();
    order.orderStatus = status;
    order.trackingNote = trackingNote ?? (status === 'Cancelled' ? 'Demo order cancelled by Admin.' : order.trackingNote);
    order.updatedAt = nowIso;
    order.timeline.push({
      status,
      timestamp: formatDisplayTimestamp(),
      note: trackingNote || `Status updated to ${status} by Admin`,
    });

    saveDatabase(db);
    res.json({
      order,
      analytics: computeSalesAnalytics(db),
      inventory: db.inventory,
    });
  });

  app.patch('/api/admin/orders/:id/payment', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const paymentStatus = req.body?.paymentStatus as PaymentStatus;
    if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      res.status(400).json({ error: 'Invalid payment status.' });
      return;
    }
    const db = loadDatabase();
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }
    order.paymentStatus = paymentStatus;
    order.updatedAt = new Date().toISOString();
    saveDatabase(db);
    res.json({ order });
  });

  app.get('/api/admin/customers/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const user = db.users.find((u) => u.id === req.params.id && u.role === 'customer');
    if (!user) {
      res.status(404).json({ error: 'Customer not found.' });
      return;
    }
    const orders = db.orders.filter(
      (o) => o.customerId === user.id || o.customerEmail.toLowerCase() === user.email.toLowerCase()
    );
    res.json({ customer: toCustomerAccount(user), orders });
  });

  app.post('/api/admin/coupons', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const code = String(req.body?.code ?? '').trim().toUpperCase();
    if (!code) {
      res.status(400).json({ error: 'Coupon code is required.' });
      return;
    }
    if (db.coupons.some((c) => c.code.toUpperCase() === code)) {
      res.status(409).json({ error: `Coupon code "${code}" already exists.` });
      return;
    }
    const type = req.body?.type === 'fixed' ? 'fixed' : 'percent';
    const value = Math.max(1, Number(req.body?.value) || 10);
    const cappedValue = type === 'percent' ? Math.min(90, value) : value;
    const minOrderPkr = Math.max(0, Number(req.body?.minOrderPkr) || 0);
    const expiresAt = String(req.body?.expiresAt ?? '2027-12-31').trim();
    const now = new Date().toISOString();

    const created: Coupon = {
      id: `coup-${Date.now()}`,
      code,
      description:
        String(req.body?.description ?? '').trim() ||
        (type === 'percent'
          ? `${cappedValue}% Demo Discount`
          : `Flat Rs. ${cappedValue} Demo Discount`),
      type,
      value: cappedValue,
      minOrderPkr,
      active: req.body?.active !== false,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    };
    db.coupons.unshift(created);
    saveDatabase(db);
    res.status(201).json({ coupon: created });
  });

  app.patch('/api/admin/coupons/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const idx = db.coupons.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Coupon not found.' });
      return;
    }
    const existing = db.coupons[idx];
    const body = req.body as Partial<Coupon>;
    const type = body.type === 'fixed' ? 'fixed' : body.type === 'percent' ? 'percent' : existing.type;
    const rawVal = body.value !== undefined ? Math.max(1, Number(body.value) || 1) : existing.value;
    const value = type === 'percent' ? Math.min(90, rawVal) : rawVal;

    const updated: Coupon = {
      ...existing,
      code: body.code !== undefined ? String(body.code).trim().toUpperCase() || existing.code : existing.code,
      description: body.description !== undefined ? String(body.description).trim() : existing.description,
      type,
      value,
      minOrderPkr:
        body.minOrderPkr !== undefined ? Math.max(0, Number(body.minOrderPkr) || 0) : existing.minOrderPkr,
      active: body.active !== undefined ? Boolean(body.active) : existing.active,
      expiresAt: body.expiresAt !== undefined ? String(body.expiresAt).trim() : existing.expiresAt,
      updatedAt: new Date().toISOString(),
    };

    db.coupons[idx] = updated;
    saveDatabase(db);
    res.json({ coupon: updated });
  });

  app.delete('/api/admin/coupons/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    db.coupons = db.coupons.filter((c) => c.id !== req.params.id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  app.patch('/api/admin/reviews/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const rev = db.reviews.find((r) => r.id === req.params.id);
    if (!rev) {
      res.status(404).json({ error: 'Review not found.' });
      return;
    }
    rev.approved = req.body?.approved !== undefined ? Boolean(req.body.approved) : !rev.approved;
    rev.updatedAt = new Date().toISOString();
    saveDatabase(db);
    res.json({ review: rev });
  });

  app.delete('/api/admin/reviews/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    db.reviews = db.reviews.filter((r) => r.id !== req.params.id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  app.put('/api/admin/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const body = req.body as Partial<SiteSettings>;
    db.settings = {
      ...db.settings,
      ...body,
      standardDeliveryFeePkr: Math.max(0, Number(body.standardDeliveryFeePkr ?? db.settings.standardDeliveryFeePkr)),
      expressDeliveryFeePkr: Math.max(0, Number(body.expressDeliveryFeePkr ?? db.settings.expressDeliveryFeePkr)),
      freeDeliveryThresholdPkr: Math.max(0, Number(body.freeDeliveryThresholdPkr ?? db.settings.freeDeliveryThresholdPkr)),
      updatedAt: new Date().toISOString(),
    };
    saveDatabase(db);
    res.json({ settings: db.settings });
  });

  app.post('/api/admin/reset-demo', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
    const reset = resetDatabaseToDemoDefaults();
    res.json({
      products: reset.products,
      categories: reset.categories,
      orders: reset.orders,
      coupons: reset.coupons,
      reviews: reset.reviews,
      customers: reset.users.filter((u) => u.role === 'customer').map(toCustomerAccount),
      inventory: reset.inventory,
      settings: reset.settings,
      analytics: computeSalesAnalytics(reset),
    });
  });

  // Catch unhandled /api/* paths cleanly as JSON 404
  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  // --- SEO TECHNICAL FILES: robots.txt & dynamic sitemap.xml ---
  const resolvePublicOrigin = (req: Request): string => {
    const configured = process.env.APP_URL?.trim().replace(/\/+$/, '');
    if (configured && /^https?:\/\//i.test(configured) && !configured.includes('MY_APP_URL')) {
      return configured;
    }
    const proto = (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim() || req.protocol;
    const host = req.get('host') || `localhost:${PORT}`;
    return `${proto}://${host}`;
  };

  app.get('/robots.txt', (req: Request, res: Response) => {
    const origin = resolvePublicOrigin(req);
    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /api/',
        'Disallow: /cart',
        'Disallow: /checkout',
        'Disallow: /account',
        'Disallow: /wishlist',
        'Disallow: /track-order',
        '',
        `Sitemap: ${origin}/sitemap.xml`,
        '',
      ].join('\n')
    );
  });

  app.get('/sitemap.xml', (req: Request, res: Response) => {
    const origin = resolvePublicOrigin(req);
    const db = loadDatabase();
    const today = new Date().toISOString().slice(0, 10);

    const staticRoutes = [
      { path: '/', changefreq: 'weekly', priority: '1.0' },
      { path: '/shop', changefreq: 'daily', priority: '0.9' },
      { path: '/collections/mens', changefreq: 'weekly', priority: '0.8' },
      { path: '/collections/womens', changefreq: 'weekly', priority: '0.8' },
      { path: '/collections/unisex', changefreq: 'weekly', priority: '0.8' },
      { path: '/collections/oud-arabic', changefreq: 'weekly', priority: '0.8' },
      { path: '/collections/french', changefreq: 'weekly', priority: '0.8' },
      { path: '/collections/attar-oils', changefreq: 'weekly', priority: '0.8' },
      { path: '/collections/gift-sets', changefreq: 'weekly', priority: '0.8' },
      { path: '/about', changefreq: 'monthly', priority: '0.6' },
      { path: '/brand-identity', changefreq: 'monthly', priority: '0.6' },
      { path: '/faq', changefreq: 'monthly', priority: '0.6' },
      { path: '/contact', changefreq: 'monthly', priority: '0.6' },
      { path: '/legal', changefreq: 'yearly', priority: '0.4' },
    ];

    const escapeXml = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const urls = [
      ...staticRoutes.map(
        (r) =>
          `  <url>\n    <loc>${escapeXml(`${origin}${r.path}`)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
      ),
      ...db.products
        .filter((p) => p.active !== false)
        .map((p) => {
          const lastmod = (p.updatedAt || p.createdAt || today).slice(0, 10);
          return `  <url>\n    <loc>${escapeXml(`${origin}/product/${p.slug}`)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
        }),
    ];

    res
      .type('application/xml')
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
      );
  });

  // Vite middleware in dev OR static build in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        ...(httpServer ? { ws: { server: httpServer } } : {}),
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(
      express.static(distDir, {
        maxAge: '7d',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      })
    );
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  return app;
}

const isMainEntry =
  process.argv[1] &&
  (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'));

if (isMainEntry) {
  const httpServer = http.createServer();
  createApp(httpServer)
    .then((app) => {
      httpServer.on('request', app);
      httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`Velora Fragrances server listening on http://0.0.0.0:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start Velora server:', err);
      process.exit(1);
    });
}
