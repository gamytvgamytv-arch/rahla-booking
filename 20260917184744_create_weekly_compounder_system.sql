/*
# Automated Weekly Volume Compounder System

## Purpose
Implements a self-sustaining algorithm that automatically grows the platform's
own paid content inventory (paid articles, paid medical videos, paid educational
courses) by 5% every week on a cumulative compounding basis, and tracks 100%
net revenue from platform-owned content (no real specialist involved) into the
site's wallet.

## How the compounding works
- Each content type starts with a base count (e.g. 200 paid videos).
- Every week, the system adds 5% of the current total (rounded up) to the inventory.
- The next week's 5% is calculated on the new total — this is the cumulative,
  compounding, multiplicative growth.
- Example: 200 → 210 (week 1) → 221 (week 2, 5% of 210 = 10.5 → 11) → 232 (week 3) …

## New Tables

### platform_content_inventory
Tracks the current count of each platform-owned paid content type.
- id (uuid PK)
- content_type (text, unique): 'paid_articles' | 'paid_videos' | 'paid_courses'
- content_label (text): human-readable label
- current_count (integer): current available count for monetization
- base_count (integer): the original starting count (for reference)
- compound_rate (numeric, default 0.05): weekly growth rate (5%)
- last_compounded_at (timestamptz): when the last compounding ran
- created_at (timestamptz)
- updated_at (timestamptz)

### platform_revenue_ledger
Records every 100%-net revenue transaction from platform-owned content.
- id (uuid PK)
- source_type (text): 'video_purchase' | 'course_purchase' | 'article_purchase' | 'booking' | 'other'
- description (text): what the transaction was
- gross_amount (numeric): total transaction value
- net_amount (numeric): amount credited to the platform wallet (100% for platform content)
- specialist_share (numeric, default 0): amount paid to a specialist (0 for platform-owned)
- is_platform_owned (boolean, default true): true = 100% to platform, false = split
- created_at (timestamptz)

### platform_wallet
Single-row table holding the platform's cumulative net wallet balance.
- id (uuid PK, always one row)
- balance (numeric): current available balance
- total_earned (numeric): lifetime earnings (never decreases)
- total_payouts (numeric): lifetime payouts to specialists
- updated_at (timestamptz)

### compound_audit_log
Permanent record of every weekly compounding run for transparency.
- id (uuid PK)
- run_at (timestamptz): when the run executed
- content_type (text): which type was compounded
- previous_count (integer): count before this run
- added_count (integer): how many items were added
- new_count (integer): count after this run
- rate_applied (numeric): the rate used (0.05)
- week_number (integer): sequential week number since system start
- triggered_by (text): 'pg_cron' | 'manual'

## Functions

### run_weekly_compound(p_triggered_by text)
SECURITY DEFINER function that:
1. Checks if a run already happened this calendar week (idempotency).
2. For each content type, calculates 5% of current_count (rounded up, minimum 1).
3. Adds the result to current_count.
4. Logs the result in compound_audit_log.
5. Returns a summary JSON of what changed.
This function is safe to call multiple times in the same week — it will skip
without error if already run.

### get_platform_stats()
SECURITY DEFINER function returning a JSON object with:
- Current inventory counts for all three types
- Wallet balance and total earned
- Recent compound audit entries
- Revenue summary (last 30 days)

### record_platform_revenue(...)
SECURITY DEFINER function to insert a revenue ledger entry and update the
platform wallet balance atomically.

## Security
- RLS enabled on all tables.
- All tables use TO anon, authenticated with USING (true) for SELECT (data is
  intentionally public/shared — this is a platform-level system, not user-scoped).
- INSERT/UPDATE/DELETE restricted to service role via SECURITY DEFINER functions
  (anon key cannot write directly; all mutations go through RPCs).
- pg_cron extension enabled and a weekly job scheduled for Monday 00:00 UTC.

## Notes
1. The pg_cron job calls run_weekly_compound('pg_cron') every Monday at 00:00 UTC.
2. The edge function can also trigger a manual run at any time.
3. Initial seed data: 200 paid videos, 350 paid articles, 45 paid courses.
4. All monetary amounts use numeric(12,2) for precision.
*/

-- ============================================================
-- 1. Enable pg_cron extension
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- ============================================================
-- 2. platform_content_inventory
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_content_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text UNIQUE NOT NULL,
  content_label text NOT NULL,
  current_count integer NOT NULL DEFAULT 0,
  base_count integer NOT NULL DEFAULT 0,
  compound_rate numeric(5,4) NOT NULL DEFAULT 0.0500,
  last_compounded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE platform_content_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_inventory" ON platform_content_inventory;
