import {
  Search,
  Stethoscope,
  Brain,
  Baby,
  HeartPulse,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Video,
  Star,
} from 'lucide-react';
import { useApp } from '@/i18n/AppContext';

export function Hero() {
  const { t, direction } = useApp();
  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  const stats = [
    { value: '500+', label: t.hero.statDoctors },
    { value: '50K+', label: t.hero.statConsultations },
    { value: '98%', label: t.hero.statSatisfaction },
    { value: '20+', label: t.hero.statCountries },
  ];

  const quickSpecialties = [
    { icon: Brain, label: t.mega.mentalHealth },
    { icon: Baby, label: t.mega.children },
    { icon: HeartPulse, label: t.mega.sub.cardiology },
    { icon: Stethoscope, label: t.mega.sub.generalInternal },
  ];

  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-b from-primary-50/50 via-white to-white">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -end-40 h-96 w-96 rounded-full bg-primary-100/40 blur-3xl" />
        <div className="absolute top-20 -start-40 h-80 w-80 rounded-full bg-secondary-100/40 blur-3xl" />
        <div className="absolute bottom-0 end-1/3 h-64 w-64 rounded-full bg-accent-100/20 blur-3xl" />
      </div>

      <div className="container-x relative py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content */}
          <div className="text-center lg:text-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50/80 px-4 py-1.5 text-sm font-medium text-primary-700 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5" />
              {t.hero.badge}
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] text-neutral-900 text-balance animate-fade-in-up">
              {t.hero.title}
            </h1>

            <p className="mt-6 text-lg text-neutral-600 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {t.hero.subtitle}
            </p>

            {/* Search bar */}
            <div className="mt-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.nav.search}
                  className="w-full rounded-2xl border border-neutral-200 bg-white py-4 ps-12 pe-32 text-sm shadow-lg shadow-neutral-900/5 placeholder:text-neutral-400 focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50 focus:outline-none transition-all"
                />
                <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <button className="absolute end-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-700 active:scale-95">
                  {t.nav.search}
                </button>
              </div>
            </div>

            {/* Quick specialties */}
            <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {quickSpecialties.map((spec, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center gap-2 rounded-full bg-white border border-neutral-200 px-3.5 py-2 text-xs font-medium text-neutral-700 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                >
                  <spec.icon className="h-3.5 w-3.5 text-primary-500" />
                  {spec.label}
                </a>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <button className="btn-primary" onClick={(e) => e.preventDefault()}>
                {t.hero.ctaPrimary}
                <ArrowIcon className="h-4 w-4" />
              </button>
              <button className="btn-secondary" onClick={(e) => e.preventDefault()}>
                {t.hero.ctaSecondary}
              </button>
            </div>
          </div>

          {/* Visual */}
          <div className="relative hidden lg:block animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="relative">
              {/* Main card */}
              <div className="rounded-3xl bg-gradient-to-br from-primary-500 to-secondary-600 p-8 shadow-2xl shadow-primary-500/25">
                <div className="rounded-2xl bg-white/95 backdrop-blur p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100">
                      <Stethoscope className="h-8 w-8 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900">Dr. Ahmed Hassan</h3>
                      <p className="text-sm text-neutral-500">Cardiology • 15 years exp.</p>
                      <div className="mt-1 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
                        <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
                        <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
                        <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
                        <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
                        <span className="text-xs text-neutral-500 ms-1">4.9 (320)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between rounded-xl bg-primary-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
                      <Video className="h-4 w-4" />
                      Video consultation
                    </div>
                    <span className="text-lg font-bold text-primary-700">$49</span>
                  </div>

                  <button className="mt-4 w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-700 active:scale-95">
                    {t.mega.bookConsultation}
                  </button>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -top-6 -start-6 rounded-2xl bg-white p-4 shadow-xl shadow-neutral-900/10 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-100 text-success-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-900">Verified Doctors</p>
                    <p className="text-[10px] text-neutral-500">100% Authenticated</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -end-6 rounded-2xl bg-white p-4 shadow-xl shadow-neutral-900/10 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-600">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-900">10% OFF</p>
                    <p className="text-[10px] text-neutral-500">First consultation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          {stats.map((stat, i) => (
            <div
              key={i}
              className="text-center rounded-2xl border border-neutral-100 bg-white/80 backdrop-blur p-5 transition-all hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5"
            >
              <p className="text-3xl lg:text-4xl font-bold text-primary-600">{stat.value}</p>
              <p className="mt-1 text-sm text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
