-- Temporarily disable RLS to test if the issue is with policies or authentication
ALTER TABLE public.survey_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_tag_assignments DISABLE ROW LEVEL SECURITY;
