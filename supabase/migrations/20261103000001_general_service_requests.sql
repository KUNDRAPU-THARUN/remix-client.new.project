-- =============================================================================
-- KAARYAN LABS — MULTI-CITY PLATFORM DATABASE MIGRATION
-- Migration Version: 20261103000001
-- Name: 20261103000001_general_service_requests.sql
-- Description: Decouple public homepage service quote requests from single-business customer enquiries.
-- Context:
--   public.customer_enquiries strictly enforces:
--     business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE
--   Public homepage enquiries do not have a preselected business_id. Fabricating 
--   a dummy business ID breaks foreign key integrity or pollutes business tables.
--   This table provides a clean, schema-correct target for general city service leads.
-- Security Standards:
--   - Strict multi-city foreign key referencing public.cities(id)
--   - Abuse & format constraints enforced at PostgreSQL engine level
--   - Zero anonymous read access (private customer leads never exposed)
--   - Zero unassigned merchant access (unrelated business owners cannot browse leads)
--   - Explicit PostgREST API role grants
-- Status: PREPARED FOR BACKEND ACTIVATION (DO NOT APPLY AUTOMATICALLY)
-- =============================================================================

-- 1. TABLE CREATION
CREATE TABLE IF NOT EXISTS public.general_service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id TEXT NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
    category_id TEXT NOT NULL,
    area_id TEXT NOT NULL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'routed', 'contacted', 'resolved', 'archived')),
    assigned_business_ids UUID[] DEFAULT ARRAY[]::UUID[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),

    -- Abuse Prevention & Input Validation Constraints
    CONSTRAINT chk_gen_req_name_len CHECK (char_length(trim(customer_name)) BETWEEN 2 AND 100),
    CONSTRAINT chk_gen_req_phone_len CHECK (char_length(trim(customer_phone)) BETWEEN 10 AND 20),
    CONSTRAINT chk_gen_req_msg_len CHECK (char_length(trim(message)) BETWEEN 5 AND 2000),
    CONSTRAINT chk_gen_req_phone_fmt CHECK (customer_phone ~ '^[0-9+ -]{10,20}$')
);

-- 2. DOCUMENTATION COMMENTS
COMMENT ON TABLE public.general_service_requests IS 'Customer-initiated general service quote requests across city hubs, routed to category-matched merchants.';
COMMENT ON COLUMN public.general_service_requests.city_id IS 'Operating territory foreign key matching public.cities(id)';
COMMENT ON COLUMN public.general_service_requests.customer_id IS 'Optional reference to auth.users(id) if customer was signed in';
COMMENT ON COLUMN public.general_service_requests.status IS 'Lead lifecycle state: pending, routed, contacted, resolved, archived';
COMMENT ON COLUMN public.general_service_requests.assigned_business_ids IS 'Array of merchant UUIDs who received this lead notification';

-- 3. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_gen_req_city_status 
ON public.general_service_requests (city_id, status);

CREATE INDEX IF NOT EXISTS idx_gen_req_city_category 
ON public.general_service_requests (city_id, category_id);

CREATE INDEX IF NOT EXISTS idx_gen_req_created_at 
ON public.general_service_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gen_req_customer 
ON public.general_service_requests (customer_id) 
WHERE customer_id IS NOT NULL;

-- 4. PERMISSIONS / ROLE GRANTS (Required for Supabase PostgREST API)
GRANT SELECT, INSERT ON TABLE public.general_service_requests TO anon, authenticated;
GRANT UPDATE ON TABLE public.general_service_requests TO authenticated;
GRANT ALL ON TABLE public.general_service_requests TO service_role;

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.general_service_requests ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 5A. INSERT PRIVILEGES (Public Anonymous & Authenticated Visitors)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public anonymous insert of general service requests" ON public.general_service_requests;
CREATE POLICY "Public anonymous insert of general service requests"
ON public.general_service_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
    char_length(trim(customer_name)) >= 2 AND
    char_length(trim(customer_name)) <= 100 AND
    char_length(trim(customer_phone)) >= 10 AND
    char_length(trim(customer_phone)) <= 20 AND
    customer_phone ~ '^[0-9+ -]{10,20}$' AND
    char_length(trim(message)) >= 5 AND
    char_length(trim(message)) <= 2000 AND
    status = 'pending' AND
    assigned_business_ids = ARRAY[]::UUID[]
);

-- -----------------------------------------------------------------------------
-- 5B. READ RESTRICTIONS (Strict Lead Privacy & Zero Public Exposure)
-- -----------------------------------------------------------------------------
-- Policy: Super Admins & City Franchise Operators have territory visibility
DROP POLICY IF EXISTS "Staff and franchise operators can view territory requests" ON public.general_service_requests;
CREATE POLICY "Staff and franchise operators can view territory requests"
ON public.general_service_requests
FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'city_franchise', general_service_requests.city_id)
);

-- Policy: Business owners can ONLY view leads explicitly assigned/routed to them
-- Unrelated business owners have ZERO visibility into other leads
DROP POLICY IF EXISTS "Assigned business owners can view routed leads" ON public.general_service_requests;
CREATE POLICY "Assigned business owners can view routed leads"
ON public.general_service_requests
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.businesses b
        WHERE b.owner_id = auth.uid()
          AND b.id = ANY(general_service_requests.assigned_business_ids)
          AND b.status = 'active'
    )
);

-- Policy: Signed-in customer who submitted the enquiry can view their own submission
DROP POLICY IF EXISTS "Customers can view their own submitted general enquiries" ON public.general_service_requests;
CREATE POLICY "Customers can view their own submitted general enquiries"
ON public.general_service_requests
FOR SELECT
TO authenticated
USING (
    customer_id IS NOT NULL 
    AND customer_id = auth.uid()
);

-- -----------------------------------------------------------------------------
-- 5C. UPDATE PRIVILEGES (Routing & Lead Lifecycle Management)
-- -----------------------------------------------------------------------------
-- Policy: Staff & Franchise Operators can route and update lead status
DROP POLICY IF EXISTS "Staff and franchise can update lead status and assignments" ON public.general_service_requests;
CREATE POLICY "Staff and franchise can update lead status and assignments"
ON public.general_service_requests
FOR UPDATE
TO authenticated
USING (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'city_franchise', general_service_requests.city_id)
)
WITH CHECK (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'city_franchise', general_service_requests.city_id)
);

-- Policy: Assigned Business Owners can update status to contacted/resolved
DROP POLICY IF EXISTS "Assigned merchants can update lead progress" ON public.general_service_requests;
CREATE POLICY "Assigned merchants can update lead progress"
ON public.general_service_requests
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.businesses b
        WHERE b.owner_id = auth.uid()
          AND b.id = ANY(general_service_requests.assigned_business_ids)
          AND b.status = 'active'
    )
)
WITH CHECK (
    status IN ('contacted', 'resolved')
);

-- -----------------------------------------------------------------------------
-- 5D. DELETE PRIVILEGES (Super Admin Only)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Only super admin may delete general service requests" ON public.general_service_requests;
CREATE POLICY "Only super admin may delete general service requests"
ON public.general_service_requests
FOR DELETE
TO authenticated
USING (
    public.has_role(auth.uid(), 'super_admin')
);

-- 6. AUTOMATIC UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_general_service_requests_updated_at ON public.general_service_requests;
CREATE TRIGGER set_general_service_requests_updated_at
    BEFORE UPDATE ON public.general_service_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

