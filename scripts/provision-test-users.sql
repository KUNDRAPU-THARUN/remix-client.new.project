-- Provision Dev Test Users for Phase 4B Integration & Security Verification
DO $$
DECLARE
    v_cust_id uuid := gen_random_uuid();
    v_owner_id uuid := gen_random_uuid();
BEGIN
    -- Customer
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'dev.customer@kaaryanlabs.com') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_cust_id,
            'authenticated',
            'authenticated',
            'dev.customer@kaaryanlabs.com',
            crypt('DevTestPassword123!#', gen_salt('bf')),
            now(),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            '{"display_name": "Dev Customer", "phone": "+91 94401 23456", "role": "customer", "city_id": "chittoor"}'::jsonb,
            now(),
            now()
        );
    END IF;

    -- Business Owner
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'dev.owner@kaaryanlabs.com') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_owner_id,
            'authenticated',
            'authenticated',
            'dev.owner@kaaryanlabs.com',
            crypt('DevTestPassword123!#', gen_salt('bf')),
            now(),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            '{"display_name": "Dev Owner", "phone": "+91 98480 98765", "role": "business_owner", "city_id": "chittoor"}'::jsonb,
            now(),
            now()
        );
    END IF;
END $$;

