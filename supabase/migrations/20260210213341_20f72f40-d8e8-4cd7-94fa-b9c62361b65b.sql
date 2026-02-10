-- Replace overly permissive INSERT policy on custom_requests with validated one
DROP POLICY "Anyone can create custom requests" ON public.custom_requests;

CREATE POLICY "Anyone can create custom requests with valid data"
  ON public.custom_requests
  FOR INSERT
  WITH CHECK (
    status = 'new'
    AND length(full_name) >= 2 AND length(full_name) <= 200
    AND length(email) >= 5 AND length(email) <= 255
    AND length(phone) >= 7 AND length(phone) <= 30
    AND length(details) >= 10 AND length(details) <= 5000
    AND (budget_cents IS NULL OR budget_cents >= 0)
  );