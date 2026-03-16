import { NextRequest, NextResponse } from "next/server"
import { applicationSchema } from "@/types/application"
import { createClient } from "@/lib/supabase/server"

// TODO (future epic) : rate limiting par IP via Upstash ou Vercel Edge Rate Limit
// Actuellement protégé au niveau BDD : un seul 'pending' par coc_tag (index unique partiel)

export async function POST(request: NextRequest) {
  // Valider Content-Type avant toute tentative de parse JSON
  const contentType = request.headers.get("content-type")
  if (!contentType?.includes("application/json")) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_CONTENT_TYPE",
          message: "Content-Type doit être application/json",
          details: {},
        },
      },
      { status: 415 }
    )
  }

  try {
    const body = (await request.json()) as unknown
    const parsed = applicationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Données invalides",
            details: parsed.error.flatten(),
          },
        },
        { status: 422 }
      )
    }

    const supabase = await createClient()
    const { error } = await supabase.from("applications").insert({
      discord_tag: parsed.data.discordTag,
      coc_tag: parsed.data.cocTag,
      hotel_de_ville: parsed.data.hotelDeVille,
      message: parsed.data.message ?? null,
    })

    if (error) {
      // 23505 = unique_violation : candidature 'pending' déjà existante pour ce coc_tag
      if (error.code === "23505") {
        return NextResponse.json(
          {
            error: {
              code: "DUPLICATE_APPLICATION",
              message:
                "Une candidature est déjà en attente pour ce tag CoC. Nous traiterons ton dossier sous peu.",
              details: {},
            },
          },
          { status: 409 }
        )
      }

      return NextResponse.json(
        {
          error: {
            code: "DATABASE_ERROR",
            message: "Erreur lors de l'enregistrement",
            details: {},
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: { success: true },
      meta: { timestamp: new Date().toISOString() },
    })
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Erreur interne du serveur",
          details: {},
        },
      },
      { status: 500 }
    )
  }
}
