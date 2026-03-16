import { NextRequest, NextResponse } from "next/server"
import { applicationSchema } from "@/types/application"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
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
