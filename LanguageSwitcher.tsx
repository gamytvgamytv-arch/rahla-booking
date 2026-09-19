import { Globe, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useI18n, type Language } from '@/lib/i18n';

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'ar', label: 'العربية', flag: '🇸🇾' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'uz', label: 'Oʻzbekcha', flag: '🇺🇿' },
  { code: 'hy', label: 'Հայերեն', flag: '🇦🇲' },
  { code: 'tg', label: 'Тоҷикӣ', flag: '🇹🇯' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
  { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'am', label: 'አማርኛ', flag: '🇪🇹' },
  { code: 'ka', label: 'ქართული', flag: '🇬🇪' },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const current = languages.find((l) => l.code === lang) || languages[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{current.label}</span>
        <span className="sm:hidden">{current.code.toUpperCase()}</span>
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[160px] z-50 animate-scale-in">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-right hover:bg-gray-50 transition-colors text-sm ${
                lang === l.code ? 'text-teal-600 font-semibold' : 'text-gray-600'
              }`}
            >
              <span className="text-lg">{l.flag}</span>
              <span>{l.label}</span>
              {lang === l.code && <Check className="w-4 h-4 mr-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
