import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { ToastContainer } from './components/common/ToastContainer';
import { SeoManager } from './components/common/SeoManager';
import { HomePage } from './pages/HomePage';

const CatalogPage = lazy(() =>
  import('./pages/CatalogPage').then((m) => ({ default: m.CatalogPage }))
);
const ProductDetailsPage = lazy(() =>
  import('./pages/ProductDetailsPage').then((m) => ({ default: m.ProductDetailsPage }))
);
const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const ContactPage = lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage }))
);
const CartPage = lazy(() =>
  import('./pages/CartPage').then((m) => ({ default: m.CartPage }))
);
const CheckoutPage = lazy(() =>
  import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
);
const AccountPage = lazy(() =>
  import('./pages/AccountPage').then((m) => ({ default: m.AccountPage }))
);
const WishlistPage = lazy(() =>
  import('./pages/WishlistPage').then((m) => ({ default: m.WishlistPage }))
);
const FaqPage = lazy(() =>
  import('./pages/FaqPage').then((m) => ({ default: m.FaqPage }))
);
const LegalPage = lazy(() =>
  import('./pages/LegalPage').then((m) => ({ default: m.LegalPage }))
);
const OrderTrackingPage = lazy(() =>
  import('./pages/OrderTrackingPage').then((m) => ({ default: m.OrderTrackingPage }))
);
const BrandIdentityPage = lazy(() =>
  import('./pages/BrandIdentityPage').then((m) => ({ default: m.BrandIdentityPage }))
);
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);

const PageLoader: React.FC = () => (
  <div className="mx-auto max-w-7xl px-4 py-20 text-center" role="status" aria-live="polite">
    <p className="font-display text-2xl text-[#8E4D57]">Loading Velora…</p>
  </div>
);

const ScrollToTop: React.FC = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
};

const StorefrontLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-white text-[#252525]">
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-[#252525] focus:px-4 focus:py-2.5 focus:text-xs focus:font-semibold focus:uppercase focus:tracking-wider focus:text-white"
    >
      Skip to main content
    </a>
    <Header />
    <main id="main-content" className="flex-1">
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </main>
    <Footer />
    <CartDrawer />
  </div>
);

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <SeoManager />
        <ScrollToTop />
        <Routes>
          {/* Separate Admin Route — isolated from customer storefront shell */}
          <Route
            path="/admin"
            element={
              <Suspense fallback={<PageLoader />}>
                <AdminDashboardPage />
              </Suspense>
            }
          />

          {/* 1. Home */}
          <Route
            path="/"
            element={
              <StorefrontLayout>
                <HomePage />
              </StorefrontLayout>
            }
          />

          {/* 2. Shop All Perfumes */}
          <Route
            path="/shop"
            element={
              <StorefrontLayout>
                <CatalogPage
                  eyebrow="Complete Sample Catalog"
                  pageTitle="Shop All Perfumes"
                  description="Explore all 30 sample fragrances across French extraits, Arabian oud, pure attar oils, daily wear, and luxury gift coffrets in PKR."
                />
              </StorefrontLayout>
            }
          />

          {/* 3. Men's Perfumes */}
          <Route
            path="/collections/mens"
            element={
              <StorefrontLayout>
                <CatalogPage
                  eyebrow="Masculine Wardrobe"
                  pageTitle="Men’s Perfumes"
                  description="Structured cedarwoods, crisp marine citrus, warm cardamom, and smoky leather signatures tailored for men."
                  lockedGender="Men"
                />
              </StorefrontLayout>
            }
          />

          {/* 4. Women's Perfumes */}
          <Route
            path="/collections/womens"
            element={
              <StorefrontLayout>
                <CatalogPage
                  eyebrow="Feminine Wardrobe"
                  pageTitle="Women’s Perfumes"
                  description="Luminous jasmine grandiflorum, centifolia rose, warm vanilla orchid, and powdery white musk compositions."
                  lockedGender="Women"
                />
              </StorefrontLayout>
            }
          />

          {/* 5. Unisex Perfumes */}
          <Route
            path="/collections/unisex"
            element={
              <StorefrontLayout>
                <CatalogPage
                  eyebrow="Shared Signatures"
                  pageTitle="Unisex Perfumes"
                  description="Gender-free olfactive statements built around Kashmir saffron, aged agarwood, neroli, and ambergris."
                  lockedGender="Unisex"
                />
              </StorefrontLayout>
            }
          />

          {/* 6. Oud & Arabic Collection */}
          <Route
            path="/collections/oud-arabic"
            element={
              <StorefrontLayout>
                <CatalogPage
                  eyebrow="Eastern Heritage"
                  pageTitle="Oud & Arabic Collection"
                  description="Smoky Assam agarwood, highland Taif rose, Omani frankincense, and rich bakhoor-inspired blends."
                  lockedCategories={['oud-collection', 'arabic-perfumes']}
                />
              </StorefrontLayout>
            }
          />

          {/* 7. French Perfumes */}
          <Route
            path="/collections/french"
            element={
              <StorefrontLayout>
                <CatalogPage
                  eyebrow="Parisian Craft"
                  pageTitle="French Perfumes"
                  description="Refined floral, chypre, and ambered designer-inspired sample compositions celebrating classic French perfumery."
                  lockedCategories={['french-perfumes']}
                />
              </StorefrontLayout>
            }
          />

          {/* 8. Attar & Oil Perfumes */}
          <Route
            path="/collections/attar-oils"
            element={
              <StorefrontLayout>
                <CatalogPage
                  eyebrow="Alcohol-Free Concentrates"
                  pageTitle="Attar & Oil Perfumes"
                  description="Pure non-alcoholic perfume oils and aged dehn al oud crystal decanters crafted for intimate longevity."
                  lockedCategories={['attar-oil-perfumes']}
                />
              </StorefrontLayout>
            }
          />

          {/* 9. Gift Sets */}
          <Route
            path="/collections/gift-sets"
            element={
              <StorefrontLayout>
                <CatalogPage
                  eyebrow="Curated Presentation"
                  pageTitle="Gift Sets"
                  description="Ivory and champagne-gold presentation coffrets designed for weddings, anniversaries, and Eid gifting."
                  lockedCategories={['gift-sets']}
                />
              </StorefrontLayout>
            }
          />

          {/* 10. Product Details */}
          <Route
            path="/product/:slug"
            element={
              <StorefrontLayout>
                <ProductDetailsPage />
              </StorefrontLayout>
            }
          />

          {/* 11. About Us */}
          <Route
            path="/about"
            element={
              <StorefrontLayout>
                <AboutPage />
              </StorefrontLayout>
            }
          />

          {/* 12. Contact Us */}
          <Route
            path="/contact"
            element={
              <StorefrontLayout>
                <ContactPage />
              </StorefrontLayout>
            }
          />

          {/* 13. Shopping Cart */}
          <Route
            path="/cart"
            element={
              <StorefrontLayout>
                <CartPage />
              </StorefrontLayout>
            }
          />

          {/* 14. Checkout */}
          <Route
            path="/checkout"
            element={
              <StorefrontLayout>
                <CheckoutPage />
              </StorefrontLayout>
            }
          />

          {/* 15. My Account / Login */}
          <Route
            path="/account"
            element={
              <StorefrontLayout>
                <AccountPage />
              </StorefrontLayout>
            }
          />

          {/* 16. Wishlist */}
          <Route
            path="/wishlist"
            element={
              <StorefrontLayout>
                <WishlistPage />
              </StorefrontLayout>
            }
          />

          {/* 17. FAQ */}
          <Route
            path="/faq"
            element={
              <StorefrontLayout>
                <FaqPage />
              </StorefrontLayout>
            }
          />

          {/* 18. Privacy Policy & Terms */}
          <Route
            path="/legal"
            element={
              <StorefrontLayout>
                <LegalPage />
              </StorefrontLayout>
            }
          />

          {/* 19. Order Tracking */}
          <Route
            path="/track-order"
            element={
              <StorefrontLayout>
                <OrderTrackingPage />
              </StorefrontLayout>
            }
          />

          {/* Day 2 Brand Identity Presentation */}
          <Route
            path="/brand-identity"
            element={
              <StorefrontLayout>
                <BrandIdentityPage />
              </StorefrontLayout>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </StoreProvider>
  );
}
