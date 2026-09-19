import { Stethoscope, Mail, Phone, MapPin } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';

export default function Footer() {
  const { navigate } = useRouter();
  const { t } = useI18n();

  const links = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.doctors'), path: '/doctors' },
    { label: t('nav.questions'), path: '/questions' },
    { label: t('nav.articles'), path: '/articles' },
    { label: t('nav.videos'), path: '/videos' },
    { label: t('nav.audio'), path: '/audio' },
    { label: t('nav.courses'), path: '/courses' },
    { label: t('nav.sessions'), path: '/sessions' },
    { label: t('nav.ask'), path: '/ask' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">سهله وبسيطه</span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-md">
              {t('footer.about')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-bold mb-4">{t('footer.quick_links')}</h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-gray-400 hover:text-teal-400 transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400" />
                <span className="text-gray-400">gamytvgamytv@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400" />
                <span className="text-gray-400">+963 11 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span className="text-gray-400">دمشق، سوريا</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
          <p>{t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
