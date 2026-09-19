import {
  FileText,
  Building2,
  Users,
  Gem,
  ArrowRight,
  ArrowLeft,
  type LucideIcon,
} from 'lucide-react';
import { useApp } from '@/i18n/AppContext';

interface QuickCard {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  countKey?: string;
  actionKey: string;
  iconBg: string;
  iconText: string;
  cardBg: string;
  border: string;
  hoverBorder: string;
  accent?: boolean;
}

export function BottomActionCards() {
  const { t, direction, formatPrice } = useApp();
  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  const cards: QuickCard[] = [
    {
      icon: FileText,
      titleKey: t.quickAccess.articles,
      descKey: t.quickAccess.articlesDesc,
      countKey: t.quickAccess.articlesCount,
      actionKey: t.quickAccess.explore,
      iconBg: 'bg-primary-100',
      iconText: 'text-primary-700',
      cardBg: 'bg-white',
      border: 'border-neutral-200',
      hoverBorder: 'hover:border-primary-300',
    },
    {
      icon: Building2,
      titleKey: t.quickAccess.clinics,
      descKey: t.quickAccess.clinicsDesc,
      actionKey: t.quickAccess.bookNow,
      iconBg: 'bg-primary-100',
      iconText: 'text-primary-700',
      cardBg: 'bg-white',
      border: 'border-neutral-200',
      hoverBorder: 'hover:border-primary-300',
    },
    {
      icon: Users,
      titleKey: t.quickAccess.specialists,
      descKey: t.quickAccess.specialistsDesc,
      countKey: t.quickAccess.specialistsCount,
      actionKey: t.quickAccess.browse,
      iconBg: 'bg-primary-100',
      iconText: 'text-primary-700',
      cardBg: 'bg-white',
      border: 'border-neutral-200',
      hoverBorder: 'hover:border-primary-300',
    },
    {
      icon: Gem,
      titleKey: t.quickAccess.subscribe,
      descKey: t.quickAccess.subscribeDesc,
      countKey: t.quickAccess.fromPrice,
      actionKey: t.quickAccess.subscribeNow,
      iconBg: 'bg-secondary-100',
      iconText: 'text-secondary-700',
      cardBg: 'bg-gradient-to-br from-secondary-50 to-primary-50',
      border: 'border-secondary-200',
      hoverBorder: 'hover:border-secondary-400',
      accent: true,
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-white to-neutral-50">
      <div className="container-x">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">{t.quickAccess.title}</h2>
          <p className="mt-3 text-base text-neutral-500">{t.quickAccess.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <button
                key={i}
                onClick={(e) => e.preventDefault()}
                className={`group relative overflow-hidden rounded-2xl border ${card.border} ${card.cardBg} p-5 lg:p-6 text-start shadow-sm transition-all duration-300 ${card.hoverBorder} hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1`}
              >
                {/* Icon */}
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.iconBg} ${card.iconText} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className="h-7 w-7" />
                </div>

                {/* Title + desc */}
                <h3 className="mt-4 text-base font-bold text-neutral-900 leading-snug">{card.titleKey}</h3>
                <p className="mt-1 text-sm text-neutral-500 leading-relaxed line-clamp-2">{card.descKey}</p>

                {/* Count badge */}
                {card.countKey && (
                  <div className="mt-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                      card.accent
                        ? 'bg-secondary-100 text-secondary-700'
                        : 'bg-primary-100 text-primary-700'
                    }`}>
                      {card.countKey}
                    </span>
                  </div>
                )}

                {/* Action link */}
                <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition-all group-hover:gap-2.5">
                  {card.actionKey}
                  <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                </div>

                {/* Decorative corner glow */}
                <div className="pointer-events-none absolute -top-12 -end-12 h-32 w-32 rounded-full bg-primary-100/20 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
