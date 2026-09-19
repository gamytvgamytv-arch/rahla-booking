import { ArrowRight, ArrowLeft, Users, Stethoscope } from 'lucide-react';
import { useApp } from '@/i18n/AppContext';

export function CTASection() {
  const { t, direction } = useApp();
  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section className="py-16 lg:py-24">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-600 to-secondary-600 px-6 py-16 lg:px-16 lg:py-20 shadow-2xl shadow-primary-500/20">
          {/* Decorations */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -end-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-24 -start-24 h-72 w-72 rounded-full bg-white/5 blur-2xl" />
            <Users className="absolute top-8 end-8 h-32 w-32 text-white/5" />
            <Stethoscope className="absolute bottom-8 start-8 h-24 w-24 text-white/5" />
          </div>

          <div className="relative text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-balance">{t.cta.title}</h2>
            <p className="mt-5 text-lg text-white/80">{t.cta.subtitle}</p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-primary-700 shadow-xl transition-all hover:shadow-2xl hover:scale-105 active:scale-95"
                onClick={(e) => e.preventDefault()}
              >
                {t.cta.button}
                <ArrowIcon className="h-4 w-4" />
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur px-8 py-3.5 text-sm font-bold text-white ring-1 ring-inset ring-white/30 transition-all hover:bg-white/20 active:scale-95"
                onClick={(e) => e.preventDefault()}
              >
                {t.cta.secondaryButton}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