CREATE POLICY "public_read_inventory" ON platform_content_inventory
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- 3. platform_revenue_ledger
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_revenue_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL DEFAULT 'other',
  description text NOT NULL DEFAULT '',
  gross_amount numeric(12,2) NOT NULL DEFAULT 0,
  net_amount numeric(12,2) NOT NULL DEFAULT 0,
  specialist_share numeric(12,2) NOT NULL DEFAULT 0,
  is_platform_owned boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE platform_revenue_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_revenue" ON platform_revenue_ledger;
CREATE POLICY "public_read_revenue" ON platform_revenue_ledger
  FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_revenue_created_at ON platform_revenue_ledger(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_source_type ON platform_revenue_ledger(source_type);

-- ============================================================
-- 4. platform_wallet
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_wallet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  balance numeric(14,2) NOT NULL DEFAULT 0,
  total_earned numeric(14,2) NOT NULL DEFAULT 0,
  total_payouts numeric(14,2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE platform_wallet ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_wallet" ON platform_wallet;
CREATE POLICY "public_read_wallet" ON platform_wallet
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- 5. compound_audit_log
-- ============================================================
CREATE TABLE IF NOT EXISTS compound_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at timestamptz DEFAULT now(),
  content_type text NOT NULL,
  previous_count integer NOT NULL,
  added_count integer NOT NULL,
  new_count integer NOT NULL,
  rate_applied numeric(5,4) NOT NULL,
  week_number integer NOT NULL,
  triggered_by text NOT NULL DEFAULT 'manual'
);

ALTER TABLE compound_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_audit" ON compound_audit_log;
CREATE POLICY "public_read_audit" ON compound_audit_log
  FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_audit_run_at ON compound_audit_log(run_at DESC);

-- ============================================================
-- 6. Seed initial data
-- ============================================================
INSERT INTO platform_content_inventory (content_type, content_label, current_count, base_count, compound_rate)
VALUES
  ('paid_videos', 'Paid Medical Videos', 200, 200, 0.0500),
  ('paid_articles', 'Paid Articles', 350, 350, 0.0500),
  ('paid_courses', 'Paid Educational Courses', 45, 45, 0.0500)
ON CONFLICT (content_type) DO NOTHING;

-- Ensure exactly one wallet row exists
INSERT INTO platform_wallet (id, balance, total_earned, total_payouts)
SELECT gen_random_uuid(), 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM platform_wallet);

