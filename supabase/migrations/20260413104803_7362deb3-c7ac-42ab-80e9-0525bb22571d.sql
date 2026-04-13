
-- Create the certificates storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', true);

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own certificates"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access
CREATE POLICY "Certificates are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'certificates');

-- Allow users to delete their own certificates
CREATE POLICY "Users can delete their own certificates"
ON storage.objects FOR DELETE
USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);
