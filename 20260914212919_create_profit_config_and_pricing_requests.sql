/*
# Create profit configuration and pricing requests tables

1. New Tables
- `profit_config`: Stores platform-wide profit distribution settings (single row).
  - facility_share_type: 'percentage' | 'fixed' | 'mixed'
  - facility_share_value: numeric value for facility share
  - platform_share_type: same options
  - platform_share_value: numeric value for platform commission
  - agent_share_type: same options
  - agent_share_value: numeric value for delivery agent fee
  Updated automatically on any change.
- `pricing_requests`: Custom pricing requests submitted by facilities or delivery agents.
  - requester_type: 'facility' | 'agent'
  - requester_name: name of the requester
  - facility_name: optional facility name
  - requested_share_type: 'percentage' | 'fixed' | 'mixed'
  - requested_value: numeric value requested
  - reason: explanation for the request
  - status: 'pending' | 'approved' | 'rejected'
  - reviewed_at: timestamp when admin reviewed

2. Security
- RLS enabled on both tables.
- Public read/write (TO anon, authenticated) because this is a no-auth demo app with intentionally shared data.

3. Seed Data
- Default profit config: facility 85%, platform 10%, agent 5%.
- Three demo pricing requests (two pending, one approved).
*/

CREATE TABLE IF NOT EXISTS profit_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_share_type text NOT NULL DEFAULT 'percentage',
  facility_share_value numeric NOT NULL DEFAULT 85,
  platform_share_type text NOT NULL DEFAULT 'percentage',
  platform_share_value numeric NOT NULL DEFAULT 10,
  agent_share_type text NOT NULL DEFAULT 'percentage',
  agent_share_value numeric NOT NULL DEFAULT 5,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profit_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_profit_config" ON profit_config;
CREATE POLICY "anon_read_profit_config" ON profit_config FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_profit_config" ON profit_config;
CREATE POLICY "anon_insert_profit_config" ON profit_config FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_profit_config" ON profit_config;
CREATE POLICY "anon_update_profit_config" ON profit_config FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS pricing_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_type text NOT NULL,
  requester_name text NOT NULL,
  facility_name text,
  requested_share_type text NOT NULL,
  requested_value numeric NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE pricing_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_pricing_requests" ON pricing_requests;
CREATE POLICY "anon_read_pricing_requests" ON pricing_requests FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_pricing_requests" ON pricing_requests;
CREATE POLICY "anon_insert_pricing_requests" ON pricing_requests FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_pricing_requests" ON pricing_requests;
CREATE POLICY "anon_update_pricing_requests" ON pricing_requests FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO profit_config (facility_share_type, facility_share_value, platform_share_type, platform_share_value, agent_share_type, agent_share_value)
VALUES ('percentage', 85, 'percentage', 10, 'percentage', 5)
ON CONFLICT DO NOTHING;

INSERT INTO pricing_requests (requester_type, requester_name, facility_name, requested_share_type, requested_value, reason, status)
VALUES
  ('facility', 'صيدلية النهدي', 'صيدلية النهدي', 'percentage', 90, 'نطلب زيادة نسبتنا إلى 90% نظراً لحجم المعاملات الكبير', 'pending'),
  ('agent', 'أحمد محمد', NULL, 'fixed', 15, 'نطلب أجر ثابت 15 ريال لكل توصيلة بدلاً من النسبة', 'pending'),
  ('facility', 'مختبر البرج المخبري', 'مختبر البرج المخبري', 'mixed', 88, 'نطلب نسبة 88% مع رسوم ثابتة 5 ريال', 'approved')
ON CONFLICT DO NOTHING;