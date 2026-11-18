import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { DeliveryMethod, Order, PaymentMethod } from '../types';
import {
  calculateDeliveryFee,
  formatPkr,
  isValidEmail,
  isValidPakistanPhone,
} from '../utils/format';
import { PageHeader } from '../components/common/PageHeader';

const PAYMENT_OPTIONS: { method: PaymentMethod; note: string }[] = [
  {
    method: 'Cash on Delivery',
    note: 'Pay cash to courier upon parcel arrival anywhere in Pakistan (Demo).',
  },
  {
    method: 'JazzCash (Demo)',
    note: 'Simulated mobile wallet approval — no real PIN or funds processed.',
  },
  {
    method: 'EasyPaisa (Demo)',
    note: 'Simulated wallet checkout — no real mobile account charged.',
  },
  {
    method: 'Debit / Credit Card (Demo)',
    note: 'Simulated card flow — do not enter real card numbers or CVV.',
  },
  {
    method: 'Demo Online Payment',
    note: 'Instant portfolio gateway simulation for testing confirmed order state.',
  },
  {
    method: 'Bank Transfer (Demo)',
    note: 'Simulated IBAN transfer workflow for high-value gift orders.',
  },
];

const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
];

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    products,
    cartSubtotalPkr,
    cartDiscountPkr,
    appliedCouponCode,
    currentCustomer,
    settings,
    placeDemoOrder,
  } = useStore();

  const [fullName, setFullName] = useState(currentCustomer?.fullName ?? '');
  const [email, setEmail] = useState(currentCustomer?.email ?? '');
  const [phone, setPhone] = useState(currentCustomer?.phone ?? '');
  const [city, setCity] = useState(currentCustomer?.city ?? 'Lahore');
  const [address, setAddress] = useState(currentCustomer?.address ?? '');
  const [postalCode, setPostalCode] = useState('54660');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const subtotalAfterDiscount = Math.max(0, cartSubtotalPkr - cartDiscountPkr);
  const deliveryFee = calculateDeliveryFee(subtotalAfterDiscount, deliveryMethod, settings);
  const grandTotal = subtotalAfterDiscount + deliveryFee;

  const fillSampleCustomer = () => {
    setFullName('Sanaullah Khan (Sample)');
    setEmail('sanaullah.demo@example.pk');
    setPhone('03180048428');
    setCity('Lahore');
    setAddress('Street 7, DHA Phase 5');
    setPostalCode('54792');
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setFormError('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setFormError('Please enter recipient full name.');
      return;
    }
    if (!isValidEmail(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!isValidPakistanPhone(phone)) {
      setFormError('Please enter a valid Pakistani mobile number (e.g., 03180048428).');
      return;
    }
    if (!address.trim() || !postalCode.trim()) {
      setFormError('Please complete your delivery address and postal code.');
      return;
    }

    setSubmitting(true);
    const res = await placeDemoOrder({
      customerName: fullName.trim(),
      customerEmail: email.trim(),
      customerPhone: phone.trim(),
      shippingAddress: address.trim(),
      city,
      postalCode: postalCode.trim(),
      deliveryMethod,
      paymentMethod,
    });
    setSubmitting(false);

    if (!res.ok) {
      setFormError(res.error ?? 'Could not place demo order.');
      return;
    }

    if (res.order) {
      setPlacedOrder(res.order);
    }
  };

  if (placedOrder) {
    return (
      <div>
        <PageHeader
          eyebrow="Demo Order Confirmed"
          title={`Order ${placedOrder.orderNumber}`}
          description="Simulated checkout completed. No real payment or courier dispatch occurred."
          breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Order Confirmation' }]}
        />

        <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="border border-[#D4AF6A] bg-[#FAF8F3] p-8">
            <div className="flex items-center gap-3 text-[#252525]">
              <CheckCircle2 className="h-7 w-7 text-[#8E4D57]" />
              <div>
                <h2 className="font-display text-3xl font-medium">
                  Thank You, {placedOrder.customerName}
                </h2>
                <p className="text-xs text-[#66635D]">
                  Demo Order Number:{' '}
                  <strong className="font-mono text-[#252525]">{placedOrder.orderNumber}</strong> ·{' '}
                  Status: {placedOrder.orderStatus}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-[#252525]/10 py-5 text-xs">
              <div>
                <p className="uppercase tracking-wider text-[#66635D]">Delivery Destination</p>
                <p className="mt-1 text-sm text-[#252525] font-medium">
                  {placedOrder.shippingAddress}, {placedOrder.city} ({placedOrder.postalCode})
                </p>
                <p className="mt-0.5 text-[#66635D]">{placedOrder.customerPhone}</p>
              </div>
              <div>
                <p className="uppercase tracking-wider text-[#66635D]">Demo Payment & Total</p>
                <p className="mt-1 text-sm text-[#252525] font-medium">
                  {placedOrder.paymentMethod} — {placedOrder.paymentStatus}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[#8E4D57] tabular-nums">
                  Total: {formatPkr(placedOrder.totalPkr)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={`/track-order?order=${placedOrder.orderNumber}`}
                className="bg-[#252525] px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-white hover:bg-[#8E4D57] transition-colors"
              >
                Track This Demo Order
              </Link>
              <Link
                to="/shop"
                className="border border-[#252525]/25 bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#252525] hover:border-[#252525]"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Demo Checkout"
        title="Simulated Order Placement"
        description="Complete the demo delivery form below. No live payment gateway or financial credentials are collected."
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'Cart', to: '/cart' },
          { label: 'Demo Checkout' },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {cart.length === 0 ? (
          <div className="border border-[#252525]/10 bg-[#FAF8F3] p-12 text-center">
            <h2 className="font-display text-3xl text-[#252525]">Your Bag is Empty</h2>
            <p className="mt-2 text-sm text-[#66635D]">
              Add a fragrance from the catalog before proceeding to demo checkout.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-block bg-[#252525] px-6 py-3 text-xs uppercase tracking-[0.14em] text-white"
            >
              Browse Perfumes
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Left Form */}
            <div className="lg:col-span-7 space-y-8">
              <div className="flex flex-wrap items-start gap-3 border border-[#B76E79]/40 bg-[#FAF8F3] p-4 text-xs text-[#252525]">
                <ShieldAlert className="h-4 w-4 text-[#8E4D57] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-[200px]">
                  <p className="font-semibold">Portfolio Demonstration Mode</p>
                  <p className="mt-0.5 text-[#66635D]">
                    Do not enter real credit card numbers or sensitive banking passwords. Use the
                    button to populate sample Lahore checkout fields instantly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fillSampleCustomer}
                  className="border border-[#252525]/25 bg-white px-3 py-2 text-[11px] font-medium hover:border-[#B76E79] shrink-0"
                >
                  Fill Sample Data
                </button>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="border border-rose-300 bg-rose-50 px-4 py-3 text-xs text-rose-800"
                >
                  {formError}
                </div>
              )}

              {/* Shipping Address */}
              <div className="border border-[#252525]/10 bg-white p-6 space-y-4">
                <h2 className="font-display text-2xl font-medium text-[#252525]">
                  1. Delivery Details (Pakistan)
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="checkout-full-name" className="block text-xs text-[#66635D] mb-1">
                      Full Name *
                    </label>
                    <input
                      id="checkout-full-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ayesha Siddiqui"
                      className="w-full border border-[#252525]/20 px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-email" className="block text-xs text-[#66635D] mb-1">
                      Email *
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full border border-[#252525]/20 px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="checkout-phone" className="block text-xs text-[#66635D] mb-1">
                      Mobile / WhatsApp (PK) *
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="03180048428"
                      className="w-full border border-[#252525]/20 px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-city" className="block text-xs text-[#66635D] mb-1">
                      City *
                    </label>
                    <select
                      id="checkout-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border border-[#252525]/20 bg-white px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                    >
                      {PAKISTAN_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="checkout-address" className="block text-xs text-[#66635D] mb-1">
                      Street Address *
                    </label>
                    <input
                      id="checkout-address"
                      type="text"
                      required
                      autoComplete="street-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House, Street, Sector / Block"
                      className="w-full border border-[#252525]/20 px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-postal" className="block text-xs text-[#66635D] mb-1">
                      Postal Code *
                    </label>
                    <input
                      id="checkout-postal"
                      type="text"
                      required
                      autoComplete="postal-code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="54660"
                      className="w-full border border-[#252525]/20 px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Speed */}
              <div className="border border-[#252525]/10 bg-white p-6 space-y-4">
                <h2 className="font-display text-2xl font-medium text-[#252525]">
                  2. Delivery Method
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    className={`cursor-pointer border p-4 transition-colors ${
                      deliveryMethod === 'standard'
                        ? 'border-[#D4AF6A] bg-[#FAF8F3]'
                        : 'border-[#252525]/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryMethod === 'standard'}
                          onChange={() => setDeliveryMethod('standard')}
                        />
                        <span className="text-sm font-medium">Standard Delivery</span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">
                        {subtotalAfterDiscount >= settings.freeDeliveryThresholdPkr
                          ? 'Free'
                          : formatPkr(settings.standardDeliveryFeePkr)}
                      </span>
                    </div>
                    <p className="mt-1.5 pl-5 text-xs text-[#66635D]">
                      {settings.standardDeliveryEta} · Free on orders{' '}
                      {formatPkr(settings.freeDeliveryThresholdPkr)}+
                    </p>
                  </label>

                  <label
                    className={`cursor-pointer border p-4 transition-colors ${
                      deliveryMethod === 'express'
                        ? 'border-[#D4AF6A] bg-[#FAF8F3]'
                        : 'border-[#252525]/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryMethod === 'express'}
                          onChange={() => setDeliveryMethod('express')}
                        />
                        <span className="text-sm font-medium">Express Delivery</span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">
                        {formatPkr(settings.expressDeliveryFeePkr)}
                      </span>
                    </div>
                    <p className="mt-1.5 pl-5 text-xs text-[#66635D]">
                      {settings.expressDeliveryEta} priority courier
                    </p>
                  </label>
                </div>
              </div>

              {/* Demo Payment Methods */}
              <div className="border border-[#252525]/10 bg-white p-6 space-y-4">
                <h2 className="font-display text-2xl font-medium text-[#252525]">
                  3. Demo Payment Option
                </h2>
                <p className="text-xs text-[#66635D]">
                  Select any payment option below to simulate checkout state. Zero real charges or
                  financial card inputs are activated.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <label
                      key={opt.method}
                      className={`cursor-pointer border p-3.5 transition-colors ${
                        paymentMethod === opt.method
                          ? 'border-[#D4AF6A] bg-[#FAF8F3]'
                          : 'border-[#252525]/15 hover:border-[#252525]/35'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === opt.method}
                          onChange={() => setPaymentMethod(opt.method)}
                        />
                        <span className="text-xs font-semibold text-[#252525]">{opt.method}</span>
                      </div>
                      <p className="mt-1 pl-5 text-[11px] leading-relaxed text-[#66635D]">
                        {opt.note}
                      </p>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Order Review */}
            <div className="lg:col-span-5">
              <div className="border border-[#252525]/12 bg-[#FAF8F3] p-6 space-y-5 sticky top-28">
                <h2 className="font-display text-2xl font-medium text-[#252525]">
                  Order Summary
                </h2>

                <ul className="divide-y divide-[#252525]/10 max-h-72 overflow-y-auto">
                  {cart.map((item) => {
                    const p = products.find((prod) => prod.id === item.productId);
                    if (!p) return null;
                    const s = p.sizes.find((sz) => sz.ml === item.sizeMl);
                    const price = s?.pricePkr ?? p.pricePkr;
                    return (
                      <li
                        key={`${item.productId}-${item.sizeMl}`}
                        className="flex justify-between gap-3 py-3 text-xs"
                      >
                        <div>
                          <p className="font-medium text-[#252525]">
                            {p.name} × {item.quantity}
                          </p>
                          <p className="text-[#66635D]">
                            {p.brand} · {item.sizeMl}
                          </p>
                        </div>
                        <span className="font-medium tabular-nums">
                          {formatPkr(price * item.quantity)}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <div className="space-y-2.5 border-t border-[#252525]/10 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#66635D]">Subtotal</span>
                    <span className="tabular-nums">{formatPkr(cartSubtotalPkr)}</span>
                  </div>
                  {cartDiscountPkr > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Coupon ({appliedCouponCode})</span>
                      <span className="tabular-nums">−{formatPkr(cartDiscountPkr)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#66635D]">
                      {deliveryMethod === 'express' ? 'Express Delivery' : 'Standard Delivery'}
                    </span>
                    <span className="tabular-nums">
                      {deliveryFee === 0 ? 'Free' : formatPkr(deliveryFee)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between border-t border-[#252525]/15 pt-4 text-lg font-semibold text-[#252525]">
                  <span>Total (PKR)</span>
                  <span className="tabular-nums">{formatPkr(grandTotal)}</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#252525] py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#8E4D57] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Placing Demo Order…' : `Place Demo Order (${formatPkr(grandTotal)})`}
                </button>

                <p className="text-[11px] leading-relaxed text-[#66635D]">
                  Return Policy: {settings.returnPolicySummary}
                </p>
              </div>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};
