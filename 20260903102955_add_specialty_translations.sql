/*
# Add translation columns to specialties

## Overview
The specialties table currently only has Arabic names/descriptions.
Adding columns for English, German, and Russian translations.

## Changes
- Add name_en, name_de, name_ru text columns to specialties
- Add description_en, description_de, description_ru text columns
- Populate all existing rows with translations
*/

ALTER TABLE specialties ADD COLUMN IF NOT EXISTS name_en text;
ALTER TABLE specialties ADD COLUMN IF NOT EXISTS name_de text;
ALTER TABLE specialties ADD COLUMN IF NOT EXISTS name_ru text;
ALTER TABLE specialties ADD COLUMN IF NOT EXISTS description_en text;
ALTER TABLE specialties ADD COLUMN IF NOT EXISTS description_de text;
ALTER TABLE specialties ADD COLUMN IF NOT EXISTS description_ru text;

-- Update translations for each specialty
UPDATE specialties SET
  name_en = 'Cardiology', name_de = 'Kardiologie', name_ru = 'Кардиология',
  description_en = 'Diagnosis and treatment of heart and blood vessel diseases',
  description_de = 'Diagnose und Behandlung von Herz- und Gefäßkrankheiten',
  description_ru = 'Диагностика и лечение заболеваний сердца и сосудов'
WHERE slug = 'cardiology';

UPDATE specialties SET
  name_en = 'Dermatology', name_de = 'Dermatologie', name_ru = 'Дерматология',
  description_en = 'Treatment of skin diseases and conditions',
  description_de = 'Behandlung von Hautkrankheiten',
  description_ru = 'Лечение заболеваний кожи'
WHERE slug = 'dermatology';

UPDATE specialties SET
  name_en = 'Pediatrics', name_de = 'Pädiatrie', name_ru = 'Педиатрия',
  description_en = 'Child healthcare from birth to adolescence',
  description_de = 'Gesundheitsversorgung für Kinder von Geburt bis Jugend',
  description_ru = 'Здравоохранение детей от рождения до подросткового возраста'
WHERE slug = 'pediatrics';

UPDATE specialties SET
  name_en = 'Gynecology', name_de = 'Gynäkologie', name_ru = 'Гинекология',
  description_en = 'Women''s health, pregnancy and childbirth',
  description_de = 'Frauengesundheit, Schwangerschaft und Geburt',
  description_ru = 'Женское здоровье, беременность и роды'
WHERE slug = 'gynecology';

UPDATE specialties SET
  name_en = 'Dentistry', name_de = 'Zahnmedizin', name_ru = 'Стоматология',
  description_en = 'Treatment of dental and gum problems',
  description_de = 'Behandlung von Zahn- und Zahnfleischproblemen',
  description_ru = 'Лечение проблем с зубами и дёснами'
WHERE slug = 'dentistry';

UPDATE specialties SET
  name_en = 'Ophthalmology', name_de = 'Augenheilkunde', name_ru = 'Офтальмология',
  description_en = 'Examination and treatment of eye diseases',
  description_de = 'Untersuchung und Behandlung von Augenerkrankungen',
  description_ru = 'Осмотр и лечение заболеваний глаз'
WHERE slug = 'ophthalmology';

UPDATE specialties SET
  name_en = 'Psychiatry', name_de = 'Psychiatrie', name_ru = 'Психиатрия',
  description_en = 'Mental health and psychiatric treatment',
  description_de = 'Psychische Gesundheit und psychiatrische Behandlung',
  description_ru = 'Психическое здоровье и психиатрическое лечение'
WHERE slug = 'psychiatry';

UPDATE specialties SET
  name_en = 'Gastroenterology', name_de = 'Gastroenterologie', name_ru = 'Гастроэнтерология',
  description_en = 'Stomach, intestinal and liver diseases',
  description_de = 'Magen-, Darm- und Lebererkrankungen',
  description_ru = 'Заболевания желудка, кишечника и печени'
WHERE slug = 'gastroenterology';

