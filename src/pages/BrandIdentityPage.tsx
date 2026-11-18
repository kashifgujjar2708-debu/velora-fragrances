import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Check,
  Copy,
  Heart,
  MessageCircle,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  BRAND_PALETTE,
  MARBLE_ASSETS,
  PACKAGING_ASSETS,
  VeloraFaviconMark,
  VeloraLogo,
  VeloraSymbol,
} from '../components/brand/VeloraBrandMarks';
import { SafeImage } from '../components/common/SafeImage';
import { PRODUCT_IMAGES } from '../data/categories';

const PACKAGING_COLLECTIONS = [
  {
    id: 'mens',
    title: "1. Men's Perfume Packaging",
    subtitle: 'Smoked Crystal · Brushed Rose Gold Cap',
    boxSpec: 'Warm Cream (#F6EFE6) rigid board with thin Rose Gold foil frame',
    bottleSpec: 'Architectural dark-smoked flacon stamped with Rose Gold VELORA mark',
    image: PACKAGING_ASSETS.mens,
    tone: 'dark' as const,
  },
  {
    id: 'womens',
    title: "2. Women's Perfume Packaging",
    subtitle: 'Fluted Glass · Polished Rose Gold Cap',
    boxSpec: 'Soft Ivory-Cream textured linen box with Rose Gold metallic trim',
    bottleSpec: 'Fluted blush-champagne crystal bottle with sculpted Rose Gold sphere cap',
    image: PACKAGING_ASSETS.womens,
    tone: 'light' as const,
  },
  {
    id: 'unisex',
    title: '3. Unisex Perfume Packaging',
    subtitle: 'Clear Architectural Glass · Satin Collar',
    boxSpec: 'Light Beige (#EAE0D2) minimalist sleeve with centered Rose Gold symbol',
    bottleSpec: 'Clean square crystal flacon with champagne-rose metallic collar',
    image: PACKAGING_ASSETS.unisex,
    tone: 'light' as const,
  },
  {
    id: 'oud',
    title: '4. Oud Collection Packaging',
    subtitle: 'Amber Crystal · Rose Gold Leatherette Box',
    boxSpec: 'Cream grained coffret framed in Subtle Metallic Gold & Rose Gold trim',
    bottleSpec: 'Heavy faceted amber flacon topped with brushed Rose Gold cylinder cap',
    image: PACKAGING_ASSETS.oud,
    tone: 'dark' as const,
  },
  {
    id: 'giftset',
    title: '5. Gift Set Packaging',
    subtitle: 'Velvet-Lined Presentation Coffret',
    boxSpec: 'Cream rigid keepsake box with Rose Gold clasp & dual bottle cradle',
    bottleSpec: 'Paired 50ml flacons + refillable Rose Gold travel atomizer',
    image: PACKAGING_ASSETS.giftset,
    tone: 'light' as const,
  },
];

const INSTAGRAM_POSTS = [
  {
    id: 'ig-1',
    type: 'Brand Introduction',
    headline: 'VELORA FRAGRANCES',
    caption: 'Make Every Moment Memorable.',
    bgImage: MARBLE_ASSETS.light,
    overlayTone: 'light' as const,
  },
  {
    id: 'ig-2',
    type: 'Product Launch',
    headline: 'Oud Imperial Reserve',
    caption: 'Now unveiled in 100ml Extrait',
    bgImage: PACKAGING_ASSETS.oud,
    overlayTone: 'dark' as const,
  },
  {
    id: 'ig-3',
    type: 'Minimal Quote',
    headline: '“Scent is the quiet architecture of memory.”',
    caption: 'Velora Atelier · Modern Luxury',
    bgImage: MARBLE_ASSETS.light,
    overlayTone: 'quote' as const,
  },
  {
    id: 'ig-4',
    type: 'New Perfume Collection',
    headline: 'The Rose Gold & Cream Edition',
    caption: 'Men’s · Women’s · Unisex · Oud',
    bgImage: PACKAGING_ASSETS.womens,
    overlayTone: 'dark' as const,
  },
  {
    id: 'ig-5',
    type: 'Luxury Product Promotional',
    headline: 'Crafted in Saffron, Rose & Agarwood',
    caption: 'Explore the Signature Coffret',
    bgImage: PACKAGING_ASSETS.giftset,
    overlayTone: 'dark' as const,
  },
  {
    id: 'ig-6',
    type: 'Customer Appreciation',
    headline: 'Thank You, Pakistan',
    caption: 'Sample Portfolio Appreciation Post',
    bgImage: MARBLE_ASSETS.dark,
    overlayTone: 'dark-marble' as const,
  },
  {
    id: 'ig-7',
    type: 'Pour Homme Spotlight',
    headline: 'Architectural Woods',
    caption: 'Smoked Cedar & Cardamom',
    bgImage: PACKAGING_ASSETS.mens,
    overlayTone: 'dark' as const,
  },
  {
    id: 'ig-8',
    type: 'Raw Botanicals',
    headline: 'Kashmir Saffron & Taif Rose',
    caption: 'Behind the Olfactive Pyramid',
    bgImage: PRODUCT_IMAGES.atelierCraft,
    overlayTone: 'dark' as const,
  },
  {
    id: 'ig-9',
    type: 'Unisex Signature',
    headline: 'Neroli Mediterraneo',
    caption: 'Pure Daylight Poise',
    bgImage: PACKAGING_ASSETS.unisex,
    overlayTone: 'dark' as const,
  },
];

