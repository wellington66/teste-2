
CREATE TABLE public.baby_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Bebê',
  birth_date DATE,
  weight_kg NUMERIC(5,2),
  height_cm NUMERIC(5,1),
  introduced_foods TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.baby_profiles TO authenticated;
GRANT ALL ON public.baby_profiles TO service_role;

ALTER TABLE public.baby_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own baby profile"
  ON public.baby_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_baby_profiles_updated_at
  BEFORE UPDATE ON public.baby_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
