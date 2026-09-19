/*
# Add Medical Tests, Facilities, Jobs, Referral, AI Reader, and Favorites Schema

1. New Tables
- `medical_tests` — Medical and psychological tests with categories (general, women, chronic, mental)
- `test_results` — Saved test results from users
- `additional_facilities` — Additional medical facilities (rehab, addiction centers, nursing homes, pharmacies)
- `pharmacy_products` — Products available at pharmacies with delivery options
- `institutions` — Registered medical institutions
- `jobs` — Job vacancies at medical institutions
- `job_applications` — Applications submitted for jobs
- `referral_rewards` — Referral tracking and reward system
- `country_pricing` — Country-specific pricing for services
- `ai_report_analyses` — AI analysis of lab reports and radiology images
- `favorites` — User favorites (doctors, articles, videos, products, tests, courses)
- `delivery_workers` — Pharmacy delivery workers
- `admin_chat_messages` — Admin chat messages

2. Security
- RLS enabled on all new tables.
- All tables allow anon + authenticated CRUD (no-auth app, intentionally public data).
*/

-- Medical Tests
CREATE TABLE IF NOT EXISTS medical_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_type text NOT NULL,
  title text NOT NULL,
  title_en text,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  questions jsonb,
  created_by text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE medical_tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_medical_tests" ON medical_tests;
CREATE POLICY "anon_select_medical_tests" ON medical_tests FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_medical_tests" ON medical_tests;
CREATE POLICY "anon_insert_medical_tests" ON medical_tests FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_medical_tests" ON medical_tests;
CREATE POLICY "anon_update_medical_tests" ON medical_tests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_medical_tests" ON medical_tests;
CREATE POLICY "anon_delete_medical_tests" ON medical_tests FOR DELETE TO anon, authenticated USING (true);

-- Test Results
CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES medical_tests(id) ON DELETE CASCADE,
  user_name text,
  user_email text,
  answers jsonb,
  result jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_test_results" ON test_results;
CREATE POLICY "anon_select_test_results" ON test_results FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_test_results" ON test_results;
CREATE POLICY "anon_insert_test_results" ON test_results FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_test_results" ON test_results;
CREATE POLICY "anon_update_test_results" ON test_results FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_test_results" ON test_results;
CREATE POLICY "anon_delete_test_results" ON test_results FOR DELETE TO anon, authenticated USING (true);

-- Additional Facilities
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
  rating numeric DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE additional_facilities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_additional_facilities" ON additional_facilities;
CREATE POLICY "anon_select_additional_facilities" ON additional_facilities FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_additional_facilities" ON additional_facilities;
CREATE POLICY "anon_insert_additional_facilities" ON additional_facilities FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_additional_facilities" ON additional_facilities;
CREATE POLICY "anon_update_additional_facilities" ON additional_facilities FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_additional_facilities" ON additional_facilities;
CREATE POLICY "anon_delete_additional_facilities" ON additional_facilities FOR DELETE TO anon, authenticated USING (true);

