
-- Function to bootstrap the first admin (only works when no admins exist)
CREATE OR REPLACE FUNCTION public.make_first_admin(_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _admin_exists BOOLEAN;
BEGIN
  -- Check if any admin already exists
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO _admin_exists;
  IF _admin_exists THEN
    RAISE EXCEPTION 'An admin already exists. Use the admin dashboard to add new admins.';
  END IF;

  -- Find user by email
  SELECT id INTO _user_id FROM auth.users WHERE email = _email;
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'No user found with that email.';
  END IF;

  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'admin');
  RETURN TRUE;
END;
$$;
