-- Agregar campo general_note a la tabla works
-- Este campo almacenará notas generales sobre la obra para los colocadores

ALTER TABLE public.works 
ADD COLUMN general_note TEXT NULL;

-- Agregar comentario para documentar el propósito del campo
COMMENT ON COLUMN public.works.general_note IS 'Nota general sobre la obra para informar sobre impedimentos o estados especiales';
