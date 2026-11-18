import React, { useId } from 'react';

export const BRAND_PALETTE = [
  {
    role: 'Primary Accent',
    name: 'Rose Gold',
    hex: '#B76E79',
    rgb: 'rgb(183, 110, 121)',
    usage: 'Brand symbol, wordmark metallic finish, bottle caps, foil borders, primary highlights.',
  },
  {
    role: 'Secondary',
    name: 'Warm Cream',
    hex: '#F6EFE6',
    rgb: 'rgb(246, 239, 230)',
    usage: 'Perfume boxes, editorial story panels, section bands, and light marble base.',
  },
  {
    role: 'Background',
    name: 'Soft White',
    hex: '#FCFBF9',
    rgb: 'rgb(252, 251, 249)',
    usage: 'Primary website canvas, generous negative space, and product presentation cards.',
  },
  {
    role: 'Supporting',
    name: 'Light Beige',
    hex: '#EAE0D2',
    rgb: 'rgb(234, 224, 210)',
    usage: 'Subtle stone plinths, secondary borders, and textured coffret interiors.',
  },
  {
    role: 'Text',
    name: 'Deep Charcoal',
    hex: '#252525',
    rgb: 'rgb(37, 37, 37)',
    usage: 'Headings, body copy, high-contrast buttons, and dark packaging editions.',
  },
  {
    role: 'Accent',
    name: 'Subtle Metallic Gold',
    hex: '#C9A46B',
    rgb: 'rgb(201, 164, 107)',
    usage: 'Fine hairlines, Oud collection trims, and warm metallic highlights paired with Rose Gold.',
  },
] as const;

export const MARBLE_ASSETS = {
  light: '/src/assets/images/marble_light_rosegold_1794987944062.jpg',
  dark: '/src/assets/images/marble_dark_rosegold_1794987944035.jpg',
} as const;

export const PACKAGING_ASSETS = {
  mens: '/src/assets/images/packaging_mens_rosegold_1794987944450.jpg',
  womens: '/src/assets/images/packaging_womens_rosegold_1794987945901.jpg',
  unisex: '/src/assets/images/perfume_fresh_azure_1794933709674.jpg',
  oud: '/src/assets/images/packaging_oud_rosegold_1794987946390.jpg',
  giftset: '/src/assets/images/perfume_gift_coffret_1794933711253.jpg',
} as const;

interface VeloraSymbolProps {
  className?: string;
  variant?: 'rosegold' | 'charcoal' | 'white' | 'cream';
}

/**
 * Original Abstract Luxury Symbol for Velora Fragrances:
 * Two intersecting sculptural flacon arcs balanced around a vertical prism axis
 * and fine horizon line — symbolizing fragrance diffusion and architectural poise.
 */
export const VeloraSymbol: React.FC<VeloraSymbolProps> = ({
  className = 'w-10 h-10',
  variant = 'rosegold',
}) => {
  const gradId = useId();

  const strokeValue =
    variant === 'rosegold'
      ? `url(#${gradId})`
      : variant === 'white'
      ? '#FFFFFF'
      : variant === 'cream'
      ? '#F6EFE6'
      : '#252525';

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E6C1BA" />
          <stop offset="48%" stopColor="#B76E79" />
          <stop offset="100%" stopColor="#8E4D57" />
        </linearGradient>
      </defs>

      {/* Outer sculptural diamond-oval equilibrium arc */}
      <path
        d="M32 6 C44 17 50 28 50 37 C50 47.5 42 56 32 56 C22 56 14 47.5 14 37 C14 28 20 17 32 6 Z"
        stroke={strokeValue}
        strokeWidth="1.7"
      />
      {/* Inner inverted flacon prism line */}
      <path
        d="M21.5 23 L32 45.5 L42.5 23"
        stroke={strokeValue}
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Delicate vertical balance axis */}
      <line
        x1="32"
        y1="14"
        x2="32"
        y2="50"
        stroke={strokeValue}
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      {/* Horizon facet */}
      <circle cx="32" cy="23" r="1.8" fill={strokeValue} />
    </svg>
  );
};

