/*
# Add comprehensive psychological and medical specialties

## Description
This migration adds all psychological health specialties and remaining medical specialties
to the specialties table, with full 4-language translations (Arabic, English, German, Russian).

## New specialties added (psychological):
- Neuropsychological assessment (التقويم النفسي العصبي)
- Applied Behavior Analysis (التحليل التطبيقي السلوكي)
- Psychoanalysis (التحليل النفسي)
- Denver model for children (أسلوب دنفر للأطفال)
- Sensory-motor therapy (الحسي الحركي)
- Cognitive behavioral therapy
- Clinical psychology
- Educational psychology
- Family therapy
- Art therapy
- Music therapy
- Play therapy
- Psychodrama
- Hypnotherapy
- Marriage counseling
- Addiction treatment
- Eating disorders
- Sleep disorders
- Stress management
- Grief counseling
- Social psychology
- Forensic psychology
- Occupational psychology
- Developmental psychology
- Child psychology
- Adolescent psychology
- Geriatric psychology
- Group therapy
- Mindfulness-based therapy
- Dialectical behavior therapy
- EMDR therapy
- Acceptance and commitment therapy

## New specialties added (medical):
- Internal medicine, Surgery, Plastic surgery, Radiology, Pathology
- Nephrology, Hematology, Infectious diseases, Allergy & Immunology
- Pulmonology, Hepatology, Genetics, Geriatrics, Physical therapy
- Nutrition & Dietetics, Speech therapy, Audiology, Prosthodontics
- Oral surgery, Orthodontics, Cosmetic dentistry, IVF & Fertility
- Preventive medicine, Public health, Occupational medicine
- Aerospace medicine, Undersea & hyperbaric medicine, Medical genetics
- Hospice & palliative care, Pain medicine, Sleep medicine
- Addiction medicine, Adolescent medicine, Sports psychiatry
- Forensic psychiatry, Geriatric psychiatry, Child & adolescent psychiatry

## Security
- No new tables created; data-only insert into existing specialties table.
- RLS already enabled on specialties table.
*/