export const BrandIdentityPage: React.FC = () => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [marblePreviewTone, setMarblePreviewTone] = useState<'light' | 'dark'>('light');
  const [fbCoverMode, setFbCoverMode] = useState<'intro' | 'collection'>('intro');

  const handleCopyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    window.setTimeout(() => setCopiedHex(null), 1800);
  };

  return (
    <div className="bg-[#FCFBF9] text-[#252525]">
      {/* Opening Presentation Hero with Light Marble Texture */}
      <section className="relative overflow-hidden border-b border-[#B76E79]/25">
        <div className="absolute inset-0">
          <SafeImage
            src={MARBLE_ASSETS.light}
            alt="White and warm cream marble with subtle rose gold veins"
            className="h-full w-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FCFBF9]/80 via-[#F6EFE6]/70 to-[#FCFBF9]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8E4D57]">
            Portfolio & Demo Brand Identity Presentation · Modern Luxury
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl lg:text-6xl font-medium text-[#252525] text-balance">
            Velora Fragrances — Brand Identity System
          </h1>
          <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-[#66635D]">
            Original luxury identity presentation crafted for Velora Fragrances (“Make Every Moment
            Memorable.”). Showcasing artistic serif typography, an original Rose Gold abstract
            symbol, Cream + Rose Gold packaging, light & dark marble surfaces, Instagram & Facebook
            systems, Letter “V” favicon, and complete visual guidelines.
          </p>

          {/* Identity Direction Summary Strip */}
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5 border-t border-[#B76E79]/25 pt-6 text-xs">
            <div>
              <p className="text-[#66635D]">Logo Style</p>
              <p className="mt-1 font-medium text-[#252525]">Artistic Serif Typography</p>
            </div>
            <div>
              <p className="text-[#66635D]">Main Accent</p>
              <p className="mt-1 font-medium text-[#8E4D57]">Rose Gold (#B76E79)</p>
            </div>
            <div>
              <p className="text-[#66635D]">Brand Symbol</p>
              <p className="mt-1 font-medium text-[#252525]">Original Abstract Emblem</p>
            </div>
            <div>
              <p className="text-[#66635D]">Packaging & Texture</p>
              <p className="mt-1 font-medium text-[#252525]">Cream + Rose Gold · Marble</p>
            </div>
            <div>
              <p className="text-[#66635D]">Favicon & Social</p>
              <p className="mt-1 font-medium text-[#252525]">Letter V · IG & Facebook</p>
            </div>
          </div>

          {/* Quick Jump Index */}
          <nav aria-label="Brand identity sections" className="mt-8 flex flex-wrap gap-2">
            {[
              ['#section-main-logo', '01. Main Logo'],
              ['#section-variations', '02. Logo Variations'],
              ['#section-palette', '03. Color Palette'],
              ['#section-typography', '04. Typography'],
              ['#section-symbol', '05. Abstract Symbol'],
              ['#section-packaging', '06. Packaging'],
              ['#section-marble', '07. Marble System'],
              ['#section-instagram', '08. Instagram'],
              ['#section-facebook', '09. Facebook'],
              ['#section-favicon', '10. Favicon'],
              ['#section-guidelines', '11. Guidelines'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="border border-[#B76E79]/30 bg-white/90 px-3 py-1.5 text-xs font-medium text-[#252525] hover:border-[#B76E79] hover:text-[#8E4D57] transition-colors whitespace-nowrap"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* SECTION 01: MAIN LOGO */}
      <section id="section-main-logo" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-b border-[#252525]/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E4D57]">
              01. Main Logo Design
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-medium">
              Artistic Serif Typography in Rose Gold
            </h2>
            <p className="text-sm leading-relaxed text-[#66635D]">
              The primary Velora Fragrances wordmark pairs sculpted high-contrast serif proportions
              (<strong className="text-[#252525]">VELORA</strong>) with widely tracked uppercase
              sub-lettering (<strong className="text-[#252525]">FRAGRANCES</strong>) underneath,
              anchored by our original abstract luxury symbol in a balanced Rose Gold finish.
            </p>
            <ul className="space-y-2 text-xs text-[#66635D] pt-2">
              <li>• Primary focus on “VELORA” for immediate shelf and mobile recognition.</li>
              <li>• Widely spaced “FRAGRANCES” sub-title maintains luxury proportion.</li>
              <li>• Engineered for crisp legibility from 120px web headers to 18mm bottle labels.</li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="relative overflow-hidden border border-[#B76E79]/35 bg-[#F6EFE6] p-12 sm:p-16 flex flex-col items-center justify-center text-center min-h-[280px]">
              <VeloraLogo layout="horizontal" tone="rosegold-light" size="lg" />
              <p className="mt-6 text-[11px] uppercase tracking-[0.24em] text-[#66635D]">
                Make Every Moment Memorable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 02: LOGO VARIATIONS (ALL 6) */}
      <section id="section-variations" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-b border-[#252525]/10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E4D57]">
          02. Logo System
        </p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium">
          Six Essential Logo Variations
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[#66635D]">
          Every application—from website headers and bottle caps to foil embossing and dark marble
          banners—uses one of six standardized lockups.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. Main Horizontal */}
          <div className="border border-[#252525]/10 bg-white flex flex-col">
            <div className="h-48 flex items-center justify-center bg-[#FCFBF9] p-6 border-b border-[#252525]/8">
              <VeloraLogo layout="horizontal" tone="rosegold-light" size="md" />
            </div>
            <div className="p-5">
              <h3 className="font-display text-xl font-medium">1. Main Horizontal Logo</h3>
              <p className="mt-1 text-xs text-[#66635D]">
                Primary lockup for desktop website header, packaging sleeves, and digital covers.
              </p>
            </div>
          </div>

          {/* 2. Compact Logo */}
          <div className="border border-[#252525]/10 bg-white flex flex-col">
            <div className="h-48 flex items-center justify-center bg-[#F6EFE6] p-6 border-b border-[#252525]/8">
              <VeloraLogo layout="compact" tone="rosegold-light" size="md" />
            </div>
            <div className="p-5">
              <h3 className="font-display text-xl font-medium">2. Compact Stacked Logo</h3>
              <p className="mt-1 text-xs text-[#66635D]">
                Centered vertical composition tailored for square perfume boxes and gift seals.
              </p>
            </div>
          </div>

          {/* 3. Symbol-Only */}
          <div className="border border-[#252525]/10 bg-white flex flex-col">
            <div className="h-48 flex items-center justify-center bg-[#FCFBF9] p-6 border-b border-[#252525]/8">
              <VeloraLogo layout="symbol-only" tone="rosegold-light" size="lg" />
            </div>
            <div className="p-5">
              <h3 className="font-display text-xl font-medium">3. Symbol-Only Logo</h3>
              <p className="mt-1 text-xs text-[#66635D]">
                Standalone abstract mark for bottle cap engraving, Instagram & Facebook avatars.
              </p>
            </div>
          </div>

          {/* 4. Single-Color */}
          <div className="border border-[#252525]/10 bg-white flex flex-col">
            <div className="h-48 flex items-center justify-center bg-[#EAE0D2] p-6 border-b border-[#252525]/8">
              <VeloraLogo layout="horizontal" tone="monochrome-dark" size="md" />
            </div>
            <div className="p-5">
              <h3 className="font-display text-xl font-medium">4. Single-Color Logo</h3>
              <p className="mt-1 text-xs text-[#66635D]">
                Pure monochrome charcoal finish for blind debossing, tissue wrap, and print specs.
              </p>
            </div>
          </div>

          {/* 5. Light-Background */}
          <div className="border border-[#252525]/10 bg-white flex flex-col">
            <div className="relative h-48 flex items-center justify-center overflow-hidden p-6 border-b border-[#252525]/8">
              <SafeImage
                src={MARBLE_ASSETS.light}
                alt="Light marble surface"
                className="absolute inset-0 h-full w-full object-cover opacity-75"
              />
              <div className="relative z-10 bg-white/80 backdrop-blur-xs px-5 py-3 border border-[#B76E79]/30">
                <VeloraLogo layout="horizontal" tone="rosegold-light" size="sm" />
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-display text-xl font-medium">5. Light-Background Version</h3>
              <p className="mt-1 text-xs text-[#66635D]">
                Deep Rose Gold & muted charcoal paired over Soft White, Cream, and Light Marble.
              </p>
            </div>
          </div>

          {/* 6. Dark-Background */}
          <div className="border border-[#252525]/10 bg-white flex flex-col">
            <div className="relative h-48 flex items-center justify-center bg-[#252525] overflow-hidden p-6 border-b border-[#252525]/8">
              <SafeImage
                src={MARBLE_ASSETS.dark}
                alt="Dark smoked marble surface"
                className="absolute inset-0 h-full w-full object-cover opacity-55"
              />
              <div className="relative z-10">
                <VeloraLogo layout="horizontal" tone="rosegold-dark" size="md" />
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-display text-xl font-medium">6. Dark-Background Version</h3>
              <p className="mt-1 text-xs text-[#66635D]">
                Luminous Rose Gold & Warm Cream sub-title for Men’s, Oud, and dark marble banners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 03: COLOR PALETTE */}
      <section id="section-palette" className="bg-[#F6EFE6]/55 border-b border-[#252525]/10 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E4D57]">
            03. Color System
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium">
            Rose Gold, Warm Cream & Charcoal Palette
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#66635D]">
            Click any swatch to copy its exact HEX code. Engineered for cohesive elegance across
            storefront UI, rigid cream boxes, Rose Gold foil, and social posts.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BRAND_PALETTE.map((swatch) => (
              <button
                key={swatch.hex}
                type="button"
                onClick={() => handleCopyHex(swatch.hex)}
                className="group text-left bg-white border border-[#252525]/10 overflow-hidden transition-all hover:border-[#B76E79]"
              >
                <div
                  className="h-28 w-full border-b border-[#252525]/10 relative"
                  style={{ backgroundColor: swatch.hex }}
                >
                  <span className="absolute bottom-2.5 right-3 inline-flex items-center gap-1 bg-white/92 px-2.5 py-1 font-mono text-[11px] font-medium text-[#252525]">
                    {copiedHex === swatch.hex ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-700" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>{swatch.hex}</span>
                      </>
                    )}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#8E4D57] font-semibold">
                    {swatch.role}
                  </p>
                  <div className="mt-1 flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-2xl font-medium text-[#252525]">
                      {swatch.name}
                    </h3>
                    <span className="font-mono text-xs text-[#66635D]">{swatch.rgb}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#66635D]">{swatch.usage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 04: TYPOGRAPHY SYSTEM */}
      <section id="section-typography" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-b border-[#252525]/10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E4D57]">
          04. Typography System
        </p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium">
          Primary Display Serif & Clean Supporting Sans
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="border border-[#252525]/10 bg-white p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[#252525]/10 pb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#8E4D57] font-semibold">
                  Primary Font · Brand & Headings
                </p>
                <h3 className="font-display text-3xl font-medium mt-1">Cormorant Garamond</h3>
              </div>
              <span className="font-mono text-xs text-[#66635D]">Weights 400 / 500 / 600</span>
            </div>

            <p className="font-display text-5xl sm:text-6xl leading-none text-[#252525]">
              Aa Bb Cc
            </p>
            <p className="font-display text-2xl italic text-[#8E4D57]">
              “Make Every Moment Memorable.”
            </p>
            <p className="text-xs leading-relaxed text-[#66635D]">
              Recommended web alternatives: <strong className="text-[#252525]">Cormorant Garamond</strong>,{' '}
              <strong className="text-[#252525]">Playfair Display</strong>, or{' '}
              <strong className="text-[#252525]">Bodoni Moda</strong>. Applied to the wordmark
              with wide uppercase tracking (`0.22em`) and to section headlines with tight balanced
              leading.
            </p>
          </div>

          <div className="border border-[#252525]/10 bg-white p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[#252525]/10 pb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#8E4D57] font-semibold">
                  Secondary Font · Descriptions & UI
                </p>
                <h3 className="font-sans text-2xl font-semibold mt-1">Plus Jakarta Sans</h3>
              </div>
              <span className="font-mono text-xs text-[#66635D]">Weights 400 / 500 / 600</span>
            </div>

            <p className="font-sans text-4xl sm:text-5xl font-medium tracking-tight text-[#252525]">
              Aa Bb Cc 123
            </p>
            <p className="font-sans text-sm leading-relaxed text-[#66635D]">
              Crafted for crisp fragrance pyramids, PKR tabular pricing, navigation labels, and
              long-form descriptions across mobile and desktop screens.
            </p>
            <p className="text-xs leading-relaxed text-[#66635D]">
              Recommended web alternatives: <strong className="text-[#252525]">Plus Jakarta Sans</strong>,{' '}
              <strong className="text-[#252525]">DM Sans</strong>, or{' '}
              <strong className="text-[#252525]">Montserrat</strong> (for widely spaced
              sub-labels).
            </p>
          </div>
        </div>

        {/* Type Hierarchy Scale */}
        <div className="mt-8 border border-[#252525]/10 bg-[#F6EFE6]/40 p-6 sm:p-8 divide-y divide-[#252525]/10">
          <div className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <span className="font-mono text-xs text-[#66635D] w-44 shrink-0">H1 Display · 56px</span>
            <p className="font-display text-4xl sm:text-5xl font-medium flex-1">
              Velora Haute Parfumerie
            </p>
          </div>
          <div className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <span className="font-mono text-xs text-[#66635D] w-44 shrink-0">H2 Section · 36px</span>
            <p className="font-display text-3xl font-medium flex-1">
              Oud & Arabic Heritage Collection
            </p>
          </div>
          <div className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <span className="font-mono text-xs text-[#66635D] w-44 shrink-0">Subtitle · 12px / 0.2em</span>
            <p className="font-sans text-xs uppercase tracking-[0.22em] text-[#8E4D57] font-semibold flex-1">
              FRAGRANCES · EXRAIT DE PARFUM · LAHORE
            </p>
          </div>
          <div className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <span className="font-mono text-xs text-[#66635D] w-44 shrink-0">Body Prose · 15px</span>
            <p className="font-sans text-[15px] leading-relaxed text-[#66635D] flex-1">
              Aged Assam agarwood balanced with Kashmir saffron, damask rose, and warm amber resin.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 05: ABSTRACT BRAND SYMBOL */}
      <section id="section-symbol" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-b border-[#252525]/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square border border-[#B76E79]/30 bg-[#F6EFE6] flex flex-col items-center justify-center p-6">
                <VeloraSymbol className="w-28 h-28" variant="rosegold" />
                <span className="mt-4 text-[11px] uppercase tracking-[0.16em] text-[#66635D]">
                  Rose Gold on Cream
                </span>
              </div>
              <div className="aspect-square border border-[#252525]/20 bg-[#252525] flex flex-col items-center justify-center p-6">
                <VeloraSymbol className="w-28 h-28" variant="rosegold" />
                <span className="mt-4 text-[11px] uppercase tracking-[0.16em] text-[#EAE0D2]">
                  Rose Gold on Charcoal
                </span>
              </div>
              <div className="col-span-2 border border-[#252525]/10 bg-white px-6 py-5 flex items-center justify-around">
                <div className="flex flex-col items-center gap-2">
                  <VeloraSymbol className="w-12 h-12" variant="rosegold" />
                  <span className="font-mono text-[11px] text-[#66635D]">48px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <VeloraSymbol className="w-8 h-8" variant="rosegold" />
                  <span className="font-mono text-[11px] text-[#66635D]">32px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <VeloraSymbol className="w-6 h-6" variant="rosegold" />
                  <span className="font-mono text-[11px] text-[#66635D]">24px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <VeloraSymbol className="w-4 h-4" variant="charcoal" />
                  <span className="font-mono text-[11px] text-[#66635D]">16px Mono</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E4D57]">
              05. Abstract Luxury Symbol
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-medium">
              The Sculpted Flacon & Prism Mark
            </h2>
            <p className="text-sm leading-relaxed text-[#66635D]">
              Designed without borrowed crowns, flowers, or third-party monograms, the Velora
              symbol merges an outer botanical drop silhouette with an inverted “V” prism cut and a
              central vertical equilibrium axis.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="border border-[#252525]/10 bg-white p-4">
                <p className="font-semibold text-[#252525]">Independent Recognition</p>
                <p className="mt-1 text-[#66635D]">
                  Stands alone on metallic bottle caps, wax/foil gift seals, and circular social
                  profile avatars.
                </p>
              </div>
              <div className="border border-[#252525]/10 bg-white p-4">
                <p className="font-semibold text-[#252525]">Optical Precision</p>
                <p className="mt-1 text-[#66635D]">
                  Uniform 1.7px stroke weight scales seamlessly from 16px micro-stamps to large
                  storefront displays.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 06: PERFUME PACKAGING DESIGN (5 COLLECTIONS, CREAM + ROSE GOLD) */}
      <section id="section-packaging" className="bg-[#F6EFE6]/60 border-b border-[#252525]/10 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E4D57]">
            06. Perfume Packaging Collection
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium">
            Cream + Gold Packaging with Rose Gold Metallic Accents
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#66635D]">
            Unified luxury architecture across all five collections—combining Warm Cream rigid
            boxes, subtle marble presentation surfaces, Rose Gold caps, and metallic foil stamping.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {PACKAGING_COLLECTIONS.map((item) => (
              <article
                key={item.id}
                className="bg-white border border-[#B76E79]/25 overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F6EFE6]">
                  <SafeImage
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                  {/* Rose Gold Metallic Plaque Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 bg-[#FCFBF9]/94 backdrop-blur-xs border border-[#B76E79]/45 px-4 py-2.5 flex items-center justify-between">
                    <VeloraLogo layout="horizontal" tone="rosegold-light" size="sm" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#66635D]">
                      100ml Extrait
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#8E4D57] font-semibold">
                      {item.subtitle}
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-medium text-[#252525]">
                      {item.title}
                    </h3>
                  </div>

                  <div className="space-y-1.5 border-t border-[#252525]/10 pt-3 text-xs text-[#66635D]">
                    <p>
                      <strong className="text-[#252525]">Box:</strong> {item.boxSpec}
                    </p>
                    <p>
                      <strong className="text-[#252525]">Bottle:</strong> {item.bottleSpec}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 07: MARBLE BRAND BACKGROUND SYSTEM */}
      <section id="section-marble" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-b border-[#252525]/10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E4D57]">
              07. Marble Background System
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium">
              Light Cream & Smoked Dark Rose-Gold Marble
            </h2>
          </div>

          <div className="inline-flex border border-[#252525]/15 bg-white p-1">
            <button
              type="button"
              onClick={() => setMarblePreviewTone('light')}
              className={`px-4 py-1.5 text-xs font-medium transition-colors ${
                marblePreviewTone === 'light'
                  ? 'bg-[#252525] text-white'
                  : 'text-[#66635D] hover:text-[#252525]'
              }`}
            >
              Light Marble
            </button>
            <button
              type="button"
              onClick={() => setMarblePreviewTone('dark')}
              className={`px-4 py-1.5 text-xs font-medium transition-colors ${
                marblePreviewTone === 'dark'
                  ? 'bg-[#252525] text-white'
                  : 'text-[#66635D] hover:text-[#252525]'
              }`}
            >
              Darker Smoked Marble
            </button>
          </div>
        </div>

        {/* Interactive Full-Width Marble Stage */}
        <div className="mt-8 relative aspect-[16/7] min-h-[260px] overflow-hidden border border-[#B76E79]/35">
          <SafeImage
            src={marblePreviewTone === 'light' ? MARBLE_ASSETS.light : MARBLE_ASSETS.dark}
            alt="Velora Rose Gold Veined Marble Texture"
            className="h-full w-full object-cover"
          />
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center ${
              marblePreviewTone === 'light' ? 'bg-white/25' : 'bg-black/35'
            }`}
          >
            <VeloraLogo
              layout="compact"
              tone={marblePreviewTone === 'light' ? 'rosegold-light' : 'rosegold-dark'}
              size="lg"
            />
            <p
              className={`mt-4 text-xs uppercase tracking-[0.22em] ${
                marblePreviewTone === 'light' ? 'text-[#252525]' : 'text-[#F6EFE6]'
              }`}
            >
              {marblePreviewTone === 'light'
                ? 'Primary Light Marble · Soft White & Cream with Delicate Rose Gold Veins'
                : 'Secondary Dark Marble · Smoked Taupe-Charcoal with Rose Gold Veins'}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-[#252525]/10 bg-white p-5 flex items-center gap-4">
            <div className="h-20 w-28 shrink-0 overflow-hidden border border-[#252525]/10">
              <SafeImage src={MARBLE_ASSETS.light} alt="Light marble swatch" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-[#252525]">Light Marble Surface</p>
              <p className="mt-1 text-[#66635D]">
                Use behind hero banners, quote cards, product cards, and Women’s / Unisex social
                templates.
              </p>
            </div>
          </div>

          <div className="border border-[#252525]/10 bg-white p-5 flex items-center gap-4">
            <div className="h-20 w-28 shrink-0 overflow-hidden border border-[#252525]/10">
              <SafeImage src={MARBLE_ASSETS.dark} alt="Dark marble swatch" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-[#252525]">Darker Smoked Marble Surface</p>
              <p className="mt-1 text-[#66635D]">
                Reserved for Oud Collection launches, Men’s night campaigns, and evening gift box
                campaigns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 08: INSTAGRAM BRANDING (PROFILE + 3x3 GRID) */}
      <section id="section-instagram" className="bg-[#F6EFE6]/55 border-b border-[#252525]/10 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E4D57]">
            08. Instagram Branding
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium">
            Profile Appearance & 3 × 3 Branded Post Grid
          </h2>

          <div className="mt-10 mx-auto max-w-4xl border border-[#252525]/12 bg-white shadow-sm">
            {/* IG Profile Header */}
            <div className="p-6 sm:p-8 border-b border-[#252525]/10">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="h-24 w-24 shrink-0 rounded-full border-2 border-[#B76E79] bg-[#F6EFE6] flex items-center justify-center">
                  <VeloraSymbol className="w-12 h-12" variant="rosegold" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-base text-[#252525]">
                      velorafragrances
                    </span>
                    <span className="bg-[#252525] px-4 py-1 text-xs font-medium text-white">
                      Follow (Concept)
                    </span>
                    <span className="border border-[#252525]/20 px-4 py-1 text-xs font-medium">
                      Shop
                    </span>
                  </div>

                  <div className="mt-3 flex gap-6 text-xs text-[#252525] tabular-nums">
                    <span>
                      <strong>9</strong> Concept Posts
                    </span>
                    <span>
                      <strong>Demo</strong> Portfolio Profile
                    </span>
                    <span>
                      <strong>Lahore</strong> Atelier
                    </span>
                  </div>

                  <div className="mt-3 text-xs leading-relaxed">
                    <p className="font-semibold text-[#252525]">Velora Fragrances</p>
                    <p className="text-[#8E4D57] font-medium">Make Every Moment Memorable.</p>
                    <p className="text-[#66635D]">
                      Modern Luxury Perfumery · French Extraits, Aged Oud & Pure Attar · Pakistan
                    </p>
                  </div>
                </div>
              </div>

              {/* Story Highlights */}
              <div className="mt-6 flex gap-5 overflow-x-auto pb-1">
                {['Oud Reserve', 'French', 'Packaging', 'Gift Sets', 'Notes'].map((label) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="h-14 w-14 rounded-full border border-[#B76E79] bg-[#F6EFE6] flex items-center justify-center">
                      <VeloraSymbol className="w-6 h-6" variant="rosegold" />
                    </div>
                    <span className="text-[11px] text-[#66635D]">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3x3 Branded Post Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 bg-[#FCFBF9] p-1">
              {INSTAGRAM_POSTS.map((post) => (
                <div
                  key={post.id}
                  className="group relative aspect-square overflow-hidden bg-[#F6EFE6]"
                >
                  <SafeImage
                    src={post.bgImage}
                    alt={post.type}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div
                    className={`absolute inset-0 flex flex-col justify-between p-4 ${
                      post.overlayTone === 'light'
                        ? 'bg-white/65 text-[#252525]'
                        : post.overlayTone === 'quote'
                        ? 'bg-[#F6EFE6]/82 text-[#252525]'
                        : 'bg-gradient-to-t from-black/75 via-black/25 to-black/15 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] uppercase tracking-[0.16em] font-semibold ${
                          post.overlayTone === 'light' || post.overlayTone === 'quote'
                            ? 'text-[#8E4D57]'
                            : 'text-[#E2B4B8]'
                        }`}
                      >
                        {post.type}
                      </span>
                      <VeloraSymbol
                        className="w-5 h-5"
                        variant={
                          post.overlayTone === 'light' || post.overlayTone === 'quote'
                            ? 'rosegold'
                            : 'cream'
                        }
                      />
                    </div>

                    <div className="text-center px-2">
                      <p className="font-display text-xl sm:text-2xl leading-tight font-medium">
                        {post.headline}
                      </p>
                      <p
                        className={`mt-1 text-[11px] tracking-wide ${
                          post.overlayTone === 'light' || post.overlayTone === 'quote'
                            ? 'text-[#66635D]'
                            : 'text-[#EAE0D2]'
                        }`}
                      >
                        {post.caption}
                      </p>
                    </div>

                    <div className="flex items-center justify-between opacity-80 pt-1">
                      <div className="flex items-center gap-2.5">
                        <Heart className="w-3.5 h-3.5" />
                        <MessageCircle className="w-3.5 h-3.5" />
                        <Send className="w-3.5 h-3.5" />
                      </div>
                      <Bookmark className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 09: FACEBOOK BRANDING */}
      <section id="section-facebook" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-b border-[#252525]/10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E4D57]">
              09. Facebook Branding
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium">
              Profile Picture & Cover Banner Designs
            </h2>
          </div>

          <div className="inline-flex border border-[#252525]/15 bg-white p-1">
            <button
              type="button"
              onClick={() => setFbCoverMode('intro')}
              className={`px-4 py-1.5 text-xs font-medium transition-colors ${
                fbCoverMode === 'intro' ? 'bg-[#252525] text-white' : 'text-[#66635D]'
              }`}
            >
              Brand Introduction Cover
            </button>
            <button
              type="button"
              onClick={() => setFbCoverMode('collection')}
              className={`px-4 py-1.5 text-xs font-medium transition-colors ${
                fbCoverMode === 'collection' ? 'bg-[#252525] text-white' : 'text-[#66635D]'
              }`}
            >
              Product Collection Cover
            </button>
          </div>
        </div>

        <div className="mt-8 mx-auto max-w-5xl border border-[#252525]/12 bg-white overflow-hidden">
          {/* Cover Banner */}
          <div className="relative aspect-[16/6] min-h-[220px] bg-[#F6EFE6] overflow-hidden">
            <SafeImage
              src={fbCoverMode === 'intro' ? MARBLE_ASSETS.light : PACKAGING_ASSETS.giftset}
              alt="Facebook Cover Banner"
              className="h-full w-full object-cover"
            />
            <div
              className={`absolute inset-0 flex flex-col justify-center px-8 sm:px-14 ${
                fbCoverMode === 'intro'
                  ? 'bg-gradient-to-r from-[#FCFBF9]/92 via-[#F6EFE6]/78 to-transparent text-[#252525]'
                  : 'bg-gradient-to-r from-black/75 via-black/45 to-transparent text-white'
              }`}
            >
              {fbCoverMode === 'intro' ? (
                <>
                  <VeloraLogo layout="horizontal" tone="rosegold-light" size="md" />
                  <p className="mt-3 font-display text-2xl sm:text-3xl italic text-[#8E4D57]">
                    Make Every Moment Memorable.
                  </p>
                  <p className="mt-1.5 max-w-md text-xs text-[#66635D]">
                    Modern Luxury Perfumery · French Extraits, Aged Oud & Pure Attar Oils.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#E2B4B8] font-semibold">
                    Signature Rose Gold & Cream Collection
                  </p>
                  <h3 className="mt-2 font-display text-3xl sm:text-4xl font-medium">
                    Crafted Gift Coffrets & Extraits
                  </h3>
                  <p className="mt-2 max-w-md text-xs text-[#EAE0D2]">
                    Discover Men’s, Women’s, Unisex & Oud Editions in PKR · Free Standard Delivery
                    Rs. 5,000+
                  </p>
                </>
              )}
            </div>
          </div>

          {/* FB Profile Bar */}
          <div className="px-6 sm:px-10 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#B76E79]/25">
            <div className="flex items-center gap-4">
              <div className="-mt-12 relative z-10 h-24 w-24 rounded-full border-4 border-white bg-[#F6EFE6] shadow-md flex items-center justify-center">
                <VeloraSymbol className="w-12 h-12" variant="rosegold" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-semibold text-[#252525]">
                  Velora Fragrances
                </h3>
                <p className="text-xs text-[#66635D]">
                  Perfume House · Demo Brand Page · Make Every Moment Memorable.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="bg-[#B76E79] px-4 py-2 text-xs font-medium text-white">
                Shop Now
              </span>
              <span className="border border-[#252525]/20 px-4 py-2 text-xs font-medium text-[#252525]">
                Message
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10: WEBSITE FAVICON ("V") */}
      <section id="section-favicon" className="bg-[#F6EFE6]/55 border-b border-[#252525]/10 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E4D57]">
            10. Website Favicon
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium">
            Letter “V” Rose Gold Serif Favicon
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#66635D]">
            Active now in your browser tab (`public/favicon.svg`). Crafted with a sculpted serif “V”
            in Rose Gold over Warm Cream (`#F6EFE6`) and Soft White (`#FFFFFF`) for razor-sharp
            recognition across 16×16, 32×32, and 48×48 viewports.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 grid grid-cols-3 gap-4">
              {([16, 32, 48] as const).map((px) => (
                <div
                  key={px}
                  className="border border-[#252525]/10 bg-white p-6 flex flex-col items-center justify-center text-center"
                >
                  <div className="h-20 flex items-center justify-center">
                    <VeloraFaviconMark pixelSize={px} background="cream" />
                  </div>
                  <p className="mt-3 font-mono text-xs font-semibold text-[#252525]">
                    {px} × {px} px
                  </p>
                  <p className="text-[11px] text-[#66635D] mt-0.5">
                    {px === 16 ? 'Browser Tab' : px === 32 ? 'Taskbar / Retina' : 'Bookmark Tile'}
                  </p>
                </div>
              ))}
            </div>

            <div className="lg:col-span-5 border border-[#252525]/10 bg-white p-6 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8E4D57]">
                Browser Tab Mockup
              </p>
              <div className="border border-[#252525]/15 bg-[#EAE0D2]/50 p-2">
                <div className="inline-flex items-center gap-2.5 bg-white px-3.5 py-2 border border-[#252525]/10 max-w-full">
                  <VeloraFaviconMark pixelSize={16} background="cream" />
                  <span className="text-xs font-medium text-[#252525] truncate">
                    VELORA FRAGRANCES — Make Every Moment Memorable
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <VeloraFaviconMark pixelSize={48} background="cream" />
                <VeloraFaviconMark pixelSize={48} background="white" />
                <p className="text-xs text-[#66635D]">
                  Paired Cream (`#F6EFE6`) & White (`#FFFFFF`) square variations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 11: BRAND VISUAL GUIDELINES */}
      <section id="section-guidelines" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E4D57]">
          11. Brand Visual Guidelines
        </p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium">
          Standards, Usage Rules & Logo Discipline
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 text-xs leading-relaxed text-[#66635D]">
          <div className="border border-[#252525]/10 bg-white p-6">
            <h3 className="font-display text-xl font-medium text-[#252525]">
              Main Logo & Clearspace
            </h3>
            <p className="mt-2">
              Maintain minimum clearspace equal to the height of the capital “V” on all four sides
              of the horizontal or compact lockup. Minimum digital width is 140px for the full
              horizontal lockup; below 140px, switch to the Symbol-Only mark.
            </p>
          </div>

          <div className="border border-[#252525]/10 bg-white p-6">
            <h3 className="font-display text-xl font-medium text-[#252525]">
              Color & Surface Hierarchy
            </h3>
            <p className="mt-2">
              Maintain 60% Soft White (`#FCFBF9`) or Warm Cream (`#F6EFE6`), 30% Light Beige
              (`#EAE0D2`) & Charcoal (`#252525`), and 10% Rose Gold (`#B76E79`) / Subtle Metallic
              Gold (`#C9A46B`) reserved strictly for focal brand elements and metallic trim.
            </p>
          </div>

          <div className="border border-[#252525]/10 bg-white p-6">
            <h3 className="font-display text-xl font-medium text-[#252525]">
              Typography & Spacing Rules
            </h3>
            <p className="mt-2">
              Pair `Cormorant Garamond` headlines with `Plus Jakarta Sans` body prose. Always set
              “FRAGRANCES” in uppercase with wide letter-spacing (`0.42em+`) beneath “VELORA”. Never
              compress tracking on the sub-wordmark.
            </p>
          </div>

          <div className="border border-[#252525]/10 bg-white p-6">
            <h3 className="font-display text-xl font-medium text-[#252525]">
              Packaging & Marble Rules
            </h3>
            <p className="mt-2">
              Boxes use matte Warm Cream or Light Beige stock with Rose Gold metallic caps and foil
              trim. Light Marble serves as the default editorial backdrop; Darker Smoked Marble is
              reserved for Oud and Men’s evening editions.
            </p>
          </div>

          <div className="border border-[#252525]/10 bg-white p-6">
            <h3 className="font-display text-xl font-medium text-[#252525]">
              Instagram & Facebook Rules
            </h3>
            <p className="mt-2">
              Use the Symbol-Only Rose Gold mark on Warm Cream as the universal profile avatar.
              Maintain generous negative space and alternate product photography with Cream Marble
              quote cards across the 3 × 3 grid.
            </p>
          </div>

          <div className="border border-[#252525]/10 bg-white p-6">
            <h3 className="font-display text-xl font-medium text-[#252525]">
              Portfolio Scope Note
            </h3>
            <p className="mt-2">
              This identity book is a portfolio demonstration concept for Velora Fragrances.
              Business stationery (cards, envelopes, letterheads) is intentionally excluded per the
              creative brief.
            </p>
          </div>
        </div>

        {/* Correct vs Incorrect Logo Usage */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="border border-emerald-300 bg-white p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-4">
              <ShieldCheck className="h-4 w-4" />
              <span>Correct Usage</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-[#252525]/10 bg-[#FCFBF9] p-6 flex items-center justify-center">
                <VeloraLogo layout="horizontal" tone="rosegold-light" size="sm" />
              </div>
              <div className="border border-[#252525]/10 bg-[#252525] p-6 flex items-center justify-center">
                <VeloraLogo layout="compact" tone="rosegold-dark" size="sm" />
              </div>
            </div>
            <p className="mt-3 text-xs text-[#66635D]">
              Preserve original aspect ratios, Rose Gold contrast, and clearspace over calm Cream,
              Soft White, or Charcoal surfaces.
            </p>
          </div>

          <div className="border border-rose-300 bg-white p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-800 mb-4">
              <X className="h-4 w-4" />
              <span>Incorrect Usage (Prohibited)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-rose-200 bg-rose-50 p-6 flex items-center justify-center overflow-hidden">
                <div className="scale-x-125 -skew-x-12 opacity-80">
                  <VeloraLogo layout="horizontal" tone="rosegold-light" size="sm" />
                </div>
              </div>
              <div className="border border-rose-200 bg-[#00A896] p-6 flex items-center justify-center">
                <VeloraLogo layout="horizontal" tone="rosegold-light" size="sm" />
              </div>
            </div>
            <p className="mt-3 text-xs text-[#66635D]">
              Never stretch, skew, outline, apply drop shadows, or place Rose Gold lettering onto
              unrelated neon or low-contrast saturated backgrounds.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[#252525]/10 pt-8">
          <p className="text-xs text-[#66635D]">
            Velora Fragrances · Modern Luxury Brand Identity Portfolio Presentation
          </p>
          <Link
            to="/shop"
            className="bg-[#252525] px-7 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:bg-[#B76E79] transition-colors"
          >
            Return to Storefront
          </Link>
        </div>
      </section>
    </div>
  );
};
