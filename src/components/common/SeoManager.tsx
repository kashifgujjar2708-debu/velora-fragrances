import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { FAQ_ITEMS } from '../../data/seedData';
import { PRODUCT_IMAGES } from '../../data/categories';
import { getProductTotalStock } from '../../utils/format';

interface RouteSeoMeta {
  title: string;
  description: string;
  robots: string;
  ogType?: 'website' | 'product';
  image?: string;
  breadcrumbs?: { name: string; path: string }[];
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string): void {
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(id: string, payload: unknown | null): void {
  const existing = document.getElementById(id);
  if (!payload) {
    existing?.remove();
    return;
  }
  let script = existing as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(payload);
}

function truncateText(text: string, maxLen: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1).trimEnd()}…`;
}

export const SeoManager: React.FC = () => {
  const { pathname } = useLocation();
  const { products, settings } = useStore();

  useEffect(() => {
    const origin = window.location.origin;
    const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    const canonicalUrl = `${origin}${cleanPath}`;
    const toAbs = (assetPath: string) =>
      assetPath.startsWith('http') ? assetPath : `${origin}${assetPath}`;

    let meta: RouteSeoMeta = {
      title: 'VELORA FRAGRANCES — Luxury Perfumes Pakistan (Demo)',
      description:
        'Explore Velora Fragrances in Pakistan: Men’s, Women’s, Unisex, Oud & Arabic, French perfumes, attar oils, and Rose Gold gift sets in PKR.',
      robots: 'index, follow',
      ogType: 'website',
      image: PRODUCT_IMAGES.hero,
    };

    let productSchema: Record<string, unknown> | null = null;
    let faqSchema: Record<string, unknown> | null = null;

    if (cleanPath === '/') {
      meta.breadcrumbs = [{ name: 'Home', path: '/' }];
    } else if (cleanPath === '/shop') {
      const count = products.filter((p) => p.active !== false).length;
      meta = {
        title: 'Shop All Perfumes in PKR | VELORA FRAGRANCES',
        description: `Browse ${count} sample fragrances across French extraits, aged Arabian oud, non-alcoholic attar oils, and gift sets in PKR.`,
        robots: 'index, follow',
        image: PRODUCT_IMAGES.frenchAmber,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Shop All Perfumes', path: '/shop' },
        ],
      };
    } else if (cleanPath === '/collections/mens') {
      meta = {
        title: "Men's Perfumes Collection | VELORA FRAGRANCES",
        description:
          "Discover sample Men's fragrances featuring cedarwood, spiced cardamom, crisp marine citrus, and smoky leather signatures in PKR.",
        robots: 'index, follow',
        image: PRODUCT_IMAGES.oudObsidian,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: "Men's Perfumes", path: '/collections/mens' },
        ],
      };
    } else if (cleanPath === '/collections/womens') {
      meta = {
        title: "Women's Perfumes Collection | VELORA FRAGRANCES",
        description:
          "Explore sample Women's fragrances with luminous jasmine, centifolia rose, white musk, and warm vanilla accord listings in PKR.",
        robots: 'index, follow',
        image: PRODUCT_IMAGES.floralIvory,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: "Women's Perfumes", path: '/collections/womens' },
        ],
      };
    } else if (cleanPath === '/collections/unisex') {
      meta = {
        title: 'Unisex Perfumes Collection | VELORA FRAGRANCES',
        description:
          'Gender-free sample perfume compositions crafted around saffron, aged agarwood, neroli, and ambergris in Pakistani Rupees.',
        robots: 'index, follow',
        image: PRODUCT_IMAGES.freshAzure,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: 'Unisex Perfumes', path: '/collections/unisex' },
        ],
      };
    } else if (cleanPath === '/collections/oud-arabic') {
      meta = {
        title: 'Oud & Arabic Perfumes | VELORA FRAGRANCES',
        description:
          'Rich sample Eastern fragrances blending Assam agarwood, Taif rose, Omani frankincense, and sandalwood priced in PKR.',
        robots: 'index, follow',
        image: PRODUCT_IMAGES.oudObsidian,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: 'Oud & Arabic', path: '/collections/oud-arabic' },
        ],
      };
    } else if (cleanPath === '/collections/french') {
      meta = {
        title: 'French Perfumes Collection | VELORA FRAGRANCES',
        description:
          'Classic Parisian-inspired floral, chypre, and amber sample fragrance listings crafted for evening and daytime elegance.',
        robots: 'index, follow',
        image: PRODUCT_IMAGES.floralIvory,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: 'French Perfumes', path: '/collections/french' },
        ],
      };
    } else if (cleanPath === '/collections/attar-oils') {
      meta = {
        title: 'Attar & Perfume Oils (Alcohol-Free) | VELORA',
        description:
          'Concentrated non-alcoholic sample attar oils and dehn al oud crystal decanters curated for intimate longevity in Pakistan.',
        robots: 'index, follow',
        image: PRODUCT_IMAGES.attarCrystal,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: 'Attar & Oil Perfumes', path: '/collections/attar-oils' },
        ],
      };
    } else if (cleanPath === '/collections/gift-sets') {
      meta = {
        title: 'Luxury Perfume Gift Sets | VELORA FRAGRANCES',
        description:
          'Cream and Rose Gold presentation fragrance coffrets and discovery sets designed for weddings, Eid, and milestones in PKR.',
        robots: 'index, follow',
        image: PRODUCT_IMAGES.giftCoffret,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: 'Gift Sets', path: '/collections/gift-sets' },
        ],
      };
    } else if (cleanPath.startsWith('/product/')) {
      const slug = cleanPath.replace('/product/', '');
      const prod = products.find((p) => p.slug === slug && p.active !== false);
      if (prod) {
        const prices = prod.sizes.map((s) => s.pricePkr).filter((n) => n > 0);
        const lowPrice = prices.length ? Math.min(...prices) : prod.pricePkr;
        const highPrice = prices.length ? Math.max(...prices) : prod.pricePkr;
        const totalStock = getProductTotalStock(prod);
        const prodImage = prod.images[0] || PRODUCT_IMAGES.frenchAmber;

        meta = {
          title: `${prod.brand} ${prod.name} | VELORA FRAGRANCES`,
          description: truncateText(
            `${prod.concentration} · ${prod.category} (${prod.gender}) in PKR. ${prod.description}`,
            158
          ),
          robots: 'index, follow',
          ogType: 'product',
          image: prodImage,
          breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: `${prod.brand} ${prod.name}`, path: cleanPath },
          ],
        };

        // Accurate Product JSON-LD strictly matching catalog prices & stock (no invented reviews/ratings)
        productSchema = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: `${prod.brand} ${prod.name}`,
          description: prod.description,
          sku: prod.id,
          category: prod.category,
          brand: {
            '@type': 'Brand',
            name: prod.brand,
          },
          image: prod.images.map(toAbs),
          url: canonicalUrl,
          offers:
            prices.length > 1 && lowPrice !== highPrice
              ? {
                  '@type': 'AggregateOffer',
                  priceCurrency: 'PKR',
                  lowPrice,
                  highPrice,
                  offerCount: prod.sizes.length,
                  availability:
                    totalStock > 0
                      ? 'https://schema.org/InStock'
                      : 'https://schema.org/OutOfStock',
                  url: canonicalUrl,
                }
              : {
                  '@type': 'Offer',
                  priceCurrency: 'PKR',
                  price: lowPrice,
                  availability:
                    totalStock > 0
                      ? 'https://schema.org/InStock'
                      : 'https://schema.org/OutOfStock',
                  url: canonicalUrl,
                },
        };
      } else {
        meta = {
          title: 'Fragrance Not Found | VELORA FRAGRANCES',
          description: 'The requested sample fragrance listing could not be found in the catalog.',
          robots: 'noindex, follow',
        };
      }
    } else if (cleanPath === '/about') {
      meta = {
        title: 'About Velora Fragrances | Modern Luxury Perfumery',
        description:
          'Learn about the Velora Fragrances portfolio storefront rooted in Lahore, combining European perfumery clarity with Eastern oud heritage.',
        robots: 'index, follow',
        image: PRODUCT_IMAGES.atelierCraft,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'About Us', path: '/about' },
        ],
      };
    } else if (cleanPath === '/brand-identity') {
      meta = {
        title: 'Brand Identity & Packaging | VELORA FRAGRANCES',
        description:
          'Explore the Rose Gold, Warm Cream, and marble visual identity system, typography, and luxury packaging concepts for Velora Fragrances.',
        robots: 'index, follow',
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Brand Identity', path: '/brand-identity' },
        ],
      };
    } else if (cleanPath === '/contact') {
      meta = {
        title: 'Contact Concierge | VELORA FRAGRANCES (Demo)',
        description:
          'Reach the Velora Fragrances demonstration desk in Lahore for scent consultations, corporate gift coffret inquiries, or feedback.',
        robots: 'index, follow',
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ],
      };
    } else if (cleanPath === '/faq') {
      meta = {
        title: 'FAQ & Pakistan Delivery Policy | VELORA FRAGRANCES',
        description:
          'Answers on Pakistan delivery timelines, PKR demo checkout, return terms, and Eau de Parfum vs Attar oil longevity.',
        robots: 'index, follow',
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'FAQ', path: '/faq' },
        ],
      };

      faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      };
    } else if (cleanPath === '/legal') {
      meta = {
        title: 'Privacy Policy & Terms | VELORA FRAGRANCES',
        description:
          'Portfolio demonstration disclosures, sample product notices, and Pakistan delivery & return policies for Velora Fragrances.',
        robots: 'index, follow',
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Privacy & Terms', path: '/legal' },
        ],
      };
    } else if (cleanPath === '/track-order') {
      meta = {
        title: 'Order Tracking | VELORA FRAGRANCES (Demo)',
        description:
          'Track simulated parcel fulfillment stages and order timelines for sample demo orders in Pakistan.',
        robots: 'noindex, follow',
      };
    } else if (cleanPath === '/cart') {
      meta = {
        title: 'Shopping Bag | VELORA FRAGRANCES',
        description: 'Review your selected sample fragrances and apply demo discount codes in PKR.',
        robots: 'noindex, nofollow',
      };
    } else if (cleanPath === '/checkout') {
      meta = {
        title: 'Demo Checkout | VELORA FRAGRANCES',
        description: 'Simulated PKR order placement for Velora Fragrances portfolio demo.',
        robots: 'noindex, nofollow',
      };
    } else if (cleanPath === '/account') {
      meta = {
        title: 'My Account | VELORA FRAGRANCES',
        description: 'Access your customer demo profile and simulated order history.',
        robots: 'noindex, nofollow',
      };
    } else if (cleanPath === '/wishlist') {
      meta = {
        title: 'Saved Wishlist | VELORA FRAGRANCES',
        description: 'View your saved sample fragrances and gift sets.',
        robots: 'noindex, nofollow',
      };
    } else if (cleanPath === '/admin') {
      meta = {
        title: 'Staff Admin Portal | VELORA FRAGRANCES',
        description: 'Restricted staff administration dashboard for Velora Fragrances.',
        robots: 'noindex, nofollow',
      };
    }

    document.title = meta.title;
    upsertMeta('name', 'description', meta.description);
    upsertMeta('name', 'robots', meta.robots);
    upsertCanonical(canonicalUrl);

    const ogImage = toAbs(meta.image || PRODUCT_IMAGES.hero);
    upsertMeta('property', 'og:type', meta.ogType ?? 'website');
    upsertMeta('property', 'og:site_name', settings.brandName || 'VELORA FRAGRANCES');
    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', ogImage);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', meta.title);
    upsertMeta('name', 'twitter:description', meta.description);
    upsertMeta('name', 'twitter:image', ogImage);

    // Organization & WebSite JSON-LD
    upsertJsonLd('velora-org-jsonld', {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${origin}/#organization`,
          name: settings.brandName || 'VELORA FRAGRANCES',
          url: origin,
          logo: `${origin}/favicon.svg`,
          description:
            'Portfolio and demonstration luxury fragrance e-commerce showcase styled in Rose Gold and Cream.',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Lahore',
            addressCountry: 'PK',
          },
        },
        {
          '@type': 'WebSite',
          '@id': `${origin}/#website`,
          name: settings.brandName || 'VELORA FRAGRANCES',
          url: origin,
          inLanguage: 'en',
          publisher: { '@id': `${origin}/#organization` },
          potentialAction: {
            '@type': 'SearchAction',
            target: `${origin}/shop?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    });

    // BreadcrumbList JSON-LD
    if (meta.breadcrumbs && meta.breadcrumbs.length > 0) {
      upsertJsonLd('velora-breadcrumb-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: meta.breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          item: `${origin}${b.path}`,
        })),
      });
    } else {
      upsertJsonLd('velora-breadcrumb-jsonld', null);
    }

    upsertJsonLd('velora-product-jsonld', productSchema);
    upsertJsonLd('velora-faq-jsonld', faqSchema);
  }, [pathname, products, settings.brandName]);

  return null;
};
