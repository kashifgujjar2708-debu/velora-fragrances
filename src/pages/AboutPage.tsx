import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { SafeImage } from '../components/common/SafeImage';
import { PRODUCT_IMAGES } from '../data/categories';
import { INTEGRATION_READINESS } from '../services/firebaseConfig';

export const AboutPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        eyebrow="Our Atelier"
        title="About Velora Fragrances"
        description="Modern luxury perfumery crafted as a portfolio storefront showcasing refined e-commerce design for Pakistan."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'About Us' }]}
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <div className="aspect-[3/4] overflow-hidden border border-[#D4AF6A]/30 bg-[#FAF8F3]">
              <SafeImage
                src={PRODUCT_IMAGES.atelierCraft}
                alt="Velora Fragrances botanical ingredients"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center lg:col-span-7 space-y-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8E4D57] font-semibold">
              Make Every Moment Memorable.
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#252525]">
              A Contemporary Fragrance House Rooted in Lahore
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-[#66635D]">
              Velora Fragrances pairs the architectural clarity of European perfumery with the
              expressive depth of aged oud, saffron, Taif rose, and pure non-alcoholic attar oils.
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-[#66635D]">
              Created as a comprehensive e-commerce portfolio demonstration, this storefront models
              end-to-end luxury merchandising—from fragrance pyramid storytelling and multi-volume
              PKR pricing to order tracking and a role-separated administrative console.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#252525]/10 pt-6">
              <div>
                <p className="font-display text-3xl text-[#252525] tabular-nums">30</p>
                <p className="text-xs text-[#66635D] mt-1">Sample Fragrances</p>
              </div>
              <div>
                <p className="font-display text-3xl text-[#252525] tabular-nums">9</p>
                <p className="text-xs text-[#66635D] mt-1">Olfactive Categories</p>
              </div>
              <div>
                <p className="font-display text-3xl text-[#252525] tabular-nums">PKR</p>
                <p className="text-xs text-[#66635D] mt-1">Pakistan-First Checkout</p>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture & Future Integration Readiness */}
        <div className="mt-16 border-t border-[#252525]/10 pt-14">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8E4D57] font-semibold">
            Technical Architecture
          </p>
          <h2 className="mt-2 font-display text-3xl font-medium text-[#252525]">
            Production Integration Readiness
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#66635D]">
            All shopping, wishlist, review, and admin features run cleanly in local demonstration
            mode. The service layer is structured for safe migration to live external services:
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {INTEGRATION_READINESS.map((mod) => (
              <div key={mod.id} className="border border-[#252525]/10 bg-[#FAF8F3] p-5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#8E4D57] font-semibold">
                  Requires External Config
                </p>
                <h3 className="mt-1 font-display text-xl font-medium text-[#252525]">
                  {mod.name}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#66635D]">{mod.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="inline-block bg-[#252525] px-7 py-3.5 text-xs font-medium uppercase tracking-[0.14em] text-white hover:bg-[#B76E79] transition-colors"
            >
              Explore the Collection
            </Link>
            <Link
              to="/brand-identity"
              className="inline-block border border-[#B76E79] bg-[#F6EFE6] px-7 py-3.5 text-xs font-medium uppercase tracking-[0.14em] text-[#8E4D57] hover:bg-[#B76E79] hover:text-white transition-colors"
            >
              View Brand Identity Book
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
