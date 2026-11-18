import React, { useState } from 'react';
import { CheckCircle2, CreditCard, MapPin, Package, ShieldCheck, User, X } from 'lucide-react';
import type { CustomerAccount, Order, OrderStatus, PaymentStatus } from '../../types';
import { formatDateShort, formatPkr } from '../../utils/format';

const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const PAYMENT_STATUSES: PaymentStatus[] = ['Pending', 'Paid (Demo)', 'Failed', 'Refunded'];

interface OrderDetailsDrawerProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, trackingNote?: string) => Promise<void>;
  onUpdatePayment: (orderId: string, paymentStatus: PaymentStatus) => Promise<void>;
}

export const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({
  order,
  onClose,
  onUpdateStatus,
  onUpdatePayment,
}) => {
  const [statusDraft, setStatusDraft] = useState<OrderStatus>(order.orderStatus);
  const [noteDraft, setNoteDraft] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-[#FCFBF9] h-full overflow-y-auto shadow-2xl border-l border-[#EAE0D2] flex flex-col">
        <div className="flex items-center justify-between border-b border-[#EAE0D2] bg-white px-6 py-5 sticky top-0 z-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#8E4D57] font-semibold">
              Demo Order Details
            </p>
            <h2 className="font-mono text-lg font-semibold text-[#252525] mt-0.5">
              {order.orderNumber}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order details"
            className="flex h-9 w-9 items-center justify-center border border-[#EAE0D2] text-[#252525] hover:border-[#B76E79]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* Customer Delivery Details */}
          <div className="bg-white border border-[#EAE0D2] p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#8E4D57] font-semibold uppercase tracking-wider text-[11px]">
              <MapPin className="h-3.5 w-3.5" />
              <span>Customer Delivery Details</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[#66635D]">Recipient</p>
                <p className="font-medium text-[#252525] mt-0.5">{order.customerName}</p>
              </div>
              <div>
                <p className="text-[#66635D]">Phone</p>
                <p className="font-medium text-[#252525] tabular-nums mt-0.5">{order.customerPhone}</p>
              </div>
              <div>
                <p className="text-[#66635D]">Email</p>
                <p className="font-medium text-[#252525] mt-0.5">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-[#66635D]">City & Postal</p>
                <p className="font-medium text-[#252525] mt-0.5">
                  {order.city} ({order.postalCode})
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[#66635D]">Shipping Address</p>
                <p className="font-medium text-[#252525] mt-0.5">{order.shippingAddress}</p>
              </div>
            </div>
          </div>

          {/* Payment & Fulfillment Controls */}
          <div className="bg-white border border-[#EAE0D2] p-5 space-y-4">
            <div className="flex items-center gap-2 text-[#8E4D57] font-semibold uppercase tracking-wider text-[11px]">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Payment & Status Management</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[#66635D] mb-1">Payment Method</p>
                <p className="font-medium text-[#252525]">{order.paymentMethod}</p>
                <p className="text-[11px] text-[#66635D] mt-0.5">
                  Simulated demo checkout method
                </p>
              </div>
              <div>
                <label className="block text-[#66635D] mb-1">Payment Status</label>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => void onUpdatePayment(order.id, e.target.value as PaymentStatus)}
                  className="w-full border border-[#252525]/20 bg-white px-3 py-2 text-xs"
                >
                  {PAYMENT_STATUSES.map((ps) => (
                    <option key={ps} value={ps}>
                      {ps}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-[#EAE0D2] pt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#66635D] mb-1">Order Status</label>
                  <select
                    value={statusDraft}
                    onChange={(e) => setStatusDraft(e.target.value as OrderStatus)}
                    className="w-full border border-[#252525]/20 bg-white px-3 py-2 text-xs font-medium"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#66635D] mb-1">Tracking Note (Optional)</label>
                  <input
                    type="text"
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="e.g. Dispatched via TCS Lahore"
                    className="w-full border border-[#252525]/20 bg-white px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => void onUpdateStatus(order.id, statusDraft, noteDraft || undefined)}
                  className="bg-[#252525] px-4 py-2 text-xs font-medium uppercase tracking-wider text-white hover:bg-[#B76E79] transition-colors"
                >
                  Save Order Status
                </button>

                {order.orderStatus !== 'Cancelled' && (
                  <div className="flex items-center gap-2">
                    {!confirmCancel ? (
                      <button
                        type="button"
                        onClick={() => setConfirmCancel(true)}
                        className="border border-rose-200 px-3 py-2 text-xs text-rose-700 hover:bg-rose-50"
                      >
                        Cancel Demo Order
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={async () => {
                            await onUpdateStatus(
                              order.id,
                              'Cancelled',
                              noteDraft || 'Cancelled by Admin — demo stock restored'
                            );
                            setStatusDraft('Cancelled');
                            setConfirmCancel(false);
                          }}
                          className="bg-rose-700 px-3 py-2 text-xs text-white"
                        >
                          Confirm Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmCancel(false)}
                          className="border border-[#EAE0D2] px-2.5 py-2 text-xs text-[#66635D]"
                        >
                          Keep
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items & Pricing Breakdown */}
          <div className="bg-white border border-[#EAE0D2] p-5 space-y-4">
            <div className="flex items-center gap-2 text-[#8E4D57] font-semibold uppercase tracking-wider text-[11px]">
              <Package className="h-3.5 w-3.5" />
              <span>Items & Server-Verified Pricing</span>
            </div>

            <div className="divide-y divide-[#EAE0D2]">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#252525]">{item.name}</p>
                    <p className="text-[#66635D]">
                      {item.brand} · {item.sizeMl} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums">
                    {formatPkr(item.unitPricePkr * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#EAE0D2] pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#66635D]">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPkr(order.subtotalPkr)}</span>
              </div>
              {order.discountPkr > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon ({order.couponCode})</span>
                  <span className="tabular-nums">−{formatPkr(order.discountPkr)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#66635D]">
                <span>Delivery ({order.deliveryMethod})</span>
                <span className="tabular-nums">
                  {order.deliveryFeePkr === 0 ? 'Free' : formatPkr(order.deliveryFeePkr)}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#EAE0D2] pt-2 text-sm font-semibold text-[#252525]">
                <span>Order Total</span>
                <span className="tabular-nums">{formatPkr(order.totalPkr)}</span>
              </div>
            </div>
          </div>

          {/* Fulfillment Timeline */}
          <div className="bg-white border border-[#EAE0D2] p-5 space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#8E4D57]">
              Fulfillment Timeline
            </h3>
            <ol className="space-y-3">
              {order.timeline.map((ev, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#8E4D57] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-[#252525]">{ev.status}</span>
                      <span className="font-mono text-[11px] text-[#66635D]">{ev.timestamp}</span>
                    </div>
                    <p className="text-[#66635D] mt-0.5">{ev.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CustomerDetailsDrawerProps {
  customer: CustomerAccount;
  orders: Order[];
  onClose: () => void;
  onInspectOrder: (order: Order) => void;
}

export const CustomerDetailsDrawer: React.FC<CustomerDetailsDrawerProps> = ({
  customer,
  orders,
  onClose,
  onInspectOrder,
}) => {
  const totalSpend = orders.reduce(
    (sum, o) => (o.orderStatus !== 'Cancelled' ? sum + o.totalPkr : sum),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#FCFBF9] h-full overflow-y-auto shadow-2xl border-l border-[#EAE0D2] flex flex-col">
        <div className="flex items-center justify-between border-b border-[#EAE0D2] bg-white px-6 py-5 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[#F6EFE6] border border-[#B76E79]/30 text-[#8E4D57]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#8E4D57] font-semibold">
                Authorized Customer Record
              </p>
              <h2 className="font-display text-xl font-medium text-[#252525]">
                {customer.fullName}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close customer details"
            className="flex h-9 w-9 items-center justify-center border border-[#EAE0D2] text-[#252525] hover:border-[#B76E79]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs">
          <div className="border border-[#B76E79]/30 bg-[#F6EFE6]/70 px-4 py-3 flex items-start gap-2.5 text-[#252525]">
            <ShieldCheck className="h-4 w-4 text-[#8E4D57] shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[#66635D]">
              Showing only contact and delivery details necessary for order fulfillment. Passwords
              and authentication credentials are never stored in plain text or exposed.
            </p>
          </div>

          <div className="bg-white border border-[#EAE0D2] p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[#66635D]">Email</p>
              <p className="font-medium text-[#252525] mt-0.5">{customer.email}</p>
            </div>
            <div>
              <p className="text-[#66635D]">Phone</p>
              <p className="font-medium text-[#252525] tabular-nums mt-0.5">{customer.phone}</p>
            </div>
            <div>
              <p className="text-[#66635D]">City</p>
              <p className="font-medium text-[#252525] mt-0.5">{customer.city}</p>
            </div>
            <div>
              <p className="text-[#66635D]">Joined</p>
              <p className="font-medium text-[#252525] mt-0.5">{formatDateShort(customer.joinedAt)}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[#66635D]">Saved Delivery Address</p>
              <p className="font-medium text-[#252525] mt-0.5">{customer.address}</p>
            </div>
          </div>

          <div className="bg-white border border-[#EAE0D2] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-medium text-[#252525]">
                Demo Order History ({orders.length})
              </h3>
              <span className="font-semibold text-[#8E4D57] tabular-nums">
                Total: {formatPkr(totalSpend)}
              </span>
            </div>

            {orders.length === 0 ? (
              <p className="text-[#66635D]">No demo orders placed by this customer yet.</p>
            ) : (
              <div className="divide-y divide-[#EAE0D2]">
                {orders.map((o) => (
                  <div key={o.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono font-semibold text-[#252525]">{o.orderNumber}</p>
                      <p className="text-[#66635D] mt-0.5">
                        {formatDateShort(o.createdAt)} · {o.orderStatus} · {o.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">{formatPkr(o.totalPkr)}</p>
                      <button
                        type="button"
                        onClick={() => onInspectOrder(o)}
                        className="text-[11px] font-medium text-[#8E4D57] hover:underline mt-0.5"
                      >
                        Inspect Order →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
