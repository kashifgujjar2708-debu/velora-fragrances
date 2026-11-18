import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_ITEMS } from '../data/seedData';
import { PageHeader } from '../components/common/PageHeader';

export const FaqPage: React.FC = () => {
  const [openId, setOpenId] = useState<string>(FAQ_ITEMS[0].id);

  return (
    <div>
      <PageHeader
        eyebrow="Questions & Guidance"
        title="Frequently Asked Questions"
        description="Delivery timelines across Pakistan, simulated checkout rules, return terms, and fragrance concentration guidance."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'FAQ' }]}
      />

      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="divide-y divide-[#252525]/10 border-y border-[#252525]/10">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className="py-5">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${item.id}`}
                  onClick={() => setOpenId(isOpen ? '' : item.id)}
                  className="flex w-full items-center justify-between gap-4 text-left py-1"
                >
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#8E4D57] font-semibold">
                      {item.category}
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-medium text-[#252525]">
                      {item.question}
                    </h2>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-[#66635D] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <p id={`faq-panel-${item.id}`} className="mt-3 text-sm leading-relaxed text-[#66635D] pr-8">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
