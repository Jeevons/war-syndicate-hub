-- Migration: create_applications
-- Date: 2026-03-16
-- Description: Table candidatures recrutement (pré-recrutement sans compte)

CREATE TABLE IF NOT EXISTS public.applications (
  id             bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  discord_tag    text         NOT NULL,
  coc_tag        text         NOT NULL,
  hotel_de_ville smallint     NOT NULL CHECK (hotel_de_ville BETWEEN 1 AND 17),
  message        text,
  status         text         NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at     timestamptz  NOT NULL DEFAULT now(),
  updated_at     timestamptz  NOT NULL DEFAULT now()
);

-- Index sur coc_tag pour chercher les candidatures par joueur
CREATE INDEX IF NOT EXISTS applications_coc_tag_idx
  ON public.applications (coc_tag);

-- RLS désactivé pour V1 — accès public en écriture via API Route
-- L'API Route valide les données via Zod avant insertion
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;
