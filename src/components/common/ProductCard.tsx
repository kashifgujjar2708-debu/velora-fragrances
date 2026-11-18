import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatPkr, getProductTotalStock } from '../../utils/format';
import { SafeImage } from './SafeImage';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const wishlisted = isWishlisted(product.id);
  const totalStock = getProductTotalStock(product);
  const defaultSize = product.sizes.find((s) => s.stock > 0) ?? product.sizes[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (defaultSize) {
      addToCart(product.id, defaultSize.ml, 1, true);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <article className="group flex flex-col bg-white border border-[#EAE0D2] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#B76E79]/65 hover:shadow-[0_16px_36px_-18px_rgba(37,37,37,0.16)]">
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-[#F6EFE6]"
      >
        <SafeImage
          src={product.images[0]}
          alt={`${product.brand} ${product.name} ${product.concentration} bottle`}
          fallbackTitle={product.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center bg-white/92 backdrop-blur-xs border border-[#EAE0D2] text-[#252525] transition-colors hover:border-[#B76E79] hover:text-[#8E4D57] focus-visible:outline-2 focus-visible:outline-[#8E4D57]"
        >
          <Heart
            className="h-4 w-4"
            strokeWidth={1.6}
            fill={wishlisted ? '#B76E79' : 'none'}
            color={wishlisted ? '#8E4D57' : 'currentColor'}
          />
        </button>

        {totalStock <= 0 && (
          <div className="absolute bottom-3 left-3 bg-[#252525]/88 px-2.5 py-1 text-[11px] tracking-wider uppercase text-white">
            Sold Out
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between gap-2 text-[11px] tracking-[0.12em] uppercase text-[#66635D]">
            <span className="truncate font-medium text-[#8E4D57]">{product.brand}</span>
            <span className="shrink-0">Sample Demo</span>
          </div>

          <Link
            to={`/product/${product.slug}`}
            className="mt-1.5 block font-display text-xl leading-snug font-medium text-[#252525] transition-colors group-hover:text-[#8E4D57]"
          >
            {product.name}
          </Link>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#66635D]">
            <div className="flex items-center gap-0.5 text-[#8E4D57]" aria-hidden="true">
              <Star className="h-3.5 w-3.5 fill-current" />
            </div>
            <span className="font-medium text-[#252525] tabular-nums">{product.rating}</span>
            <span aria-hidden="true">·</span>
            <span>Sample Rating</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2 tabular-nums">
            <span className="text-base font-semibold text-[#252525]">
              {formatPkr(product.pricePkr)}
            </span>
            {product.originalPricePkr && product.originalPricePkr > product.pricePkr && (
              <span className="text-xs text-[#66635D] line-through">
                {formatPkr(product.originalPricePkr)}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#EAE0D2] pt-3.5">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={totalStock <= 0}
            className="inline-flex items-center justify-center gap-1.5 bg-[#252525] px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#8E4D57] disabled:opacity-45 disabled:pointer-events-none whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#8E4D57]"
          >
            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.6} />
            <span>Add to Cart</span>
          </button>

          <Link
            to={`/product/${product.slug}`}
            className="inline-flex items-center justify-center border border-[#252525]/20 bg-[#FCFBF9] px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#252525] transition-colors hover:border-[#B76E79] hover:text-[#8E4D57] whitespace-nowrap shrink-0"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
};
