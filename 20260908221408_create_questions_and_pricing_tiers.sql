/*
# Create pricing tiers, questions, and answers tables

## Purpose
Supports the medical consultation Q&A platform: users can post free or paid medical
questions, pricing tiers are dynamically configurable per country/currency by the
admin, and answers are collected from specialists.

## New Tables

### pricing_tiers
Configurable pricing tiers that control the cost of a paid question based on:
- Duration the question stays active (days)
- Number of specialists notified
- Min/max answers allowed
- Response speed (standard / fast / instant)
Each tier has a base USD price; the frontend converts to the user's currency.
- id (uuid, PK)
- name (text) — display name
- name_ar (text) — Arabic display name
- description (text) — short description
- duration_days (int) — how long the question stays active
- specialists_notified (int) — how many specialists get notified
- min_answers (int) — minimum answers guaranteed
- max_answers (int) — maximum answers accepted
- response_speed (text) — 'standard' | 'fast' | 'instant'
- price_usd (numeric) — base price in USD
- is_active (boolean) — whether the tier is available
- is_featured (boolean) — highlighted in the UI
- sort_order (int) — display order
- created_at (timestamptz)

### questions
Medical questions posted by users (anonymous or registered).
- id (uuid, PK)
- specialty_key (text) — references a key from SPECIALTIES config
- specialty_category (text) — 'children' | 'mentalHealth' | 'otherSpecialties'
- title (text) — short question title
- body (text) — detailed question body
- question_type (text) — 'free' | 'paid'
- tier_id (uuid, FK to pricing_tiers, nullable for free questions)
- price_usd (numeric, default 0) — price paid (0 for free)
- status (text) — 'new' | 'under_review' | 'active' | 'closed' | 'answered'
- votes (int, default 0)
- views (int, default 0)
- answer_count (int, default 0)
- max_answers (int) — from tier or default for free
- expires_at (timestamptz, nullable) — when the question stops accepting answers
- author_name (text) — display name (anonymous users can set this)
- country_code (text) — country of the asker
- created_at (timestamptz)

### question_answers
Answers from specialists to questions.
- id (uuid, PK)
- question_id (uuid, FK to questions)
- author_name (text) — specialist display name
- author_title (text) — specialist title/credential
- body (text) — answer text
- is_accepted (boolean, default false)
- helpful_votes (int, default 0)
- created_at (timestamptz)

## Security
- All tables use RLS with TO anon, authenticated (no-auth app — all visitors are anonymous).
- Full CRUD allowed for all users since this is a public Q&A platform.
*/

-- Pricing tiers table
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text NOT NULL,
  description text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  duration_days int NOT NULL DEFAULT 7,
  specialists_notified int NOT NULL DEFAULT 10,
  min_answers int NOT NULL DEFAULT 1,
  max_answers int NOT NULL DEFAULT 5,
  response_speed text NOT NULL DEFAULT 'standard' CHECK (response_speed IN ('standard', 'fast', 'instant')),
  price_usd numeric(10,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_pricing_tiers" ON pricing_tiers;
CREATE POLICY "anon_select_pricing_tiers" ON pricing_tiers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_pricing_tiers" ON pricing_tiers;
CREATE POLICY "anon_insert_pricing_tiers" ON pricing_tiers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_pricing_tiers" ON pricing_tiers;
CREATE POLICY "anon_update_pricing_tiers" ON pricing_tiers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_pricing_tiers" ON pricing_tiers;
CREATE POLICY "anon_delete_pricing_tiers" ON pricing_tiers FOR DELETE
  TO anon, authenticated USING (true);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty_key text NOT NULL,
  specialty_category text NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  question_type text NOT NULL DEFAULT 'free' CHECK (question_type IN ('free', 'paid')),
  tier_id uuid REFERENCES pricing_tiers(id) ON DELETE SET NULL,
  price_usd numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'active', 'closed', 'answered')),
  votes int NOT NULL DEFAULT 0,
  views int NOT NULL DEFAULT 0,
  answer_count int NOT NULL DEFAULT 0,
  max_answers int NOT NULL DEFAULT 3,
  expires_at timestamptz,
  author_name text NOT NULL DEFAULT 'مستخدم مجهول',
  country_code text NOT NULL DEFAULT 'SA',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_questions" ON questions;
