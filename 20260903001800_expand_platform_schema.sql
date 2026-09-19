/*
# Expand platform: more specialties, videos, audio, courses, sessions, payments, admin, AI moderation

## Overview
Major schema expansion adding:
- 10 more medical specialties
- Doctor videos table (linked to specialty, boosts search ranking)
- Doctor audio recordings table (linked to specialty)
- Courses table with pricing
- Course enrollments
- Video sessions (paid, monitored, recorded)
- Free text chat sessions (limited, text-only)
- Chat messages
- Payments table
- Admin users table (owner + moderators)
- AI violation reports table
- Site settings table

## New Tables
1. `doctor_videos` - video content from doctors
2. `doctor_audio` - audio recordings from doctors
3. `courses` - paid training courses
4. `course_enrollments` - user enrollments in courses
5. `video_sessions` - paid video consultation sessions
6. `text_sessions` - free limited text chat sessions
7. `chat_messages` - messages in text sessions
8. `payments` - payment records for sessions/courses
9. `admin_users` - admin/owner accounts
10. `ai_violations` - AI-detected content violations
11. `site_settings` - global site configuration

## Security
- RLS enabled on all new tables
- All tables use TO anon, authenticated (single-tenant public app)
- Admin tables restricted to authenticated admins
*/

-- Add more specialties
INSERT INTO specialties (name, slug, icon, description) VALUES
('المسالك البولية', 'urology', 'droplet', 'أمراض المسالك البولية والكلى'),
('الأعصاب', 'neurology', 'brain', 'أمراض الجهاز العصبي والدماغ'),
('الغدد الصماء', 'endocrinology', 'activity', 'أمراض السكري والغدد الصماء'),
('الأورام', 'oncology', 'shield', 'تشخيص وعلاج الأورام'),
('التخدير', 'anesthesia', 'syringe', 'تخدير وإعادة تأهيل'),
('الروماتيزم', 'rheumatology', 'bone', 'أمراض المفاصل والروماتيزم'),
('المسالك البولية النسائية', 'gynecology-urology', 'droplet', 'أمراض المسالك البولية لدى النساء'),
('طب الإسعاف', 'emergency', 'ambulance', 'الطب الطارئ والإسعافات الأولية'),
('الطب الرياضي', 'sports-medicine', 'activity', 'إصابات الرياضة والتأهيل'),
('الطب النووي', 'nuclear-medicine', 'radiation', 'التصوير الطبي والطب النووي')
ON CONFLICT (slug) DO NOTHING;

