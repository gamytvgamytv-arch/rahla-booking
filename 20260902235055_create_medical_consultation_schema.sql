/*
# Create medical consultation platform schema

## Overview
A medical consultation website combining doctor directory, Q&A platform, and health articles.
Single-tenant (no auth) — all data is public/shared.

## New Tables
1. `specialties` — medical specialties (cardiology, dermatology, etc.)
   - id (uuid PK), name (text), slug (text unique), icon (text), description (text), created_at
2. `doctors` — doctor profiles
   - id (uuid PK), name (text), specialty_id (FK), bio (text), education (text), 
     experience_years (int), photo_url (text), city (text), rating (numeric), 
     consultation_count (int), created_at
3. `questions` — user-submitted medical questions
   - id (uuid PK), specialty_id (FK), author_name (text), title (text), body (text),
     age (int), gender (text), status (text default 'pending'), views (int default 0),
     created_at
4. `answers` — doctor answers to questions
   - id (uuid PK), question_id (FK), doctor_id (FK), body (text), helpful_count (int),
     created_at
5. `articles` — health education articles
   - id (uuid PK), specialty_id (FK), doctor_id (FK nullable), title (text), 
     excerpt (text), body (text), image_url (text), reading_time_min (int),
     views (int), created_at

## Security
- RLS enabled on all tables.
- All tables use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
  because this is a single-tenant public app with no sign-in.
*/

-- Specialties
CREATE TABLE IF NOT EXISTS specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text NOT NULL DEFAULT 'stethoscope',
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_specialties" ON specialties;
CREATE POLICY "anon_select_specialties" ON specialties FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_specialties" ON specialties;
CREATE POLICY "anon_insert_specialties" ON specialties FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Doctors
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialty_id uuid REFERENCES specialties(id) ON DELETE SET NULL,
  bio text,
  education text,
  experience_years int DEFAULT 0,
  photo_url text,
  city text,
  rating numeric DEFAULT 5.0,
  consultation_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_doctors" ON doctors;
CREATE POLICY "anon_select_doctors" ON doctors FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_doctors" ON doctors;
CREATE POLICY "anon_insert_doctors" ON doctors FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty_id uuid REFERENCES specialties(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  age int,
  gender text,
  status text NOT NULL DEFAULT 'answered',
  views int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_questions" ON questions;
CREATE POLICY "anon_select_questions" ON questions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_questions" ON questions;
CREATE POLICY "anon_insert_questions" ON questions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Answers
CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  body text NOT NULL,
  helpful_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_answers" ON answers;
CREATE POLICY "anon_select_answers" ON answers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_answers" ON answers;
CREATE POLICY "anon_insert_answers" ON answers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Articles
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty_id uuid REFERENCES specialties(id) ON DELETE SET NULL,
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  title text NOT NULL,
  excerpt text NOT NULL,
  body text NOT NULL,
  image_url text,
  reading_time_min int DEFAULT 5,
  views int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_articles" ON articles;
CREATE POLICY "anon_select_articles" ON articles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_articles" ON articles;
CREATE POLICY "anon_insert_articles" ON articles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty_id);
CREATE INDEX IF NOT EXISTS idx_questions_specialty ON questions(specialty_id);
CREATE INDEX IF NOT EXISTS idx_questions_created ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_articles_specialty ON articles(specialty_id);
CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at DESC);