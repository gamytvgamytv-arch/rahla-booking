/*
# Major Platform Expansion (fixed)

Adds sub-specialties, Q&A enhancements, medical tests, additional facilities,
pharmacy products, institutions, jobs, referral rewards, country pricing,
AI report reader, favorites, delivery workers, admin chat.

All new tables have RLS enabled with anon,authenticated access.
*/

-- ===================== SUB-SPECIALTIES =====================
DO $$ BEGIN
  ALTER TABLE specialties ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES specialties(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS sub_specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_specialty_id uuid NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_en text,
  name_de text,
  name_ru text,
  slug text NOT NULL,
  description text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sub_specialties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_sub_specialties" ON sub_specialties;
CREATE POLICY "anon_read_sub_specialties" ON sub_specialties FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_sub_specialties" ON sub_specialties;
CREATE POLICY "anon_insert_sub_specialties" ON sub_specialties FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_sub_specialties" ON sub_specialties;
CREATE POLICY "anon_update_sub_specialties" ON sub_specialties FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_sub_specialties" ON sub_specialties;
CREATE POLICY "anon_delete_sub_specialties" ON sub_specialties FOR DELETE
  TO anon, authenticated USING (true);

-- ===================== QUESTIONS ENHANCEMENTS =====================
DO $$ BEGIN
  ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_paid boolean NOT NULL DEFAULT false;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE questions ADD COLUMN IF NOT EXISTS max_chars integer;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE questions ADD COLUMN IF NOT EXISTS open_days integer NOT NULL DEFAULT 7;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE questions ADD COLUMN IF NOT EXISTS max_specialists integer;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE questions ADD COLUMN IF NOT EXISTS price numeric(10,2) NOT NULL DEFAULT 0;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ===================== QUESTION COMMENTS =====================
CREATE TABLE IF NOT EXISTS question_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_type text NOT NULL DEFAULT 'client',
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE question_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_question_comments" ON question_comments;
CREATE POLICY "anon_read_question_comments" ON question_comments FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_question_comments" ON question_comments;
CREATE POLICY "anon_insert_question_comments" ON question_comments FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_question_comments" ON question_comments;
CREATE POLICY "anon_delete_question_comments" ON question_comments FOR DELETE
  TO anon, authenticated USING (true);

-- ===================== ANSWER RATINGS =====================
CREATE TABLE IF NOT EXISTS answer_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id uuid NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  rater_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE answer_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_answer_ratings" ON answer_ratings;
CREATE POLICY "anon_read_answer_ratings" ON answer_ratings FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_answer_ratings" ON answer_ratings;
CREATE POLICY "anon_insert_answer_ratings" ON answer_ratings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ===================== BEST ANSWERS =====================
CREATE TABLE IF NOT EXISTS best_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_id uuid NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  selected_by text NOT NULL,
  rank integer NOT NULL CHECK (rank >= 1 AND rank <= 3),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE best_answers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_best_answers" ON best_answers;
CREATE POLICY "anon_read_best_answers" ON best_answers FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_best_answers" ON best_answers;
CREATE POLICY "anon_insert_best_answers" ON best_answers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ===================== ANSWER PAYMENTS =====================
CREATE TABLE IF NOT EXISTS answer_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id uuid NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  question_price numeric(10,2) NOT NULL DEFAULT 0,
  platform_share numeric(10,2) NOT NULL DEFAULT 0,
  doctor_share numeric(10,2) NOT NULL DEFAULT 0,
  rating integer DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  calculated_at timestamptz DEFAULT now()
);

ALTER TABLE answer_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_answer_payments" ON answer_payments;
CREATE POLICY "anon_read_answer_payments" ON answer_payments FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_answer_payments" ON answer_payments;
CREATE POLICY "anon_insert_answer_payments" ON answer_payments FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_answer_payments" ON answer_payments;
CREATE POLICY "anon_update_answer_payments" ON answer_payments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ===================== MEDICAL TESTS =====================
CREATE TABLE IF NOT EXISTS medical_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_type text NOT NULL,
  title text NOT NULL,
  title_en text,
  description text,
  category text NOT NULL DEFAULT 'general',
  questions jsonb,
  created_by text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medical_tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_medical_tests" ON medical_tests;
