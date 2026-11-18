import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { VeloraLogo } from '../brand/VeloraBrandMarks';

export const Footer: React.FC = () => {
  const { settings, notify } = useStore();

  const handleSocialPlaceholder = (platform: string, e: React.MouseEvent) => {
    e.preventDefault();
    notify(`${platform} placeholder link — social handles are not connected in demo mode.`, 'info');
  };

  return (
    <footer className="bg-[#F6EFE6] border-t border-[#B76E79]/30 text-[#252525]">
      <h2 className="sr-only">Footer Navigation and Store Information</h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* 1. Logo & Short Brand Description */}
          <div>
            <Link to="/" aria-label="Velora Fragrances Home" className="inline-block">
              <VeloraLogo layout="horizontal" tone="rosegold-light" size="sm" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-[#66635D] max-w-xs">
              {settings.tagline} Modern luxury fragrance portfolio experience curated in Rose Gold
              and Warm Cream.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[#66635D]">
              Portfolio Demo: All sample products, prices in PKR, and reviews are illustrative only.
              Velora Fragrances does not claim official authorized retailer status.
            </p>

            {/* Instagram & Facebook Icons */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href="#instagram-placeholder"
                onClick={(e) => handleSocialPlaceholder('Instagram', e)}
                aria-label="Velora Fragrances Instagram (Placeholder)"
                className="flex h-10 w-10 items-center justify-center border border-[#B76E79]/40 bg-white text-[#252525] transition-colors hover:border-[#B76E79] hover:text-[#8E4D57]"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.6} />
              </a>
              <a
                href="#facebook-placeholder"
                onClick={(e) => handleSocialPlaceholder('Facebook', e)}
                aria-label="Velora Fragrances Facebook (Placeholder)"
                className="flex h-10 w-10 items-center justify-center border border-[#B76E79]/40 bg-white text-[#252525] transition-colors hover:border-[#B76E79] hover:text-[#8E4D57]"
              >
                <Facebook className="h-4 w-4" strokeWidth={1.6} />
              </a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h3 className="font-display text-lg font-medium text-[#252525] mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm text-[#66635D]">
              <li>
                <Link to="/" className="hover:text-[#8E4D57] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-[#8E4D57] transition-colors">
                  Shop All Perfumes
                </Link>
              </li>
              <li>
                <Link to="/collections/mens" className="hover:text-[#8E4D57] transition-colors">
                  Men’s Collection
                </Link>
              </li>
              <li>
                <Link to="/collections/womens" className="hover:text-[#8E4D57] transition-colors">
                  Women’s Collection
                </Link>
              </li>
              <li>
                <Link to="/collections/unisex" className="hover:text-[#8E4D57] transition-colors">
                  Unisex Collection
                </Link>
              </li>
              <li>
                <Link to="/collections/oud-arabic" className="hover:text-[#8E4D57] transition-colors">
                  Oud Collection
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#8E4D57] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/brand-identity" className="font-medium text-[#8E4D57] hover:underline">
                  Brand Identity Book
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Customer Support */}
          <div>
            <h3 className="font-display text-lg font-medium text-[#252525] mb-4">
              Customer Support
            </h3>
            <ul className="space-y-2.5 text-sm text-[#66635D]">
              <li>
                <Link to="/contact" className="hover:text-[#8E4D57] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-[#8E4D57] transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[#8E4D57] transition-colors">
                  FAQ & Delivery Info
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-[#8E4D57] transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-[#8E4D57] transition-colors">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#8E4D57] transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/legal" className="hover:text-[#8E4D57] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal" className="hover:text-[#8E4D57] transition-colors">
                  Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Demo Contact Information */}
          <div>
            <h3 className="font-display text-lg font-medium text-[#252525] mb-4">
              Contact Information (Demo)
            </h3>
            <ul className="space-y-2.5 text-sm text-[#66635D]">
              <li>
                <span className="text-[#252525] font-medium">Location:</span> {settings.location}
              </li>
              <li>
                <span className="text-[#252525] font-medium">WhatsApp / Phone:</span>{' '}
                {settings.contactPhone}
              </li>
              <li>
                <span className="text-[#252525] font-medium">Email:</span>{' '}
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="hover:text-[#8E4D57] transition-colors"
                >
                  {settings.contactEmail}
                </a>
              </li>
              <li>
                <span className="text-[#252525] font-medium">Support Hours:</span>{' '}
                {settings.supportHours}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[#252525]/10 pt-8 text-xs text-[#66635D] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.brandName}. Portfolio & Demonstration Project —
            All prices in PKR.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/legal" className="hover:text-[#252525] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/legal" className="hover:text-[#252525] transition-colors">
              Terms and Conditions
            </Link>
            <Link to="/admin" className="hover:text-[#8E4D57] transition-colors">
              Staff Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
