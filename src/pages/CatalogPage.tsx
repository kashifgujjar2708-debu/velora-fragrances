import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CategorySlug, GenderCategory } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { ProductCard } from '../components/common/ProductCard';

interface CatalogPageProps {
  pageTitle: string;
  eyebrow: string;
  description: string;
  lockedGender?: GenderCategory;
  lockedCategories?: CategorySlug[];
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'name';

const PRICE_RANGES = [
  { id: 'all', label: 'All Prices', min: 0, max: Infinity },
  { id: 'under-8000', label: 'Under Rs. 8,000', min: 0, max: 8000 },
  { id: '8000-20000', label: 'Rs. 8,000 – Rs. 20,000', min: 8000, max: 20000 },
  { id: '20000-35000', label: 'Rs. 20,000 – Rs. 35,000', min: 20000, max: 35000 },
  { id: 'over-35000', label: 'Above Rs. 35,000', min: 35000, max: Infinity },
];

export const CatalogPage: React.FC<CatalogPageProps> = ({
  pageTitle,
  eyebrow,
  description,
  lockedGender,
  lockedCategories,
}) => {
  const { products, categories } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get('q') ?? '';
  const initialCat = searchParams.get('category') ?? 'all';

  const [searchText, setSearchText] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>(lockedGender ?? 'all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setSearchText(searchParams.get('q') ?? '');
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    } else {
      setSelectedCategory('all');
    }
  }, [searchParams]);

  useEffect(() => {
    setSelectedGender(lockedGender ?? 'all');
  }, [lockedGender]);

  const activeProducts = useMemo(
    () => products.filter((p) => p.active !== false),
    [products]
  );

  const allBrands = useMemo(
    () => Array.from(new Set(activeProducts.map((p) => p.brand))).sort(),
    [activeProducts]
  );

  const filteredProducts = useMemo(() => {
    const range = PRICE_RANGES.find((r) => r.id === selectedPriceRange) ?? PRICE_RANGES[0];
    const query = searchText.trim().toLowerCase();

    const list = activeProducts.filter((p) => {
      if (lockedGender && p.gender !== lockedGender) return false;
      if (lockedCategories && lockedCategories.length > 0) {
        const matchesLocked =
          lockedCategories.includes(p.categorySlug) ||
          (p.secondaryCategories ?? []).some((sc) => lockedCategories.includes(sc));
        if (!matchesLocked) return false;
      }

      if (!lockedCategories && selectedCategory !== 'all') {
        const matchesCat =
          p.categorySlug === selectedCategory ||
          (p.secondaryCategories ?? []).includes(selectedCategory as CategorySlug);
        if (!matchesCat) return false;
      }

      if (!lockedGender && selectedGender !== 'all' && p.gender !== selectedGender) {
        return false;
      }

      if (selectedBrand !== 'all' && p.brand !== selectedBrand) {
        return false;
      }

      if (p.pricePkr < range.min || p.pricePkr > range.max) {
        return false;
      }

      if (query) {
        const match =
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.notes.top.some((n) => n.toLowerCase().includes(query)) ||
          p.notes.heart.some((n) => n.toLowerCase().includes(query)) ||
          p.notes.base.some((n) => n.toLowerCase().includes(query));
        if (!match) return false;
      }

      return true;
    });

    const sorted = [...list];
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.pricePkr - b.pricePkr);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.pricePkr - a.pricePkr);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        sorted.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
        break;
    }

    return sorted;
  }, [
    activeProducts,
    lockedGender,
    lockedCategories,
    selectedCategory,
    selectedGender,
    selectedBrand,
    selectedPriceRange,
    searchText,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchText('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedGender(lockedGender ?? 'all');
    setSelectedPriceRange('all');
    setSortBy('featured');
    setSearchParams({});
  };

  return (
    <div>
      <PageHeader
        eyebrow={eyebrow}
        title={pageTitle}
        description={description}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: pageTitle }]}
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Portfolio Sample Data Notice */}
        <div className="mb-8 border border-[#D4AF6A]/35 bg-[#FAF8F3] px-4 py-3 text-xs text-[#66635D] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>
            Sample Demo Catalog: Prices in PKR and designer brand examples are for portfolio
            demonstration only; Velora does not claim authorized retailer status.
          </span>
          <span className="font-medium text-[#252525] tabular-nums shrink-0">
            Showing {filteredProducts.length} fragrance{filteredProducts.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Search & Sort Toolbar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-[#252525]/10 pb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#66635D]" />
            <label htmlFor="catalog-search" className="sr-only">
              Filter by perfume, brand, or scent note
            </label>
            <input
              id="catalog-search"
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Filter by perfume, brand, or scent note..."
              className="w-full border border-[#252525]/18 bg-white pl-10 pr-9 py-2.5 text-sm text-[#252525] placeholder:text-[#66635D]/70 focus:border-[#B76E79] focus:outline-none"
            />
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#66635D] hover:text-[#252525]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((v) => !v)}
              aria-expanded={mobileFiltersOpen}
              aria-controls="catalog-filters-sidebar"
              className="inline-flex items-center gap-2 border border-[#252525]/20 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-[#252525] lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
            </button>

            <label htmlFor="catalog-sort" className="flex items-center gap-2 text-xs text-[#66635D]">
              <span className="hidden sm:inline uppercase tracking-wider">Sort:</span>
              <select
                id="catalog-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="border border-[#252525]/18 bg-white px-3 py-2.5 text-xs font-medium text-[#252525] focus:border-[#B76E79] focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Sidebar Filters */}
          <aside
            id="catalog-filters-sidebar"
            className={`lg:col-span-3 space-y-7 ${
              mobileFiltersOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            <h2 className="sr-only">Catalog Filters</h2>
            {!lockedCategories && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#252525] mb-3">
                  Category
                </h3>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`block w-full text-left px-3 py-2 text-xs transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-[#252525] text-white font-medium'
                        : 'text-[#66635D] hover:bg-[#FAF8F3] hover:text-[#252525]'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories
                    .filter((c) => c.visible)
                    .map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`block w-full text-left px-3 py-2 text-xs transition-colors ${
                          selectedCategory === cat.slug
                            ? 'bg-[#252525] text-white font-medium'
                            : 'text-[#66635D] hover:bg-[#FAF8F3] hover:text-[#252525]'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {!lockedGender && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#252525] mb-3">
                  Audience
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {(['all', 'Men', 'Women', 'Unisex'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGender(g)}
                      className={`px-3 py-2 text-xs border transition-colors ${
                        selectedGender === g
                          ? 'border-[#252525] bg-[#252525] text-white font-medium'
                          : 'border-[#252525]/15 bg-white text-[#66635D] hover:border-[#D4AF6A]'
                      }`}
                    >
                      {g === 'all' ? 'All' : g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#252525] mb-3">
                <label htmlFor="catalog-brand-select">Brand / House</label>
              </h3>
              <select
                id="catalog-brand-select"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full border border-[#252525]/18 bg-white px-3 py-2.5 text-xs text-[#252525] focus:border-[#B76E79] focus:outline-none"
              >
                <option value="all">All Brands</option>
                {allBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#252525] mb-3">
                Price Range (PKR)
              </h3>
              <div className="space-y-1.5">
                {PRICE_RANGES.map((range) => (
                  <button
                    key={range.id}
                    type="button"
                    onClick={() => setSelectedPriceRange(range.id)}
                    className={`block w-full text-left px-3 py-2 text-xs transition-colors ${
                      selectedPriceRange === range.id
                        ? 'bg-[#FAF8F3] border border-[#D4AF6A] text-[#252525] font-medium'
                        : 'text-[#66635D] hover:bg-[#FAF8F3]'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="w-full border border-[#252525]/20 py-2.5 text-xs font-medium uppercase tracking-wider text-[#252525] hover:bg-[#FAF8F3] transition-colors"
            >
              Reset All Filters
            </button>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="border border-[#252525]/10 bg-[#FAF8F3] px-6 py-16 text-center">
                <h2 className="font-display text-2xl text-[#252525]">
                  No Fragrances Match Your Filters
                </h2>
                <p className="mt-2 text-sm text-[#66635D]">
                  Try clearing one or more filters to browse the full 30-product sample catalog.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 bg-[#252525] px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-white hover:bg-[#8E4D57] transition-colors"
                >
                  Show All Fragrances
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
