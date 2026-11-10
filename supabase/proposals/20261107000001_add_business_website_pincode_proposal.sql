-- =============================================================================
-- KAARYAN LABS — ADDITIVE MIGRATION PROPOSAL (PHASE C)
-- Migration: 20261107000001_add_business_website_pincode_proposal.sql
-- Status: PROPOSED (DO NOT APPLY REMOTELY WITHOUT CLIENT APPROVAL)
-- Safety: Additive only. No existing columns, constraints, or RLS policies altered.
-- Target: Supabase PostgreSQL (public.businesses)
-- =============================================================================

-- Purpose:
-- Adds optional metadata columns (website, pincode, subcategory) to support
-- legacy business data migration from velloreads.com and complete business discovery
-- across all three city platforms (Chittoor AP-03, Vellore TN-23, Bengaluru KA-01).

DO $$
BEGIN
    -- 1. Add official website URL column if not already present
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'businesses'
          AND column_name = 'website'
    ) THEN
        ALTER TABLE public.businesses ADD COLUMN website TEXT;
        COMMENT ON COLUMN public.businesses.website IS 'Verified external website URL for the business merchant';
    END IF;

    -- 2. Add postal pincode column if not already present
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'businesses'
          AND column_name = 'pincode'
    ) THEN
        ALTER TABLE public.businesses ADD COLUMN pincode VARCHAR(20);
        COMMENT ON COLUMN public.businesses.pincode IS 'Postal PIN code (e.g. 632001 to 632014 for Vellore)';
    END IF;

    -- 3. Add fine-grained trade subcategory column if not already present
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'businesses'
          AND column_name = 'subcategory'
    ) THEN
        ALTER TABLE public.businesses ADD COLUMN subcategory TEXT;
        COMMENT ON COLUMN public.businesses.subcategory IS 'Specific commercial specialty or legacy trade category';
    END IF;
END $$;

-- 4. Create index on pincode for fast geographic search within city territory
CREATE INDEX IF NOT EXISTS idx_businesses_pincode ON public.businesses(pincode);

-- 5. Create index on subcategory for granular filtering
CREATE INDEX IF NOT EXISTS idx_businesses_subcategory ON public.businesses(subcategory);

