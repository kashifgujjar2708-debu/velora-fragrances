import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PageHeader } from '../components/common/PageHeader';
import { ProductCard } from '../components/common/ProductCard';

export const WishlistPage: React.FC = () => {
  const { products, wishlist } = useStore();
  const savedProducts = products.filter((p) => p.active !== false && wishlist.includes(p.id));

  return (
    <div>
      <PageHeader
        eyebrow="Saved Signatures"
        title="Your Fragrance Wishlist"
        description="Keep track of sample perfumes and gift coffrets you wish to revisit."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]}
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {savedProducts.length === 0 ? (
          <div className="border border-[#252525]/10 bg-[#FAF8F3] px-6 py-16 text-center">
            <Heart className="mx-auto h-9 w-9 text-[#D4AF6A] mb-3" strokeWidth={1.4} />
            <h2 className="font-display text-3xl text-[#252525]">No Saved Fragrances</h2>
            <p className="mt-2 text-sm text-[#66635D]">
              Tap the heart icon on any fragrance card to curate your personal wishlist.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-block bg-[#252525] px-7 py-3.5 text-xs uppercase tracking-[0.14em] text-white hover:bg-[#8E4D57] transition-colors"
            >
              Browse Perfumes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
