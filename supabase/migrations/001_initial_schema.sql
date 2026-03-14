-- ══════════════════════════════════════════════════════════════════════════════
-- war-syndicate-hub — Migration initiale
-- Story 1.1 : Fondation du projet
-- ══════════════════════════════════════════════════════════════════════════════

-- Extension cryptographique (génération d'UUID)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Table users (identité Discord) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id  TEXT UNIQUE NOT NULL,
  username    TEXT NOT NULL,
  avatar_url  TEXT,
  email       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Table profiles (comptes CoC liés) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tag             TEXT UNIQUE NOT NULL,  -- Format: #XXXXXXXX
  name            TEXT NOT NULL,
  townhall_level  INT NOT NULL,
  role_in_clan    TEXT,
  is_main         BOOLEAN NOT NULL DEFAULT false,
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Table news (articles Blog) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.news (
  id          BIGSERIAL PRIMARY KEY,
  author_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  is_public   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Table strategies (analyses La Sonde) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.strategies (
  id             BIGSERIAL PRIMARY KEY,
  author_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  image_url      TEXT,
  detected_data  JSONB,
  attack_plan    JSONB,
  th_level       INT,
  is_public      BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Note : Tables RBAC (syndicate_roles, user_syndicate_roles) ───────────────
-- Créées en Story 4.1 — NE PAS ajouter ici
