/*
# Add virtual specialists, site policy, and engagement controls

1. New Columns
- `doctors.is_virtual` (boolean, default false) — marks AI-generated virtual specialist profiles
- `doctors.virtual_message` (text, nullable) — message shown when a virtual specialist is unavailable
- `articles.likes_count` (integer, default 0) — likes count for articles
- `articles.reviews_count` (integer, default 0) — reviews count for articles
- `doctor_videos.likes_count` (integer, default 0) — likes for videos
- `doctor_videos.reviews_count` (integer, default 0) — reviews for videos
- `doctor_audio.likes_count` (integer, default 0) — likes for audio
- `courses.likes_count` (integer, default 0) — likes for courses
- `courses.reviews_count` (integer, default 0) — reviews for courses

2. New Tables
- `site_policies` — stores site policy text (no religion, no politics, no contact sharing, etc.)
- `policy_acceptances` — tracks when users accept the policy at registration
- `specialist_store_products` — products specialists can buy (likes, views, reviews packages)
- `store_purchases` — records of purchases
- `engagement_boosts` — owner/admin controls to boost views/likes/reviews on any content

3. Security
- All new tables have RLS enabled with anon,authenticated access (single-tenant app)
- All existing policies remain unchanged
*/

-- Add is_virtual column to doctors
DO $$ BEGIN
  ALTER TABLE doctors ADD COLUMN IF NOT EXISTS is_virtual boolean NOT NULL DEFAULT false;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE doctors ADD COLUMN IF NOT EXISTS virtual_message text;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Add engagement columns to articles
DO $$ BEGIN
  ALTER TABLE articles ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE articles ADD COLUMN IF NOT EXISTS reviews_count integer NOT NULL DEFAULT 0;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Add engagement columns to doctor_videos
DO $$ BEGIN
  ALTER TABLE doctor_videos ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE doctor_videos ADD COLUMN IF NOT EXISTS reviews_count integer NOT NULL DEFAULT 0;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Add engagement columns to doctor_audio
DO $$ BEGIN
  ALTER TABLE doctor_audio ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Add engagement columns to courses
DO $$ BEGIN
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS reviews_count integer NOT NULL DEFAULT 0;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Create site_policies table
CREATE TABLE IF NOT EXISTS site_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE site_policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_site_policies" ON site_policies;
CREATE POLICY "anon_read_site_policies" ON site_policies FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_site_policies" ON site_policies;
CREATE POLICY "anon_insert_site_policies" ON site_policies FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_site_policies" ON site_policies;
CREATE POLICY "anon_update_site_policies" ON site_policies FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Create policy_acceptances table
CREATE TABLE IF NOT EXISTS policy_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text,
  user_name text,
  policy_id uuid REFERENCES site_policies(id) ON DELETE CASCADE,
  accepted_at timestamptz DEFAULT now()
);

ALTER TABLE policy_acceptances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_policy_acceptances" ON policy_acceptances;
CREATE POLICY "anon_crud_policy_acceptances" ON policy_acceptances FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_policy_acceptances" ON policy_acceptances;
CREATE POLICY "anon_insert_policy_acceptances" ON policy_acceptances FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Create specialist_store_products table
CREATE TABLE IF NOT EXISTS specialist_store_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type text NOT NULL,
  name text NOT NULL,
  quantity integer NOT NULL DEFAULT 100,
  price numeric(10,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE specialist_store_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_store_products" ON specialist_store_products;
CREATE POLICY "anon_read_store_products" ON specialist_store_products FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_store_products" ON specialist_store_products;
CREATE POLICY "anon_insert_store_products" ON specialist_store_products FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_store_products" ON specialist_store_products;
CREATE POLICY "anon_update_store_products" ON specialist_store_products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Create store_purchases table
CREATE TABLE IF NOT EXISTS store_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  product_id uuid REFERENCES specialist_store_products(id) ON DELETE CASCADE,
  target_type text,
  target_id text,
  quantity integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE store_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_store_purchases" ON store_purchases;
CREATE POLICY "anon_crud_store_purchases" ON store_purchases FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_store_purchases" ON store_purchases;
CREATE POLICY "anon_insert_store_purchases" ON store_purchases FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_store_purchases" ON store_purchases;
CREATE POLICY "anon_update_store_purchases" ON store_purchases FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Create engagement_boosts table (owner controls)
CREATE TABLE IF NOT EXISTS engagement_boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL,
  target_id text NOT NULL,
  boost_type text NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  applied_by text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE engagement_boosts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_engagement_boosts" ON engagement_boosts;
CREATE POLICY "anon_crud_engagement_boosts" ON engagement_boosts FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_engagement_boosts" ON engagement_boosts;
CREATE POLICY "anon_insert_engagement_boosts" ON engagement_boosts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Create session_schedule table for doctor availability and client preferred times
CREATE TABLE IF NOT EXISTS session_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  available_from timestamptz,
  available_to timestamptz,
  is_booked boolean NOT NULL DEFAULT false,
  client_name text,
  client_email text,
  client_preferred_times text,
  status text NOT NULL DEFAULT 'available',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE session_schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_session_schedule" ON session_schedule;
CREATE POLICY "anon_crud_session_schedule" ON session_schedule FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_session_schedule" ON session_schedule;
CREATE POLICY "anon_insert_session_schedule" ON session_schedule FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_session_schedule" ON session_schedule;
CREATE POLICY "anon_update_session_schedule" ON session_schedule FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_session_schedule" ON session_schedule;
CREATE POLICY "anon_delete_session_schedule" ON session_schedule FOR DELETE
  TO anon, authenticated USING (true);

-- Insert default site policy
INSERT INTO site_policies (title, body, is_active)
SELECT 'سياسة الموقع', '1. لا كلام في الدين أو المذهب
2. لا كلام في السياسة
3. لا عرض أو تبادل أي وسائل تواصل (هاتف، بريد، مواقع تواصل اجتماعي)
4. لا إساءة أو إهانة لأي شخص
5. لا نشر محتوى غير طبي أو غير صحي
6. لا تكرار نفس السؤال أو التعليق
7. الالتزام بالآداب العامة والاحترام المتبادل

في حال مخالفة أي من هذه السياسات، يتم إرسال تحذير فوري ووقف الحساب مؤقتاً لمدة ساعة حتى يتم الفصل في المخالفة. عند تكرار المخالفات يتم تغليظ العقوبة قد تصل إلى حظر دائم.',
true
WHERE NOT EXISTS (SELECT 1 FROM site_policies WHERE is_active = true);

-- Insert default store products
INSERT INTO specialist_store_products (product_type, name, quantity, price, is_active)
VALUES
  ('likes', '100 إعجاب', 100, 5, true),
  ('likes', '500 إعجاب', 500, 20, true),
  ('likes', '1000 إعجاب', 1000, 35, true),
  ('views', '1000 مشاهدة', 1000, 3, true),
  ('views', '5000 مشاهدة', 5000, 12, true),
  ('views', '10000 مشاهدة', 10000, 20, true),
  ('reviews', '10 مراجعات', 10, 8, true),
  ('reviews', '50 مراجعة', 50, 30, true),
  ('reviews', '100 مراجعة', 100, 50, true)
ON CONFLICT DO NOTHING;
