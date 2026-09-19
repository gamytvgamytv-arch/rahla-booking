import { useState, useEffect } from 'react';
import { Gift, X, Sparkles, ChevronDown } from 'lucide-react';
import { useApp } from '@/i18n/AppContext';

export function DiscountBanner() {
  const { t, showDiscount, dismissDiscount } = useApp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (showDiscount) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [showDiscount]);

  if (!showDiscount) return null;

  return (
    <div
      className={`fixed bottom-4 start-1/2 z-50 -translate-x-1/2 rtl:translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
      }`}
      style={{ transform: 'translateX(-50%)' }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-600 to-secondary-600 p-px shadow-2xl shadow-primary-900/30">
        <div className="relative rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-600 px-5 py-4 sm:px-6 sm:py-5">
          {/* Decorative sparkles */}
          <Sparkles className="absolute top-3 end-4 h-4 w-4 text-white/30" />
          <Sparkles className="absolute bottom-3 start-4 h-3 w-3 text-white/20" />

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-bold text-white">{t.discount.title}</p>
              <p className="text-xs sm:text-sm text-white/80 mt-0.5 line-clamp-2">{t.discount.desc}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-primary-700 shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95"
                onClick={(e) => e.preventDefault()}
              >
                {t.discount.cta}
                <ChevronDown className="h-3.5 w-3.5 rotate-[-90deg]" />
              </button>
              <button
                onClick={dismissDiscount}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label={t.discount.close}
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Mobile CTA */}
          <button
            className="mt-3 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-primary-700 shadow-lg sm:hidden active:scale-95"
            onClick={(e) => e.preventDefault()}
          >
            {t.discount.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
