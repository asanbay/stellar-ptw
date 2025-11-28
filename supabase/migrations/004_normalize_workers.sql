-- Create junction table for permits and workers (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.permit_workers (
    permit_id UUID REFERENCES public.permits(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES public.personnel(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (permit_id, worker_id)
);

-- Enable RLS
ALTER TABLE public.permit_workers ENABLE ROW LEVEL SECURITY;

-- Add policy
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all access for authenticated users' AND tablename = 'permit_workers') THEN
        CREATE POLICY "Enable all access for authenticated users" ON public.permit_workers FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- Migrate existing data from JSONB column to new table
-- We use a CTE to expand the JSON array and then insert valid relationships
WITH expanded_workers AS (
    SELECT 
        id AS permit_id, 
        (jsonb_array_elements_text(worker_ids))::uuid AS worker_id
    FROM public.permits
    WHERE worker_ids IS NOT NULL 
    AND jsonb_typeof(worker_ids) = 'array'
    AND jsonb_array_length(worker_ids) > 0
)
INSERT INTO public.permit_workers (permit_id, worker_id)
SELECT DISTINCT e.permit_id, e.worker_id
FROM expanded_workers e
JOIN public.personnel p ON p.id = e.worker_id
ON CONFLICT (permit_id, worker_id) DO NOTHING;

-- Drop the old column
ALTER TABLE public.permits DROP COLUMN worker_ids;
