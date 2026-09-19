import type { LanguageCode, TranslationData } from '@/types/i18n';
import ar from './translations/ar';
import ru from './translations/ru';
import uz from './translations/uz';
import hy from './translations/hy';
import tg from './translations/tg';
import uk from './translations/uk';
import az from './translations/az';
import ka from './translations/ka';

export const translations: Record<LanguageCode, TranslationData> = {
  ar,
  ru,
  uz,
  hy,
  tg,
  uk,
  az,
  ka,
};

export type { TranslationData, LanguageCode };
