import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatPkr } from '../../utils/format';
import { SafeImage } from '../common/SafeImage';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    products,
    isCartDrawerOpen,
    setCartDrawerOpen,
    updateCartQuantity,
    removeFromCart,
    cartSubtotalPkr,
    settings,
  } = useStore();

  if (!isCartDrawerOpen) return null;

  const remainingForFreeShipping = Math.max(
    0,
    settings.freeDeliveryThresholdPkr - cartSubtotalPkr
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        onClick={() => setCartDrawerOpen(false)}
      />

      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#252525]/10 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-[#8E4D57]" strokeWidth={1.6} />
            <h2 className="font-display text-2xl font-medium text-[#252525]">
              Shopping Bag
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setCartDrawerOpen(false)}
            aria-label="Close shopping bag"
            className="flex h-10 w-10 items-center justify-center text-[#66635D] hover:text-[#252525]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free delivery threshold */}
        <div className="bg-[#FAF8F3] border-b border-[#252525]/8 px-6 py-3 text-xs text-[#252525]">
          {remainingForFreeShipping === 0 ? (
            <span>
              Your order qualifies for complimentary Standard Delivery across Pakistan.
            </span>
          ) : (
            <span>
              Add{' '}
              <strong className="font-semibold tabular-nums">
                {formatPkr(remainingForFreeShipping)}
              </strong>{' '}
              more for free Standard Delivery (orders {formatPkr(settings.freeDeliveryThresholdPkr)}+).
            </span>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="h-10 w-10 text-[#D4AF6A] mb-3" strokeWidth={1.3} />
              <p className="font-display text-2xl text-[#252525]">Your bag is empty</p>
              <p className="mt-2 text-sm text-[#66635D] max-w-xs">
                Explore our signature French, Oud & Arabic, and Attar fragrance collections.
              </p>
              <Link
                to="/shop"
                onClick={() => setCartDrawerOpen(false)}
                className="mt-6 bg-[#252525] px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-white hover:bg-[#8E4D57] transition-colors"
              >
                Explore Perfumes
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[#252525]/8">
              {cart.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                if (!product) return null;
                const sizeObj = product.sizes.find((s) => s.ml === item.sizeMl);
                const unitPrice = sizeObj?.pricePkr ?? product.pricePkr;

                return (
                  <li key={`${item.productId}-${item.sizeMl}`} className="flex gap-4 py-4">
                    <Link
                      to={`/product/${product.slug}`}
                      onClick={() => setCartDrawerOpen(false)}
                      className="h-20 w-20 shrink-0 bg-[#FAF8F3] overflow-hidden"
                    >
                      <SafeImage src={product.images[0]} alt={product.name} />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-[#66635D]">
                            {product.brand}
                          </p>
                          <Link
                            to={`/product/${product.slug}`}
                            onClick={() => setCartDrawerOpen(false)}
                            className="font-display text-lg text-[#252525] hover:text-[#8E4D57] block truncate"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-[#66635D]">Size: {item.sizeMl}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId, item.sizeMl)}
                          aria-label={`Remove ${product.name}`}
                          className="flex h-9 w-9 items-center justify-center text-[#66635D] hover:text-rose-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center border border-[#252525]/15">
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(item.productId, item.sizeMl, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                            className="flex h-10 w-10 items-center justify-center text-[#252525] hover:bg-[#FAF8F3]"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-medium tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(item.productId, item.sizeMl, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                            className="flex h-10 w-10 items-center justify-center text-[#252525] hover:bg-[#FAF8F3]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="text-sm font-semibold text-[#252525] tabular-nums">
                          {formatPkr(unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer Actions */}
        {cart.length > 0 && (
          <div className="border-t border-[#252525]/10 bg-[#FAF8F3] px-6 py-5">
            <div className="flex items-center justify-between text-sm mb-4">
              <span className="text-[#66635D]">Subtotal</span>
              <span className="text-lg font-semibold text-[#252525] tabular-nums">
                {formatPkr(cartSubtotalPkr)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/cart"
                onClick={() => setCartDrawerOpen(false)}
                className="flex items-center justify-center border border-[#252525]/25 bg-white px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-[#252525] hover:border-[#252525] transition-colors"
              >
                View Bag
              </Link>
              <Link
                to="/checkout"
                onClick={() => setCartDrawerOpen(false)}
                className="flex items-center justify-center bg-[#252525] px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-white hover:bg-[#8E4D57] transition-colors"
              >
                Demo Checkout
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
