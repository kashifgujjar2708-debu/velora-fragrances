import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
  width?: number;
  height?: number;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackTitle,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  width,
  height,
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF8F3] via-[#F3EFE6] to-[#E8DEC8] text-[#66635D] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Sparkles className="w-6 h-6 text-[#8E4D57] mb-2 opacity-80" strokeWidth={1.5} />
        <span className="font-display text-sm tracking-wide text-[#252525]">
          {fallbackTitle || 'Velora Fragrances'}
        </span>
      </div>
    );
  }

  const hasWebpSibling = /^\/src\/assets\/images\/.+\.jpg$/i.test(src);
  const webpSrc = hasWebpSibling ? src.replace(/\.jpg$/i, '.webp') : undefined;

  const imgEl = (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      width={width}
      height={height}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );

  if (webpSrc) {
    return (
      <picture className="contents">
        <source srcSet={webpSrc} type="image/webp" />
        {imgEl}
      </picture>
    );
  }

  return imgEl;
};
