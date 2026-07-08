-- Fix profiles_public: anon lost SELECT on profiles; view must run as owner.
ALTER VIEW public.profiles_public SET (security_invoker = false);
