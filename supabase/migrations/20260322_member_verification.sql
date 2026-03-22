-- ══════════════════════════════════════════════════════════════════════════════
-- war-syndicate-hub — Migration vérification appartenance au clan
-- Story 2.3 : Vérification périodique de l'appartenance au clan
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Ajouter is_active sur profiles (défaut true = tous les membres existants sont actifs)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- 2. Ajouter syndicate_role (prépare Epic 4 RBAC, utilisé ici pour PENDING_REVIEW)
--    Valeurs valides (contrainte CHECK) : inclut tous les rôles futurs pour éviter une migration en Story 4.1
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS syndicate_role TEXT NOT NULL DEFAULT 'MEMBER'
    CHECK (syndicate_role IN ('MEMBER', 'PENDING_REVIEW', 'HR_MANAGER', 'CAPITAL_MAYOR', 'WAR_CHIEF', 'LEADER'));

-- 3. Table notifications — broadcast interne Staff (Chef / Gestionnaire RH)
CREATE TABLE IF NOT EXISTS public.notifications (
  id          BIGSERIAL PRIMARY KEY,
  type        TEXT NOT NULL,                    -- ex: 'MEMBER_LEFT_CLAN'
  data        JSONB NOT NULL DEFAULT '{}',      -- { tag, name, user_id, detected_at, ... }
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index optimisé pour les lectures Staff (non-lus en premier, récents d'abord)
CREATE INDEX IF NOT EXISTS notifications_unread_idx
  ON public.notifications (is_read, created_at DESC);

-- RLS : seuls les rôles Staff peuvent lire les notifications
-- NOTE : RLS complet à implémenter en Epic 4 (Story 4.1) avec le RBAC complet
-- Pour l'instant, accès restreint via service_role dans l'Edge Function uniquement
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
