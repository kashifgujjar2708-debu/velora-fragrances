import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gift, HeartHandshake, Instagram, PackageCheck, Sparkles, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PRODUCT_IMAGES } from '../data/categories';
import { MARBLE_ASSETS, PACKAGING_ASSETS } from '../components/brand/VeloraBrandMarks';
import { ProductCard } from '../components/common/ProductCard';
import { SafeImage } from '../components/common/SafeImage';

const FOUR_COLLECTIONS = [
  {
    id: 'col-men',
    title: 'Men’s Collection',
    description:
      'Architectural cedarwoods, spiced cardamom, crisp marine citrus, and smoked leather accords.',
    image: PACKAGING_ASSETS.mens,
    to: '/collections/mens',
  },
  {
    id: 'col-women',
    title: 'Women’s Collection',
    description:
      'Luminous Grasse jasmine, centifolia rose, velvety white musk, and warm Madagascar vanilla.',
    image: PACKAGING_ASSETS.womens,
    to: '/collections/womens',
  },
  {
    id: 'col-unisex',
    title: 'Unisex Collection',
    description:
      'Gender-free modern signatures blending saffron silk, Tunisian neroli, and golden ambergris.',
    image: PACKAGING_ASSETS.unisex,
    to: '/collections/unisex',
  },
  {
    id: 'col-oud',
    title: 'Oud Collection',
    description:
      'Aged Assam agarwood, highland Taif rose, frankincense tears, and deep resinous warmth.',
    image: PACKAGING_ASSETS.oud,
    to: '/collections/oud-arabic',
  },
];

const WHY_CHOOSE_FEATURES = [
  {
    icon: Sparkles,
    title: 'Elegant Fragrance Selection',
    description:
      'Curated showcase spanning French florals, fresh citrus blends, pure attar oils, and aged oud accords.',
  },
  {
    icon: PackageCheck,
    title: 'Premium Presentation',
    description:
      'Warm Cream presentation boxes accented with brushed Rose Gold hardware and marble-inspired visual detail.',
  },
  {
    icon: Gift,
    title: 'Gift-Worthy Collections',
    description:
      'Thoughtfully proportioned gift coffrets and discovery sets tailored for weddings, Eid, and milestones.',
  },
  {
    icon: HeartHandshake,
    title: 'Customer-Focused Experience',
    description:
      'Clear PKR pricing, intuitive fragrance pyramids, responsive wishlist & bag tools, and order tracking.',
  },
];

const INSTAGRAM_GALLERY = [
  {
    src: PACKAGING_ASSETS.womens,
    caption: 'Fluted crystal & polished Rose Gold cap on marble',
    to: '/collections/womens',
  },
  {
    src: PACKAGING_ASSETS.mens,
    caption: 'Pour Homme smoked glass & Cream rigid box',
    to: '/collections/mens',
  },
  {
    src: PACKAGING_ASSETS.oud,
    caption: 'Oud Collection in amber crystal & Rose Gold trim',
    to: '/collections/oud-arabic',
  },
  {
    src: PACKAGING_ASSETS.giftset,
    caption: 'Ivory keepsake coffret & travel atomizer',
    to: '/collections/gift-sets',
  },
  {
    src: MARBLE_ASSETS.light,
    caption: 'Signature Cream & Rose Gold veined marble surface',
    to: '/brand-identity',
  },
  {
    src: PRODUCT_IMAGES.atelierCraft,
    caption: 'Raw saffron, aged oud wood & damask rose petals',
    to: '/about',
  },
];

