INSERT INTO storage.buckets (id, name, public) 
VALUES ('custom_requests', 'custom_requests', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload to custom_requests" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'custom_requests' );

CREATE POLICY "Admins can view custom_requests" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'custom_requests' AND public.is_admin() );
