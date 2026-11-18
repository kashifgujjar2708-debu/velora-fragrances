import React from 'react';
import { BarChart3, Download, Info } from 'lucide-react';
import type { SalesAnalyticsSummary } from '../../types';
import { formatPkr } from '../../utils/format';

interface AdminAnalyticsPanelProps {
  analytics: SalesAnalyticsSummary | null;
  totalDemoRevenue: number;
  totalOrdersCount: number;
  onExportCsv: () => void;
}

export const AdminAnalyticsPanel: React.FC<AdminAnalyticsPanelProps> = ({
  analytics,
  totalDemoRevenue,
  totalOrdersCount,
  onExportCsv,
}) => {
  const ordersByMonth = analytics?.ordersByMonth ?? [];
  const popularProducts = analytics?.popularProducts ?? [];
  const categoryDistribution = analytics?.categoryDistribution ?? [];

  const maxOrders = Math.max(1, ...ordersByMonth.map((m) => m.orders));
  const maxMonthlyRevenue = Math.max(1, ...ordersByMonth.map((m) => m.revenuePkr));
  const maxProductUnits = Math.max(1, ...popularProducts.map((p) => p.unitsSold));
  const maxCatRevenue = Math.max(1, ...categoryDistribution.map((c) => c.revenuePkr));

  return (
    <div className="space-y-6">
      {/* Header & Demo Data Banner */}
      <div className="bg-white border border-[#EAE0D2] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#F6EFE6] border border-[#B76E79]/30 text-[#8E4D57]">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-medium text-[#252525]">
                Demo Sales & Performance Analytics
              </h2>
              <span className="border border-[#B76E79]/40 bg-[#F6EFE6] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#8E4D57]">
                Demo Data Only
              </span>
            </div>
            <p className="mt-1 text-xs text-[#66635D] flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-[#8E4D57] shrink-0" />
              <span>
                Computed strictly from {totalOrdersCount} sample & simulated demo orders ({formatPkr(totalDemoRevenue)} non-cancelled demo total). Not live commercial sales.
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExportCsv}
          className="inline-flex items-center justify-center gap-2 bg-[#252525] px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-white hover:bg-[#B76E79] transition-colors shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Demo CSV</span>
        </button>
      </div>

      {/* 1 & 2: Monthly Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demo Orders by Month */}
        <div className="bg-white border border-[#EAE0D2] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#8E4D57] font-semibold">
                Monthly Volume (Demo)
              </p>
              <h3 className="font-display text-xl font-medium text-[#252525]">
                Demo Orders by Month
              </h3>
            </div>
            <span className="text-xs text-[#66635D] tabular-nums">
              {ordersByMonth.reduce((s, m) => s + m.orders, 0)} active orders
            </span>
          </div>

          {ordersByMonth.length === 0 ? (
            <p className="text-xs text-[#66635D]">No monthly demo order data available.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 items-end h-48 pt-6 border-b border-[#EAE0D2] pb-2">
              {ordersByMonth.map((m) => {
                const heightPct = m.orders > 0 ? Math.max(14, Math.round((m.orders / maxOrders) * 100)) : 4;
                return (
                  <div key={m.month} className="flex flex-col items-center h-full justify-end gap-2">
                    <span className="text-xs font-semibold text-[#252525] tabular-nums">
                      {m.orders}
                    </span>
                    <div className="w-full max-w-[48px] bg-[#F6EFE6] h-32 flex items-end overflow-hidden border border-[#EAE0D2]">
                      <div
                        className="w-full bg-[#252525] transition-all duration-300"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-[#66635D] text-center">{m.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Demo Revenue by Month */}
        <div className="bg-white border border-[#EAE0D2] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#8E4D57] font-semibold">
                Monthly Revenue (Demo PKR)
              </p>
              <h3 className="font-display text-xl font-medium text-[#252525]">
                Demo Revenue by Month
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#8E4D57] tabular-nums">
              {formatPkr(totalDemoRevenue)}
            </span>
          </div>

          {ordersByMonth.length === 0 ? (
            <p className="text-xs text-[#66635D]">No monthly demo revenue recorded.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 items-end h-48 pt-6 border-b border-[#EAE0D2] pb-2">
              {ordersByMonth.map((m) => {
                const heightPct =
                  m.revenuePkr > 0
                    ? Math.max(14, Math.round((m.revenuePkr / maxMonthlyRevenue) * 100))
                    : 4;
                return (
                  <div key={m.month} className="flex flex-col items-center h-full justify-end gap-2">
                    <span className="text-[11px] font-semibold text-[#252525] tabular-nums text-center">
                      {m.revenuePkr > 0 ? `${Math.round(m.revenuePkr / 1000)}k` : '0'}
                    </span>
                    <div className="w-full max-w-[48px] bg-[#F6EFE6] h-32 flex items-end overflow-hidden border border-[#EAE0D2]">
                      <div
                        className="w-full bg-[#B76E79] transition-all duration-300"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-[#66635D] text-center">{m.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3 & 4: Popular Demo Products & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Demo Products */}
        <div className="bg-white border border-[#EAE0D2] p-6 space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8E4D57] font-semibold">
              Top Sample Selections
            </p>
            <h3 className="font-display text-xl font-medium text-[#252525]">
              Popular Demo Products
            </h3>
          </div>

          {popularProducts.length === 0 ? (
            <p className="text-xs text-[#66635D]">No active demo product orders yet.</p>
          ) : (
            <div className="space-y-3.5">
              {popularProducts.map((p, index) => {
                const widthPct = Math.max(10, Math.round((p.unitsSold / maxProductUnits) * 100));
                return (
                  <div key={p.productId} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-[#252525] truncate">
                        {index + 1}. {p.name}{' '}
                        <span className="text-[#66635D] font-normal">({p.brand})</span>
                      </span>
                      <span className="tabular-nums text-[#66635D] shrink-0">
                        <strong className="text-[#252525]">{p.unitsSold}</strong> unit
                        {p.unitsSold === 1 ? '' : 's'} · {formatPkr(p.revenuePkr)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#F6EFE6]">
                      <div
                        className="h-full bg-[#252525]"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white border border-[#EAE0D2] p-6 space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8E4D57] font-semibold">
              Olfactive Share (Demo)
            </p>
            <h3 className="font-display text-xl font-medium text-[#252525]">
              Category Distribution
            </h3>
          </div>

          {categoryDistribution.length === 0 ? (
            <p className="text-xs text-[#66635D]">No category distribution data yet.</p>
          ) : (
            <div className="space-y-3.5">
              {categoryDistribution.map((cat) => {
                const pctOfTotal = Math.round(
                  (cat.revenuePkr / Math.max(1, totalDemoRevenue)) * 100
                );
                const barPct = Math.max(10, Math.round((cat.revenuePkr / maxCatRevenue) * 100));
                return (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-[#252525]">{cat.category}</span>
                      <span className="tabular-nums text-[#66635D]">
                        {cat.unitsSold} units · {formatPkr(cat.revenuePkr)} ({pctOfTotal}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-[#F6EFE6]">
                      <div
                        className="h-full bg-[#B76E79]"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
