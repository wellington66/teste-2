
-- Lock down anon writes: move all funnel tracking through SECURITY DEFINER RPCs scoped to session_id.

DROP POLICY IF EXISTS "anon update by session" ON public.leads;
DROP POLICY IF EXISTS "anon insert leads" ON public.leads;
DROP POLICY IF EXISTS "anon insert events" ON public.lead_events;
DROP POLICY IF EXISTS "anon insert answers" ON public.quiz_answers;

REVOKE INSERT, UPDATE, DELETE ON public.leads FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.lead_events FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.quiz_answers FROM anon, authenticated;

-- Ensure admin-only triggers/internal helpers are not callable by clients.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM anon, authenticated, public;

-- ============ RPCs (anon may call; rows scoped strictly by p_session) ============

CREATE OR REPLACE FUNCTION public.track_ensure_lead(
  p_session text, p_source text DEFAULT NULL, p_medium text DEFAULT NULL,
  p_campaign text DEFAULT NULL, p_content text DEFAULT NULL, p_term text DEFAULT NULL,
  p_device text DEFAULT NULL, p_browser text DEFAULT NULL,
  p_user_agent text DEFAULT NULL, p_referrer text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  IF p_session IS NULL OR length(p_session) < 8 THEN RAISE EXCEPTION 'invalid session'; END IF;
  INSERT INTO public.leads (session_id, status, current_step, source, medium, campaign, content, term, device, browser, user_agent, referrer)
  VALUES (p_session, 'new_visitor', 'home', p_source, p_medium, p_campaign, p_content, p_term, p_device, p_browser, p_user_agent, p_referrer)
  ON CONFLICT (session_id) DO UPDATE SET last_action_at = now()
  RETURNING id INTO v_id;
  RETURN v_id;
END; $$;

CREATE OR REPLACE FUNCTION public.track_event(
  p_session text, p_event text, p_step text DEFAULT NULL,
  p_page text DEFAULT NULL, p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_lead uuid;
BEGIN
  IF p_session IS NULL OR length(p_session) < 8 THEN RAISE EXCEPTION 'invalid session'; END IF;
  IF p_event IS NULL OR length(p_event) < 1 OR length(p_event) > 100 THEN RAISE EXCEPTION 'invalid event'; END IF;
  SELECT id INTO v_lead FROM public.leads WHERE session_id = p_session;
  INSERT INTO public.lead_events (lead_id, session_id, event_name, funnel_step, page_url, metadata)
  VALUES (v_lead, p_session, p_event, p_step, left(coalesce(p_page,''), 500), coalesce(p_metadata,'{}'::jsonb));
  IF v_lead IS NOT NULL THEN
    UPDATE public.leads SET last_action_at = now() WHERE id = v_lead;
  END IF;
END; $$;

CREATE OR REPLACE FUNCTION public.track_status(
  p_session text, p_status text, p_step text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_session IS NULL OR length(p_session) < 8 THEN RAISE EXCEPTION 'invalid session'; END IF;
  UPDATE public.leads
     SET status = left(p_status, 50),
         current_step = coalesce(left(p_step, 50), current_step),
         last_action_at = now()
   WHERE session_id = p_session;
END; $$;

CREATE OR REPLACE FUNCTION public.track_identify(
  p_session text, p_name text DEFAULT NULL, p_email text DEFAULT NULL, p_phone text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_session IS NULL OR length(p_session) < 8 THEN RAISE EXCEPTION 'invalid session'; END IF;
  UPDATE public.leads
     SET name = coalesce(left(p_name, 120), name),
         email = coalesce(left(p_email, 200), email),
         phone = coalesce(left(p_phone, 40), phone),
         last_action_at = now()
   WHERE session_id = p_session;
END; $$;

CREATE OR REPLACE FUNCTION public.track_quiz(
  p_session text, p_question_id text, p_question_text text, p_answer text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_lead uuid;
BEGIN
  IF p_session IS NULL OR length(p_session) < 8 THEN RAISE EXCEPTION 'invalid session'; END IF;
  IF p_question_id IS NULL OR length(p_question_id) > 100 THEN RAISE EXCEPTION 'invalid question'; END IF;
  SELECT id INTO v_lead FROM public.leads WHERE session_id = p_session;
  INSERT INTO public.quiz_answers (lead_id, session_id, question_id, question_text, answer)
  VALUES (v_lead, p_session, p_question_id, left(coalesce(p_question_text,''), 500), left(coalesce(p_answer,''), 500));
  IF v_lead IS NOT NULL THEN
    UPDATE public.leads SET last_action_at = now() WHERE id = v_lead;
  END IF;
END; $$;

REVOKE EXECUTE ON FUNCTION public.track_ensure_lead(text,text,text,text,text,text,text,text,text,text) FROM public;
REVOKE EXECUTE ON FUNCTION public.track_event(text,text,text,text,jsonb) FROM public;
REVOKE EXECUTE ON FUNCTION public.track_status(text,text,text) FROM public;
REVOKE EXECUTE ON FUNCTION public.track_identify(text,text,text,text) FROM public;
REVOKE EXECUTE ON FUNCTION public.track_quiz(text,text,text,text) FROM public;

GRANT EXECUTE ON FUNCTION public.track_ensure_lead(text,text,text,text,text,text,text,text,text,text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_event(text,text,text,text,jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_status(text,text,text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_identify(text,text,text,text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_quiz(text,text,text,text) TO anon, authenticated;
