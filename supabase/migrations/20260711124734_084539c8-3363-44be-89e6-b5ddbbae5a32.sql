DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.baby_profiles CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.tg_set_updated_at() CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;