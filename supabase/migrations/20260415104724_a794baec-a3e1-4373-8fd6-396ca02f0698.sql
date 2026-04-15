
CREATE TABLE public.mentor_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL,
  mentee_id uuid NOT NULL,
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  rating integer NOT NULL,
  review text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(session_id, mentee_id)
);

ALTER TABLE public.mentor_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.mentor_reviews
  FOR SELECT USING (true);

CREATE POLICY "Mentees can create reviews for own sessions" ON public.mentor_reviews
  FOR INSERT WITH CHECK (auth.uid() = mentee_id);

-- Create a trigger to update mentor_profiles rating when a review is added
CREATE OR REPLACE FUNCTION public.update_mentor_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.mentor_profiles
  SET rating = (
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM public.mentor_reviews
    WHERE mentor_id = NEW.mentor_id
  )
  WHERE user_id = NEW.mentor_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_mentor_rating_on_review
AFTER INSERT ON public.mentor_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_mentor_rating();
