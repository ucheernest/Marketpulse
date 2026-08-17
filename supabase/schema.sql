-- ==============================================================================
-- MARKETPULSE POSTGRESQL / SUPABASE DATABASE SCHEMA (v0.1)
-- ==============================================================================
-- Core Tables:
-- 1. users & auth
-- 2. agents
-- 3. categories
-- 4. brands
-- 5. pack_sizes
-- 6. products
-- 7. markets
-- 8. stores_vendors
-- 9. price_observations
-- 10. evidence_photos
-- 11. confidence_scores
-- 12. verification_records
-- 13. reports
-- 14. audit_logs
-- ==============================================================================

-- Enable UUID and PostGIS extensions if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USER ROLES ENUM
DO $$ BEGIN
  CREATE TYPE app_user_role AS ENUM (
    'public_user',
    'field_agent',
    'verifier_admin',
    'super_admin'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. USERS TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  role app_user_role NOT NULL DEFAULT 'public_user',
  avatar_url TEXT,
  preferred_city TEXT DEFAULT 'Port Harcourt',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. AGENTS TABLE (Field Data Collectors & Verifiers)
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent_code VARCHAR(20) UNIQUE NOT NULL,
  level VARCHAR(30) NOT NULL DEFAULT 'Level 1 Verifier',
  reputation_score NUMERIC(5, 2) NOT NULL DEFAULT 85.00 CHECK (reputation_score BETWEEN 0 AND 100),
  total_submissions INTEGER NOT NULL DEFAULT 0,
  verified_submissions INTEGER NOT NULL DEFAULT 0,
  rejected_submissions INTEGER NOT NULL DEFAULT 0,
  assigned_market_ids UUID[] DEFAULT '{}',
  bounty_balance_ngn NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  is_field_active BOOLEAN NOT NULL DEFAULT true,
  last_checkin_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_name VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. BRANDS TABLE
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  manufacturer VARCHAR(200),
  country_of_origin VARCHAR(100) DEFAULT 'Nigeria',
  is_local BOOLEAN DEFAULT true,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PACK SIZES TABLE
CREATE TABLE IF NOT EXISTS public.pack_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  size_label VARCHAR(100) NOT NULL, -- e.g. "50kg Bag", "Painter (4L)", "1kg", "Crate"
  standard_unit VARCHAR(50) NOT NULL, -- e.g. "kg", "liter", "piece", "crate"
  unit_multiplier NUMERIC(10, 3) NOT NULL DEFAULT 1.000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. MARKETS TABLE
CREATE TABLE IF NOT EXISTS public.markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT 'Port Harcourt',
  state VARCHAR(100) NOT NULL DEFAULT 'Rivers State',
  country VARCHAR(100) NOT NULL DEFAULT 'Nigeria',
  address TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  geofence_radius_meters INTEGER NOT NULL DEFAULT 350,
  operating_hours VARCHAR(100) DEFAULT '6:00 AM - 6:30 PM',
  health_score NUMERIC(5, 2) NOT NULL DEFAULT 90.00,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. STORES / VENDORS TABLE
CREATE TABLE IF NOT EXISTS public.stores_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  vendor_name VARCHAR(150),
  stall_number VARCHAR(100) NOT NULL,
  line_section VARCHAR(100), -- e.g. "Grains & Cereals Lane", "Butchery Alley"
  vendor_phone VARCHAR(50),
  reliability_score NUMERIC(5, 2) DEFAULT 90.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PRODUCTS TABLE (Commodity Catalog)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) UNIQUE,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  pack_size_id UUID REFERENCES public.pack_sizes(id) ON DELETE SET NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'kg',
  is_local_or_imported VARCHAR(20) DEFAULT 'Local',
  image_url TEXT,
  current_avg_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  price_low NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  price_high NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  price_change_percent NUMERIC(6, 2) DEFAULT 0.00,
  price_change_direction VARCHAR(10) DEFAULT 'neutral',
  confidence_score NUMERIC(5, 2) NOT NULL DEFAULT 90.00,
  observations_count INTEGER DEFAULT 0,
  markets_count INTEGER DEFAULT 0,
  market_insight TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PRICE OBSERVATIONS TABLE (Field Agent Reports & Ingests)
