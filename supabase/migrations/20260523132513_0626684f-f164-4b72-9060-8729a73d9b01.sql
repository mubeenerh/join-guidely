
-- 1. Restrict profiles SELECT: own profile, or profile of a mentor (public mentors only)
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Mentor profiles viewable"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.mentor_profiles mp
    WHERE mp.user_id = profiles.user_id
  )
);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Hide mentor_profiles internal admin flags from anonymous users (column-level)
REVOKE SELECT ON public.mentor_profiles FROM anon;
GRANT SELECT (
  id, user_id, sector, bio, qualifications, certifications,
  achievements, available, rating, created_at, updated_at
) ON public.mentor_profiles TO anon;

-- 3. Add UPDATE policy on certificates bucket (owner-only)
CREATE POLICY "Users can update their own certificates"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'certificates'
  AND (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'certificates'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 4. Restrict certificates SELECT to owners (public URLs on public bucket still work without RLS)
DROP POLICY IF EXISTS "Certificates are publicly accessible" ON storage.objects;

CREATE POLICY "Users can view their own certificates"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'certificates'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 5. Revoke EXECUTE on has_role from anon/authenticated so it cannot be probed via PostgREST.
-- RLS policies still call it internally (postgres role bypasses these grants).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
