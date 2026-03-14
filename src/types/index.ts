// Types globaux war-syndicate-hub
// Interfaces métier ajoutées au fil des stories

// ── Identité Discord ──────────────────────────────────────────────────────────
export interface User {
  id: string;
  discord_id: string;
  username: string;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

// ── Profil CoC lié ────────────────────────────────────────────────────────────
export interface Profile {
  id: number;
  user_id: string;
  tag: string;
  name: string;
  townhall_level: number;
  role_in_clan: string | null;
  is_main: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Articles Blog ─────────────────────────────────────────────────────────────
export interface News {
  id: number;
  author_id: string;
  title: string;
  content: string;
  slug: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// ── Analyses La Sonde ─────────────────────────────────────────────────────────
export interface Strategy {
  id: number;
  author_id: string;
  image_url: string | null;
  detected_data: Record<string, unknown> | null;
  attack_plan: Record<string, unknown> | null;
  th_level: number | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// ── API Response Standard (RFC 7807) ─────────────────────────────────────────
export interface ApiSuccess<T> {
  data: T;
  meta: { timestamp: string };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
}
