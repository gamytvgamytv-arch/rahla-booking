import { useState, useEffect } from 'react';
import { Menu, X, Stethoscope, Phone, ChevronDown } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { path, navigate } = useRouter();
  const { t, lang } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const mainLinks = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.doctors'), path: '/doctors' },
    { label: t('nav.ask'), path: '/ask' },
    { label: t('nav.questions'), path: '/questions' },
    { label: t('nav.articles'), path: '/articles' },
  ];

  const moreLinks = [
    { label: t('nav.videos'), path: '/videos' },
    { label: t('nav.audio'), path: '/audio' },
    { label: t('nav.courses'), path: '/courses' },
    { label: t('nav.sessions'), path: '/sessions' },
    { label: t('nav.chat'), path: '/chat' },
    { label: t('nav.library'), path: '/library' },
    { label: t('nav.clinics'), path: '/clinics' },
    { label: t('nav.radiology'), path: '/radiology' },
    { label: t('nav.labs'), path: '/labs' },
    { label: t('nav.tests'), path: '/tests' },
    { label: t('nav.facilities'), path: '/facilities' },
    { label: t('nav.jobs'), path: '/jobs' },
    { label: t('nav.ai_reader'), path: '/ai-reader' },
    { label: t('nav.favorites'), path: '/favorites' },
    { label: t('nav.referral'), path: '/referral' },
    { label: t('nav.subscriptions'), path: '/subscriptions' },
    { label: t('nav.register'), path: '/register' },
    { label: t('nav.policy') || (lang === 'ar' ? 'سياسة الموقع' : 'Site Policy'), path: '/policy' },
    { label: t('nav.admin'), path: '/admin' },
  ];

  const isActive = (linkPath: string) => {
    if (linkPath === '/') return path === '/';
    return path.startsWith(linkPath);
  };

  const handleNavigate = (to: string) => {
    navigate(to);
    setMobileOpen(false);
    setMoreOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-2' : 'bg-white/80 backdrop-blur-sm py-3'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => handleNavigate('/')} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <span className="block text-lg font-bold text-gray-800 leading-tight">سهله وبسيطه</span>
              <span className="block text-[10px] text-teal-600 font-medium">Sahla Wa Basita</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {mainLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavigate(link.path)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-teal-700 bg-teal-50'
                    : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </button>
            ))}
            {/* More dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-sm text-gray-600 hover:text-teal-600 hover:bg-gray-50 transition-all"
              >
                {t('nav.more') || (lang === 'ar' ? 'المزيد' : 'More')}
                <ChevronDown className="w-4 h-4" />
              </button>
              {moreOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[180px] animate-scale-in">
                  {moreLinks.map((link) => (
                    <button
                      key={link.path}
                      onClick={() => handleNavigate(link.path)}
                      className={`flex items-center w-full px-4 py-2.5 text-right text-sm hover:bg-gray-50 transition-colors ${
                        isActive(link.path) ? 'text-teal-600 font-semibold' : 'text-gray-600'
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => handleNavigate('/ask')}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Phone className="w-4 h-4" />
              <span>{t('hero.ask_now')}</span>
            </button>
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden mt-3 pb-3 animate-slide-up">
            <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-3">
              {[...mainLinks, ...moreLinks].map((link) => (
                <button
                  key={link.path}
                  onClick={() => handleNavigate(link.path)}
                  className={`px-4 py-3 rounded-lg font-medium text-sm text-right transition-all ${
                    isActive(link.path)
                      ? 'text-teal-700 bg-teal-50'
                      : 'text-gray-600 hover:bg-white'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => handleNavigate('/ask')}
                className="flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold px-5 py-3 rounded-xl mt-2"
              >
                <Phone className="w-4 h-4" />
                <span>{t('hero.ask_now')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
