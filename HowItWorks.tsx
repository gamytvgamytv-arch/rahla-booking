import {
  Search,
  Stethoscope,
  CalendarCheck,
  Video,
  type LucideIcon,
} from 'lucide-react';
import { useApp } from '@/i18n/AppContext';

export function HowItWorks() {
  const { t } = useApp();

  const steps: { icon: LucideIcon; title: string; desc: string; num: string }[] = [
    { icon: Search, title: t.howItWorks.step1Title, desc: t.howItWorks.step1Desc, num: '01' },
    { icon: Stethoscope, title: t.howItWorks.step2Title, desc: t.howItWorks.step2Desc, num: '02' },
    { icon: CalendarCheck, title: t.howItWorks.step3Title, desc: t.howItWorks.step3Desc, num: '03' },
    { icon: Video, title: t.howItWorks.step4Title, desc: t.howItWorks.step4Desc, num: '04' },
  ];

  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-gradient-to-b from-neutral-50 to-white">
      <div className="container-x">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 text-balance">{t.howItWorks.title}</h2>
          <p className="mt-4 text-lg text-neutral-500">{t.howItWorks.subtitle}</p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-16 start-[12.5%] end-[12.5%] h-0.5 bg-gradient-to-r from-primary-200 via-secondary-200 to-primary-200" />

          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              <div className="relative inline-flex">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border-2 border-primary-200 shadow-lg shadow-primary-500/10 transition-all duration-300 hover:border-primary-500 hover:shadow-primary-500/20 hover:scale-105">
                  <step.icon className="h-7 w-7 text-primary-600" />
                </div>
                <span className="absolute -top-2 -end-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white shadow-md">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-base font-bold text-neutral-900">{step.title}</h3>
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
