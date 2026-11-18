import type { Product } from '../types/index.ts';

export function formatPkr(amount: number): string {
  const rounded = Math.round(amount);
  return `Rs. ${rounded.toLocaleString('en-PK')}`;
}

export function formatDateShort(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  return parsed.toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getProductTotalStock(product: Product): number {
  return product.sizes.reduce((sum, s) => sum + s.stock, 0);
}

export function getStockStatusLabel(stock: number): {
  label: string;
  tone: 'in' | 'low' | 'out';
} {
  if (stock <= 0) {
    return { label: 'Out of Stock', tone: 'out' };
  }
  if (stock <= 6) {
    return { label: `Low Stock (${stock} left)`, tone: 'low' };
  }
  return { label: 'In Stock', tone: 'in' };
}

export function calculateDeliveryFee(
  subtotalAfterDiscount: number,
  method: 'standard' | 'express',
  settings: {
    standardDeliveryFeePkr: number;
    expressDeliveryFeePkr: number;
    freeDeliveryThresholdPkr: number;
  }
): number {
  if (method === 'express') {
    return settings.expressDeliveryFeePkr;
  }
  if (subtotalAfterDiscount >= settings.freeDeliveryThresholdPkr) {
    return 0;
  }
  return settings.standardDeliveryFeePkr;
}

export function isValidPakistanPhone(phone: string): boolean {
  const digits = phone.replace(/[\s\-()]/g, '');
  return /^(\+92|0)?3\d{9}$/.test(digits);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const [local, domain] = parts;
  const visible = local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(2, local.length - 2))}@${domain}`;
}

export function maskPhone(phone: string): string {
  const clean = phone.trim();
  if (clean.length <= 5) return '***';
  return `${clean.slice(0, 4)}****${clean.slice(-3)}`;
}

export function isCouponExpired(expiresAt: string): boolean {
  if (!expiresAt) return false;
  const today = new Date().toISOString().slice(0, 10);
  return expiresAt < today;
}
