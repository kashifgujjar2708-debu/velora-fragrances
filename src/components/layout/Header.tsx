import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatPkr } from '../../utils/format';
import { SafeImage } from '../common/SafeImage';
import { VeloraLogo } from '../brand/VeloraBrandMarks';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Men', to: '/collections/mens' },
  { label: 'Women', to: '/collections/womens' },
  { label: 'Unisex', to: '/collections/unisex' },
  { label: 'Oud Collection', to: '/collections/oud-arabic' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export const Header: React.FC = () => {
  const { cartItemCount, wishlist, products, setCartDrawerOpen, currentCustomer } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const searchResults = searchQuery.trim()
    ? products
        .filter((p) => {
          if (p.active === false) return false;
          const q = searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.notes.top.some((n) => n.toLowerCase().includes(q)) ||
            p.notes.heart.some((n) => n.toLowerCase().includes(q)) ||
            p.notes.base.some((n) => n.toLowerCase().includes(q))
          );
        })
        .slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FCFBF9]/96 backdrop-blur-md border-b border-[#B76E79]/25">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
          {/* Mobile Hamburger + Velora Fragrances Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              className="flex h-11 w-11 items-center justify-center text-[#252525] hover:text-[#8E4D57] lg:hidden focus-visible:outline-2 focus-visible:outline-[#B76E79]"
            >
              <Menu className="h-5 w-5" strokeWidth={1.6} />
            </button>

            <Link to="/" aria-label="Velora Fragrances Home" className="shrink-0">
              <VeloraLogo layout="horizontal" tone="rosegold-light" size="sm" />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-5 xl:gap-6"
          >
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative py-1 text-[13px] tracking-[0.03em] whitespace-nowrap shrink-0 transition-colors duration-150 ${
                    isActive
                      ? 'text-[#8E4D57] font-medium after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-[#B76E79]'
                      : 'text-[#252525]/85 hover:text-[#8E4D57]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Search, Wishlist & Shopping Cart Icons (+ Account) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search fragrances"
              className="flex h-10 w-10 items-center justify-center text-[#252525] hover:text-[#8E4D57] transition-colors focus-visible:outline-2 focus-visible:outline-[#B76E79]"
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </button>

            <Link
              to="/wishlist"
              aria-label={`Wishlist (${wishlist.length})`}
              className="relative flex h-10 w-10 items-center justify-center text-[#252525] hover:text-[#8E4D57] transition-colors focus-visible:outline-2 focus-visible:outline-[#B76E79]"
            >
              <Heart className="h-[18px] w-[18px]" strokeWidth={1.6} />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B76E79] px-1 text-[10px] font-semibold text-white tabular-nums">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              aria-label={`Shopping bag (${cartItemCount} items)`}
              className="relative flex h-10 w-10 items-center justify-center text-[#252525] hover:text-[#8E4D57] transition-colors focus-visible:outline-2 focus-visible:outline-[#B76E79]"
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.6} />
              {cartItemCount > 0 && (
                <span className="absolute top-1.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#252525] px-1 text-[10px] font-semibold text-white tabular-nums">
                  {cartItemCount}
                </span>
              )}
            </button>

            <Link
              to="/account"
              aria-label={currentCustomer ? `Account (${currentCustomer.fullName})` : 'My Account'}
              className="hidden sm:flex h-10 w-10 items-center justify-center text-[#252525] hover:text-[#8E4D57] transition-colors focus-visible:outline-2 focus-visible:outline-[#B76E79]"
            >
              <User className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Hamburger Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-[#FCFBF9] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EAE0D2] px-6 py-5">
              <VeloraLogo layout="horizontal" tone="rosegold-light" size="sm" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-10 w-10 items-center justify-center text-[#252525]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 py-6">
              <ul className="space-y-1">
                {NAV_LINKS.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block py-3 text-base border-b border-[#EAE0D2] transition-colors ${
                          isActive ? 'text-[#8E4D57] font-medium' : 'text-[#252525]'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
                <li>
                  <Link
                    to="/collections/french"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 text-base border-b border-[#EAE0D2] text-[#252525]"
                  >
                    French Perfumes
                  </Link>
                </li>
                <li>
                  <Link
                    to="/collections/attar-oils"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 text-base border-b border-[#EAE0D2] text-[#252525]"
                  >
                    Attar & Oil Perfumes
                  </Link>
                </li>
                <li>
                  <Link
                    to="/collections/gift-sets"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 text-base border-b border-[#EAE0D2] text-[#252525]"
                  >
                    Gift Sets
                  </Link>
                </li>
              </ul>

              <div className="mt-8 space-y-2 text-sm text-[#66635D]">
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 hover:text-[#252525]"
                >
                  My Account
                </Link>
                <Link
                  to="/brand-identity"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 font-medium text-[#8E4D57]"
                >
                  Brand Identity & Packaging
                </Link>
                <Link
                  to="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 hover:text-[#252525]"
                >
                  Track Order
                </Link>
                <Link
                  to="/faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 hover:text-[#252525]"
                >
                  FAQ & Delivery Info
                </Link>
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Search Velora Fragrances"
        >
          <div className="w-full max-w-2xl bg-white border border-[#B76E79]/40 shadow-2xl">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-3 border-b border-[#EAE0D2] px-5 py-4"
            >
              <Search className="h-5 w-5 text-[#8E4D57] shrink-0" />
              <label htmlFor="header-search-input" className="sr-only">
                Search perfumes, brands, or notes
              </label>
              <input
                id="header-search-input"
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search perfumes, brands, or notes (e.g., Oud, Dior, Saffron)..."
                className="w-full bg-transparent text-sm sm:text-base text-[#252525] placeholder:text-[#66635D]/70 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="flex h-9 w-9 items-center justify-center text-[#66635D] hover:text-[#252525]"
              >
                <X className="h-5 w-5" />
              </button>
            </form>

            {searchQuery.trim() ? (
              <div className="max-h-96 overflow-y-auto divide-y divide-[#EAE0D2]">
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.map((p) => (
                      <Link
                        key={p.id}
                        to={`/product/${p.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F6EFE6] transition-colors"
                      >
                        <div className="h-14 w-16 shrink-0 bg-[#F6EFE6] overflow-hidden">
                          <SafeImage src={p.images[0]} alt={p.name} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] uppercase tracking-wider text-[#66635D]">
                            {p.brand} · {p.category}
                          </p>
                          <p className="font-display text-lg text-[#252525] truncate">
                            {p.name}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-[#252525] tabular-nums shrink-0">
                          {formatPkr(p.pricePkr)}
                        </span>
                      </Link>
                    ))}
                    <div className="px-5 py-3 bg-[#F6EFE6]">
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="text-xs font-medium uppercase tracking-wider text-[#8E4D57] hover:underline"
                      >
                        View all results for “{searchQuery}” →
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="px-5 py-8 text-center text-sm text-[#66635D]">
                    No sample fragrances matched “{searchQuery}”. Try Oud, Rose, Dior, or Saffron.
                  </div>
                )}
              </div>
            ) : (
              <div className="px-5 py-5 bg-[#F6EFE6]">
                <p className="text-xs uppercase tracking-wider text-[#66635D] mb-3">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Oud Imperial', 'Chanel', 'Dior', 'Attar', 'Gift Coffret', 'Saffron'].map(
                    (term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setSearchQuery(term)}
                        className="border border-[#EAE0D2] bg-white px-3 py-1.5 text-xs text-[#252525] hover:border-[#B76E79]"
                      >
                        {term}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