-- Pharmacy Products
CREATE TABLE IF NOT EXISTS pharmacy_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid REFERENCES additional_facilities(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  image_url text,
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  delivery_option text NOT NULL DEFAULT 'delivery',
  pickup_address text,
  is_active boolean NOT NULL DEFAULT true,
  stock integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE pharmacy_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_pharmacy_products" ON pharmacy_products;
CREATE POLICY "anon_select_pharmacy_products" ON pharmacy_products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_pharmacy_products" ON pharmacy_products;
CREATE POLICY "anon_insert_pharmacy_products" ON pharmacy_products FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_pharmacy_products" ON pharmacy_products;
CREATE POLICY "anon_update_pharmacy_products" ON pharmacy_products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_pharmacy_products" ON pharmacy_products;
CREATE POLICY "anon_delete_pharmacy_products" ON pharmacy_products FOR DELETE TO anon, authenticated USING (true);

-- Institutions
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
DROP POLICY IF EXISTS "anon_select_institutions" ON institutions;
CREATE POLICY "anon_select_institutions" ON institutions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_institutions" ON institutions;
CREATE POLICY "anon_insert_institutions" ON institutions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_institutions" ON institutions;
CREATE POLICY "anon_update_institutions" ON institutions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_institutions" ON institutions;
CREATE POLICY "anon_delete_institutions" ON institutions FOR DELETE TO anon, authenticated USING (true);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES institutions(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  requirements text,
  salary_range text,
  location text,
  job_type text NOT NULL DEFAULT 'full_time',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_jobs" ON jobs;
CREATE POLICY "anon_select_jobs" ON jobs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_jobs" ON jobs;
CREATE POLICY "anon_insert_jobs" ON jobs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_jobs" ON jobs;
CREATE POLICY "anon_update_jobs" ON jobs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_jobs" ON jobs;
CREATE POLICY "anon_delete_jobs" ON jobs FOR DELETE TO anon, authenticated USING (true);

-- Job Applications
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  applicant_phone text,
  cover_letter text,
  resume_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_job_applications" ON job_applications;
CREATE POLICY "anon_select_job_applications" ON job_applications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_job_applications" ON job_applications;
CREATE POLICY "anon_insert_job_applications" ON job_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_job_applications" ON job_applications;
CREATE POLICY "anon_update_job_applications" ON job_applications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_job_applications" ON job_applications;
CREATE POLICY "anon_delete_job_applications" ON job_applications FOR DELETE TO anon, authenticated USING (true);

-- Referral Rewards
CREATE TABLE IF NOT EXISTS referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_name text NOT NULL,
  referrer_email text,
  referred_email text,
  referral_code text NOT NULL,
  total_referrals integer NOT NULL DEFAULT 0,
  total_paid_amount numeric NOT NULL DEFAULT 0,
  reward_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_referral_rewards" ON referral_rewards;
CREATE POLICY "anon_select_referral_rewards" ON referral_rewards FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_referral_rewards" ON referral_rewards;
CREATE POLICY "anon_insert_referral_rewards" ON referral_rewards FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_referral_rewards" ON referral_rewards;
CREATE POLICY "anon_update_referral_rewards" ON referral_rewards FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_referral_rewards" ON referral_rewards;
CREATE POLICY "anon_delete_referral_rewards" ON referral_rewards FOR DELETE TO anon, authenticated USING (true);

-- Country Pricing
CREATE TABLE IF NOT EXISTS country_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL,
  country_name text NOT NULL,
  currency_code text NOT NULL DEFAULT 'USD',
  currency_symbol text NOT NULL DEFAULT '$',
  service_type text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE country_pricing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_country_pricing" ON country_pricing;
CREATE POLICY "anon_select_country_pricing" ON country_pricing FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_country_pricing" ON country_pricing;
CREATE POLICY "anon_insert_country_pricing" ON country_pricing FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_country_pricing" ON country_pricing;
CREATE POLICY "anon_update_country_pricing" ON country_pricing FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_country_pricing" ON country_pricing;
CREATE POLICY "anon_delete_country_pricing" ON country_pricing FOR DELETE TO anon, authenticated USING (true);

-- AI Report Analyses
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
DROP POLICY IF EXISTS "anon_select_ai_report_analyses" ON ai_report_analyses;
CREATE POLICY "anon_select_ai_report_analyses" ON ai_report_analyses FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_ai_report_analyses" ON ai_report_analyses;
CREATE POLICY "anon_insert_ai_report_analyses" ON ai_report_analyses FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_ai_report_analyses" ON ai_report_analyses;
CREATE POLICY "anon_update_ai_report_analyses" ON ai_report_analyses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_ai_report_analyses" ON ai_report_analyses;
CREATE POLICY "anon_delete_ai_report_analyses" ON ai_report_analyses FOR DELETE TO anon, authenticated USING (true);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  item_type text NOT NULL,
  item_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_favorites" ON favorites;
CREATE POLICY "anon_select_favorites" ON favorites FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_favorites" ON favorites;
CREATE POLICY "anon_insert_favorites" ON favorites FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_favorites" ON favorites;
CREATE POLICY "anon_update_favorites" ON favorites FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_favorites" ON favorites;
CREATE POLICY "anon_delete_favorites" ON favorites FOR DELETE TO anon, authenticated USING (true);

-- Delivery Workers
CREATE TABLE IF NOT EXISTS delivery_workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  pharmacy_id uuid REFERENCES additional_facilities(id) ON DELETE SET NULL,
  vehicle_type text,
  zone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE delivery_workers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_delivery_workers" ON delivery_workers;
CREATE POLICY "anon_select_delivery_workers" ON delivery_workers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_delivery_workers" ON delivery_workers;
CREATE POLICY "anon_insert_delivery_workers" ON delivery_workers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_delivery_workers" ON delivery_workers;
CREATE POLICY "anon_update_delivery_workers" ON delivery_workers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_delivery_workers" ON delivery_workers;
CREATE POLICY "anon_delete_delivery_workers" ON delivery_workers FOR DELETE TO anon, authenticated USING (true);

-- Admin Chat Messages
CREATE TABLE IF NOT EXISTS admin_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name text NOT NULL,
  sender_role text NOT NULL,
  recipient_name text,
  body text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE admin_chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_admin_chat_messages" ON admin_chat_messages;
CREATE POLICY "anon_select_admin_chat_messages" ON admin_chat_messages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_admin_chat_messages" ON admin_chat_messages;
CREATE POLICY "anon_insert_admin_chat_messages" ON admin_chat_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_admin_chat_messages" ON admin_chat_messages;
CREATE POLICY "anon_update_admin_chat_messages" ON admin_chat_messages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_admin_chat_messages" ON admin_chat_messages;
CREATE POLICY "anon_delete_admin_chat_messages" ON admin_chat_messages FOR DELETE TO anon, authenticated USING (true);

-- Insert seed data for medical tests
INSERT INTO medical_tests (test_type, title, title_en, description, category) VALUES
  ('bmi', 'حاسبة مؤشر كتلة الجسم', 'BMI Calculator', 'احسب مؤشر كتلة جسمك لمعرفة وزنك مثالي', 'general'),
  ('calories', 'حاسبة السعرات الحرارية', 'Calorie Calculator', 'احسب احتياجك اليومي من السعرات الحرارية', 'general'),
  ('ideal_weight', 'حاسبة الوزن المثالي', 'Ideal Weight Calculator', 'احسب وزنك المثالي حسب الطول والجنس', 'general'),
  ('pregnancy', 'حاسبة موعد الولادة', 'Pregnancy Due Date Calculator', 'احسب موعد الولادة المتوقع', 'women'),
  ('fertility', 'حاسبة وقت الحمل', 'Fertility Calculator', 'احسب أفضل وقت للحمل', 'women'),
  ('prediabetes', 'اختبار السكري المبكر', 'Prediabetes Risk Test', 'اختبار لمعرفة خطر الإصابة بالسكري', 'chronic'),
  ('asthma', 'اختبار السيطرة على الربو', 'Asthma Control Test', 'اختبار لقياس مدى السيطرة على الربو', 'chronic'),
  ('vision', 'اختبار النظر', 'Vision Test', 'اختبار قوة الإبصار', 'general'),
  ('depression', 'اختبار الصحة النفسية', 'Mental Health Test', 'اختبار لتقييم الصحة النفسية', 'mental'),
  ('anxiety', 'اختبار القلق', 'Anxiety Test', 'اختبار لقياس مستوى القلق', 'mental')
ON CONFLICT DO NOTHING;

-- Insert seed data for facilities
INSERT INTO additional_facilities (facility_type, name, description, address, city, phone, services) VALUES
  ('rehab', 'مركز التأهيل الطبي', 'مركز متخصص في التأهيل البدني', 'شارع الكلية', 'الرياض', '+96650000001', 'تأهيل بدني، علاج طبيعي'),
  ('addiction', 'مصحة الأمل للإدمان', 'مركز علاج الإدمان', 'حي النزهة', 'جدة', '+96650000002', 'علاج الإدمان، استشارات نفسية'),
  ('nursing', 'دار الرعاية للمسنين', 'رعاية كاملة للمسنين', 'شارع الملك', 'الدمام', '+96650000003', 'رعاية مسنين، تمريض منزلي'),
  ('pharmacy', 'صيدلية الحياة', 'صيدلية موثوقة', 'شارع الأمير', 'الرياض', '+96650000004', 'أدوية، مستلزمات طبية')
ON CONFLICT DO NOTHING;

-- Insert seed data for pharmacy products
INSERT INTO pharmacy_products (pharmacy_id, name, description, price, currency, delivery_option, stock) VALUES
  ((SELECT id FROM additional_facilities WHERE name = 'صيدلية الحياة' LIMIT 1), 'باراسيتامول 500mg', 'مسكن للألم وخافض للحرارة', 5, 'SAR', 'delivery', 100),
  ((SELECT id FROM additional_facilities WHERE name = 'صيدلية الحياة' LIMIT 1), 'فيتامين د 1000IU', 'مكمل غذائي لفيتامين د', 25, 'SAR', 'pickup', 50),
  ((SELECT id FROM additional_facilities WHERE name = 'صيدلية الحياة' LIMIT 1), 'مقياس ضغط الدم', 'جهاز قياس ضغط الدم الرقمي', 120, 'SAR', 'delivery', 10)
ON CONFLICT DO NOTHING;

-- Insert seed data for jobs
INSERT INTO jobs (title, description, requirements, salary_range, location, job_type) VALUES
  ('طبيب أطفال', 'مطلوب طبيب أطفال بدوام كامل', 'بورد أو دبلوم في طب الأطفال', '5000-8000 SAR', 'الرياض', 'full_time'),
  ('ممرض/ة مؤهل', 'ممرض مؤهل للعمل في قسم الطوارئ', 'بكالوريوس تمريض + خبرة سنتين', '3000-5000 SAR', 'جدة', 'full_time'),
  ('أخصائي تغذية', 'أخصائي تغذية بدوام جزئي', 'ماجستير في التغذية', '2000-4000 SAR', 'الدمام', 'part_time')
ON CONFLICT DO NOTHING;