INSERT INTO specialties (slug, name, icon, description, name_en, name_de, name_ru, description_en, description_de, description_ru)
VALUES
-- Psychological specialties
('neuropsychological-assessment', 'التقويم النفسي العصبي', 'Brain', 'تقييم الوظائف المعرفية والنفسية العصبية', 'Neuropsychological Assessment', 'Neuropsychologische Begutachtung', 'Нейропсихологическая оценка', 'Assessment of cognitive and neuropsychological functions', 'Bewertung kognitiver und neuropsychologischer Funktionen', 'Оценка когнитивных и нейропсихологических функций'),
('applied-behavior-analysis', 'التحليل التطبيقي السلوكي', 'Activity', 'تحليل وتعديل السلوك تطبيقياً', 'Applied Behavior Analysis', 'Angewandte Verhaltensanalyse', 'Прикладной анализ поведения', 'Applied behavior modification and analysis', 'Angewandte Verhaltensmodifikation und Analyse', 'Прикладной анализ и модификация поведения'),
('psychoanalysis', 'التحليل النفسي', 'Brain', 'العلاج بالتحليل النفسي العميق', 'Psychoanalysis', 'Psychoanalyse', 'Психоанализ', 'Deep psychoanalytic therapy', 'Tiefenpsychoanalytische Therapie', 'Глубокий психоаналитический анализ'),
('denver-model-children', 'أسلوب دنفر للأطفال', 'Baby', 'نموذج دنفر لتدخل الأطفال المبكر', 'Denver Model for Children', 'Denver-Modell für Kinder', 'Денверская модель для детей', 'Early intervention model for children', 'Frühinterventionsmodell für Kinder', 'Модель раннего вмешательства для детей'),
('sensory-motor-therapy', 'الحسي الحركي', 'Hand', 'علاج التكامل الحسي والحركي', 'Sensory-Motor Therapy', 'Sensorisch-Motorische Therapie', 'Сенсорно-моторная терапия', 'Sensory integration and motor therapy', 'Sensorische Integration und Motoriktherapie', 'Сенсорная интеграция и моторная терапия'),
('cognitive-behavioral-therapy', 'العلاج المعرفي السلوكي', 'Brain', 'علاج يعتمد على تغيير الأفكار والسلوكيات', 'Cognitive Behavioral Therapy', 'Kognitive Verhaltenstherapie', 'Когнитивно-поведенческая терапия', 'Therapy based on changing thoughts and behaviors', 'Therapie zur Veränderung von Gedanken und Verhalten', 'Терапия, основанная на изменении мыслей и поведения'),
('clinical-psychology', 'علم النفس الإكلينيكي', 'Stethoscope', 'تشخيص وعلاج الاضطرابات النفسية', 'Clinical Psychology', 'Klinische Psychologie', 'Клиническая психология', 'Diagnosis and treatment of psychological disorders', 'Diagnose und Behandlung psychischer Störungen', 'Диагностика и лечение психических расстройств'),
('educational-psychology', 'علم النفس التربوي', 'GraduationCap', 'دعم التعلم والصعوبات التعليمية', 'Educational Psychology', 'Pädagogische Psychologie', 'Образовательная психология', 'Support for learning and educational difficulties', 'Unterstützung bei Lern- und Bildungsproblemen', 'Поддержка обучения и образовательных трудностей'),
('family-therapy', 'العلاج الأسري', 'Users', 'علاج المشاكل الأسرية والعلاقات', 'Family Therapy', 'Familientherapie', 'Семейная терапия', 'Treatment of family and relationship issues', 'Behandlung von Familien- und Beziehungsproblemen', 'Лечение семейных и отношенческих проблем'),
('art-therapy', 'العلاج بالفن', 'Palette', 'استخدام الفن للتعبير والعلاج النفسي', 'Art Therapy', 'Kunsttherapie', 'Арт-терапия', 'Using art for psychological expression and healing', 'Kunst als psychologischer Ausdruck und Heilung', 'Использование искусства для психологического выражения'),
('music-therapy', 'العلاج بالموسيقى', 'Music', 'استخدام الموسيقى للعلاج النفسي', 'Music Therapy', 'Musiktherapie', 'Музыкотерапия', 'Using music for psychological healing', 'Musik zur psychologischen Heilung', 'Использование музыки для психологического лечения'),
('play-therapy', 'العلاج باللعب', 'Gamepad2', 'علاج الأطفال من خلال اللعب', 'Play Therapy', 'Spieltherapie', 'Игровая терапия', 'Treating children through play', 'Behandlung von Kindern durch Spiel', 'Лечение детей через игру'),
('psychodrama', 'السايكودراما', 'Drama', 'علاج جماعي من خلال التمثيل', 'Psychodrama', 'Psychodrama', 'Психодрама', 'Group therapy through role-playing', 'Gruppentherapie durch Rollenspiel', 'Групповая терапия через ролевую игру'),
('hypnotherapy', 'العلاج بالتنويم المغناطيسي', 'Moon', 'استخدام التنويم المغناطيسي في العلاج', 'Hypnotherapy', 'Hypnotherapie', 'Гипнотерапия', 'Using hypnosis in therapy', 'Hypnose in der Therapie', 'Использование гипноза в терапии'),
('marriage-counseling', 'الاستشارة الزوجية', 'Heart', 'علاج المشاكل الزوجية', 'Marriage Counseling', 'Eheberatung', 'Семейное консультирование', 'Treatment of marital problems', 'Behandlung von Eheproblemen', 'Лечение супружеских проблем'),
('addiction-treatment', 'علاج الإدمان', 'Pill', 'علاج إدمان المواد والسلوكيات', 'Addiction Treatment', 'Suchtbehandlung', 'Лечение зависимостей', 'Treatment of substance and behavioral addictions', 'Behandlung von Substanz- und Verhaltenssüchten', 'Лечение зависимостей от веществ и поведения'),
('eating-disorders', 'اضطرابات الأكل', 'Utensils', 'علاج اضطرابات الأكل', 'Eating Disorders', 'Essstörungen', 'Расстройства пищевого поведения', 'Treatment of eating disorders', 'Behandlung von Essstörungen', 'Лечение расстройств пищевого поведения'),
('sleep-disorders', 'اضطرابات النوم', 'Moon', 'علاج مشاكل النوم والأرق', 'Sleep Disorders', 'Schlafstörungen', 'Расстройства сна', 'Treatment of sleep problems and insomnia', 'Behandlung von Schlafproblemen und Schlaflosigkeit', 'Лечение проблем со сном и бессонницы'),
('stress-management', 'إدارة التوتر', 'Wind', 'تقنيات إدارة التوتر والضغط النفسي', 'Stress Management', 'Stressmanagement', 'Управление стрессом', 'Techniques for managing stress', 'Techniken zum Stressmanagement', 'Методы управления стрессом'),
('grief-counseling', 'استشارات الحزن', 'Heart', 'دعم التعامل مع الفقد والحزن', 'Grief Counseling', 'Trauerberatung', 'Консультирование по вопросам горя', 'Support for dealing with loss and grief', 'Unterstützung bei Verlust und Trauer', 'Поддержка при потере и горе'),
('social-psychology', 'علم النفس الاجتماعي', 'Users', 'دراسة السلوك الاجتماعي', 'Social Psychology', 'Sozialpsychologie', 'Социальная психология', 'Study of social behavior', 'Studie des Sozialverhaltens', 'Изучение социального поведения'),
('forensic-psychology', 'علم النفس الشرعي', 'Scale', 'تطبيق علم النفس في القانون', 'Forensic Psychology', 'Forensische Psychologie', 'Судебная психология', 'Applying psychology in law', 'Anwendung der Psychologie im Recht', 'Применение психологии в праве'),
('occupational-psychology', 'علم نفس العمل', 'Briefcase', 'دعم الصحة النفسية في العمل', 'Occupational Psychology', 'Arbeitspsychologie', 'Профессиональная психология', 'Mental health support at work', 'Psychologische Unterstützung bei der Arbeit', 'Психологическая поддержка на работе'),
('developmental-psychology', 'علم النفس النمائي', 'TrendingUp', 'دراسة نمو الإنسان عبر مراحل العمر', 'Developmental Psychology', 'Entwicklungspsychologie', 'Психология развития', 'Study of human growth across life stages', 'Studie des menschlichen Wachstums', 'Изучение развития человека на протяжении жизни'),
('child-psychology', 'علم نفس الطفل', 'Baby', 'علاج المشاكل النفسية للأطفال', 'Child Psychology', 'Kinderpsychologie', 'Детская психология', 'Treatment of children''s psychological issues', 'Behandlung psychologischer Probleme bei Kindern', 'Лечение психологических проблем у детей'),
('adolescent-psychology', 'علم نفس المراهقين', 'PersonStanding', 'دعم المراهقين نفسياً', 'Adolescent Psychology', 'Jugendpsychologie', 'Подростковая психология', 'Psychological support for adolescents', 'Psychologische Unterstützung für Jugendliche', 'Психологическая поддержка подростков'),
('geriatric-psychology', 'علم نفس كبار السن', 'Accessibility', 'دعم الصحة النفسية لكبار السن', 'Geriatric Psychology', 'Gerontopsychologie', 'Геронтопсихология', 'Mental health support for the elderly', 'Psychologische Unterstützung für Senioren', 'Психологическая поддержка пожилых людей'),
('group-therapy', 'العلاج الجماعي', 'Users', 'علاج نفسي في مجموعة', 'Group Therapy', 'Gruppentherapie', 'Групповая терапия', 'Psychotherapy in a group setting', 'Psychotherapie in einer Gruppe', 'Психотерапия в группе'),
('mindfulness-therapy', 'العلاج باليقظة الذهنية', 'Flower', 'تقنيات اليقظة والتأمل للعلاج', 'Mindfulness-Based Therapy', 'Achtsamkeitsbasierte Therapie', 'Терапия осознанности', 'Mindfulness and meditation techniques for therapy', 'Achtsamkeits- und Meditationstechniken', 'Техники осознанности и медитации'),
('dialectical-behavior-therapy', 'العلاج السلوكي الجدلي', 'Brain', 'علاج يعتمد على تنظيم المشاعر', 'Dialectical Behavior Therapy', 'Dialektische Verhaltenstherapie', 'Диалектическая поведенческая терапия', 'Therapy based on emotion regulation', 'Therapie zur Emotionsregulation', 'Терапия, основанная на регуляции эмоций'),
('emdr-therapy', 'علاج EMDR', 'Eye', 'علاج الصدمات بإعادة المعالجة', 'EMDR Therapy', 'EMDR-Therapie', 'EMDR-терапия', 'Trauma treatment through reprocessing', 'Traumabehandung durch Aufarbeitung', 'Лечение травм через переработку'),
('acceptance-commitment-therapy', 'علاج القبول والالتزام', 'CheckCircle', 'علاج يعتمد على القبول النفسي', 'Acceptance and Commitment Therapy', 'Akzeptanz- und Commitment-Therapie', 'Терапия принятия и ответственности', 'Therapy based on psychological acceptance', 'Therapie basierend auf Akzeptanz', 'Терапия, основанная на психологическом принятии'),

