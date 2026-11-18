import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatPkr } from '../utils/format';
import { PageHeader } from '../components/common/PageHeader';

export const LegalPage: React.FC = () => {
  const { settings } = useStore();

  return (
    <div>
      <PageHeader
        eyebrow="Disclosures & Policies"
        title="Privacy Policy & Terms"
        description="Portfolio demonstration disclosures, sample product notices, and Pakistan return & delivery terms."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Privacy Policy & Terms' }]}
      />

      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10 text-sm leading-relaxed text-[#66635D]">
        <article className="border border-[#D4AF6A]/40 bg-[#FAF8F3] p-6">
          <h2 className="font-display text-2xl font-medium text-[#252525]">
            1. Portfolio & Sample Product Disclaimer
          </h2>
          <p className="mt-3">
            Velora Fragrances is a web development portfolio and demonstration project. All product
            listings, PKR prices, customer testimonials, customer accounts, orders, and payment
            methods displayed across the storefront and admin dashboard are illustrative sample data.
          </p>
          <p className="mt-2">
            References to third-party designer fragrance houses (such as Dior, Chanel, Gucci,
            Versace, Yves Saint Laurent, and Giorgio Armani) are included strictly as sample catalog
            demonstration entries. Velora Fragrances does not claim authorized retailer status,
            endorsement, or live product authenticity verification.
          </p>
        </article>

        <article>
          <h2 className="font-display text-2xl font-medium text-[#252525]">
            2. Demo Payments & Data Privacy
          </h2>
          <p className="mt-3">
            No live payment gateways, bank integrations, or WhatsApp Cloud APIs are active in this
            application. All checkout interactions are simulated locally in your browser via
            localStorage so visitors can safely evaluate the user flow without submitting sensitive
            financial credentials.
          </p>
        </article>

        <article>
          <h2 className="font-display text-2xl font-medium text-[#252525]">
            3. Delivery Terms (Pakistan)
          </h2>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              Standard Delivery: {formatPkr(settings.standardDeliveryFeePkr)} (
              {settings.standardDeliveryEta})
            </li>
            <li>
              Express Delivery: {formatPkr(settings.expressDeliveryFeePkr)} (
              {settings.expressDeliveryEta})
            </li>
            <li>
              Complimentary Standard Delivery on orders of{' '}
              {formatPkr(settings.freeDeliveryThresholdPkr)} or more.
            </li>
          </ul>
        </article>

        <article>
          <h2 className="font-display text-2xl font-medium text-[#252525]">
            4. Return & Exchange Policy
          </h2>
          <p className="mt-3">{settings.returnPolicySummary}</p>
        </article>
      </section>
    </div>
  );
};
