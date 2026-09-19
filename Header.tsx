import { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Search,
  User,
  HeartPulse,
  LogIn,
  UserPlus,
  Home,
  HelpCircle,
  Info,
  Phone,
  BookOpen,
  Stethoscope,
  Building2,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '@/i18n/AppContext';
import { MegaMenu } from '@/components/MegaMenu';
import { LanguageSwitcher, MobileLanguageSwitcher } from '@/components/LanguageSwitcher';
import { NotificationsPopover } from '@/components/NotificationsPopover';
import { SPECIALTIES } from '@/types/i18n';

export function Header() {
  const { t, isAnonymous } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<'main' | 'specialties' | 'language'>('main');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const navItems = [
    { label: t.nav.home, href: '#home', icon: Home },
    { label: t.specialists.title, href: '#specialists', icon: Stethoscope },
    { label: t.facilities.title, href: '#facilities', icon: Building2 },
    { label: t.nav.howItWorks, href: '#how-it-works', icon: HelpCircle },
    { label: t.nav.about, href: '#about', icon: Info },
    { label: t.nav.blog, href: '#library', icon: BookOpen },
    { label: t.nav.contact, href: '#contact', icon: Phone },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'glass border-b border-neutral-200/80 shadow-sm shadow-neutral-900/5'
            : 'bg-white border-b border-neutral-100'
        }`}
      >
        <div className="container-x">
          <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2.5 flex-shrink-0" onClick={(e) => e.preventDefault()}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/25">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div className="hidden sm:block">
                <span className="block text-lg font-bold leading-tight text-neutral-900">Tabibi</span>
                <span className="block text-[10px] font-medium leading-tight text-primary-600">Online</span>
              </div>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.slice(0, 1).map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-100 hover:text-primary-700"
                  onClick={(e) => e.preventDefault()}
                >
                  {item.label}
                </a>
              ))}
              {navItems.slice(1, 3).map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-100 hover:text-primary-700"
                >
                  {item.label}
                </a>
              ))}
              <MegaMenu />
              {navItems.slice(3).map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-100 hover:text-primary-700"
                  onClick={(e) => e.preventDefault()}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Search (desktop) */}
              <div className="hidden xl:flex relative">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder={t.nav.search}
                  className="w-56 rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 ps-10 pe-4 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none"
                />
                <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              </div>

              <LanguageSwitcher />

              <NotificationsPopover />

              {/* Auth buttons */}
              <div className="hidden md:flex items-center gap-2">
                {isAnonymous && (
                  <>
                    <button className="btn-ghost text-sm" onClick={(e) => e.preventDefault()}>
                      <LogIn className="h-4 w-4" />
                      {t.nav.signIn}
                    </button>
                    <button className="btn-primary text-sm" onClick={(e) => e.preventDefault()}>
                      <UserPlus className="h-4 w-4" />
                      {t.nav.signUp}
                    </button>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors"
                onClick={() => setMobileOpen(true)}
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-fade-in"
            onClick={() => {
              setMobileOpen(false);
              setMobileSection('main');
            }}
          />
          <div className="absolute end-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl animate-slide-down overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between border-b border-neutral-100 p-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
                  <HeartPulse className="h-4.5 w-4.5" />
                </div>
                <span className="font-bold text-neutral-900">Tabibi Online</span>
              </div>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setMobileSection('main');
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {mobileSection === 'main' && (
              <div className="p-4 space-y-1">
                {/* Search */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder={t.nav.search}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 ps-10 pe-4 text-sm placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:outline-none"
                  />
                  <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                </div>

                {/* Nav links */}
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                    onClick={(e) => {
                      if (item.href.startsWith('#') && !['#home', '#how-it-works', '#about', '#blog', '#contact'].includes(item.href)) {
                        return;
                      }
                      e.preventDefault();
                      setMobileOpen(false);
                    }}
                  >
                    <item.icon className="h-4.5 w-4.5 text-neutral-400" />
                    {item.label}
                  </a>
                ))}

                {/* Specialties */}
                <button
                  onClick={() => setMobileSection('specialties')}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  <span className="flex items-center gap-3">
                    <Shield className="h-4.5 w-4.5 text-neutral-400" />
                    {t.nav.specialties}
                  </span>
                  <ChevronDown className="h-4 w-4 rotate-[-90deg] text-neutral-400" />
                </button>

                {/* Language */}
                <button
                  onClick={() => setMobileSection('language')}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  <span className="flex items-center gap-3">
                    <User className="h-4.5 w-4.5 text-neutral-400" />
                    {t.language.selectLanguage}
                  </span>
                  <ChevronDown className="h-4 w-4 rotate-[-90deg] text-neutral-400" />
                </button>

                {/* Auth */}
                <div className="mt-4 space-y-2 border-t border-neutral-100 pt-4">
                  {isAnonymous && (
                    <>
                      <button
                        className="btn-ghost w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          setMobileOpen(false);
                        }}
                      >
                        <LogIn className="h-4 w-4" />
                        {t.nav.signIn}
                      </button>
                      <button
                        className="btn-primary w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          setMobileOpen(false);
                        }}
                      >
                        <UserPlus className="h-4 w-4" />
                        {t.nav.signUp}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {mobileSection === 'specialties' && (
              <div className="p-4">
                <button
                  onClick={() => setMobileSection('main')}
                  className="mb-4 flex items-center gap-2 text-sm font-medium text-primary-600"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                  {t.nav.specialties}
                </button>
                <div className="space-y-4">
                  {SPECIALTIES.map((cat) => (
                    <div key={cat.key}>
                      <h3 className="mb-2 text-sm font-bold text-neutral-900 px-1">
                        {t.mega[cat.key as keyof typeof t.mega] as string}
                      </h3>
                      <div className="space-y-1">
                        {cat.items.map((item) => (
                          <a
                            key={item.key}
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setMobileOpen(false);
                              setMobileSection('main');
                            }}
                            className="block rounded-lg px-3 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700"
                          >
                            {t.mega.sub[item.key]}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mobileSection === 'language' && (
              <div className="p-4">
                <button
                  onClick={() => setMobileSection('main')}
                  className="mb-4 flex items-center gap-2 text-sm font-medium text-primary-600"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                  {t.language.selectLanguage}
                </button>
                <MobileLanguageSwitcher
                  onClose={() => {
                    setMobileOpen(false);
                    setMobileSection('main');
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
