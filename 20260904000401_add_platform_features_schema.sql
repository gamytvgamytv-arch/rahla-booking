/*
# Add specialist profile and platform features schema

## Description
This migration adds columns and tables for specialist profile pages (Facebook-style),
specialty chat rooms, specialty libraries, registration flow, subscriptions, planner,
clinics/hospitals, radiology, labs, ads, and badges.

## New columns on doctors:
- native_language (text) - specialist's native language for language-based filtering
- is_online (boolean) - online status
- is_verified (boolean) - verification status
- phone_number (text) - contact phone for cross-platform follow
- follower_count (integer) - number of followers

## New tables:
1. specialist_posts - Facebook-style posts on specialist profile
2. specialist_reels - Short video reels
3. specialist_diary - Diary entries
4. post_comments - Comments on posts
5. post_likes - Likes on posts
6. specialty_chat_rooms - Chat rooms per specialty
7. chat_room_messages - Messages in chat rooms
8. specialty_library_items - Library items (news, books, services) per specialty
9. specialist_documents - Registration documents for specialists
10. subscriptions - User subscription plans
11. subscription_plans - Available plans
12. specialist_planner - Session scheduling for specialists
13. planner_reminders - Reminders for sessions
14. clinics - Clinics and hospitals
15. clinic_bookings - Bookings for clinics
16. radiology_centers - Radiology centers
17. radiology_bookings - Bookings for radiology
18. lab_centers - Lab centers
19. lab_bookings - Bookings for labs
20. advertisements - Ads from specialists
21. badges - Achievement badges
22. user_badges - Badges earned by users
23. user_follows - Follow relationships

## Security
- RLS enabled on all new tables.
- Policies allow anon+authenticated read on public content (posts, reels, library items, clinics, etc.)
- Write operations scoped to authenticated users where appropriate.
*/

-- Add columns to doctors
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS native_language text DEFAULT 'ar';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS follower_count integer DEFAULT 0;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS nationality text;

-- Update site name
UPDATE site_settings SET site_name = 'سهله وبسيطه' WHERE id = 1;

-- 1. Specialist posts (Facebook-style)
CREATE TABLE IF NOT EXISTS specialist_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  body text NOT NULL,
  image_url text,
  video_url text,
  post_type text DEFAULT 'post',
  views integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE specialist_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_posts" ON specialist_posts;
CREATE POLICY "anon_read_posts" ON specialist_posts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_posts" ON specialist_posts;
CREATE POLICY "auth_insert_posts" ON specialist_posts FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_posts" ON specialist_posts;
CREATE POLICY "auth_update_posts" ON specialist_posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_posts" ON specialist_posts;
CREATE POLICY "auth_delete_posts" ON specialist_posts FOR DELETE TO authenticated USING (true);

-- 2. Specialist reels
CREATE TABLE IF NOT EXISTS specialist_reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  title text,
  video_url text NOT NULL,
  thumbnail_url text,
  views integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE specialist_reels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_reels" ON specialist_reels;
CREATE POLICY "anon_read_reels" ON specialist_reels FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_reels" ON specialist_reels;
CREATE POLICY "auth_insert_reels" ON specialist_reels FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_reels" ON specialist_reels;
CREATE POLICY "auth_delete_reels" ON specialist_reels FOR DELETE TO authenticated USING (true);

-- 3. Specialist diary
CREATE TABLE IF NOT EXISTS specialist_diary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  title text,
  body text NOT NULL,
  mood text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE specialist_diary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_diary" ON specialist_diary;
CREATE POLICY "anon_read_diary" ON specialist_diary FOR SELECT TO anon, authenticated USING (is_public);
DROP POLICY IF EXISTS "auth_insert_diary" ON specialist_diary;
CREATE POLICY "auth_insert_diary" ON specialist_diary FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_diary" ON specialist_diary;
CREATE POLICY "auth_delete_diary" ON specialist_diary FOR DELETE TO authenticated USING (true);

-- 4. Post comments
CREATE TABLE IF NOT EXISTS post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES specialist_posts(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_comments" ON post_comments;
CREATE POLICY "anon_read_comments" ON post_comments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_comments" ON post_comments;
CREATE POLICY "auth_insert_comments" ON post_comments FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_comments" ON post_comments;
CREATE POLICY "auth_delete_comments" ON post_comments FOR DELETE TO authenticated USING (true);

-- 5. Post likes
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES specialist_posts(id) ON DELETE CASCADE,
  user_identifier text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_identifier)
);
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_likes" ON post_likes;
CREATE POLICY "anon_read_likes" ON post_likes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_likes" ON post_likes;
CREATE POLICY "auth_insert_likes" ON post_likes FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_likes" ON post_likes;
CREATE POLICY "auth_delete_likes" ON post_likes FOR DELETE TO authenticated USING (true);