CREATE POLICY "anon_select_questions" ON questions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_questions" ON questions;
CREATE POLICY "anon_insert_questions" ON questions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_questions" ON questions;
CREATE POLICY "anon_update_questions" ON questions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_questions" ON questions;
CREATE POLICY "anon_delete_questions" ON questions FOR DELETE
  TO anon, authenticated USING (true);

-- Question answers table
CREATE TABLE IF NOT EXISTS question_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT 'طبيب',
  author_title text NOT NULL DEFAULT '',
  body text NOT NULL,
  is_accepted boolean NOT NULL DEFAULT false,
  helpful_votes int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_answers" ON question_answers;
CREATE POLICY "anon_select_answers" ON question_answers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_answers" ON question_answers;
CREATE POLICY "anon_insert_answers" ON question_answers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_answers" ON question_answers;
CREATE POLICY "anon_update_answers" ON question_answers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_answers" ON question_answers;
CREATE POLICY "anon_delete_answers" ON question_answers FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_specialty ON questions(specialty_key);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_active ON pricing_tiers(is_active, sort_order);

-- Seed default pricing tiers
INSERT INTO pricing_tiers (name, name_ar, description, description_ar, duration_days, specialists_notified, min_answers, max_answers, response_speed, price_usd, is_active, is_featured, sort_order)
VALUES
  ('Basic', 'الأساسية', 'Standard response within 48 hours', 'رد قياسي خلال 48 ساعة', 7, 10, 1, 3, 'standard', 9.00, true, false, 1),
  ('Plus', 'المعززة', 'Faster responses from more specialists', 'ردود أسرع من عدد أكبر من الأخصائيين', 14, 25, 2, 5, 'fast', 19.00, true, true, 2),
  ('Premium', 'المميزة', 'Instant response, maximum specialists, extended duration', 'رد فوري، أقصى عدد من الأخصائيين، مدة ممتدة', 30, 50, 3, 10, 'instant', 39.00, true, false, 3),
  ('Ultimate', 'النهائية', 'Top priority, all specialists, longest duration', 'أولوية قصوى، جميع الأخصائيين، أطول مدة', 60, 100, 5, 20, 'instant', 69.00, true, false, 4)
ON CONFLICT DO NOTHING;

