import React from 'react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumb?: { label: string; to?: string }[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  breadcrumb,
}) => {
  return (
    <section className="bg-[#FAF8F3] border-b border-[#D4AF6A]/25">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-xs text-[#66635D]">
            {breadcrumb.map((item, index) => (
              <React.Fragment key={item.label}>
                {index > 0 && <span aria-hidden="true">/</span>}
                {item.to ? (
                  <Link to={item.to} className="hover:text-[#8E4D57] transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-[#252525] font-medium">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.2em] text-[#8E4D57] font-semibold mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-[#252525] text-balance">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-[#66635D]">
            {description}
          </p>
        )}
      </div>
    </section>
  );
};
