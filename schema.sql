create extension if not exists pgcrypto;
create table if not exists profiles(id uuid primary key default gen_random_uuid(),email text unique,full_name text not null,role text default 'client',avatar_url text,specialty text,bio text,verified boolean default false,created_at timestamptz default now());
create table if not exists specialists(id uuid primary key default gen_random_uuid(),profile_id uuid references profiles(id) on delete cascade,specialty text,rating numeric(3,2) default 0,followers int default 0,answers int default 0,price numeric(12,2) default 0,currency text default 'USD',online boolean default false,badge text);
create table if not exists questions(id uuid primary key default gen_random_uuid(),author_id uuid references profiles(id),title text not null,body text,specialty text,is_paid boolean default false,price numeric(12,2) default 0,currency text default 'USD',max_answers int default 5,active_days int default 3,status text default 'new',created_at timestamptz default now());
create table if not exists courses(id uuid primary key default gen_random_uuid(),title_ar text,title_ru text,description_ar text,description_ru text,category text,level text,duration text,price numeric(12,2) default 0,currency text default 'USD',published boolean default false,created_at timestamptz default now());
create table if not exists facilities(id uuid primary key default gen_random_uuid(),name text,type text,city text,district text,rating numeric(3,2) default 0,status text default 'pending',created_at timestamptz default now());
create table if not exists orders(id uuid primary key default gen_random_uuid(),buyer_id uuid references profiles(id),total numeric(12,2),currency text,status text default 'pending',created_at timestamptz default now());
-- Add Row Level Security policies before storing real user data.
-- =========================================================================
-- الأكواد المكملة المدمجة (خطط الأسعار، أرباح المنصة، والتضخيم التراكمي للمحتوى)
-- =========================================================================

-- 1. جداول خطط الأسعار والأسئلة المتقدمة
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
CREATE POLICY "anon_select_pricing_tiers" ON pricing_tiers FOR SELECT TO anon, authenticated USING (true);

-- تحديث جدول الأسئلة لربطه بالباقات
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS specialty_key text DEFAULT 'general';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS tier_id uuid REFERENCES pricing_tiers(id) ON DELETE SET NULL;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS price_usd numeric(10,2) DEFAULT 0;

-- 2. جدول أرباح المنصة والصيدليات وتوزيع النسب
CREATE TABLE IF NOT EXISTS public.profit_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_share_type text NOT NULL DEFAULT 'percentage',
  facility_share_value numeric NOT NULL DEFAULT 85,
  platform_share_type text NOT NULL DEFAULT 'percentage',
  platform_share_value numeric NOT NULL DEFAULT 10,
  agent_share_type text NOT NULL DEFAULT 'percentage',
  agent_share_value numeric NOT NULL DEFAULT 5,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profit_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_profit_config" ON public.profit_config;
CREATE POLICY "anon_read_profit_config" ON public.profit_config FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.profit_config (facility_share_type, facility_share_value, platform_share_type, platform_share_value, agent_share_type, agent_share_value)
VALUES ('percentage', 85, 'percentage', 10, 'percentage', 5) ON CONFLICT DO NOTHING;

-- 3. نظام التضخيم التراكمي ومخزون المحتوى الرقمي للمنصة
CREATE TABLE IF NOT EXISTS public.platform_content_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text UNIQUE NOT NULL,
  content_label text NOT NULL,
  current_count integer NOT NULL DEFAULT 0,
  base_count integer NOT NULL DEFAULT 0,
  compound_rate numeric(5,4) NOT NULL DEFAULT 0.0500,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.platform_content_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_inventory" ON public.platform_content_inventory;
CREATE POLICY "public_read_inventory" ON public.platform_content_inventory FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.platform_content_inventory (content_type, content_label, current_count, base_count, compound_rate)
VALUES
  ('paid_videos', 'Paid Medical Videos', 200, 200, 0.0500),
  ('paid_articles', 'Paid Articles', 350, 350, 0.0500),
  ('paid_courses', 'Paid Educational Courses', 45, 45, 0.0500)
ON CONFLICT (content_type) DO NOTHING;

-- زرع باقات التسعير الافتراضية
INSERT INTO pricing_tiers (name, name_ar, description, description_ar, duration_days, specialists_notified, min_answers, max_answers, response_speed, price_usd, is_active, is_featured, sort_order)
VALUES
  ('Basic', 'الأساسية', 'Standard response within 48 hours', 'رد قياسي خلال 48 ساعة', 7, 10, 1, 3, 'standard', 9.00, true, false, 1),
  ('Plus', 'المعززة', 'Faster responses from more specialists', 'ردود أسرع من عدد أكبر من الأخصائيين', 14, 25, 2, 5, 'fast', 19.00, true, true, 2),
  ('Premium', 'المميزة', 'Instant response, maximum specialists, extended duration', 'رد فوري، أقصى عدد من الأخصائيين، مدة ممتدة', 30, 50, 3, 10, 'instant', 39.00, true, false, 3),
  ('Ultimate', 'النهائية', 'Top priority, all specialists, longest duration', 'أولوية قصوى، جميع الأخصائيين، أطول مدة', 60, 100, 5, 20, 'instant', 69.00, true, false, 4)
ON CONFLICT DO NOTHING;
