import fs from 'fs';
import path from 'path';
import { INITIAL_CATEGORIES } from '../src/data/categories.ts';
import { INITIAL_PRODUCTS } from '../src/data/products.ts';
import {
  DEFAULT_SITE_SETTINGS,
  INITIAL_COUPONS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
} from '../src/data/seedData.ts';
import type {
  CategoryItem,
  ContactMessage,
  Coupon,
  CustomerAccount,
  InventoryRecord,
  Order,
  Product,
  ProductReview,
  SalesAnalyticsSummary,
  SiteSettings,
} from '../src/types/index.ts';
import { hashPassword, type UserRole } from './auth.ts';

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  passwordHash: string;
  passwordSalt: string;
  phone: string;
  city: string;
  address: string;
  joinedAt: string;
  updatedAt: string;
  isDemoAccount: boolean;
}

export interface VeloraDatabase {
  products: Product[];
  categories: CategoryItem[];
  users: UserRecord[];
  orders: Order[];
  coupons: Coupon[];
  reviews: ProductReview[];
  inventory: InventoryRecord[];
  settings: SiteSettings;
  newsletterEmails: string[];
  contactMessages: ContactMessage[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'velora-db.json');

export function buildInventoryFromProducts(products: Product[], existing?: InventoryRecord[]): InventoryRecord[] {
  const existingMap = new Map<string, InventoryRecord>();
  for (const rec of existing ?? []) {
    existingMap.set(`${rec.productId}::${rec.sizeMl}`, rec);
  }

  const now = new Date().toISOString();
  const records: InventoryRecord[] = [];
  for (const product of products) {
    for (const size of product.sizes) {
      const key = `${product.id}::${size.ml}`;
      const prev = existingMap.get(key);
      records.push({
        id: prev?.id ?? `inv-${product.id}-${size.ml.replace(/[^a-zA-Z0-9]/g, '')}`,
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        category: product.category,
        sizeMl: size.ml,
        stock: Math.max(0, size.stock),
        lowStockThreshold: prev?.lowStockThreshold ?? 10,
        updatedAt: prev && prev.stock === size.stock ? prev.updatedAt : now,
      });
    }
  }
  return records;
}

function createBootstrapUsers(): UserRecord[] {
  const now = new Date().toISOString();
  const adminEmail = (process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@velorafragrances.com').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'VeloraAdmin#2026';
  const adminCreds = hashPassword(adminPassword);

  const adminUser: UserRecord = {
    id: 'user-admin-1',
    email: adminEmail,
    fullName: 'Velora Store Administrator',
    role: 'admin',
    passwordHash: adminCreds.hash,
    passwordSalt: adminCreds.salt,
    phone: '03180048428',
    city: 'Lahore',
    address: 'Velora Atelier Desk, Gulberg III, Lahore',
    joinedAt: '2026-09-01',
    updatedAt: now,
    isDemoAccount: true,
  };

  const demoCustomerPass = hashPassword('VeloraDemo#2026');
  const customerUsers: UserRecord[] = INITIAL_CUSTOMERS.map((c) => ({
    id: c.id,
    email: c.email.toLowerCase(),
    fullName: c.fullName,
    role: 'customer',
    passwordHash: demoCustomerPass.hash,
    passwordSalt: demoCustomerPass.salt,
    phone: c.phone,
    city: c.city,
    address: c.address,
    joinedAt: c.joinedAt,
    updatedAt: now,
    isDemoAccount: true,
  }));

  return [adminUser, ...customerUsers];
}

function createInitialDatabase(existingUsers?: UserRecord[]): VeloraDatabase {
  const now = new Date().toISOString();
  const products: Product[] = INITIAL_PRODUCTS.map((p) => ({
    ...p,
    active: p.active !== false,
    createdAt: p.createdAt ?? '2026-10-01T10:00:00Z',
    updatedAt: now,
  }));

  const categories: CategoryItem[] = INITIAL_CATEGORIES.map((c) => ({
    ...c,
    createdAt: c.createdAt ?? '2026-10-01T10:00:00Z',
    updatedAt: now,
  }));

  const coupons: Coupon[] = INITIAL_COUPONS.map((c) => ({
    ...c,
    createdAt: c.createdAt ?? '2026-10-01T10:00:00Z',
    updatedAt: now,
  }));

  const orders: Order[] = INITIAL_ORDERS.map((o) => ({
    ...o,
    updatedAt: o.createdAt,
  }));

  const reviews: ProductReview[] = INITIAL_REVIEWS.map((r) => ({
    ...r,
    updatedAt: r.createdAt,
  }));

  const users = existingUsers && existingUsers.length > 0 ? existingUsers : createBootstrapUsers();
  const inventory = buildInventoryFromProducts(products);

  return {
    products,
    categories,
    users,
    orders,
    coupons,
    reviews,
    inventory,
    settings: { ...DEFAULT_SITE_SETTINGS, updatedAt: now },
    newsletterEmails: [],
    contactMessages: [],
  };
}

let memoryDb: VeloraDatabase | null = null;

export function loadDatabase(): VeloraDatabase {
  if (memoryDb) return memoryDb;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(raw) as Partial<VeloraDatabase>;
      if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.users)) {
        const defaults = createInitialDatabase(parsed.users);
        memoryDb = {
          products: parsed.products.map((p) => ({ ...p, active: p.active !== false })),
          categories: Array.isArray(parsed.categories) ? parsed.categories : defaults.categories,
          users: parsed.users,
          orders: Array.isArray(parsed.orders) ? parsed.orders : defaults.orders,
          coupons: Array.isArray(parsed.coupons) ? parsed.coupons : defaults.coupons,
          reviews: Array.isArray(parsed.reviews) ? parsed.reviews : defaults.reviews,
          inventory: buildInventoryFromProducts(
            parsed.products,
            Array.isArray(parsed.inventory) ? parsed.inventory : undefined
          ),
          settings: parsed.settings ?? defaults.settings,
          newsletterEmails: Array.isArray(parsed.newsletterEmails) ? parsed.newsletterEmails : [],
          contactMessages: Array.isArray(parsed.contactMessages) ? parsed.contactMessages : [],
        };
        return memoryDb;
      }
    }
  } catch {
    // Fall back to clean seed initialization
  }

  memoryDb = createInitialDatabase();
  saveDatabase(memoryDb);
  return memoryDb;
}