CREATE POLICY "anon_crud_medical_tests" ON medical_tests FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_medical_tests" ON medical_tests;
CREATE POLICY "anon_insert_medical_tests" ON medical_tests FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_medical_tests" ON medical_tests;
CREATE POLICY "anon_update_medical_tests" ON medical_tests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_medical_tests" ON medical_tests;
CREATE POLICY "anon_delete_medical_tests" ON medical_tests FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES medical_tests(id) ON DELETE CASCADE,
  user_name text,
  user_email text,
  answers jsonb,
  result jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_test_results" ON test_results;
CREATE POLICY "anon_read_test_results" ON test_results FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_test_results" ON test_results;
CREATE POLICY "anon_insert_test_results" ON test_results FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_test_results" ON test_results;
CREATE POLICY "anon_delete_test_results" ON test_results FOR DELETE
  TO anon, authenticated USING (true);

-- ===================== ADDITIONAL FACILITIES =====================
CREATE TABLE IF NOT EXISTS additional_facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_type text NOT NULL,
  name text NOT NULL,
  description text,
  address text,
  city text,
  phone text,
  email text,
  logo_url text,
  services text,
  schedule jsonb,
  rating numeric(3,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE additional_facilities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_additional_facilities" ON additional_facilities;
CREATE POLICY "anon_crud_additional_facilities" ON additional_facilities FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_additional_facilities" ON additional_facilities;
CREATE POLICY "anon_insert_additional_facilities" ON additional_facilities FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_additional_facilities" ON additional_facilities;
CREATE POLICY "anon_update_additional_facilities" ON additional_facilities FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_additional_facilities" ON additional_facilities;
CREATE POLICY "anon_delete_additional_facilities" ON additional_facilities FOR DELETE
  TO anon, authenticated USING (true);

-- ===================== PHARMACY PRODUCTS =====================
CREATE TABLE IF NOT EXISTS pharmacy_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid REFERENCES additional_facilities(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  image_url text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  delivery_option text NOT NULL DEFAULT 'pickup',
  pickup_address text,
  is_active boolean NOT NULL DEFAULT true,
  stock integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pharmacy_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_pharmacy_products" ON pharmacy_products;
CREATE POLICY "anon_crud_pharmacy_products" ON pharmacy_products FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_pharmacy_products" ON pharmacy_products;
CREATE POLICY "anon_insert_pharmacy_products" ON pharmacy_products FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_pharmacy_products" ON pharmacy_products;
CREATE POLICY "anon_update_pharmacy_products" ON pharmacy_products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_pharmacy_products" ON pharmacy_products;
CREATE POLICY "anon_delete_pharmacy_products" ON pharmacy_products FOR DELETE
  TO anon, authenticated USING (true);

-- ===================== INSTITUTIONS =====================
CREATE TABLE IF NOT EXISTS institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  service_type text,
  address text,
  city text,
  country text,
  phone text,
  email text,
  description text,
  logo_url text,
  documents jsonb,
  schedule jsonb,
  service_info text,
  is_approved boolean NOT NULL DEFAULT false,
  subscription_plan text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_institutions" ON institutions;
CREATE POLICY "anon_crud_institutions" ON institutions FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_institutions" ON institutions;
CREATE POLICY "anon_insert_institutions" ON institutions FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_institutions" ON institutions;
CREATE POLICY "anon_update_institutions" ON institutions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_institutions" ON institutions;
CREATE POLICY "anon_delete_institutions" ON institutions FOR DELETE
  TO anon, authenticated USING (true);

-- ===================== JOBS =====================
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  requirements text,
  salary_range text,
  location text,
  job_type text NOT NULL DEFAULT 'full-time',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_jobs" ON jobs;
CREATE POLICY "anon_crud_jobs" ON jobs FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_jobs" ON jobs;
CREATE POLICY "anon_insert_jobs" ON jobs FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_jobs" ON jobs;
CREATE POLICY "anon_update_jobs" ON jobs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_jobs" ON jobs;
CREATE POLICY "anon_delete_jobs" ON jobs FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  applicant_phone text,
  cover_letter text,
  resume_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_job_applications" ON job_applications;
CREATE POLICY "anon_crud_job_applications" ON job_applications FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_job_applications" ON job_applications;
CREATE POLICY "anon_insert_job_applications" ON job_applications FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_job_applications" ON job_applications;
CREATE POLICY "anon_update_job_applications" ON job_applications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ===================== REFERRAL REWARDS =====================
CREATE TABLE IF NOT EXISTS referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_name text NOT NULL,
  referrer_email text,
  referred_email text,
  referral_code text NOT NULL,
  total_referrals integer NOT NULL DEFAULT 0,
  total_paid_amount numeric(10,2) NOT NULL DEFAULT 0,
  reward_amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_referral_rewards" ON referral_rewards;
CREATE POLICY "anon_crud_referral_rewards" ON referral_rewards FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_referral_rewards" ON referral_rewards;
CREATE POLICY "anon_insert_referral_rewards" ON referral_rewards FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_referral_rewards" ON referral_rewards;
CREATE POLICY "anon_update_referral_rewards" ON referral_rewards FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ===================== COUNTRY PRICING =====================
CREATE TABLE IF NOT EXISTS country_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL,
  country_name text NOT NULL,
  currency_code text NOT NULL,
  currency_symbol text NOT NULL,
  service_type text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE country_pricing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_country_pricing" ON country_pricing;
CREATE POLICY "anon_crud_country_pricing" ON country_pricing FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_country_pricing" ON country_pricing;
CREATE POLICY "anon_insert_country_pricing" ON country_pricing FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_country_pricing" ON country_pricing;
CREATE POLICY "anon_update_country_pricing" ON country_pricing FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_country_pricing" ON country_pricing;
CREATE POLICY "anon_delete_country_pricing" ON country_pricing FOR DELETE
  TO anon, authenticated USING (true);

INSERT INTO country_pricing (country_code, country_name, currency_code, currency_symbol, service_type, price)
VALUES
  ('EG', 'مصر', 'EGP', 'ج.م', 'question_paid', 100),
  ('SA', 'السعودية', 'SAR', 'ر.س', 'question_paid', 25),
  ('AE', 'الإمارات', 'AED', 'د.إ', 'question_paid', 25),
  ('RU', 'Россия', 'RUB', '₽', 'question_paid', 500),
  ('DE', 'Deutschland', 'EUR', '€', 'question_paid', 10),
  ('US', 'United States', 'USD', '$', 'question_paid', 10),
  ('UZ', 'Oʻzbekiston', 'UZS', 'soʻm', 'question_paid', 15000),
  ('UA', 'Україна', 'UAH', '₴', 'question_paid', 150),
  ('AM', 'Հայաստան', 'AMD', '֏', 'question_paid', 2000),
  ('AZ', 'Azərbaycan', 'AZN', '₼', 'question_paid', 15),
  ('TJ', 'Тоҷикистон', 'TJS', 'SM', 'question_paid', 50),
  ('GE', 'საქართველო', 'GEL', '₾', 'question_paid', 15)
ON CONFLICT DO NOTHING;

-- ===================== AI REPORT ANALYSES =====================
CREATE TABLE IF NOT EXISTS ai_report_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text,
  user_email text,
  report_type text NOT NULL,
  file_url text,
  analysis_result text,
  recommendations text,
  is_paid boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_report_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_ai_report_analyses" ON ai_report_analyses;
CREATE POLICY "anon_crud_ai_report_analyses" ON ai_report_analyses FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_ai_report_analyses" ON ai_report_analyses;
CREATE POLICY "anon_insert_ai_report_analyses" ON ai_report_analyses FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_ai_report_analyses" ON ai_report_analyses;
CREATE POLICY "anon_update_ai_report_analyses" ON ai_report_analyses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ===================== FAVORITES =====================
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  item_type text NOT NULL,
  item_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_favorites" ON favorites;
CREATE POLICY "anon_crud_favorites" ON favorites FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_favorites" ON favorites;
CREATE POLICY "anon_insert_favorites" ON favorites FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_favorites" ON favorites;
CREATE POLICY "anon_delete_favorites" ON favorites FOR DELETE
  TO anon, authenticated USING (true);

-- ===================== DELIVERY WORKERS =====================
CREATE TABLE IF NOT EXISTS delivery_workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  pharmacy_id uuid REFERENCES additional_facilities(id) ON DELETE CASCADE,
  vehicle_type text,
  zone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE delivery_workers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_delivery_workers" ON delivery_workers;
CREATE POLICY "anon_crud_delivery_workers" ON delivery_workers FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_delivery_workers" ON delivery_workers;
CREATE POLICY "anon_insert_delivery_workers" ON delivery_workers FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_delivery_workers" ON delivery_workers;
CREATE POLICY "anon_update_delivery_workers" ON delivery_workers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ===================== ADMIN CHAT =====================
CREATE TABLE IF NOT EXISTS admin_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name text NOT NULL,
  sender_role text NOT NULL DEFAULT 'owner',
  recipient_name text,
  body text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_admin_chat_messages" ON admin_chat_messages;
CREATE POLICY "anon_crud_admin_chat_messages" ON admin_chat_messages FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_admin_chat_messages" ON admin_chat_messages;
CREATE POLICY "anon_insert_admin_chat_messages" ON admin_chat_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ===================== DOCTORS SUB-SPECIALTY =====================
DO $$ BEGIN
  ALTER TABLE doctors ADD COLUMN IF NOT EXISTS sub_specialty_id uuid REFERENCES sub_specialties(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ===================== INSERT DEFAULT MEDICAL TESTS =====================
INSERT INTO medical_tests (test_type, title, description, category, questions)
VALUES
  ('bmi', 'حساب كتلة الجسم', 'احسب مؤشر كتلة جسمك', 'general', '{"fields": ["weight", "height"]}'),
  ('calories', 'حساب السعرات الحرارية', 'احسب احتياجك اليومي من السعرات', 'general', '{"fields": ["age", "gender", "weight", "height", "activity"]}'),
  ('ideal_weight', 'حساب الوزن المثالي', 'اعرف وزنك المثالي', 'general', '{"fields": ["height", "gender"]}'),
  ('pregnancy_due', 'حساب الموعد التقريبي للولادة', 'احسب تاريخ الولادة المتوقع', 'women', '{"fields": ["last_period_date"]}'),
  ('fertility', 'حساب الوقت المناسب للحمل', 'احسب فترة الإباضة', 'women', '{"fields": ["last_period_date", "cycle_length"]}'),
  ('prediabetes', 'اختبار خطر الإصابة بمرحلة ما قبل السكري', 'قيّم خطر الإصابة', 'chronic', '{"questions": ["age", "family_history", "weight", "activity"]}'),
  ('asthma_control', 'اختبار التحكم بالربو', 'قيّم تحكمك بالربو', 'chronic', '{"questions": ["symptoms_day", "symptoms_night", "activity_limitation", "rescue_inhaler"]}'),
  ('vision', 'اختبار النظر', 'اختبر قوة بصرك', 'general', '{"questions": ["read_distance", "blurry_vision", "eye_strain"]}'),
  ('depression', 'اختبار الصحة النفسية', 'قيّم حالتك النفسية', 'mental', '{"questions": ["mood", "interest", "sleep", "energy", "appetite", "concentration", "self_worth", "movement"]}'),
  ('anxiety', 'اختبار القلق', 'قيّم مستوى القلق', 'mental', '{"questions": ["worry", "tension", "restless", "panic", "fear"]}')
ON CONFLICT DO NOTHING;
