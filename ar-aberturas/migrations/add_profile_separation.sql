-- Add columns to profiles table for separation tracking
-- These columns allow marking profiles as "separated" for specific works

-- Add separated_for_work_id column (bigint, nullable, references works.id)
-- When null, the profile is not separated. When set, the profile is separated for that work.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS separated_for_work_id BIGINT;

-- Add foreign key constraint for separated_for_work_id
ALTER TABLE public.profiles
ADD CONSTRAINT fk_profiles_separated_for_work
FOREIGN KEY (separated_for_work_id)
REFERENCES public.works(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.separated_for_work_id IS 'ID of the work for which this profile is separated. Null if not separated.';
