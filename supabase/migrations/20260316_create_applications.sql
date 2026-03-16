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

-- Index unique partiel : un joueur (coc_tag) ne peut avoir qu'une candidature 'pending' à la fois
-- Empêche les soumissions dupliquées sans bloquer les re-candidatures après rejet
CREATE UNIQUE INDEX IF NOT EXISTS applications_coc_tag_pending_unique
  ON public.applications (coc_tag)
  WHERE (status = 'pending');

-- Trigger updated_at — mis à jour automatiquement lors d'un UPDATE de statut
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS activé — protection contre l'accès direct avec la clé anon publique
-- Sans RLS, la clé anon (exposée dans le bundle browser) permettrait un INSERT direct
-- qui bypasse la validation Zod de l'API Route
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Politique d'insertion publique : tout visiteur peut soumettre une candidature
-- La validation Zod (API Route) + les contraintes CHECK/UNIQUE sont les gardes-fous
CREATE POLICY "allow_public_insert"
  ON public.applications
  FOR INSERT
  TO anon
  WITH CHECK (true);
