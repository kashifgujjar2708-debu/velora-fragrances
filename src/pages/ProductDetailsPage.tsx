import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Heart, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPkr, getStockStatusLabel } from '../utils/format';
import { SafeImage } from '../components/common/SafeImage';
import { ProductCard } from '../components/common/ProductCard';

export const ProductDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const {
    products,
    reviews,
    recentlyViewedIds,
    recordRecentlyViewed,
    addToCart,
    toggleWishlist,
    isWishlisted,
    addProductReview,
    settings,
  } = useStore();

  const product = products.find((p) => p.slug === slug && p.active !== false);

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSizeMl, setSelectedSizeMl] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Visitor review submission form (moderated by Admin before display)
  const [reviewName, setReviewName] = useState('');
  const [reviewCity, setReviewCity] = useState('Lahore');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewNotice, setReviewNotice] = useState('');

  useEffect(() => {
    if (product) {
      recordRecentlyViewed(product.id);
      const firstInStock = product.sizes.find((s) => s.stock > 0) ?? product.sizes[0];
      setSelectedSizeMl(firstInStock?.ml ?? '');
      setSelectedImageIdx(0);
      setQuantity(1);
    }
  }, [product?.id]);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-[#252525]">Fragrance Not Found</h1>
        <p className="mt-3 text-sm text-[#66635D]">
          The requested sample fragrance could not be located in the active catalog.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-block bg-[#252525] px-6 py-3 text-xs uppercase tracking-[0.14em] text-white"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const activeSize =
    product.sizes.find((s) => s.ml === selectedSizeMl) ?? product.sizes[0];
  const activePrice = activeSize?.pricePkr ?? product.pricePkr;
  const activeOriginal = activeSize?.originalPricePkr ?? product.originalPricePkr;
  const stockInfo = getStockStatusLabel(activeSize?.stock ?? 0);
  const wishlisted = isWishlisted(product.id);

  const productReviews = reviews.filter(
    (r) => r.productId === product.id && r.approved
  );

  const relatedProducts = products
    .filter(
      (p) =>
        p.active !== false &&
        p.id !== product.id &&
        (p.categorySlug === product.categorySlug || p.gender === product.gender)
    )
    .slice(0, 3);

  const recentlyViewedProducts = recentlyViewedIds
    .filter((id) => id !== product.id)
    .map((id) => products.find((p) => p.id === id && p.active !== false))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 3);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;
    const res = await addProductReview({
      productId: product.id,
      authorName: reviewName.trim(),
      city: reviewCity.trim() || 'Pakistan',
      rating: reviewRating,
      title: reviewTitle.trim() || 'Fragrance Impression',
      comment: reviewComment.trim(),
    });
    if (res.ok) {
      setReviewNotice(res.message);
      setReviewName('');
      setReviewTitle('');
      setReviewComment('');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-[#66635D]">
        <Link to="/" className="hover:text-[#8E4D57]">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to="/shop" className="hover:text-[#8E4D57]">Shop</Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#252525] font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Contiguous Purchase Module */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Left: Sticky Image Gallery */}
        <div className="lg:col-span-6">
          <div className="lg:sticky lg:top-28 space-y-4">
            <div className="aspect-[4/3] w-full overflow-hidden border border-[#252525]/10 bg-[#FAF8F3]">
              <SafeImage
                src={product.images[selectedImageIdx] ?? product.images[0]}
                alt={`${product.brand} ${product.name} ${product.concentration} bottle`}
                loading="eager"
                fetchPriority="high"
              />
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`View ${product.name} image ${idx + 1}`}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`aspect-[4/3] overflow-hidden border transition-colors ${
                      selectedImageIdx === idx
                        ? 'border-[#B76E79] ring-1 ring-[#B76E79]'
                        : 'border-[#252525]/10 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <SafeImage src={img} alt={`${product.name} bottle angle ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Purchase & Olfactive Details */}
        <div className="lg:col-span-6">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#8E4D57] font-semibold">
            <span>{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>{product.gender}</span>
          </div>

          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-medium text-[#252525]">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#66635D]">
            <div className="flex items-center gap-1 text-[#D4AF6A]">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-semibold text-[#252525] tabular-nums">{product.rating}</span>
            </div>
            <span>{product.reviewCount + productReviews.length} sample reviews</span>
            <span aria-hidden="true">·</span>
            <span>{product.concentration}</span>
          </div>

          {/* Price & Stock */}
          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4 border-y border-[#252525]/10 py-5">
            <div className="flex items-baseline gap-3 tabular-nums">
              <span className="text-2xl font-semibold text-[#252525]">
                {formatPkr(activePrice)}
              </span>
              {activeOriginal && activeOriginal > activePrice && (
                <span className="text-sm text-[#66635D] line-through">
                  {formatPkr(activeOriginal)}
                </span>
              )}
            </div>

            <span
              className={`text-xs font-medium ${
                stockInfo.tone === 'in'
                  ? 'text-emerald-700'
                  : stockInfo.tone === 'low'
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {stockInfo.label}
            </span>
          </div>

          {/* Sample Disclaimer */}
          <p className="mt-4 text-xs leading-relaxed text-[#66635D] bg-[#FAF8F3] border border-[#D4AF6A]/30 px-4 py-3">
            Portfolio Demo Entry: Sample fragrance description and PKR pricing for demonstration.
            Velora Fragrances does not claim authorized retailer status for third-party designer names.
          </p>

          <p className="mt-5 text-sm sm:text-base leading-relaxed text-[#252525]/85">
            {product.description}
          </p>

          {/* Size Selector */}
          <div className="mt-6">
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#252525] mb-3">
              Select Volume
            </label>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map((size) => {
                const isSelected = size.ml === activeSize?.ml;
                return (
                  <button
                    key={size.ml}
                    type="button"
                    onClick={() => setSelectedSizeMl(size.ml)}
                    className={`border px-4 py-2.5 text-xs transition-colors tabular-nums ${
                      isSelected
                        ? 'border-[#252525] bg-[#252525] text-white font-medium'
                        : 'border-[#252525]/20 bg-white text-[#252525] hover:border-[#D4AF6A]'
                    }`}
                  >
                    {size.ml} — {formatPkr(size.pricePkr)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity + Add to Cart + Wishlist */}
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <div className="inline-flex items-center border border-[#252525]/20 bg-white">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-12 w-11 text-sm hover:bg-[#FAF8F3]"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-medium tabular-nums">{quantity}</span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => Math.min(activeSize?.stock ?? 10, q + 1))
                }
                className="h-12 w-11 text-sm hover:bg-[#FAF8F3]"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              disabled={(activeSize?.stock ?? 0) <= 0}
              onClick={() => addToCart(product.id, activeSize.ml, quantity, true)}
              className="flex-1 inline-flex items-center justify-center gap-2.5 bg-[#252525] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#8E4D57] transition-colors disabled:opacity-45"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{(activeSize?.stock ?? 0) > 0 ? 'Add to Bag' : 'Out of Stock'}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-pressed={wishlisted}
              className={`inline-flex items-center justify-center gap-2 border px-5 py-3.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors ${
                wishlisted
                  ? 'border-[#B76E79] bg-[#FAF8F3] text-[#8E4D57]'
                  : 'border-[#252525]/20 bg-white text-[#252525] hover:border-[#B76E79]'
              }`}
            >
              <Heart
                className="h-4 w-4"
                fill={wishlisted ? '#B76E79' : 'none'}
              />
              <span>{wishlisted ? 'Saved' : 'Wishlist'}</span>
            </button>
          </div>

          {/* Fragrance Pyramid */}
          <div className="mt-9 border border-[#252525]/10 bg-[#FAF8F3] p-6">
            <h2 className="font-display text-2xl font-medium text-[#252525]">
              Olfactive Notes
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
              <div>
                <p className="uppercase tracking-[0.14em] text-[#8E4D57] font-semibold">
                  Top Notes
                </p>
                <p className="mt-1.5 text-[#252525] leading-relaxed">
                  {product.notes.top.join(', ')}
                </p>
              </div>
              <div>
                <p className="uppercase tracking-[0.14em] text-[#8E4D57] font-semibold">
                  Heart Notes
                </p>
                <p className="mt-1.5 text-[#252525] leading-relaxed">
                  {product.notes.heart.join(', ')}
                </p>
              </div>
              <div>
                <p className="uppercase tracking-[0.14em] text-[#8E4D57] font-semibold">
                  Base Notes
                </p>
                <p className="mt-1.5 text-[#252525] leading-relaxed">
                  {product.notes.base.join(', ')}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-6 border-t border-[#252525]/10 pt-4 text-xs text-[#66635D]">
              <span>
                <strong className="text-[#252525]">Longevity:</strong> {product.longevity}
              </span>
              <span>
                <strong className="text-[#252525]">Projection / Sillage:</strong> {product.sillage}
              </span>
            </div>
          </div>

          {/* Delivery & Returns */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs text-[#66635D]">
            <div className="flex items-start gap-3 border border-[#252525]/10 p-4">
              <Truck className="h-4 w-4 text-[#8E4D57] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#252525]">Pakistan Delivery Policy</p>
                <p className="mt-1 leading-relaxed">
                  Standard {formatPkr(settings.standardDeliveryFeePkr)} ({settings.standardDeliveryEta}) ·
                  Express {formatPkr(settings.expressDeliveryFeePkr)} ({settings.expressDeliveryEta}) ·
                  Free Standard Delivery over {formatPkr(settings.freeDeliveryThresholdPkr)}.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 border border-[#252525]/10 p-4">
              <ShieldCheck className="h-4 w-4 text-[#8E4D57] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#252525]">Return & Exchange</p>
                <p className="mt-1 leading-relaxed">{settings.returnPolicySummary}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="mt-16 border-t border-[#252525]/10 pt-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8E4D57] font-semibold">
              Sample Customer Impressions
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium text-[#252525]">
              Reviews ({productReviews.length})
            </h2>

            {productReviews.length === 0 ? (
              <p className="mt-4 text-sm text-[#66635D]">
                No sample reviews recorded for this fragrance yet. Submit a demo review alongside.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {productReviews.map((rev) => (
                  <article
                    key={rev.id}
                    className="border border-[#252525]/10 bg-white p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-1 text-[#D4AF6A]">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#66635D]">
                        <span className="uppercase tracking-wider text-[10px] font-medium text-[#8E4D57]">
                          {rev.isSampleDemo ? 'Sample Review' : 'Visitor Feedback'}
                        </span>
                        <span>·</span>
                        <span>{rev.createdAt}</span>
                      </div>
                    </div>
                    <h3 className="mt-2 font-display text-xl text-[#252525]">{rev.title}</h3>
                    <p className="mt-1.5 text-sm text-[#66635D] leading-relaxed">
                      {rev.comment}
                    </p>
                    <p className="mt-3 text-xs text-[#252525] font-medium">
                      {rev.authorName} · {rev.city}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <form
              onSubmit={handleAddReview}
              className="border border-[#252525]/10 bg-[#FAF8F3] p-6 space-y-4"
            >
              <h3 className="font-display text-2xl font-medium text-[#252525]">
                Write a Fragrance Review
              </h3>
              <p className="text-xs text-[#66635D]">
                Visitor feedback is queued for Administrator moderation before appearing publicly.
              </p>

              {reviewNotice && (
                <div className="border border-[#B76E79]/40 bg-white px-3.5 py-2.5 text-xs text-[#252525]">
                  {reviewNotice}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="review-author-name" className="block text-xs text-[#66635D] mb-1">
                    Your Name *
                  </label>
                  <input
                    id="review-author-name"
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Your name"
                    className="w-full border border-[#252525]/18 bg-white px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="review-author-city" className="block text-xs text-[#66635D] mb-1">
                    City
                  </label>
                  <input
                    id="review-author-city"
                    type="text"
                    value={reviewCity}
                    onChange={(e) => setReviewCity(e.target.value)}
                    placeholder="City (e.g. Lahore)"
                    className="w-full border border-[#252525]/18 bg-white px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="review-rating-select" className="block text-xs text-[#66635D] mb-1">
                  Rating
                </label>
                <select
                  id="review-rating-select"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full border border-[#252525]/18 bg-white px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                >
                  <option value={5}>5 Stars — Exceptional</option>
                  <option value={4}>4 Stars — Very Good</option>
                  <option value={3}>3 Stars — Good</option>
                  <option value={2}>2 Stars — Fair</option>
                  <option value={1}>1 Star — Needs Improvement</option>
                </select>
              </div>

              <div>
                <label htmlFor="review-title-input" className="block text-xs text-[#66635D] mb-1">
                  Review Headline
                </label>
                <input
                  id="review-title-input"
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Review headline"
                  className="w-full border border-[#252525]/18 bg-white px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="review-comment-input" className="block text-xs text-[#66635D] mb-1">
                  Review Comment *
                </label>
                <textarea
                  id="review-comment-input"
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your impression of longevity and scent notes..."
                  className="w-full border border-[#252525]/18 bg-white px-3.5 py-2.5 text-sm focus:border-[#B76E79] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#252525] py-3 text-xs font-medium uppercase tracking-[0.14em] text-white hover:bg-[#8E4D57] transition-colors"
              >
                Submit Review for Moderation
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-[#252525]/10 pt-14">
          <h2 className="font-display text-3xl font-medium text-[#252525] mb-8">
            Related Fragrances
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewedProducts.length > 0 && (
        <section className="mt-16 border-t border-[#252525]/10 pt-14">
          <h2 className="font-display text-3xl font-medium text-[#252525] mb-8">
            Recently Viewed
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentlyViewedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
