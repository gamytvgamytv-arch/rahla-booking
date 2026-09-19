import {
  ShieldCheck,
  Lock,
  Clock,
  Languages,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useApp } from '@/i18n/AppContext';

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
}

export function Features() {
  const { t } = useApp();

  const features: FeatureItem[] = [
    { icon: ShieldCheck, title: t.features.items.verifiedDoctors.title, desc: t.features.items.verifiedDoctors.desc, color: 'text-primary-600 bg-primary-100' },
    { icon: Lock, title: t.features.items.secureConfidential.title, desc: t.features.items.secureConfidential.desc, color: 'text-secondary-600 bg-secondary-100' },
    { icon: Clock, title: t.features.items.twentyFourSeven.title, desc: t.features.items.twentyFourSeven.desc, color: 'text-accent-600 bg-accent-100' },
    { icon: Languages, title: t.features.items.multilingual.title, desc: t.features.items.multilingual.desc, color: 'text-success-600 bg-success-100' },
    { icon: Wallet, title: t.features.items.affordablePricing.title, desc: t.features.items.affordablePricing.desc, color: 'text-error-600 bg-error-100' },
    { icon: Zap, title: t.features.items.instantBooking.title, desc: t.features.items.instantBooking.desc, color: 'text-primary-600 bg-secondary-100' },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container-x">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 text-balance">{t.features.title}</h2>
          <p className="mt-4 text-lg text-neutral-500">{t.features.subtitle}</p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color} transition-transform duration-300 group-hover:scale-110`}>
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-neutral-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