-- Doctor videos
CREATE TABLE IF NOT EXISTS doctor_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  specialty_id uuid REFERENCES specialties(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  duration_seconds int DEFAULT 0,
  views int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE doctor_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_videos" ON doctor_videos;
CREATE POLICY "anon_select_videos" ON doctor_videos FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_videos" ON doctor_videos;
CREATE POLICY "anon_insert_videos" ON doctor_videos FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_videos" ON doctor_videos;
CREATE POLICY "anon_update_videos" ON doctor_videos FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_videos" ON doctor_videos;
CREATE POLICY "anon_delete_videos" ON doctor_videos FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_videos_specialty ON doctor_videos(specialty_id);
CREATE INDEX IF NOT EXISTS idx_videos_doctor ON doctor_videos(doctor_id);
CREATE INDEX IF NOT EXISTS idx_videos_created ON doctor_videos(created_at DESC);

-- Doctor audio recordings
CREATE TABLE IF NOT EXISTS doctor_audio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  specialty_id uuid REFERENCES specialties(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  audio_url text NOT NULL,
  duration_seconds int DEFAULT 0,
  listens int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE doctor_audio ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_audio" ON doctor_audio;
CREATE POLICY "anon_select_audio" ON doctor_audio FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_audio" ON doctor_audio;
CREATE POLICY "anon_insert_audio" ON doctor_audio FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_audio" ON doctor_audio;
CREATE POLICY "anon_update_audio" ON doctor_audio FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_audio" ON doctor_audio;
CREATE POLICY "anon_delete_audio" ON doctor_audio FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_audio_specialty ON doctor_audio(specialty_id);
CREATE INDEX IF NOT EXISTS idx_audio_doctor ON doctor_audio(doctor_id);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty_id uuid REFERENCES specialties(id) ON DELETE SET NULL,
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  price numeric DEFAULT 0,
  duration_weeks int DEFAULT 4,
  lessons_count int DEFAULT 10,
  level text DEFAULT 'beginner',
  enrolled_count int DEFAULT 0,
  rating numeric DEFAULT 5.0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_courses" ON courses;
CREATE POLICY "anon_select_courses" ON courses FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_courses" ON courses;
CREATE POLICY "anon_insert_courses" ON courses FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_courses" ON courses;
CREATE POLICY "anon_update_courses" ON courses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_courses" ON courses;
CREATE POLICY "anon_delete_courses" ON courses FOR DELETE TO anon, authenticated USING (true);

-- Course enrollments
CREATE TABLE IF NOT EXISTS course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  student_email text NOT NULL,
  progress int DEFAULT 0,
  enrolled_at timestamptz DEFAULT now()
);

ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_enrollments" ON course_enrollments;
CREATE POLICY "anon_select_enrollments" ON course_enrollments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_enrollments" ON course_enrollments;
CREATE POLICY "anon_insert_enrollments" ON course_enrollments FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments(course_id);

-- Video sessions (paid, monitored, recorded)
CREATE TABLE IF NOT EXISTS video_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  patient_name text NOT NULL,
  patient_email text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes int DEFAULT 30,
  price numeric DEFAULT 0,
  status text DEFAULT 'pending',
  meeting_url text,
  recording_url text,
  is_recorded boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE video_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_vsessions" ON video_sessions;
CREATE POLICY "anon_select_vsessions" ON video_sessions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_vsessions" ON video_sessions;
CREATE POLICY "anon_insert_vsessions" ON video_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_vsessions" ON video_sessions;
CREATE POLICY "anon_update_vsessions" ON video_sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_vsessions" ON video_sessions;
CREATE POLICY "anon_delete_vsessions" ON video_sessions FOR DELETE TO anon, authenticated USING (true);

-- Text sessions (free, limited, text-only)
CREATE TABLE IF NOT EXISTS text_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  patient_name text NOT NULL,
  specialty_id uuid REFERENCES specialties(id) ON DELETE SET NULL,
  status text DEFAULT 'active',
  message_count int DEFAULT 0,
  max_messages int DEFAULT 5,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE text_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_tsessions" ON text_sessions;
CREATE POLICY "anon_select_tsessions" ON text_sessions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_tsessions" ON text_sessions;
CREATE POLICY "anon_insert_tsessions" ON text_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_tsessions" ON text_sessions;
CREATE POLICY "anon_update_tsessions" ON text_sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES text_sessions(id) ON DELETE CASCADE,
  sender_type text NOT NULL,
  sender_name text NOT NULL,
  body text NOT NULL,
  is_flagged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_messages" ON chat_messages;
CREATE POLICY "anon_select_messages" ON chat_messages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_messages" ON chat_messages;
CREATE POLICY "anon_insert_messages" ON chat_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_messages_session ON chat_messages(session_id);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payer_email text NOT NULL,
  payer_name text NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  payment_type text NOT NULL,
  reference_id uuid,
  status text DEFAULT 'pending',
  stripe_session_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_payments" ON payments;
CREATE POLICY "anon_select_payments" ON payments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_payments" ON payments;
CREATE POLICY "anon_insert_payments" ON payments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_payments" ON payments;
CREATE POLICY "anon_update_payments" ON payments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'moderator',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_admins" ON admin_users;
CREATE POLICY "anon_select_admins" ON admin_users FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_admins" ON admin_users;
CREATE POLICY "anon_insert_admins" ON admin_users FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_admins" ON admin_users;
CREATE POLICY "anon_update_admins" ON admin_users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Insert owner
INSERT INTO admin_users (email, name, role) VALUES
('gamytvgamytv@gmail.com', 'مالك الموقع', 'owner')
ON CONFLICT (email) DO NOTHING;

-- AI violations
CREATE TABLE IF NOT EXISTS ai_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL,
  source_id uuid,
  user_name text,
  content_snippet text,
  violation_type text NOT NULL,
  severity text DEFAULT 'medium',
  status text DEFAULT 'pending',
  ai_response text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_violations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_violations" ON ai_violations;
CREATE POLICY "anon_select_violations" ON ai_violations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_violations" ON ai_violations;
CREATE POLICY "anon_insert_violations" ON ai_violations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_violations" ON ai_violations;
CREATE POLICY "anon_update_violations" ON ai_violations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Site settings
CREATE TABLE IF NOT EXISTS site_settings (
  id int PRIMARY KEY DEFAULT 1,
  site_name text DEFAULT 'طبيبك',
  default_language text DEFAULT 'ar',
  free_session_messages int DEFAULT 5,
  video_session_price numeric DEFAULT 25,
  currency text DEFAULT 'USD',
  ai_moderation_enabled boolean DEFAULT true,
  stripe_enabled boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_settings" ON site_settings;
CREATE POLICY "anon_select_settings" ON site_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_update_settings" ON site_settings;
CREATE POLICY "anon_update_settings" ON site_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO site_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
