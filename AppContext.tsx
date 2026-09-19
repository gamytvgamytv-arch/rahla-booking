import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  type LanguageCode,
  type Direction,
  type CountryInfo,
  type TranslationData,
  LANGUAGES,
  ARAB_COUNTRIES,
  CURRENCY_RATES,
} from '@/types/i18n';
import { translations } from '@/i18n/translations';

interface AppContextValue {
  language: LanguageCode;
  direction: Direction;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationData;
  isAnonymous: boolean;
  hasSeenDiscount: boolean;
  dismissDiscount: () => void;
  showDiscount: boolean;
  setShowDiscount: (v: boolean) => void;
  country: CountryInfo;
  setCountry: (country: CountryInfo) => void;
  formatPrice: (priceUSD: number) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  language: 'app_language',
  country: 'app_country',
  discountDismissed: 'app_discount_dismissed',
};

function getInitialLanguage(): LanguageCode {
  if (typeof window === 'undefined') return 'ar';
  const stored = localStorage.getItem(STORAGE_KEYS.language) as LanguageCode | null;
  if (stored && LANGUAGES[stored]) return stored;
  return 'ar';
}

function getInitialCountry(): CountryInfo {
  if (typeof window === 'undefined') return ARAB_COUNTRIES[0];
  const stored = localStorage.getItem(STORAGE_KEYS.country);
  if (stored) {
    const found = ARAB_COUNTRIES.find((c) => c.code === stored);
    if (found) return found;
  }
  return ARAB_COUNTRIES[0];
}

function getInitialDiscountDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.discountDismissed) === 'true';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(getInitialLanguage);
  const [country, setCountryState] = useState<CountryInfo>(getInitialCountry);
  const [discountDismissed, setDiscountDismissed] = useState<boolean>(getInitialDiscountDismissed);
  const [showDiscount, setShowDiscount] = useState<boolean>(false);

  const direction: Direction = LANGUAGES[language].direction;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [language, direction]);

  useEffect(() => {
    // Show discount banner after a short delay on first visit (only if not dismissed)
    if (!discountDismissed) {
      const timer = setTimeout(() => setShowDiscount(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [discountDismissed]);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.language, lang);
  }, []);

  const setCountry = useCallback((c: CountryInfo) => {
    setCountryState(c);
    localStorage.setItem(STORAGE_KEYS.country, c.code);
  }, []);

  const dismissDiscount = useCallback(() => {
    setDiscountDismissed(true);
    setShowDiscount(false);
    localStorage.setItem(STORAGE_KEYS.discountDismissed, 'true');
  }, []);

  const formatPrice = useCallback(
    (priceUSD: number): string => {
      const rate = CURRENCY_RATES[country.currency] ?? 1;
      const converted = priceUSD * rate;
      const formatted = converted.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      return `${formatted} ${country.currencySymbol}`;
    },
    [country, language]
  );

  const isAnonymous = true; // No auth in this phase — all visitors are anonymous

  const value: AppContextValue = {
    language,
    direction,
    setLanguage,
    t: translations[language],
    isAnonymous,
    hasSeenDiscount: discountDismissed,
    dismissDiscount,
    showDiscount,
    setShowDiscount,
    country,
    setCountry,
    formatPrice,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
