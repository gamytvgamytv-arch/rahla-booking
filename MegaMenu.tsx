import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Baby,
  Brain,
  Stethoscope,
  BabyIcon,
  Languages,
  Ruler,
  Activity,
  HeartHandshake,
  BrainCircuit,
  Network,
  LineChart,
  BrainCog,
  Moon,
  Wind,
  Thermometer,
  HeartPulse,
  Sparkles,
  Bone,
  Shield,
  Accessibility,
  Camera,
  type LucideIcon,
} from 'lucide-react';
import { useApp } from '@/i18n/AppContext';
import { SPECIALTIES, type SpecialtyCategory } from '@/types/i18n';

const ICON_MAP: Record<string, LucideIcon> = {
  Baby,
  Brain,
  Stethoscope,
  BabyIcon,
  Languages,
  Ruler,
  Activity,
  HeartHandshake,
  BrainCircuit,
  Network,
  LineChart,
  BrainCog,
  Moon,
  Wind,
  Thermometer,
  HeartPulse,
  Sparkles,
  Bone,
  Shield,
  Accessibility,
  Camera,
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  children: Baby,
  mentalHealth: Brain,
  otherSpecialties: Stethoscope,
};

export function MegaMenu() {
  const { t, direction } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      ref={containerRef}
    >
      <button
        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-100 hover:text-primary-700"
        aria-expanded={isOpen}
      >
        {t.nav.specialties}
        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute start-0 top-full z-50 pt-3">
          <div className="w-[920px] max-w-[calc(100vw-2rem)] rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/15 animate-slide-down">
            <div className="grid grid-cols-3 gap-0">
              {SPECIALTIES.map((category: SpecialtyCategory, idx) => {
                const CatIcon = CATEGORY_ICONS[category.key] || Stethoscope;
                const isActive = activeCategory === idx;
                return (
                  <div
                    key={category.key}
                    className={`p-5 transition-colors ${idx < 2 ? 'border-e border-neutral-100' : ''} ${
                      isActive ? 'bg-primary-50/50' : ''
                    }`}
                    onMouseEnter={() => setActiveCategory(idx)}
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-md shadow-primary-500/20">
                        <CatIcon className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-bold text-neutral-900">
                        {t.mega[category.key as keyof typeof t.mega] as string}
                      </h3>
                    </div>
                    <ul className="space-y-1">
                      {category.items.map((item) => {
                        const ItemIcon = ICON_MAP[item.icon] || Stethoscope;
                        return (
                          <li key={item.key}>
                            <a
                              href="#"
                              className="group mega-menu-item"
                              onClick={(e) => e.preventDefault()}
                            >
                              <div className="mega-menu-icon">
                                <ItemIcon className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-800 group-hover:text-primary-700 transition-colors leading-snug">
                                  {t.mega.sub[item.key]}
                                </p>
                              </div>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Bottom CTA bar */}
            <div className="flex items-center justify-between rounded-b-2xl border-t border-neutral-100 bg-gradient-to-r from-primary-50 via-white to-secondary-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                  <Stethoscope className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{t.mega.viewAllSpecialties}</p>
                  <p className="text-xs text-neutral-500">{SPECIALTIES.reduce((a, c) => a + c.items.length, 0)}+ specialties</p>
                </div>
              </div>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="btn-primary text-xs px-4 py-2"
              >
                {t.mega.bookConsultation}
                <ArrowIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
