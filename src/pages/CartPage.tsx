import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Tag, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { calculateDeliveryFee, formatPkr } from '../utils/format';
import { PageHeader } from '../components/common/PageHeader';
import { SafeImage } from '../components/common/SafeImage';

export const CartPage: React.FC = () => {
  const {
    cart,
    products,
    coupons,
    appliedCouponCode,
    applyCoupon,
    removeCoupon,
    updateCartQuantity,
    removeFromCart,
    cartSubtotalPkr,
    cartDiscountPkr,
    settings,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponStatus, setCouponStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const afterDiscount = Math.max(0, cartSubtotalPkr - cartDiscountPkr);
  const estimatedStandardShipping = calculateDeliveryFee(afterDiscount, 'standard', settings);
  const estimatedTotal = afterDiscount + estimatedStandardShipping;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await applyCoupon(couponInput);
    setCouponStatus(res);
    if (res.ok) setCouponInput('');
  };

  return (
    <div>
      <PageHeader
        eyebrow="Shopping Bag"
        title="Your Fragrance Selection"
        description="Review your selected volumes, test demo discount vouchers, and proceed to simulated PKR checkout."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Shopping Cart' }]}
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {cart.length === 0 ? (
          <div className="border border-[#252525]/10 bg-[#FAF8F3] px-6 py-16 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-[#D4AF6A] mb-3" strokeWidth={1.3} />
            <h2 className="font-display text-3xl text-[#252525]">Your Bag is Empty</h2>
            <p className="mt-2 text-sm text-[#66635D] max-w-md mx-auto">
              Browse our 30 sample fragrances across French Perfumes, Oud & Arabic, Attars, and
              Gift Coffrets.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-block bg-[#252525] px-7 py-3.5 text-xs font-medium uppercase tracking-[0.14em] text-white hover:bg-[#8E4D57] transition-colors"
            >
              Shop All Perfumes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Cart Line Items */}
            <div className="lg:col-span-8">
              <div className="border-t border-[#252525]/10 divide-y divide-[#252525]/10">
                {cart.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  if (!product) return null;
                  const sizeObj = product.sizes.find((s) => s.ml === item.sizeMl);
                  const unitPrice = sizeObj?.pricePkr ?? product.pricePkr;

                  return (
                    <div
                      key={`${item.productId}-${item.sizeMl}`}
                      className="flex flex-col sm:flex-row sm:items-center gap-5 py-6"
                    >
                      <Link
                        to={`/product/${product.slug}`}
                        className="h-28 w-28 shrink-0 bg-[#FAF8F3] border border-[#252525]/8 overflow-hidden"
                      >
                        <SafeImage src={product.images[0]} alt={product.name} />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-[#8E4D57] font-medium">
                          {product.brand} · {product.category}
                        </p>
                        <Link
                          to={`/product/${product.slug}`}
                          className="mt-1 block font-display text-2xl text-[#252525] hover:text-[#8E4D57]"
                        >
                          {product.name}
                        </Link>
                        <p className="mt-1 text-xs text-[#66635D]">
                          Volume: {item.sizeMl} · Unit Price:{' '}
                          <span className="tabular-nums font-medium text-[#252525]">
                            {formatPkr(unitPrice)}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 sm:gap-6">
                        <div className="inline-flex items-center border border-[#252525]/20">
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(item.productId, item.sizeMl, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                            className="flex h-10 w-10 items-center justify-center hover:bg-[#FAF8F3]"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-9 text-center text-xs font-medium tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(item.productId, item.sizeMl, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                            className="flex h-10 w-10 items-center justify-center hover:bg-[#FAF8F3]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="min-w-20 text-right text-sm font-semibold text-[#252525] tabular-nums">
                          {formatPkr(unitPrice * item.quantity)}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId, item.sizeMl)}
                          aria-label={`Remove ${product.name}`}
                          className="flex h-9 w-9 items-center justify-center text-[#66635D] hover:text-rose-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Interface */}
              <div className="mt-8 border border-[#252525]/10 bg-[#FAF8F3] p-6">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#252525] mb-3">
                  <Tag className="h-4 w-4 text-[#8E4D57]" />
                  <span>Demo Discount Coupon</span>
                </div>

                <form onSubmit={handleApplyCoupon} className="flex flex-col sm:flex-row gap-3">
                  <label htmlFor="cart-coupon-input" className="sr-only">
                    Demo coupon code
                  </label>
                  <input
                    id="cart-coupon-input"
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter coupon code (e.g., VELORA10)"
                    className="flex-1 border border-[#252525]/18 bg-white px-4 py-2.5 text-sm uppercase focus:border-[#B76E79] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#252525] px-6 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-white hover:bg-[#8E4D57] transition-colors whitespace-nowrap"
                  >
                    Apply Code
                  </button>
                </form>

                {couponStatus && (
                  <p
                    className={`mt-2.5 text-xs ${
                      couponStatus.ok ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {couponStatus.message}
                  </p>
                )}

                {appliedCouponCode && (
                  <div className="mt-3 flex items-center justify-between border border-[#D4AF6A] bg-white px-3.5 py-2 text-xs">
                    <span>
                      Active Voucher: <strong>{appliedCouponCode}</strong> (−
                      {formatPkr(cartDiscountPkr)})
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-rose-700 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <p className="mt-3 text-xs text-[#66635D]">
                  Available Demo Codes:{' '}
                  {coupons
                    .filter((c) => c.active)
                    .map((c) => c.code)
                    .join(', ')}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="border border-[#252525]/12 bg-[#FAF8F3] p-6 space-y-4 sticky top-28">
                <h2 className="font-display text-2xl font-medium text-[#252525]">
                  Order Summary
                </h2>

                <div className="space-y-3 border-t border-[#252525]/10 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#66635D]">Subtotal</span>
                    <span className="font-medium tabular-nums">{formatPkr(cartSubtotalPkr)}</span>
                  </div>

                  {cartDiscountPkr > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Coupon Discount ({appliedCouponCode})</span>
                      <span className="tabular-nums">−{formatPkr(cartDiscountPkr)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-[#66635D]">Standard Delivery Est.</span>
                    <span className="font-medium tabular-nums">
                      {estimatedStandardShipping === 0
                        ? 'Free'
                        : formatPkr(estimatedStandardShipping)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between border-t border-[#252525]/15 pt-4 text-base font-semibold text-[#252525]">
                  <span>Estimated Total</span>
                  <span className="tabular-nums">{formatPkr(estimatedTotal)}</span>
                </div>

                <Link
                  to="/checkout"
                  className="block w-full bg-[#252525] py-3.5 text-center text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#8E4D57] transition-colors"
                >
                  Proceed to Demo Checkout
                </Link>

                <div className="space-y-2 border-t border-[#252525]/10 pt-4 text-xs text-[#66635D]">
                  <p>
                    • Standard Delivery: {formatPkr(settings.standardDeliveryFeePkr)} (
                    {settings.standardDeliveryEta})
                  </p>
                  <p>
                    • Express Delivery: {formatPkr(settings.expressDeliveryFeePkr)} (
                    {settings.expressDeliveryEta})
                  </p>
                  <p>
                    • Free Standard Delivery on orders of{' '}
                    {formatPkr(settings.freeDeliveryThresholdPkr)} or more.
                  </p>
                  <p>• {settings.returnPolicySummary}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
