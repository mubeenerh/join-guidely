
-- Add suspended column to mentor_profiles
ALTER TABLE public.mentor_profiles ADD COLUMN suspended boolean NOT NULL DEFAULT false;

-- Create appeals table
CREATE TABLE public.mentor_appeals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL,
  reason text NOT NULL,
  admin_response text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.mentor_appeals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors can view own appeals" ON public.mentor_appeals
  FOR SELECT USING (auth.uid() = mentor_id);

CREATE POLICY "Mentors can create own appeals" ON public.mentor_appeals
  FOR INSERT WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Admins can view all appeals" ON public.mentor_appeals
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update appeals" ON public.mentor_appeals
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_mentor_appeals_updated_at
  BEFORE UPDATE ON public.mentor_appeals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
