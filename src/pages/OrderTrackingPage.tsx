import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, PackageSearch } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatDateShort, formatPkr } from '../utils/format';
import { PageHeader } from '../components/common/PageHeader';

export const OrderTrackingPage: React.FC = () => {
  const { sampleOrderNumbers, trackOrderByNumber } = useStore();
  const [searchParams] = useSearchParams();
  const initialOrder = searchParams.get('order') ?? 'VLR-2026-1043';

  const [query, setQuery] = useState(initialOrder);
  const [activeCode, setActiveCode] = useState(initialOrder);
  const [matchedOrder, setMatchedOrder] = useState<Awaited<ReturnType<typeof trackOrderByNumber>>>(null);

  useEffect(() => {
    const param = searchParams.get('order');
    if (param) {
      setQuery(param);
      setActiveCode(param);
    }
  }, [searchParams]);

  useEffect(() => {
    let alive = true;
    if (!activeCode.trim()) {
      setMatchedOrder(null);
      return;
    }
    void trackOrderByNumber(activeCode).then((order) => {
      if (alive) setMatchedOrder(order);
    });
    return () => {
      alive = false;
    };
  }, [activeCode, trackOrderByNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveCode(query.trim());
  };

  return (
    <div>
      <PageHeader
        eyebrow="Demo Dispatch Status"
        title="Order Tracking"
        description="Inspect simulated fulfillment stages for pre-seeded sample orders or any demo order placed at checkout."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Order Tracking' }]}
      />

      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <label htmlFor="track-order-input" className="sr-only">
            Demo Order Number
          </label>
          <input
            id="track-order-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Order Number (e.g. VLR-2026-1043)"
            className="flex-1 border border-[#252525]/20 bg-white px-4 py-3 text-sm font-mono uppercase focus:border-[#B76E79] focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#252525] px-7 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#8E4D57] transition-colors whitespace-nowrap"
          >
            Track Order
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#66635D]">
          <span>Sample Orders:</span>
          {sampleOrderNumbers.map((orderNumber) => (
            <button
              key={orderNumber}
              type="button"
              onClick={() => {
                setQuery(orderNumber);
                setActiveCode(orderNumber);
              }}
              className="border border-[#252525]/15 bg-[#FAF8F3] px-2.5 py-1 font-mono text-[11px] text-[#252525] hover:border-[#D4AF6A]"
            >
              {orderNumber}
            </button>
          ))}
        </div>

        {matchedOrder ? (
          <div className="mt-8 border border-[#252525]/12 bg-white p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#252525]/10 pb-5">
              <div>
                <p className="font-mono text-xs text-[#8E4D57] font-medium">
                  {matchedOrder.orderNumber} · Sample Demo Order
                </p>
                <h2 className="mt-1 font-display text-3xl font-medium text-[#252525]">
                  Status: {matchedOrder.orderStatus}
                </h2>
                <p className="mt-1 text-xs text-[#66635D]">
                  Placed {formatDateShort(matchedOrder.createdAt)} · {matchedOrder.trackingNote}
                </p>
              </div>
              <div className="text-left sm:text-right text-xs">
                <p className="text-[#66635D]">{matchedOrder.paymentMethod}</p>
                <p className="font-medium text-[#252525]">{matchedOrder.paymentStatus}</p>
                <p className="mt-1 text-base font-semibold text-[#252525] tabular-nums">
                  {formatPkr(matchedOrder.totalPkr)}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#252525] mb-4">
                Fulfillment Timeline (Simulated)
              </h3>
              <ol className="space-y-4">
                {matchedOrder.timeline.map((event, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[#8E4D57] shrink-0 mt-0.5" />
                    <div className="flex-1 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-[#252525]">{event.status}</span>
                        <span className="font-mono text-xs text-[#66635D]">{event.timestamp}</span>
                      </div>
                      <p className="text-xs text-[#66635D] mt-0.5">{event.note}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Items */}
            <div className="border-t border-[#252525]/10 pt-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#252525] mb-3">
                Items in Parcel
              </h3>
              <ul className="divide-y divide-[#252525]/8 text-xs">
                {matchedOrder.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between py-2.5">
                    <span>
                      {item.brand} {item.name} ({item.sizeMl}) × {item.quantity}
                    </span>
                    <span className="font-medium tabular-nums">
                      {formatPkr(item.unitPricePkr * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="mt-8 border border-[#252525]/10 bg-[#FAF8F3] p-10 text-center">
            <PackageSearch className="mx-auto h-9 w-9 text-[#D4AF6A] mb-3" />
            <p className="font-display text-2xl text-[#252525]">Order Not Found</p>
            <p className="mt-1 text-sm text-[#66635D]">
              Check the demo order number above or select one of the sample order buttons.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
