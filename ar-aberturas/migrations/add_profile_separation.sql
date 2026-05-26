    ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS separated_for_work_id BIGINT;

ALTER TABLE public.profiles
ADD CONSTRAINT IF NOT EXISTS fk_profiles_separated_for_work
FOREIGN KEY (separated_for_work_id)
REFERENCES public.works(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

COMMENT ON COLUMN public.profiles.separated_for_work_id IS 'ID of the work for which this profile is separated. Null if not separated.';