export function saveDatabase(db: VeloraDatabase): void {
  db.inventory = buildInventoryFromProducts(db.products, db.inventory);
  memoryDb = db;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch {
    // Keep memory state active even if disk write is restricted
  }
}

export function resetDatabaseToDemoDefaults(): VeloraDatabase {
  const current = loadDatabase();
  const adminUsers = current.users.filter((u) => u.role === 'admin');
  const bootstrap = createBootstrapUsers();
  const keptUsers = [
    ...(adminUsers.length > 0 ? adminUsers : bootstrap.filter((u) => u.role === 'admin')),
    ...bootstrap.filter((u) => u.role === 'customer'),
  ];
  const reset = createInitialDatabase(keptUsers);
  saveDatabase(reset);
  return reset;
}

export function toCustomerAccount(user: UserRecord): CustomerAccount {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    city: user.city,
    address: user.address,
    joinedAt: user.joinedAt,
    updatedAt: user.updatedAt,
    isDemoAccount: user.isDemoAccount,
  };
}

export function computeSalesAnalytics(db: VeloraDatabase): SalesAnalyticsSummary {
  const activeOrders = db.orders.filter((o) => o.orderStatus !== 'Cancelled');

  // Group demo orders and revenue by month (YYYY-MM)
  const monthMap = new Map<string, { orders: number; revenuePkr: number }>();
  for (const order of activeOrders) {
    const monthKey = (order.createdAt || '').slice(0, 7) || '2026-11';
    const current = monthMap.get(monthKey) ?? { orders: 0, revenuePkr: 0 };
    current.orders += 1;
    current.revenuePkr += order.totalPkr;
    monthMap.set(monthKey, current);
  }

  // Ensure chronological order across at least 4 baseline demo months
  const seedMonths = ['2026-09', '2026-10', '2026-11'];
  for (const m of seedMonths) {
    if (!monthMap.has(m)) monthMap.set(m, { orders: 0, revenuePkr: 0 });
  }

  const ordersByMonth = Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, stats]) => {
      const [yr, mo] = key.split('-');
      const d = new Date(Number(yr) || 2026, Math.max(0, (Number(mo) || 1) - 1), 1);
      const label = d.toLocaleDateString('en-PK', { month: 'short', year: 'numeric' });
      return {
        month: label,
        orders: stats.orders,
        revenuePkr: stats.revenuePkr,
      };
    });

  // Popular Demo Products
  const productMap = new Map<
    string,
    { productId: string; name: string; brand: string; unitsSold: number; revenuePkr: number }
  >();
  // Category Distribution
  const categoryMap = new Map<
    string,
    { category: string; ordersSet: Set<string>; unitsSold: number; revenuePkr: number }
  >();

  for (const order of activeOrders) {
    for (const item of order.items) {
      const lineTotal = item.unitPricePkr * item.quantity;
      const prodEntry = productMap.get(item.productId) ?? {
        productId: item.productId,
        name: item.name,
        brand: item.brand,
        unitsSold: 0,
        revenuePkr: 0,
      };
      prodEntry.unitsSold += item.quantity;
      prodEntry.revenuePkr += lineTotal;
      productMap.set(item.productId, prodEntry);

      const product = db.products.find((p) => p.id === item.productId);
      const categoryName = product?.category ?? 'Other Fragrances';
      const catEntry = categoryMap.get(categoryName) ?? {
        category: categoryName,
        ordersSet: new Set<string>(),
        unitsSold: 0,
        revenuePkr: 0,
      };
      catEntry.ordersSet.add(order.id);
      catEntry.unitsSold += item.quantity;
      catEntry.revenuePkr += lineTotal;
      categoryMap.set(categoryName, catEntry);
    }
  }

  const popularProducts = Array.from(productMap.values())
    .sort((a, b) => b.unitsSold - a.unitsSold || b.revenuePkr - a.revenuePkr)
    .slice(0, 8);

  const categoryDistribution = Array.from(categoryMap.values())
    .map((entry) => ({
      category: entry.category,
      ordersCount: entry.ordersSet.size,
      unitsSold: entry.unitsSold,
      revenuePkr: entry.revenuePkr,
    }))
    .sort((a, b) => b.revenuePkr - a.revenuePkr);

  return {
    ordersByMonth,
    popularProducts,
    categoryDistribution,
    isDemoData: true,
  };
}
