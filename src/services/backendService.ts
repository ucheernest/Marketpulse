import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { FieldSubmission, AuditLogEntry, UserRole } from '../types';

export const SUPABASE_SCHEMA_SQL = `-- =========================================================================
-- MARKETPULSE NIGERIA: PRODUCTION DATABASE SCHEMA & SECURITY POLICIES (RLS)
-- Copy and paste this script directly into your Supabase Project SQL Editor
-- =========================================================================

-- 1. Create Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'consumer' CHECK (role IN ('consumer', 'agent', 'admin', 'super_admin')),
  city TEXT DEFAULT 'Port Harcourt',
  reputation_score INT DEFAULT 85,
  verifications_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Field Submissions Table
CREATE TABLE IF NOT EXISTS public.field_submissions (
  id TEXT PRIMARY KEY,
  submission_number TEXT UNIQUE NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  market_id TEXT NOT NULL,
  market_name TEXT NOT NULL,
  city TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity INT DEFAULT 1,
  unit TEXT NOT NULL,
  seller_stall TEXT,
  photo_url TEXT,
  gps_lat NUMERIC,
  gps_lng NUMERIC,
  gps_accuracy_meters NUMERIC,
  exif_timestamp TIMESTAMPTZ DEFAULT NOW(),
  exif_matches_location BOOLEAN DEFAULT TRUE,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  agent_reputation INT DEFAULT 90,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged', 'recheck_requested')),
  system_confidence INT DEFAULT 92,
  anomaly_flag BOOLEAN DEFAULT FALSE,
  anomaly_reason TEXT,
  review_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- 3. Create System & Security Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  action TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  market_name TEXT,
  city TEXT,
  status TEXT NOT NULL,
  confidence_score INT,
  price NUMERIC,
  details TEXT
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Define Public & Authenticated Access Policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view approved submissions" 
  ON public.field_submissions FOR SELECT USING (true);

CREATE POLICY "Agents can insert new submissions" 
  ON public.field_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update verification status" 
  ON public.field_submissions FOR UPDATE USING (true);

CREATE POLICY "Audit logs are viewable by authenticated users" 
  ON public.audit_logs FOR SELECT USING (true);

CREATE POLICY "System can record audit logs" 
  ON public.audit_logs FOR INSERT WITH CHECK (true);

-- 6. Storage Bucket for Photo Evidence
INSERT INTO storage.buckets (id, name, public) 
VALUES ('price-evidence', 'price-evidence', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Read Access for Verification Photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'price-evidence');

CREATE POLICY "Authenticated & Agent Upload Access"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'price-evidence');
`;

/**
 * Upload evidence photo to Supabase Storage bucket 'price-evidence'
 */
export async function uploadEvidencePhoto(
  fileOrBase64: File | string,
  submissionId: string = `sub-${Date.now()}`
): Promise<{ url: string; error?: string }> {
  const supabase = getSupabase();

  if (!supabase || !isSupabaseConfigured) {
    // If Supabase is not configured, return the base64 or local object URL
    if (typeof fileOrBase64 === 'string') {
      return { url: fileOrBase64 };
    }
    return { url: URL.createObjectURL(fileOrBase64) };
  }

  try {
    const fileName = `${submissionId}-${Date.now()}.jpg`;
    let fileBody: Blob | File;

    if (typeof fileOrBase64 === 'string') {
      // Convert Data URL / base64 string to Blob
      const res = await fetch(fileOrBase64);
      fileBody = await res.blob();
    } else {
      fileBody = fileOrBase64;
    }

    const { data, error } = await supabase.storage
      .from('price-evidence')
      .upload(fileName, fileBody, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.warn('Supabase storage upload error:', error);
      // Fallback to string if available
      return {
        url: typeof fileOrBase64 === 'string' ? fileOrBase64 : URL.createObjectURL(fileOrBase64),
        error: error.message,
      };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('price-evidence')
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl };
  } catch (err: any) {
    console.error('Error during photo upload:', err);
    return {
      url: typeof fileOrBase64 === 'string' ? fileOrBase64 : '',
      error: err?.message || 'Storage upload failed',
    };
  }
}

/**
 * Real-time cloud submission synchronization
 */
export async function syncSubmissionToCloud(
  submission: FieldSubmission
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    const { error } = await supabase.from('field_submissions').upsert({
      id: submission.id,
      submission_number: submission.submissionNumber,
      product_id: submission.productId,
      product_name: submission.productName,
      market_id: submission.marketId,
      market_name: submission.marketName,
      city: submission.city,
      price: submission.price,
      quantity: submission.quantity,
      unit: submission.unit,
      seller_stall: submission.sellerStall,
      photo_url: submission.photoUrl,
      gps_lat: submission.gpsLocation?.lat,
      gps_lng: submission.gpsLocation?.lng,
      gps_accuracy_meters: 10,
      exif_timestamp: submission.timestamp,
      exif_matches_location: submission.exifMatched,
      agent_id: submission.agentId,
      agent_name: submission.agentName,
      agent_reputation: submission.agentReputation,
      status: submission.status,
      system_confidence: submission.systemConfidence,
      anomaly_flag: submission.systemRecommendation !== 'Likely Valid',
      anomaly_reason: submission.anomalyNote || null,
      review_notes: null,
      submitted_at: submission.submittedAt,
      reviewed_at: null,
    });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.warn('Cloud submission sync failed:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Record an audit log entry in Supabase cloud
 */
export async function recordCloudAuditLog(
  log: AuditLogEntry
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    const { error } = await supabase.from('audit_logs').insert({
      id: log.id,
      timestamp: log.timestamp,
      action: log.action,
      actor_id: log.actorId,
      actor_name: log.actorName,
      actor_role: log.actorRole,
      entity_type: log.entityType,
      entity_id: log.entityId,
      entity_name: log.entityName,
      market_name: log.marketName,
      city: log.city,
      status: log.status,
      confidence_score: log.confidenceScore,
      price: log.price,
      details: log.details,
    });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.warn('Cloud audit log sync failed:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Authentication handlers (Supabase Auth)
 */
export type DatabaseRole = 'public_user' | 'field_agent' | 'verifier_admin' | 'super_admin';

export async function getAuthenticatedProfile() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured yet');

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id,email,full_name,role,preferred_city,is_active')
    .eq('id', user.id)
    .single();

  if (profileError) throw profileError;
  return profile as {
    id: string;
    email: string | null;
    full_name: string;
    role: DatabaseRole;
    preferred_city: string;
    is_active: boolean;
  };
}

export async function signUpWithSupabase(
  email: string,
  pass: string,
  fullName: string,
  city: string = 'Port Harcourt'
) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured yet');

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password: pass,
    options: {
      data: {
        full_name: fullName.trim(),
        city,
      },
    },
  });

  if (error) throw error;
  // The database trigger creates the public.profiles row and always assigns
  // new users the non-privileged `public_user` role.
  return data;
}

export async function signInWithSupabase(email: string, pass: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured yet');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: pass,
  });

  if (error) throw error;

  const profile = await getAuthenticatedProfile();
  if (profile && !profile.is_active) {
    await supabase.auth.signOut();
    throw new Error('This MarketPulse account is currently inactive.');
  }

  return { ...data, profile };
}

export async function signOutSupabase() {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
}