UPDATE specialties SET
  name_en = 'Orthopedics', name_de = 'Orthopädie', name_ru = 'Ортопедия',
  description_en = 'Treatment of bone and joint diseases and injuries',
  description_de = 'Behandlung von Knochen- und Gelenkerkrankungen',
  description_ru = 'Лечение заболеваний костей и суставов'
WHERE slug = 'orthopedics';

UPDATE specialties SET
  name_en = 'ENT', name_de = 'HNO', name_ru = 'ЛОР',
  description_en = 'Ear, nose and throat diseases',
  description_de = 'Hals-, Nasen- und Ohrenkrankheiten',
  description_ru = 'Заболевания уха, горла и носа'
WHERE slug = 'ent';

UPDATE specialties SET
  name_en = 'Urology', name_de = 'Urologie', name_ru = 'Урология',
  description_en = 'Urinary tract and kidney diseases',
  description_de = 'Harnwegs- und Nierenerkrankungen',
  description_ru = 'Заболевания мочевыводящих путей и почек'
WHERE slug = 'urology';

UPDATE specialties SET
  name_en = 'Neurology', name_de = 'Neurologie', name_ru = 'Неврология',
  description_en = 'Nervous system and brain diseases',
  description_de = 'Nervensystem- und Hirnerkrankungen',
  description_ru = 'Заболевания нервной системы и мозга'
WHERE slug = 'neurology';

UPDATE specialties SET
  name_en = 'Endocrinology', name_de = 'Endokrinologie', name_ru = 'Эндокринология',
  description_en = 'Diabetes and endocrine gland diseases',
  description_de = 'Diabetes und endokrine Drüsenerkrankungen',
  description_ru = 'Сахарный диабет и заболевания эндокринных желёз'
WHERE slug = 'endocrinology';

UPDATE specialties SET
  name_en = 'Oncology', name_de = 'Onkologie', name_ru = 'Онкология',
  description_en = 'Cancer diagnosis and treatment',
  description_de = 'Krebsdiagnose und -behandlung',
  description_ru = 'Диагностика и лечение рака'
WHERE slug = 'oncology';

UPDATE specialties SET
  name_en = 'Anesthesia', name_de = 'Anästhesie', name_ru = 'Анестезиология',
  description_en = 'Anesthesia and rehabilitation',
  description_de = 'Anästhesie und Rehabilitation',
  description_ru = 'Анестезия и реабилитация'
WHERE slug = 'anesthesia';

UPDATE specialties SET
  name_en = 'Rheumatology', name_de = 'Rheumatologie', name_ru = 'Ревматология',
  description_en = 'Joint and rheumatic diseases',
  description_de = 'Gelenk- und Rheumaerkrankungen',
  description_ru = 'Заболевания суставов и ревматизм'
WHERE slug = 'rheumatology';

UPDATE specialties SET
  name_en = 'Gynecological Urology', name_de = 'Gynäkologische Urologie', name_ru = 'Гинекологическая урология',
  description_en = 'Urinary tract diseases in women',
  description_de = 'Harnwegserkrankungen bei Frauen',
  description_ru = 'Заболевания мочевыводящих путей у женщин'
WHERE slug = 'gynecology-urology';

UPDATE specialties SET
  name_en = 'Emergency Medicine', name_de = 'Notfallmedizin', name_ru = 'Скорая помощь',
  description_en = 'Emergency medicine and first aid',
  description_de = 'Notfallmedizin und Erste Hilfe',
  description_ru = 'Экстренная медицина и первая помощь'
WHERE slug = 'emergency';

UPDATE specialties SET
  name_en = 'Sports Medicine', name_de = 'Sportmedizin', name_ru = 'Спортивная медицина',
  description_en = 'Sports injuries and rehabilitation',
  description_de = 'Sportverletzungen und Rehabilitation',
  description_ru = 'Спортивные травмы и реабилитация'
WHERE slug = 'sports-medicine';

UPDATE specialties SET
  name_en = 'Nuclear Medicine', name_de = 'Nuklearmedizin', name_ru = 'Ядерная медицина',
  description_en = 'Medical imaging and nuclear medicine',
  description_de = 'Medizinische Bildgebung und Nuklearmedizin',
  description_ru = 'Медицинская визуализация и ядерная медицина'
WHERE slug = 'nuclear-medicine';
