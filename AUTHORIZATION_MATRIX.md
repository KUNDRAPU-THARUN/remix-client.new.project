# KAARYAN LABS — AUTHORIZATION MATRIX & ACCESS CONTROL SPECIFICATION
## Multi-City Platform Security Architecture

**Framework:** Supabase Auth + PostgreSQL Row Level Security (RLS) + Database Triggers
**Security Boundary:** Multi-Tenant, Multi-City Isolation with Anti-Tampering Enforcement

---

## 1. User Roles Definition

| Role ID | Scope | Provisioning Method | Description |
| :--- | :--- | :--- | :--- |
| **`anonymous`** | Public | Default unauthenticated state | Visitors browsing the public directory and viewing active listings. |
| **`customer`** | User Account | Self-service registration | Registered citizens who can submit direct enquiries, write reviews, and save bookmarks. |
| **`business_owner`** | Merchant Account | Self-service registration | Verified local business owners who manage their company profiles and view private customer leads. |
| **`data_entry_staff`** | City Scoped | Admin / Franchise provisioned | Operational operators who assist in drafting and transcribing local business listings. |
| **`city_franchise`** | City Scoped | Super Admin provisioned | Regional territory operators managing listing approvals, moderation, and local leads for an assigned city. |
| **`super_admin`** | Global | Root / Executive provisioned | Platform administrators with global platform oversight, territory provisioning, and role assignment permissions. |

---

## 2. Comprehensive Permissions Matrix

| Entity / Action | Anonymous | Customer | Business Owner | Data Entry Staff | City Franchise | Super Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Cities** | | | | | | |
| • View active cities | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| • Create/Edit/Delete cities | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Categories** | | | | | | |
| • View categories | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| • Create/Edit/Delete categories | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Business Listings** | | | | | | |
| • View active listings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| • View pending listings | ❌ | ❌ | ✅ (Own only) | ✅ (Assigned city) | ✅ (Assigned city) | ✅ (All) |
| • Submit new listing | ❌ | ❌ | ✅ (Pending only) | ✅ (Draft/Pending) | ✅ (Direct) | ✅ (Direct) |
| • Edit own listing details | ❌ | ❌ | ✅ (Content only)| ✅ (Assigned city) | ✅ (Assigned city) | ✅ (All) |
| • Approve pending listing | ❌ | ❌ | ❌ (Trigger blocked)| ❌ | ✅ (Assigned city) | ✅ (All) |
| • Self-grant verified badge | ❌ | ❌ | ❌ (Trigger blocked)| ❌ | ✅ (Assigned city) | ✅ (All) |
| • Delete listing | ❌ | ❌ | ✅ (Own only) | ❌ | ✅ (Assigned city) | ✅ (All) |
| **Business Images** | | | | | | |
| • View public images | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| • Upload / Delete images | ❌ | ❌ | ✅ (Own listings)| ✅ (Assigned city) | ✅ (Assigned city) | ✅ (All) |
| **Customer Enquiries** | | | | | | |
| • Submit enquiry | ❌* | ✅ | ✅ | ❌ | ❌ | ✅ |
| • View private enquiry | ❌ | ✅ (Own submitted)| ✅ (Own business)| ❌ | ✅ (Assigned city) | ✅ (All) |
| • Update enquiry status | ❌ | ❌ | ✅ (Own business)| ❌ | ✅ (Assigned city) | ✅ (All) |
| **Classified Ads** | | | | | | |
| • View active classifieds | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| • Post classified ad | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| • Delete classified ad | ❌ | ✅ (Own only) | ✅ (Own only) | ❌ | ✅ (Assigned city) | ✅ (All) |
| **Reviews & Bookmarks** | | | | | | |
| • View approved reviews | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| • Submit review | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| • Manage saved bookmarks | ❌ | ✅ (Own only) | ✅ (Own only) | ✅ (Own only) | ✅ (Own only) | ✅ |
| **User Roles & Security** | | | | | | |
| • View own roles | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| • Assign / Escalate roles | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| • View audit logs | ❌ | ❌ | ❌ | ❌ | ✅ (Assigned city) | ✅ (All) |

*\* Guest enquiries are processed via rate-limited server endpoints or validated registration.*

---

## 3. Server-Controlled Role Resolver Function

To prevent JWT tampering or client-side role forgery, role membership is verified exclusively in PostgreSQL via a `SECURITY DEFINER` function:

```sql
CREATE OR REPLACE FUNCTION public.has_role(
    _user_id UUID,
    _role TEXT,
    _city_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id
          AND (
            role = 'super_admin'
            OR (
                role = _role
                AND (city_id IS NULL OR _city_id IS NULL OR city_id = _city_id)
            )
          )
    );
$$;
```

---

## 4. Anti-Tampering Database Triggers

Even if a malicious client manually sends altered HTTP requests to the Supabase PostgREST endpoint, database triggers strictly enforce business rules:

### 4.1. Insertion Guard (`guard_business_insert`)
When an ordinary business owner submits a listing:
- Forces `NEW.owner_id := auth.uid()`
- Forces `NEW.status := 'pending'`
- Forces `NEW.is_verified := false` (prevents self-awarding verified shields)
- Forces `NEW.is_featured := false` (prevents unauthorized sponsorship)
- Forces `NEW.rating := 0.0` (new listings start unrated)
- Forces `NEW.reviews_count := 0`

### 4.2. Update Guard (`guard_business_update`)
When an owner updates their business:
- **Ownership Transfer Rejection:** `NEW.owner_id IS DISTINCT FROM OLD.owner_id` throws an exception.
- **City Transfer Rejection:** `NEW.city_id IS DISTINCT FROM OLD.city_id` throws an exception.
- **Self-Approval Rejection:** `NEW.status = 'active'` throws `Security Violation: Business owners cannot approve their own listings.`
- **Badge Modification Rejection:** `NEW.is_verified IS DISTINCT FROM OLD.is_verified` throws an exception.
- **Rating Alteration Rejection:** `NEW.rating IS DISTINCT FROM OLD.rating` throws an exception.

---

## 5. Negative Authorization Test Evidence

All security policies were validated using negative authorization tests (`supabase/tests/rls_policies_test.sql`):
1. **Anonymous Isolation:** Confirmed anonymous visitors query 0 pending businesses and 0 private leads.
2. **Cross-Owner Isolation:** Confirmed Owner B receives 0 rows when attempting to select enquiries sent to Owner A.
3. **Territorial Franchise Isolation:** Confirmed the Vellore Franchise account receives 0 rows when attempting to access Chittoor leads.
4. **Self-Escalation Rejection:** Confirmed database blocks any direct `INSERT INTO user_roles` by non-super-admin users.

