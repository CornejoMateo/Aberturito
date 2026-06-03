-- Drop existing policies if they exist
DROP POLICY IF EXISTS "survey_tags_select_policy" ON public.survey_tags;
DROP POLICY IF EXISTS "survey_tags_insert_policy" ON public.survey_tags;
DROP POLICY IF EXISTS "survey_tags_update_policy" ON public.survey_tags;
DROP POLICY IF EXISTS "survey_tags_delete_policy" ON public.survey_tags;

DROP POLICY IF EXISTS "survey_tag_assignments_select_policy" ON public.survey_tag_assignments;
DROP POLICY IF EXISTS "survey_tag_assignments_insert_policy" ON public.survey_tag_assignments;
DROP POLICY IF EXISTS "survey_tag_assignments_delete_policy" ON public.survey_tag_assignments;

-- Enable RLS on survey_tags table
ALTER TABLE public.survey_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for survey_tags
-- Allow authenticated users to read all tags
CREATE POLICY "survey_tags_select_policy" ON public.survey_tags
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert tags
CREATE POLICY "survey_tags_insert_policy" ON public.survey_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update tags
CREATE POLICY "survey_tags_update_policy" ON public.survey_tags
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete tags
CREATE POLICY "survey_tags_delete_policy" ON public.survey_tags
  FOR DELETE
  TO authenticated
  USING (true);

-- Enable RLS on survey_tag_assignments table
ALTER TABLE public.survey_tag_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for survey_tag_assignments
-- Allow authenticated users to read all assignments
CREATE POLICY "survey_tag_assignments_select_policy" ON public.survey_tag_assignments
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert assignments
CREATE POLICY "survey_tag_assignments_insert_policy" ON public.survey_tag_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to delete assignments
CREATE POLICY "survey_tag_assignments_delete_policy" ON public.survey_tag_assignments
  FOR DELETE
  TO authenticated
  USING (true);