-- 6. Specialty chat rooms
CREATE TABLE IF NOT EXISTS specialty_chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty_id uuid REFERENCES specialties(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  member_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE specialty_chat_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_chat_rooms" ON specialty_chat_rooms;
CREATE POLICY "anon_read_chat_rooms" ON specialty_chat_rooms FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_chat_rooms" ON specialty_chat_rooms;
CREATE POLICY "auth_insert_chat_rooms" ON specialty_chat_rooms FOR INSERT TO authenticated WITH CHECK (true);

-- 7. Chat room messages
CREATE TABLE IF NOT EXISTS chat_room_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES specialty_chat_rooms(id) ON DELETE CASCADE,
  sender_name text NOT NULL,
  sender_type text DEFAULT 'user',
  body text NOT NULL,
  is_flagged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE chat_room_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_chat_msgs" ON chat_room_messages;
CREATE POLICY "anon_read_chat_msgs" ON chat_room_messages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_chat_msgs" ON chat_room_messages;
CREATE POLICY "auth_insert_chat_msgs" ON chat_room_messages FOR INSERT TO authenticated WITH CHECK (true);

-- 8. Specialty library items
CREATE TABLE IF NOT EXISTS specialty_library_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty_id uuid REFERENCES specialties(id) ON DELETE CASCADE,
  item_type text NOT NULL DEFAULT 'article',
  title text NOT NULL,
  description text,
  url text,
  image_url text,
  source text,
  is_auto_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE specialty_library_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_library" ON specialty_library_items;
CREATE POLICY "anon_read_library" ON specialty_library_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_library" ON specialty_library_items;
CREATE POLICY "auth_insert_library" ON specialty_library_items FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_library" ON specialty_library_items;
CREATE POLICY "auth_update_library" ON specialty_library_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_library" ON specialty_library_items;
CREATE POLICY "auth_delete_library" ON specialty_library_items FOR DELETE TO authenticated USING (true);

-- 9. Specialist documents (registration)
CREATE TABLE IF NOT EXISTS specialist_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  doc_type text NOT NULL,
  doc_url text NOT NULL,
  status text DEFAULT 'pending',
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE specialist_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_docs" ON specialist_documents;
CREATE POLICY "anon_read_docs" ON specialist_documents FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_docs" ON specialist_documents;
CREATE POLICY "auth_insert_docs" ON specialist_documents FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_docs" ON specialist_documents;
CREATE POLICY "auth_update_docs" ON specialist_documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 10. Subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text,
  duration_months integer NOT NULL DEFAULT 1,
  price numeric NOT NULL DEFAULT 0,
  daily_questions_limit integer,
  weekly_questions_limit integer,
  free_courses_limit integer,
  free_books_limit integer,
  features text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_plans" ON subscription_plans;
CREATE POLICY "anon_read_plans" ON subscription_plans FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_plans" ON subscription_plans;
CREATE POLICY "auth_insert_plans" ON subscription_plans FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_plans" ON subscription_plans;
CREATE POLICY "auth_update_plans" ON subscription_plans FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 11. User subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  plan_id uuid REFERENCES subscription_plans(id) ON DELETE CASCADE,
  status text DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_subs" ON subscriptions;
CREATE POLICY "anon_read_subs" ON subscriptions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_subs" ON subscriptions;
CREATE POLICY "auth_insert_subs" ON subscriptions FOR INSERT TO authenticated WITH CHECK (true);

-- 12. Specialist planner
CREATE TABLE IF NOT EXISTS specialist_planner (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  session_type text DEFAULT 'paid',
  client_name text NOT NULL,
  client_email text,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  status text DEFAULT 'scheduled',
  price numeric DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE specialist_planner ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_planner" ON specialist_planner;
CREATE POLICY "anon_read_planner" ON specialist_planner FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_planner" ON specialist_planner;
CREATE POLICY "auth_insert_planner" ON specialist_planner FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_planner" ON specialist_planner;
CREATE POLICY "auth_update_planner" ON specialist_planner FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_planner" ON specialist_planner;
CREATE POLICY "auth_delete_planner" ON specialist_planner FOR DELETE TO authenticated USING (true);

-- 13. Planner reminders
CREATE TABLE IF NOT EXISTS planner_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  planner_id uuid REFERENCES specialist_planner(id) ON DELETE CASCADE,
  reminder_type text DEFAULT 'before',
  remind_at timestamptz NOT NULL,
  is_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE planner_reminders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_reminders" ON planner_reminders;
CREATE POLICY "anon_read_reminders" ON planner_reminders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_reminders" ON planner_reminders;
CREATE POLICY "auth_insert_reminders" ON planner_reminders FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_reminders" ON planner_reminders;
CREATE POLICY "auth_update_reminders" ON planner_reminders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 14. Clinics
CREATE TABLE IF NOT EXISTS clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  address text,
  city text,
  phone text,
  image_url text,
  latitude numeric,
  longitude numeric,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_clinics" ON clinics;
CREATE POLICY "anon_read_clinics" ON clinics FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_clinics" ON clinics;
CREATE POLICY "auth_insert_clinics" ON clinics FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_clinics" ON clinics;
CREATE POLICY "auth_update_clinics" ON clinics FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_clinics" ON clinics;
CREATE POLICY "auth_delete_clinics" ON clinics FOR DELETE TO authenticated USING (true);

-- 15. Clinic bookings
CREATE TABLE IF NOT EXISTS clinic_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  patient_email text,
  patient_phone text,
  scheduled_at timestamptz NOT NULL,
  status text DEFAULT 'pending',
  price numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE clinic_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_clinic_bookings" ON clinic_bookings;
CREATE POLICY "anon_read_clinic_bookings" ON clinic_bookings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_clinic_bookings" ON clinic_bookings;
CREATE POLICY "auth_insert_clinic_bookings" ON clinic_bookings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_clinic_bookings" ON clinic_bookings;
CREATE POLICY "auth_update_clinic_bookings" ON clinic_bookings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 16. Radiology centers
CREATE TABLE IF NOT EXISTS radiology_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  address text,
  city text,
  phone text,
  image_url text,
  services text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE radiology_centers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_radiology" ON radiology_centers;
CREATE POLICY "anon_read_radiology" ON radiology_centers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_radiology" ON radiology_centers;
CREATE POLICY "auth_insert_radiology" ON radiology_centers FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_radiology" ON radiology_centers;
CREATE POLICY "auth_update_radiology" ON radiology_centers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_radiology" ON radiology_centers;
CREATE POLICY "auth_delete_radiology" ON radiology_centers FOR DELETE TO authenticated USING (true);

-- 17. Radiology bookings
CREATE TABLE IF NOT EXISTS radiology_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid REFERENCES radiology_centers(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  patient_email text,
  patient_phone text,
  service_type text,
  scheduled_at timestamptz NOT NULL,
  status text DEFAULT 'pending',
  price numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE radiology_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_rad_bookings" ON radiology_bookings;
CREATE POLICY "anon_read_rad_bookings" ON radiology_bookings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_rad_bookings" ON radiology_bookings;
CREATE POLICY "auth_insert_rad_bookings" ON radiology_bookings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_rad_bookings" ON radiology_bookings;
CREATE POLICY "auth_update_rad_bookings" ON radiology_bookings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 18. Lab centers
CREATE TABLE IF NOT EXISTS lab_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  address text,
  city text,
  phone text,
  image_url text,
  services text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE lab_centers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_labs" ON lab_centers;
CREATE POLICY "anon_read_labs" ON lab_centers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_labs" ON lab_centers;
CREATE POLICY "auth_insert_labs" ON lab_centers FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_labs" ON lab_centers;
CREATE POLICY "auth_update_labs" ON lab_centers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_labs" ON lab_centers;
CREATE POLICY "auth_delete_labs" ON lab_centers FOR DELETE TO authenticated USING (true);

-- 19. Lab bookings
CREATE TABLE IF NOT EXISTS lab_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid REFERENCES lab_centers(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  patient_email text,
  patient_phone text,
  test_type text,
  scheduled_at timestamptz NOT NULL,
  status text DEFAULT 'pending',
  price numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE lab_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_lab_bookings" ON lab_bookings;
CREATE POLICY "anon_read_lab_bookings" ON lab_bookings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_lab_bookings" ON lab_bookings;
CREATE POLICY "auth_insert_lab_bookings" ON lab_bookings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_lab_bookings" ON lab_bookings;
CREATE POLICY "auth_update_lab_bookings" ON lab_bookings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 20. Advertisements
CREATE TABLE IF NOT EXISTS advertisements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text,
  target_url text,
  placement text DEFAULT 'sidebar',
  start_date timestamptz,
  end_date timestamptz,
  price numeric DEFAULT 0,
  status text DEFAULT 'pending',
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_ads" ON advertisements;
CREATE POLICY "anon_read_ads" ON advertisements FOR SELECT TO anon, authenticated USING (status = 'active');
DROP POLICY IF EXISTS "auth_insert_ads" ON advertisements;
CREATE POLICY "auth_insert_ads" ON advertisements FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_ads" ON advertisements;
CREATE POLICY "auth_update_ads" ON advertisements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_ads" ON advertisements;
CREATE POLICY "auth_delete_ads" ON advertisements FOR DELETE TO authenticated USING (true);

-- 21. Badges
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text,
  description text,
  icon text,
  color text DEFAULT 'teal',
  requirement_type text,
  requirement_value integer,
  is_purchasable boolean DEFAULT false,
  price numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_badges" ON badges;
CREATE POLICY "anon_read_badges" ON badges FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_badges" ON badges;
CREATE POLICY "auth_insert_badges" ON badges FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_badges" ON badges;
CREATE POLICY "auth_update_badges" ON badges FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 22. User badges
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  is_earned boolean DEFAULT false,
  is_purchased boolean DEFAULT false,
  earned_at timestamptz DEFAULT now()
);
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_user_badges" ON user_badges;
CREATE POLICY "anon_read_user_badges" ON user_badges FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_user_badges" ON user_badges;
CREATE POLICY "auth_insert_user_badges" ON user_badges FOR INSERT TO authenticated WITH CHECK (true);

-- 23. User follows
CREATE TABLE IF NOT EXISTS user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_email text NOT NULL,
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_email, doctor_id)
);
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_follows" ON user_follows;
CREATE POLICY "anon_read_follows" ON user_follows FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_follows" ON user_follows;
CREATE POLICY "auth_insert_follows" ON user_follows FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_follows" ON user_follows;
CREATE POLICY "auth_delete_follows" ON user_follows FOR DELETE TO authenticated USING (true);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, name_ar, duration_months, price, daily_questions_limit, weekly_questions_limit, free_courses_limit, free_books_limit, features)
VALUES
('Monthly', 'اشتراك شهري', 1, 9.99, 5, 20, 1, 1, '5 أسئلة يومية، 20 سؤال أسبوعي، دورة مجانية، كتاب مجاني'),
('Quarterly', 'اشتراك ثلاثة شهور', 3, 24.99, 10, 50, 3, 3, '10 أسئلة يومية، 50 سؤال أسبوعي، 3 دورات مجانية، 3 كتب مجانية'),
('Semi-Annual', 'اشتراك نصف سنوي', 6, 44.99, 15, 80, 6, 6, '15 سؤال يومي، 80 سؤال أسبوعي، 6 دورات مجانية، 6 كتب مجانية'),
('Annual', 'اشتراك سنوي', 12, 79.99, 25, 150, 12, 12, '25 سؤال يومي، 150 سؤال أسبوعي، 12 دورة مجانية، 12 كتاب مجاني')
ON CONFLICT DO NOTHING;

-- Insert default badges
INSERT INTO badges (name, name_ar, description, icon, color, requirement_type, requirement_value, is_purchasable, price)
VALUES
('Trusted Expert', 'خبير موثوق', 'أجاب على 100 سؤال', 'ShieldCheck', 'teal', 'answers', 100, false, 0),
('Top Rated', 'الأعلى تقييماً', 'تقييم 4.5 أو أعلى', 'Star', 'amber', 'rating', 5, false, 0),
('Popular', 'مشهور', '1000 متابع', 'Users', 'blue', 'followers', 1000, false, 0),
('Verified', 'موثق', 'تم التحقق من الوثائق', 'BadgeCheck', 'green', 'verified', 1, false, 0),
('Premium', 'مميز', 'شارة قابلة للشراء', 'Crown', 'purple', 'purchased', 1, true, 19.99),
('Rising Star', 'نجم صاعد', '50 إجابة', 'TrendingUp', 'pink', 'answers', 50, false, 0)
ON CONFLICT DO NOTHING;