-- Medical specialties
('internal-medicine', 'الباطنة', 'Stethoscope', 'تشخيص وعلاج أمراض الباطنة', 'Internal Medicine', 'Innere Medizin', 'Внутренняя медицина', 'Diagnosis and treatment of internal diseases', 'Diagnose und Behandlung innerer Erkrankungen', 'Диагностика и лечение внутренних болезней'),
('general-surgery', 'الجراحة العامة', 'Scissors', 'عمليات جراحية متنوعة', 'General Surgery', 'Allgemeinchirurgie', 'Общая хирургия', 'Various surgical operations', 'Verschiedene chirurgische Eingriffe', 'Различные хирургические операции'),
('plastic-surgery', 'جراحة التجميل', 'Sparkles', 'عمليات التجميل وإعادة البناء', 'Plastic Surgery', 'Plastische Chirurgie', 'Пластическая хирургия', 'Cosmetic and reconstructive surgery', 'Kosmetische und rekonstruktive Chirurgie', 'Косметическая и реконструктивная хирургия'),
('radiology', 'الأشعة', 'Scan', 'تشخيص بالأشعة والتصوير الطبي', 'Radiology', 'Radiologie', 'Радиология', 'Diagnostic imaging and radiology', 'Diagnostische Bildgebung und Radiologie', 'Диагностическая визуализация и радиология'),
('pathology', 'علم الأمراض', 'Microscope', 'تحليل الأنسجة والتشخيص المرضي', 'Pathology', 'Pathologie', 'Патология', 'Tissue analysis and pathological diagnosis', 'Gewebeanalyse und pathologische Diagnose', 'Анализ тканей и патологическая диагностика'),
('nephrology', 'الكلى', 'Droplet', 'علاج أمراض الكلى', 'Nephrology', 'Nephrologie', 'Нефрология', 'Treatment of kidney diseases', 'Behandlung von Nierenerkrankungen', 'Лечение заболеваний почек'),
('hematology', 'أمراض الدم', 'Droplet', 'علاج أمراض الدم', 'Hematology', 'Hämatologie', 'Гематология', 'Treatment of blood disorders', 'Behandlung von Bluterkrankungen', 'Лечение заболеваний крови'),
('infectious-diseases', 'الأمراض المعدية', 'Bug', 'علاج الأمراض المعدية', 'Infectious Diseases', 'Infektionskrankheiten', 'Инфекционные болезни', 'Treatment of infectious diseases', 'Behandlung von Infektionskrankheiten', 'Лечение инфекционных заболеваний'),
('allergy-immunology', 'الحساسية والمناعة', 'Shield', 'علاج الحساسية وأمراض المناعة', 'Allergy and Immunology', 'Allergologie und Immunologie', 'Аллергология и иммунология', 'Treatment of allergies and immune diseases', 'Behandlung von Allergien und Immunkrankheiten', 'Лечение аллергий и иммунных заболеваний'),
('pulmonology', 'أمراض الصدر', 'Wind', 'علاج أمراض الجهاز التنفسي', 'Pulmonology', 'Pulmonologie', 'Пульмонология', 'Treatment of respiratory diseases', 'Behandlung von Atemwegserkrankungen', 'Лечение заболеваний дыхательной системы'),
('hepatology', 'الكبد', 'Droplet', 'علاج أمراض الكبد', 'Hepatology', 'Hepatologie', 'Гепатология', 'Treatment of liver diseases', 'Behandlung von Lebererkrankungen', 'Лечение заболеваний печени'),
('genetics', 'الوراثة', 'Dna', 'استشارات الأمراض الوراثية', 'Medical Genetics', 'Medizinische Genetik', 'Медицинская генетика', 'Genetic disease consultations', 'Beratung zu genetischen Erkrankungen', 'Консультации по генетическим заболеваниям'),
('geriatrics', 'طب كبار السن', 'Accessibility', 'رعاية كبار السن', 'Geriatrics', 'Geriatrie', 'Гериатрия', 'Elderly care medicine', 'Medizin für Senioren', 'Медицина для пожилых людей'),
('physical-therapy', 'العلاج الطبيعي', 'Hand', 'إعادة التأهيل والعلاج الطبيعي', 'Physical Therapy', 'Physiotherapie', 'Физиотерапия', 'Rehabilitation and physical therapy', 'Rehabilitation und Physiotherapie', 'Реабилитация и физиотерапия'),
('nutrition-dietetics', 'التغذية', 'Apple', 'استشارات التغذية والحمية', 'Nutrition and Dietetics', 'Ernährung und Diätetik', 'Питание и диетология', 'Nutrition and diet consultations', 'Ernährungs- und Diätberatung', 'Консультации по питанию и диете'),
('speech-therapy', 'علاج النطق', 'MessageCircle', 'علاج مشاكل النطق واللغة', 'Speech Therapy', 'Logopädie', 'Логопедия', 'Treatment of speech and language problems', 'Behandlung von Sprach- und Sprechproblemen', 'Лечение проблем речи и языка'),
('audiology', 'السمعيات', 'Ear', 'علاج مشاكل السمع', 'Audiology', 'Audiologie', 'Аудиология', 'Treatment of hearing problems', 'Behandlung von Hörproblemen', 'Лечение проблем со слухом'),
('prosthodontics', 'تركيب الأسنان', 'Smile', 'تركيبات وغرسات الأسنان', 'Prosthodontics', 'Prothetik', 'Протезирование зубов', 'Dental prosthetics and implants', 'Zahnersatz und Implantate', 'Зубные протезы и имплантаты'),
('oral-surgery', 'جراحة الفم', 'Scissors', 'جراحة الفم والوجه', 'Oral Surgery', 'Oralchirurgie', 'Челюстно-лицевая хирургия', 'Oral and facial surgery', 'Mund- und Gesichtschirurgie', 'Хирургия полости рта и лица'),
('orthodontics', 'تقويم الأسنان', 'Smile', 'تقويم الأسنان', 'Orthodontics', 'Kieferorthopädie', 'Ортодонтия', 'Dental braces and alignment', 'Zahnspangen und Ausrichtung', 'Зубные брекеты и выравнивание'),
('cosmetic-dentistry', 'تجميل الأسنان', 'Sparkles', 'تجميل وبياض الأسنان', 'Cosmetic Dentistry', 'Ästhetische Zahnmedizin', 'Косметическая стоматология', 'Teeth whitening and cosmetic dentistry', 'Zahnaufhellung und ästhetische Zahnmedizin', 'Отбеливание и косметическая стоматология'),
('ivf-fertility', 'أطفال الأنابيب والخصوبة', 'Baby', 'علاج العقم وأطفال الأنابيب', 'IVF and Fertility', 'IVF und Fruchtbarkeit', 'ЭКО и фертильность', 'Infertility and IVF treatment', 'Unfruchtbarkeit und IVF-Behandlung', 'Лечение бесплодия и ЭКО'),
('preventive-medicine', 'الطب الوقائي', 'Shield', 'الوقاية من الأمراض', 'Preventive Medicine', 'Präventivmedizin', 'Профилактическая медицина', 'Disease prevention', 'Krankheitsprävention', 'Профилактика заболеваний'),
('public-health', 'الصحة العامة', 'Globe', 'الصحة العامة والمجتمعية', 'Public Health', 'Öffentliche Gesundheit', 'Общественное здравоохранение', 'Public and community health', 'Öffentliche und kommunale Gesundheit', 'Общественное и коммунальное здравоохранение'),
('occupational-medicine', 'طب العمل', 'Briefcase', 'صحة وسلامة العمال', 'Occupational Medicine', 'Arbeitsmedizin', 'Медицина труда', 'Worker health and safety', 'Arbeitssicherheit und Gesundheit', 'Здоровье и безопасность работников'),
('aerospace-medicine', 'طب الفضاء', 'Plane', 'طب الفضاء والطيران', 'Aerospace Medicine', 'Luft- und Raumfahrtmedizin', 'Аэрокосмическая медицина', 'Aviation and space medicine', 'Luft- und Raumfahrtmedizin', 'Авиационная и космическая медицина'),
('hyperbaric-medicine', 'الطب بالأكسجين عالي الضغط', 'Wind', 'العلاج بالأكسجين عالي الضغط', 'Undersea and Hyperbaric Medicine', 'Uberdruckmedizin', 'Баротерапия', 'Hyperbaric oxygen therapy', 'Hyperbare Sauerstofftherapie', 'Баротерапия кислородом'),
('hospice-palliative-care', 'الرعاية التلطيفية', 'Heart', 'رعاية المرضى في المراحل المتقدمة', 'Hospice and Palliative Care', 'Hospiz- und Palliativversorgung', 'Хосписная и паллиативная помощь', 'Care for advanced-stage patients', 'Versorgung von Patienten in fortgeschrittenen Stadien', 'Уход за пациентами на поздних стадиях'),
('pain-medicine', 'طب الألم', 'Activity', 'علاج الآلام المزمنة', 'Pain Medicine', 'Schmerzmedizin', 'Обезболивающая медицина', 'Treatment of chronic pain', 'Behandlung chronischer Schmerzen', 'Лечение хронической боли'),
('addiction-medicine', 'طب الإدمان', 'Pill', 'علاج الإدمان طبياً', 'Addiction Medicine', 'Suchtmedizin', 'Медицина зависимостей', 'Medical treatment of addiction', 'Medizinische Behandlung von Sucht', 'Медицинское лечение зависимостей'),
('adolescent-medicine', 'طب المراهقين', 'PersonStanding', 'رعاية المراهقين صحياً', 'Adolescent Medicine', 'Jugendmedizin', 'Медицина подростков', 'Healthcare for adolescents', 'Gesundheitsversorgung für Jugendliche', 'Здравоохранение для подростков'),
('child-adolescent-psychiatry', 'طب نفس الأطفال والمراهقين', 'Baby', 'علاج الاضطرابات النفسية للأطفال', 'Child and Adolescent Psychiatry', 'Kinder- und Jugendpsychiatrie', 'Детская и подростковая психиатрия', 'Treatment of children''s psychiatric disorders', 'Behandlung psychiatrischer Störungen bei Kindern', 'Лечение психических расстройств у детей'),
('forensic-psychiatry', 'الطب النفسي الشرعي', 'Scale', 'الطب النفسي في المجال القانوني', 'Forensic Psychiatry', 'Forensische Psychiatrie', 'Судебная психиатрия', 'Psychiatry in the legal field', 'Psychiatrie im rechtlichen Bereich', 'Психиатрия в правовой сфере'),
('geriatric-psychiatry', 'الطب النفسي لكبار السن', 'Accessibility', 'علاج الاضطرابات النفسية لكبار السن', 'Geriatric Psychiatry', 'Gerontopsychiatrie', 'Геронтопсихиатрия', 'Treatment of elderly psychiatric disorders', 'Behandlung psychischer Störungen bei Senioren', 'Лечение психических расстройств у пожилых'),
('sports-psychiatry', 'الطب النفسي الرياضي', 'Trophy', 'الصحة النفسية للرياضيين', 'Sports Psychiatry', 'Sportpsychiatrie', 'Спортивная психиатрия', 'Mental health for athletes', 'Psychische Gesundheit für Sportler', 'Психическое здоровье спортсменов')
ON CONFLICT (slug) DO NOTHING;