interface VeloraLogoProps {
  layout?: 'horizontal' | 'compact' | 'symbol-only';
  tone?: 'rosegold-light' | 'rosegold-dark' | 'monochrome-dark' | 'monochrome-light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VeloraLogo: React.FC<VeloraLogoProps> = ({
  layout = 'horizontal',
  tone = 'rosegold-light',
  size = 'md',
  className = '',
}) => {
  const symbolVariant =
    tone === 'monochrome-dark'
      ? 'charcoal'
      : tone === 'monochrome-light'
      ? 'white'
      : 'rosegold';

  const primaryTextClass =
    tone === 'monochrome-dark'
      ? 'text-[#252525]'
      : tone === 'monochrome-light'
      ? 'text-white'
      : tone === 'rosegold-dark'
      ? 'bg-gradient-to-r from-[#F0CFC9] via-[#D8959E] to-[#E6C1BA] bg-clip-text text-transparent'
      : 'bg-gradient-to-r from-[#8E4D57] via-[#B76E79] to-[#9E5B66] bg-clip-text text-transparent';

  const subTextClass =
    tone === 'monochrome-dark'
      ? 'text-[#252525]/80'
      : tone === 'monochrome-light'
      ? 'text-white/85'
      : tone === 'rosegold-dark'
      ? 'text-[#EAE0D2]'
      : 'text-[#66635D]';

  if (layout === 'symbol-only') {
    const dim = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-16 h-16' : 'w-11 h-11';
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <VeloraSymbol className={dim} variant={symbolVariant} />
      </div>
    );
  }

  const wordSize =
    size === 'sm'
      ? 'text-lg sm:text-xl tracking-[0.22em]'
      : size === 'lg'
      ? 'text-3xl sm:text-4xl tracking-[0.26em]'
      : 'text-2xl tracking-[0.24em]';

  const subSize =
    size === 'sm'
      ? 'text-[8px] tracking-[0.44em]'
      : size === 'lg'
      ? 'text-[11px] tracking-[0.52em]'
      : 'text-[9px] tracking-[0.46em]';

  const symbolDim =
    size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-12 h-12' : 'w-9 h-9';

  if (layout === 'compact') {
    return (
      <div className={`inline-flex flex-col items-center text-center ${className}`}>
        <VeloraSymbol className={symbolDim} variant={symbolVariant} />
        <span className={`mt-1.5 font-display font-semibold uppercase leading-none whitespace-nowrap ${wordSize} ${primaryTextClass}`}>
          Velora
        </span>
        <span className={`mt-1 font-sans font-medium uppercase leading-none whitespace-nowrap ${subSize} ${subTextClass}`}>
          Fragrances
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 shrink-0 ${className}`}>
      <VeloraSymbol className={symbolDim} variant={symbolVariant} />
      <div className="flex flex-col leading-none">
        <span className={`font-display font-semibold uppercase whitespace-nowrap ${wordSize} ${primaryTextClass}`}>
          Velora
        </span>
        <span className={`mt-1 font-sans font-medium uppercase whitespace-nowrap ${subSize} ${subTextClass}`}>
          Fragrances
        </span>
      </div>
    </div>
  );
};

interface VeloraFaviconMarkProps {
  pixelSize?: 16 | 32 | 48 | 96;
  background?: 'cream' | 'white';
}

export const VeloraFaviconMark: React.FC<VeloraFaviconMarkProps> = ({
  pixelSize = 48,
  background = 'cream',
}) => {
  const gradId = useId();
  const bgColor = background === 'cream' ? '#F6EFE6' : '#FFFFFF';

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Velora Fragrances ${pixelSize}px Favicon`}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E5BFB7" />
          <stop offset="48%" stopColor="#B76E79" />
          <stop offset="100%" stopColor="#8C4B55" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" fill={bgColor} />
      <rect x="3" y="3" width="58" height="58" fill="none" stroke={`url(#${gradId})`} strokeWidth="1.6" />
      <path
        d="M18.5 18 L24 18 L32 41.5 L40 18 L45.5 18 L33.4 48.5 L30.6 48.5 Z"
        fill={`url(#${gradId})`}
      />
      <rect x="16.5" y="17.2" width="9.5" height="1.4" fill={`url(#${gradId})`} />
      <rect x="38" y="17.2" width="9.5" height="1.4" fill={`url(#${gradId})`} />
    </svg>
  );
};