export const HomePage: React.FC = () => {
  const { products, reviews, subscribeNewsletter, notify } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterFeedback, setNewsletterFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const activeProducts = products.filter((p) => p.active !== false);

  // 8 Sample Featured Products
  const featuredEight = [
    ...activeProducts.filter((p) => p.featured),
    ...activeProducts.filter((p) => !p.featured),
  ].slice(0, 8);

  // 4 Distinct Sample Best Seller Selections
  const featuredIds = new Set(featuredEight.map((p) => p.id));
  const bestSellersFour = activeProducts.filter((p) => !featuredIds.has(p.id)).slice(0, 4);

  // 4 Clearly Labelled Sample Customer Reviews
  const sampleReviewsFour = reviews.filter((r) => r.approved).slice(0, 4);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await subscribeNewsletter(newsletterEmail);
    setNewsletterFeedback(res);
    if (res.ok) setNewsletterEmail('');
  };

  const handleFollowPlaceholder = (e: React.MouseEvent) => {
    e.preventDefault();
    notify('Placeholder social link — Instagram integration is disabled in portfolio demo mode.', 'info');
  };

  return (
    <div className="bg-[#FCFBF9] text-[#252525]">
      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-[#B76E79]/25">
        <div className="absolute inset-0">
          <SafeImage
            src={MARBLE_ASSETS.light}
            alt="Soft white and warm cream marble background with delicate rose gold veins"
            loading="eager"
            decoding="sync"
            className="h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FCFBF9]/95 via-[#F6EFE6]/82 to-[#FCFBF9]/60" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="flex flex-col justify-center lg:col-span-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8E4D57]">
                Velora Fragrances · Modern Luxury Perfumery
              </p>

              <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.08] font-medium text-[#252525] text-balance">
                Make Every Moment Memorable.
              </h1>

              <p className="mt-4 font-display text-2xl sm:text-3xl italic text-[#8E4D57]">
                Discover the Art of Fine Fragrance.
              </p>

              <p className="mt-4 max-w-lg text-sm sm:text-base leading-relaxed text-[#66635D]">
                Refined French-inspired compositions, aged Arabian oud, pure non-alcoholic attars,
                and Cream & Rose Gold gift coffrets presented for Pakistan in PKR.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2.5 bg-[#8E4D57] px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition-colors duration-150 hover:bg-[#252525] focus-visible:outline-2 focus-visible:outline-[#252525]"
                >
                  <span>SHOP NOW</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.7} />
                </Link>

                <Link
                  to="/collections/oud-arabic"
                  className="inline-flex items-center gap-2 border border-[#252525]/25 bg-white/90 px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[#252525] transition-colors hover:border-[#B76E79] hover:text-[#8E4D57]"
                >
                  Oud Collection
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-72 sm:h-96 lg:h-full min-h-[340px] sm:min-h-[380px] overflow-hidden border border-[#B76E79]/35 bg-[#F6EFE6] shadow-[0_24px_48px_-24px_rgba(37,37,37,0.22)]">
                <SafeImage
                  src={PRODUCT_IMAGES.hero}
                  alt="Velora Fragrances luxury crystal perfume bottles on warm travertine stone"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SHOP BY COLLECTION (4 COLLECTION CARDS) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-[#EAE0D2] pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E4D57]">
              Curated Worlds
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium text-[#252525]">
              Shop by Collection
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[#252525] hover:text-[#8E4D57] transition-colors whitespace-nowrap"
          >
            <span>Explore All 9 Categories</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FOUR_COLLECTIONS.map((col) => (
            <article
              key={col.id}
              className="group flex flex-col bg-white border border-[#EAE0D2] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#B76E79]/70 hover:shadow-[0_14px_30px_-18px_rgba(37,37,37,0.16)]"
            >
              <Link
                to={col.to}
                className="aspect-[4/3] w-full overflow-hidden bg-[#F6EFE6] block"
              >
                <SafeImage
                  src={col.image}
                  alt={`${col.title} — Velora Cream and Rose Gold fragrance presentation`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </Link>
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <h3 className="font-display text-2xl font-medium text-[#252525] group-hover:text-[#8E4D57] transition-colors">
                    {col.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#66635D]">
                    {col.description}
                  </p>
                </div>

                <Link
                  to={col.to}
                  className="mt-5 inline-flex items-center justify-center gap-2 border border-[#252525]/20 bg-[#F6EFE6] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#252525] transition-colors hover:border-[#B76E79] hover:bg-[#B76E79] hover:text-white"
                >
                  <span>Shop Collection</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. FEATURED PRODUCTS (8 SAMPLE PERFUME PRODUCTS) */}
      <section className="bg-[#F6EFE6]/70 border-y border-[#B76E79]/20 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[#252525]/10 pb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E4D57]">
                Demo Portfolio Selection · Sample Catalog Only
              </p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium text-[#252525]">
                Featured Fragrances
              </h2>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-[#66635D]">
                Illustrative sample perfume listings in PKR for portfolio demonstration. Velora
                Fragrances does not claim these items as genuine or officially authorized retail stock.
              </p>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[#252525] hover:text-[#8E4D57] transition-colors whitespace-nowrap shrink-0"
            >
              <span>View All 30 Samples</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredEight.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS SECTION (4 SAMPLE DEMO SELECTIONS) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-[#EAE0D2] pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E4D57]">
              Demo / Sample Selections (Not Live Sales Rankings)
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium text-[#252525]">
              Best Sellers Showcase
            </h2>
          </div>
          <span className="text-xs text-[#66635D]">
            Illustrative portfolio showcase · Prices in PKR
          </span>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestSellersFour.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. BRAND INTRODUCTION ("DISCOVER THE WORLD OF VELORA") */}
      <section className="relative overflow-hidden border-y border-[#B76E79]/25 bg-[#F6EFE6]">
        <div className="absolute inset-0">
          <SafeImage
            src={MARBLE_ASSETS.light}
            alt="Cream marble texture with subtle rose gold veining"
            className="h-full w-full object-cover opacity-40"
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <div className="h-72 sm:h-96 lg:h-full min-h-[360px] overflow-hidden border border-[#B76E79]/35 bg-white shadow-sm">
                <SafeImage
                  src={PACKAGING_ASSETS.womens}
                  alt="Velora luxury crystal perfume bottle and cream presentation box on marble"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center lg:col-span-6 bg-[#FCFBF9]/90 backdrop-blur-xs border border-[#EAE0D2] p-8 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E4D57]">
                Our Maison
              </p>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-[#252525] text-balance">
                Discover the World of Velora
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[#66635D]">
                At Velora Fragrances, we celebrate the beauty of fragrance through elegance,
                individuality, and unforgettable moments.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[#66635D]">
                Rooted in a Cream, Soft White, and Rose Gold aesthetic paired with calm marble
                surfaces, every composition is curated to elevate quiet daily rituals and milestone
                evenings alike.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[#EAE0D2] pt-6">
                <Link
                  to="/about"
                  className="bg-[#252525] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#B76E79] transition-colors"
                >
                  About Velora
                </Link>
                <Link
                  to="/brand-identity"
                  className="border border-[#B76E79]/50 bg-[#F6EFE6] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#8E4D57] hover:bg-[#B76E79] hover:text-white transition-colors"
                >
                  Explore Brand Identity
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. WHY CHOOSE VELORA (4 FEATURE CARDS) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E4D57]">
              Brand Presentation Highlights (Demo Statements)
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium text-[#252525]">
              Why Choose Velora
            </h2>
          </div>
          <p className="text-xs text-[#66635D]">
            Portfolio presentation statements, not verified operational guarantees.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_CHOOSE_FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="border border-[#EAE0D2] bg-white p-6 transition-colors hover:border-[#B76E79]/60"
              >
                <div className="flex h-11 w-11 items-center justify-center bg-[#F6EFE6] border border-[#B76E79]/30 text-[#8E4D57]">
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                </div>
                <h3 className="mt-5 font-display text-2xl font-medium text-[#252525]">
                  {feat.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#66635D]">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. CUSTOMER REVIEWS (4 SAMPLE / DEMO REVIEW CARDS) */}
      <section className="bg-[#F6EFE6]/70 border-y border-[#B76E79]/20 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E4D57]">
                Sample / Demo Reviews Only
              </p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium text-[#252525]">
                Sample Client Impressions
              </h2>
            </div>
            <p className="text-xs text-[#66635D]">
              Fictional sample reviews for portfolio demonstration — not genuine testimonials.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sampleReviewsFour.map((review) => (
              <article
                key={review.id}
                className="flex flex-col justify-between bg-white border border-[#EAE0D2] p-6"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="flex items-center gap-0.5 text-[#B76E79]"
                      aria-label={`${review.rating} out of 5 stars (Sample)`}
                    >
                      {Array.from({ length: review.rating }).map((_, idx) => (
                        <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[11px] uppercase tracking-wider text-[#8E4D57] font-medium">
                      Sample Review
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-xl font-medium text-[#252525]">
                    {review.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#66635D]">
                    {review.comment}
                  </p>
                </div>

                <div className="mt-5 border-t border-[#EAE0D2] pt-4 text-xs text-[#66635D]">
                  <p className="font-medium text-[#252525]">{review.authorName}</p>
                  <p className="mt-0.5">{review.city} · Demo Entry</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 10. INSTAGRAM GALLERY (6-IMAGE GRID + FOLLOW US BUTTON) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E4D57]">
              @VeloraFragrances · Portfolio Gallery
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium text-[#252525]">
              Cream, Rose Gold & Marble Journal
            </h2>
          </div>

          <a
            href="#instagram-placeholder"
            onClick={handleFollowPlaceholder}
            className="inline-flex items-center gap-2 border border-[#B76E79] bg-[#F6EFE6] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#8E4D57] hover:bg-[#B76E79] hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Instagram className="h-4 w-4" strokeWidth={1.6} />
            <span>Follow Us</span>
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
          {INSTAGRAM_GALLERY.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className="group relative aspect-square overflow-hidden bg-[#F6EFE6] border border-[#EAE0D2]"
            >
              <SafeImage
                src={item.src}
                alt={item.caption}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
                <span className="text-[11px] leading-snug text-white">{item.caption}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 11. NEWSLETTER SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative overflow-hidden border border-[#B76E79]/40 bg-[#F6EFE6] px-6 py-12 sm:px-12 lg:py-16 text-center">
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E4D57]">
              Demo Newsletter
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium text-[#252525]">
              Stay in the World of Velora
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-[#66635D]">
              Subscribe for fragrance inspiration and brand updates.
            </p>

            <form
              onSubmit={handleNewsletter}
              className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="home-newsletter-email" className="sr-only">
                Email address for newsletter
              </label>
              <input
                id="home-newsletter-email"
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 border border-[#EAE0D2] bg-white px-4 py-3 text-sm text-[#252525] placeholder:text-[#66635D]/70 focus:border-[#B76E79] focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#252525] px-7 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:bg-[#8E4D57] transition-colors whitespace-nowrap shrink-0"
              >
                Subscribe
              </button>
            </form>

            <p className="mt-3 text-[11px] text-[#66635D]">
              Demo-only subscription form: entries are saved locally in your browser; no real emails
              are sent.
            </p>

            {newsletterFeedback && (
              <p
                className={`mt-2 text-xs font-medium ${
                  newsletterFeedback.ok ? 'text-[#8E4D57]' : 'text-rose-700'
                }`}
              >
                {newsletterFeedback.message}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
