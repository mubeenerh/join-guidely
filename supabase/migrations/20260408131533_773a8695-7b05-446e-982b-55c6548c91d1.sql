CREATE POLICY "Admins can update mentor profiles"
ON public.mentor_profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));