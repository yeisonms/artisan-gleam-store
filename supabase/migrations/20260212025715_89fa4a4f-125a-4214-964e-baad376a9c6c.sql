
-- Create storage bucket for custom request reference images
INSERT INTO storage.buckets (id, name, public)
VALUES ('custom-request-images', 'custom-request-images', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can upload images to this bucket (for the public form)
CREATE POLICY "Anyone can upload custom request images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'custom-request-images');

-- Public read access
CREATE POLICY "Public read custom request images"
ON storage.objects FOR SELECT
USING (bucket_id = 'custom-request-images');

-- Admins can delete
CREATE POLICY "Admins can delete custom request images"
ON storage.objects FOR DELETE
USING (bucket_id = 'custom-request-images' AND public.is_admin());