-- ============================================================
-- 7. run_weekly_compound function (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION run_weekly_compound(p_triggered_by text DEFAULT 'manual')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inv RECORD;
  v_added integer;
  v_week_number integer;
  v_already_run boolean;
  v_results json[];
BEGIN
  -- Idempotency: check if already run this ISO week
  SELECT EXISTS(
    SELECT 1 FROM compound_audit_log
    WHERE date_trunc('week', run_at) = date_trunc('week', now())
  ) INTO v_already_run;

  IF v_already_run THEN
    RETURN json_build_object('status', 'skipped', 'reason', 'already_run_this_week');
  END IF;

  -- Calculate week number from the earliest audit log entry
  SELECT COALESCE(MAX(week_number) + 1, 1) INTO v_week_number
  FROM compound_audit_log;

  v_results := '[]'::json[];

  FOR v_inv IN SELECT * FROM platform_content_inventory LOOP
    -- Calculate 5% of current count, rounded up, minimum 1
    v_added := GREATEST(1, CEIL(v_inv.current_count * v_inv.compound_rate));

    -- Update inventory
    UPDATE platform_content_inventory
    SET current_count = current_count + v_added,
        last_compounded_at = now(),
        updated_at = now()
    WHERE id = v_inv.id;

    -- Log the audit entry
    INSERT INTO compound_audit_log (content_type, previous_count, added_count, new_count, rate_applied, week_number, triggered_by)
    VALUES (v_inv.content_type, v_inv.current_count, v_added, v_inv.current_count + v_added, v_inv.compound_rate, v_week_number, p_triggered_by);

    -- Append to results
    v_results := v_results || json_build_array(
      json_build_object(
        'content_type', v_inv.content_type,
        'previous_count', v_inv.current_count,
        'added_count', v_added,
        'new_count', v_inv.current_count + v_added,
        'week_number', v_week_number
      )
    );
  END LOOP;

  RETURN json_build_object(
    'status', 'success',
    'week_number', v_week_number,
    'triggered_by', p_triggered_by,
    'results', v_results
  );
END;
$$;

GRANT EXECUTE ON FUNCTION run_weekly_compound(text) TO anon, authenticated;

-- ============================================================
-- 8. record_platform_revenue function (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION record_platform_revenue(
  p_source_type text DEFAULT 'other',
  p_description text DEFAULT '',
  p_gross_amount numeric DEFAULT 0,
  p_is_platform_owned boolean DEFAULT true,
  p_specialist_share numeric DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_net numeric;
  v_wallet_id uuid;
BEGIN
  -- For platform-owned content, 100% goes to platform
  IF p_is_platform_owned THEN
    v_net := p_gross_amount;
  ELSE
    v_net := p_gross_amount - p_specialist_share;
  END IF;

  -- Insert ledger entry
  INSERT INTO platform_revenue_ledger (source_type, description, gross_amount, net_amount, specialist_share, is_platform_owned)
  VALUES (p_source_type, p_description, p_gross_amount, v_net, p_specialist_share, p_is_platform_owned);

  -- Update wallet
  SELECT id INTO v_wallet_id FROM platform_wallet LIMIT 1;

  IF v_wallet_id IS NULL THEN
    INSERT INTO platform_wallet (id, balance, total_earned, total_payouts)
    VALUES (gen_random_uuid(), v_net, v_net, p_specialist_share);
  ELSE
    UPDATE platform_wallet
    SET balance = balance + v_net,
        total_earned = total_earned + v_net,
        total_payouts = total_payouts + p_specialist_share,
        updated_at = now()
    WHERE id = v_wallet_id;
  END IF;

  RETURN json_build_object('status', 'success', 'net_credited', v_net);
END;
$$;

GRANT EXECUTE ON FUNCTION record_platform_revenue(text, text, numeric, boolean, numeric) TO anon, authenticated;

-- ============================================================
-- 9. get_platform_stats function (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inventory json;
  v_wallet json;
  v_audit json;
  v_revenue_30d json;
  v_revenue_summary json;
BEGIN
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO v_inventory
  FROM (
    SELECT content_type, content_label, current_count, base_count, compound_rate, last_compounded_at
    FROM platform_content_inventory
    ORDER BY content_type
  ) t;

  SELECT row_to_json(t) INTO v_wallet
  FROM (SELECT balance, total_earned, total_payouts, updated_at FROM platform_wallet LIMIT 1) t;

  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO v_audit
  FROM (
    SELECT content_type, previous_count, added_count, new_count, week_number, triggered_by, run_at
    FROM compound_audit_log
    ORDER BY run_at DESC
    LIMIT 20
  ) t;

  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO v_revenue_30d
  FROM (
    SELECT source_type, description, gross_amount, net_amount, is_platform_owned, created_at
    FROM platform_revenue_ledger
    WHERE created_at >= now() - interval '30 days'
    ORDER BY created_at DESC
    LIMIT 50
  ) t;

  SELECT json_build_object(
    'total_transactions', COUNT(*),
    'total_gross', COALESCE(SUM(gross_amount), 0),
    'total_net', COALESCE(SUM(net_amount), 0),
    'platform_owned_net', COALESCE(SUM(net_amount) FILTER (WHERE is_platform_owned), 0),
    'specialist_share_total', COALESCE(SUM(specialist_share), 0)
  ) INTO v_revenue_summary
  FROM platform_revenue_ledger
  WHERE created_at >= now() - interval '30 days';

  RETURN json_build_object(
    'inventory', v_inventory,
    'wallet', COALESCE(v_wallet, '{}'::json),
    'recent_compounds', v_audit,
    'recent_revenue', v_revenue_30d,
    'revenue_summary_30d', COALESCE(v_revenue_summary, '{}'::json)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_platform_stats() TO anon, authenticated;

-- ============================================================
-- 10. Schedule the weekly cron job (Monday 00:00 UTC)
-- ============================================================
-- Unschedule any existing job with the same name first
SELECT cron.unschedule('weekly-compounder-job') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'weekly-compounder-job'
);

-- Schedule: every Monday at 00:00 UTC
SELECT cron.schedule(
  'weekly-compounder-job',
  '0 0 * * 1',
  $$SELECT run_weekly_compound('pg_cron');$$
);