CREATE TABLE IF NOT EXISTS public.price_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_number VARCHAR(50) UNIQUE NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  store_vendor_id UUID REFERENCES public.stores_vendors(id) ON DELETE SET NULL,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE RESTRICT,
  price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
  unit VARCHAR(50) NOT NULL,
  seller_stall_desc TEXT,
  observation_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  gps_latitude NUMERIC(10, 7) NOT NULL,
  gps_longitude NUMERIC(10, 7) NOT NULL,
  gps_accuracy_meters NUMERIC(6, 2),
  gps_distance_to_market_meters NUMERIC(8, 2),
  status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected', 'flagged', 'recheck_requested'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. EVIDENCE PHOTOS TABLE
CREATE TABLE IF NOT EXISTS public.evidence_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES public.price_observations(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type VARCHAR(50) DEFAULT 'image/jpeg',
  exif_timestamp TIMESTAMPTZ,
  exif_latitude NUMERIC(10, 7),
  exif_longitude NUMERIC(10, 7),
  exif_matched BOOLEAN DEFAULT true,
  ocr_extracted_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. CONFIDENCE SCORES TABLE (Verification Engine Output)
CREATE TABLE IF NOT EXISTS public.confidence_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES public.price_observations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  composite_score NUMERIC(5, 2) NOT NULL CHECK (composite_score BETWEEN 0 AND 100),
  gps_score NUMERIC(5, 2) NOT NULL,
  timestamp_score NUMERIC(5, 2) NOT NULL,
  evidence_score NUMERIC(5, 2) NOT NULL,
  agent_reputation_score NUMERIC(5, 2) NOT NULL,
  outlier_score NUMERIC(5, 2) NOT NULL,
  duplicate_score NUMERIC(5, 2) NOT NULL,
  is_outlier BOOLEAN DEFAULT false,
  is_duplicate BOOLEAN DEFAULT false,
  system_recommendation VARCHAR(50) NOT NULL DEFAULT 'Likely Valid', -- 'Likely Valid', 'Potential Anomaly', 'Needs Recheck'
  anomaly_reasons JSONB DEFAULT '[]'::jsonb,
  algorithm_version VARCHAR(20) NOT NULL DEFAULT 'v1.0.0',
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. VERIFICATION RECORDS TABLE (Admin / Verifier Audits)
CREATE TABLE IF NOT EXISTS public.verification_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES public.price_observations(id) ON DELETE CASCADE,
  verifier_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  action VARCHAR(30) NOT NULL, -- 'approved', 'rejected', 'recheck_requested', 'auto_approved'
  previous_status VARCHAR(30) NOT NULL,
  new_status VARCHAR(30) NOT NULL,
  decision_reason TEXT,
  admin_notes TEXT,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. REPORTS TABLE (Community / Shopper Price Inaccuracies)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  reported_price NUMERIC(12, 2) NOT NULL,
  discrepancy_reason VARCHAR(150) NOT NULL,
  notes TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'under_investigation', -- 'under_investigation', 'resolved', 'dismissed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  actor_role app_user_role,
  action_type VARCHAR(100) NOT NULL, -- e.g. 'PRICE_SUBMITTED', 'PRICE_VERIFIED', 'ANOMALY_FLAGGED', 'ROLE_CHANGED'
  entity_table VARCHAR(100) NOT NULL,
  entity_id UUID,
  ip_address VARCHAR(45),
  user_agent TEXT,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_price_observations_prod ON public.price_observations(product_id);
CREATE INDEX IF NOT EXISTS idx_price_observations_market ON public.price_observations(market_id);
CREATE INDEX IF NOT EXISTS idx_price_observations_status ON public.price_observations(status);
CREATE INDEX IF NOT EXISTS idx_price_observations_created ON public.price_observations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_confidence_scores_obs ON public.confidence_scores(observation_id);
CREATE INDEX IF NOT EXISTS idx_reports_product ON public.reports(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confidence_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read active products; Admins/SuperAdmins can write
CREATE POLICY "Public users can view active products" 
  ON public.products FOR SELECT USING (is_active = true);

-- Markets: Everyone can view active markets
CREATE POLICY "Public users can view active markets" 
  ON public.markets FOR SELECT USING (is_active = true);

-- Price Observations: Public can view verified; Agents can view own; Admins can view all
CREATE POLICY "Public can view verified observations" 
  ON public.price_observations FOR SELECT USING (status = 'verified');

CREATE POLICY "Agents can create observations" 
  ON public.price_observations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ==============================================================================
-- REALTIME PUBLICATION SUBSCRIPTIONS
-- ==============================================================================
-- Enable Realtime broadcasting for live price feeds & admin verification
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.price_observations;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.confidence_scores;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;
