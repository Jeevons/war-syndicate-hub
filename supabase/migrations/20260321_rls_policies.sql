-- ══════════════════════════════════════════════════════════════════════════════
-- war-syndicate-hub — Politiques Row Level Security
-- Story 2.1 : Authentification Discord OAuth2
-- ══════════════════════════════════════════════════════════════════════════════
-- RLS est activé dans le dashboard Supabase mais sans policies → tout accès
-- refusé (code 42501). Ce fichier crée les politiques permissives minimales.

-- ── Activer RLS (idempotent) ─────────────────────────────────────────────────
ALTER TABLE public.users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════════════
-- public.users
-- id = auth.uid() : l'UUID Supabase Auth est stocké comme PK dans public.users
-- ══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "users_select_own"  ON public.users;
DROP POLICY IF EXISTS "users_insert_own"  ON public.users;
DROP POLICY IF EXISTS "users_update_own"  ON public.users;

-- Lecture : un user authentifié peut lire sa propre ligne
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Insertion : uniquement sa propre ligne (auth.uid() = id)
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Mise à jour : uniquement sa propre ligne
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ══════════════════════════════════════════════════════════════════════════════
-- public.profiles
-- user_id = auth.uid() : lié à la table users via user_id
-- Nécessaire pour : SELECT COUNT(*) FROM profiles WHERE user_id = user.id
--   dans le callback OAuth2 (Story 2.1)
-- ══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "profiles_select_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- public.news
-- Lecture publique des articles is_public = true (page blog publique — Story 1.5)
-- Écriture : réservée au staff (policies RBAC à compléter en Story 4.1)
-- ══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "news_select_public" ON public.news;

CREATE POLICY "news_select_public" ON public.news
  FOR SELECT
  USING (is_public = true);

-- ══════════════════════════════════════════════════════════════════════════════
-- public.strategies
-- Lecture : propriétaire uniquement pour l'instant
-- ══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "strategies_select_own" ON public.strategies;

CREATE POLICY "strategies_select_own" ON public.strategies
  FOR SELECT TO authenticated
  USING (auth.uid() = author_id);
