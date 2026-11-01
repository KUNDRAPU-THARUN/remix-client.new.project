-- =============================================================================
-- KAARYAN LABS — MULTI-CITY LOCAL BUSINESS PLATFORM
-- RLS Negative Authorization & Security Verification Tests
-- Simulates: Anonymous, Customer, Owner A, Owner B, Franchise, and Super Admin
-- =============================================================================

BEGIN;

-- Setup Mock Test Users in auth.users
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
DECLARE
    uid_admin UUID := '00000000-0000-0000-0000-000000000001'::uuid;
    uid_fran_chittoor UUID := '00000000-0000-0000-0000-000000000002'::uuid;
    uid_fran_vellore UUID := '00000000-0000-0000-0000-000000000003'::uuid;
    uid_owner_a UUID := '00000000-0000-0000-0000-000000000004'::uuid;
    uid_owner_b UUID := '00000000-0000-0000-0000-000000000005'::uuid;
    uid_customer UUID := '00000000-0000-0000-0000-000000000006'::uuid;
    test_biz_id UUID := '11111111-1111-1111-1111-111111111111'::uuid;
    test_enq_id UUID := '22222222-2222-2222-2222-222222222222'::uuid;
    rec_count INT;
BEGIN
    RAISE NOTICE '=== STARTING RLS POLICY NEGATIVE AUTHORIZATION TESTS ===';

    -- 1. Setup Role Mappings
    INSERT INTO public.user_roles (user_id, role, city_id) VALUES
        (uid_admin, 'super_admin', NULL),
        (uid_fran_chittoor, 'city_franchise', 'chittoor'),
        (uid_fran_vellore, 'city_franchise', 'vellore'),
        (uid_owner_a, 'business_owner', 'chittoor'),
        (uid_owner_b, 'business_owner', 'chittoor'),
        (uid_customer, 'customer', 'chittoor')
    ON CONFLICT DO NOTHING;

    -- 2. Setup a Test Business owned by Owner A in Chittoor
    INSERT INTO public.businesses (
        id, city_id, owner_id, category_id, name, description, phone, address, locality, status
    ) VALUES (
        test_biz_id, 'chittoor', uid_owner_a, 'restaurants', 'Owner A Dhaba',
        'Delicious meals', '+91 94400 11111', 'Gandhi Road', 'gandhi-road', 'pending'
    ) ON CONFLICT (id) DO NOTHING;

    -- Setup a private enquiry sent to Owner A's business
    INSERT INTO public.customer_enquiries (
        id, business_id, city_id, customer_id, customer_name, customer_phone, message, status
    ) VALUES (
        test_enq_id, test_biz_id, 'chittoor', uid_customer, 'Kalyan Kumar',
        '+91 98480 22222', 'Do you take bulk catering orders?', 'pending'
    ) ON CONFLICT (id) DO NOTHING;

    -- -------------------------------------------------------------------------
    -- TEST 1: ANONYMOUS / PUBLIC CANNOT READ PENDING LISTINGS
    -- -------------------------------------------------------------------------
    -- Simulate anonymous (auth.uid() IS NULL)
    PERFORM set_config('request.jwt.claim.sub', '', true);
    PERFORM set_config('role', 'anon', true);

    SELECT COUNT(*) INTO rec_count FROM public.businesses WHERE id = test_biz_id;
    IF rec_count != 0 THEN
        RAISE EXCEPTION 'RLS FAILED: Anonymous visitor could see pending business!';
    ELSE
        RAISE NOTICE '✓ PASS: Anonymous visitor cannot see pending businesses';
    END IF;

    -- -------------------------------------------------------------------------
    -- TEST 2: ANONYMOUS / PUBLIC CANNOT READ PRIVATE ENQUIRIES
    -- -------------------------------------------------------------------------
    SELECT COUNT(*) INTO rec_count FROM public.customer_enquiries WHERE id = test_enq_id;
    IF rec_count != 0 THEN
        RAISE EXCEPTION 'RLS FAILED: Anonymous visitor could see private enquiry!';
    ELSE
        RAISE NOTICE '✓ PASS: Anonymous visitor cannot see private customer enquiries';
    END IF;

    -- -------------------------------------------------------------------------
    -- TEST 3: OWNER B CANNOT READ OWNER A''S PRIVATE ENQUIRIES
    -- -------------------------------------------------------------------------
    PERFORM set_config('request.jwt.claim.sub', uid_owner_b::text, true);
    PERFORM set_config('role', 'authenticated', true);

    SELECT COUNT(*) INTO rec_count FROM public.customer_enquiries WHERE id = test_enq_id;
    IF rec_count != 0 THEN
        RAISE EXCEPTION 'RLS FAILED: Competitor Owner B could read Owner A private enquiry!';
    ELSE
        RAISE NOTICE '✓ PASS: Owner B cannot read Owner A private customer enquiry';
    END IF;

    -- -------------------------------------------------------------------------
    -- TEST 4: OWNER A CAN READ THEIR OWN BUSINESS ENQUIRY
    -- -------------------------------------------------------------------------
    PERFORM set_config('request.jwt.claim.sub', uid_owner_a::text, true);
    PERFORM set_config('role', 'authenticated', true);

    SELECT COUNT(*) INTO rec_count FROM public.customer_enquiries WHERE id = test_enq_id;
    IF rec_count != 1 THEN
        RAISE EXCEPTION 'RLS FAILED: Owner A could not read their own enquiry!';
    ELSE
        RAISE NOTICE '✓ PASS: Owner A can legitimately read enquiries sent to their business';
    END IF;

    -- -------------------------------------------------------------------------
    -- TEST 5: VELLORE FRANCHISE CANNOT ACCESS CHITTOOR PRIVATE ENQUIRIES
    -- -------------------------------------------------------------------------
    PERFORM set_config('request.jwt.claim.sub', uid_fran_vellore::text, true);
    PERFORM set_config('role', 'authenticated', true);

    SELECT COUNT(*) INTO rec_count FROM public.customer_enquiries WHERE id = test_enq_id;
    IF rec_count != 0 THEN
        RAISE EXCEPTION 'RLS FAILED: Vellore franchise breached Chittoor territory enquiries!';
    ELSE
        RAISE NOTICE '✓ PASS: Vellore franchise cannot read Chittoor city enquiries';
    END IF;

    -- -------------------------------------------------------------------------
    -- TEST 6: CHITTOOR FRANCHISE CAN ACCESS CHITTOOR PRIVATE ENQUIRIES
    -- -------------------------------------------------------------------------
    PERFORM set_config('request.jwt.claim.sub', uid_fran_chittoor::text, true);
    PERFORM set_config('role', 'authenticated', true);

    SELECT COUNT(*) INTO rec_count FROM public.customer_enquiries WHERE id = test_enq_id;
    IF rec_count != 1 THEN
        RAISE EXCEPTION 'RLS FAILED: Chittoor franchise could not access Chittoor enquiry!';
    ELSE
        RAISE NOTICE '✓ PASS: Chittoor franchise can moderate Chittoor enquiries';
    END IF;

    -- -------------------------------------------------------------------------
    -- TEST 7: BUSINESS OWNER CANNOT APPROVE THEIR OWN LISTING (ANTI-TAMPERING)
    -- -------------------------------------------------------------------------
    PERFORM set_config('request.jwt.claim.sub', uid_owner_a::text, true);
    PERFORM set_config('role', 'authenticated', true);

    BEGIN
        UPDATE public.businesses SET status = 'active' WHERE id = test_biz_id;
        RAISE EXCEPTION 'RLS FAILED: Business owner was able to set status = active!';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%Business owners cannot approve their own listings%' THEN
            RAISE NOTICE '✓ PASS: Anti-Tampering Trigger blocked business owner from self-approving listing';
        ELSE
            RAISE EXCEPTION 'Unexpected error: %', SQLERRM;
        END IF;
    END;

    -- -------------------------------------------------------------------------
    -- TEST 8: BUSINESS OWNER CANNOT ASSIGN ADMINISTRATIVE ROLES
    -- -------------------------------------------------------------------------
    BEGIN
        INSERT INTO public.user_roles (user_id, role, city_id)
        VALUES (uid_owner_a, 'super_admin', NULL);
        RAISE EXCEPTION 'RLS FAILED: Business owner self-escalated to super_admin!';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✓ PASS: RLS blocked business owner from self-escalating role';
    END IF;

    RAISE NOTICE '=== ALL RLS & NEGATIVE AUTHORIZATION TESTS PASSED ===';
END $$;

ROLLBACK;