-- Seed sample questions for demonstration
INSERT INTO questions (specialty_key, specialty_category, title, body, question_type, price_usd, status, votes, views, answer_count, max_answers, author_name, country_code, created_at, expires_at)
VALUES
  ('pediatricsNeonatal', 'children', 'ابني يبكي كثيراً في الليل ولا ينام، ما السبب؟', 'طفلي عمره 3 أشهر ويبكي باستمرار في الليل منذ أسبوع، جربت كل شيء لكنه لا يهدأ. هل هذا طبيعي أم أحتاج لزيارة طبيب؟', 'paid', 19.00, 'active', 12, 245, 2, 5, 'أم محمد', 'SA', now() - interval '2 days', now() + interval '12 days'),
  ('anxietyPhobiaOcd', 'mentalHealth', 'أعاني من وسواس قهري مزعج، كيف أتعامل معه؟', 'منذ عدة أشهر أعاني من أفكار متكررة لا أستطيع التوقف عنها، وتجبرني على تكرار بعض الأفعال. هذا يؤثر على حياتي اليومية والعمل.', 'paid', 39.00, 'active', 34, 580, 3, 10, 'أحمد', 'EG', now() - interval '1 day', now() + interval '29 days'),
  ('cardiology', 'otherSpecialties', 'هل ارتفاع ضربات القلب عند الراحة خطر؟', 'لاحظت أن ضربات قلبي تتسارع حتى وأنا جالس بدون مجهود، أحياناً تصل إلى 110 ضربة في الدقيقة. عمري 35 سنة ولا أعاني من أمراض مزمنة.', 'free', 0, 'new', 5, 89, 0, 3, 'سارة', 'AE', now() - interval '3 hours', now() + interval '7 days'),
  ('dermatology', 'otherSpecialties', 'طفح جلدي أحمر على الوجه، ما العلاج؟', 'ظهر لي طفح جلدي أحمر على الخدين منذ يومين مع حكة خفيفة. لم أستخدم أي منتج جديد. هل يمكن أن يكون حساسية؟', 'free', 0, 'under_review', 2, 45, 0, 3, 'خالد', 'SA', now() - interval '5 hours', now() + interval '7 days'),
  ('sleepDisorders', 'mentalHealth', 'الأرق الشديد يمنعني من النوم أكثر من ساعتين', 'منذ شهر لا أستطيع النوم أكثر من ساعتين في الليلة، أصبحت عصبياً وغير قادر على التركيز في العمل. جربت الأعشاب والأدوية بدون جدوى.', 'paid', 19.00, 'answered', 28, 410, 4, 5, 'فاطمة', 'JO', now() - interval '10 days', now() + interval '4 days')
ON CONFLICT DO NOTHING;

-- Seed sample answers
INSERT INTO question_answers (question_id, author_name, author_title, body, is_accepted, helpful_votes)
SELECT id, 'د. سارة الأحمدي', 'استشارية طب الأطفال', 'بكاء الرضع في هذا العمر غالباً ما يكون طبيعياً ويسمى بالمغص الرضيعي. أنصحك ب: 1) التأكد من إرضاعه بشكل كامل 2) تدليك بطنه بلطف 3) استخدام تقنيات التهدئة. إذا استمر البكاء أكثر من 3 ساعات متواصلة يومياً، يفضل مراجعة الطبيب.', true, 15
FROM questions WHERE title LIKE '%ابني يبكي%' LIMIT 1;

INSERT INTO question_answers (question_id, author_name, author_title, body, is_accepted, helpful_votes)
SELECT id, 'د. أحمد منصور', 'أخصائي نفسي', 'أفكارك المتكررة قد تكون عرضاً للوسواس القهري. العلاج المعرفي السلوكي (CBT) هو الأكثر فعالية. أنصحك بمراجعة معالج نفسي متخصص في الـ CBT. لا تقلق، هذه الحالة قابلة للعلاج تماماً.', false, 8
FROM questions WHERE title LIKE '%وسواس%' LIMIT 1;

INSERT INTO question_answers (question_id, author_name, author_title, body, is_accepted, helpful_votes)
SELECT id, 'د. ليلى حسن', 'طبيبة نفسية', 'إضافة لما ذكره د. أحمد، هناك تقنية تسمى ERP (التعرض ومنع الاستجابة) وهي فعالة جداً. قد يستفيد المريض أيضاً من دواء يساعد على تقليل الأفكار الوسواسية. الاستشارة الطبية المباشرة ضرورية.', true, 22
FROM questions WHERE title LIKE '%وسواس%' LIMIT 1;

INSERT INTO question_answers (question_id, author_name, author_title, body, is_accepted, helpful_votes)
SELECT id, 'د. عمر الخالد', 'استشاري طب نفسي', 'الأرق المزمن يحتاج تقييماً شاملاً. أولاً: حافظ على روتين نوم ثابت. ثانياً: تجنب الكافيين بعد الظهر. ثالثاً: إذا استمر أكثر من شهر، قد تحتاج جلسات علاج معرفي سلوكي للأرق (CBT-I) وهي فعالة جداً.', true, 18
FROM questions WHERE title LIKE '%الأرق%' LIMIT 1;
