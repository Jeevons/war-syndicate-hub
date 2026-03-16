"use client"

import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { applicationSchema, type ApplicationFormData } from "@/types/application"

// Défini hors composant — évite la recréation du tableau à chaque render (L-1)
const HDV_LEVELS = Array.from({ length: 17 }, (_, i) => i + 1)

export function RecruitmentForm() {
  const form = useForm<ApplicationFormData>({
    // Cast nécessaire : zodResolver avec z.coerce.number() infère hotelDeVille: unknown
    // en entrée (Zod 4), incompatible avec exactOptionalPropertyTypes: true
    resolver: zodResolver(applicationSchema) as Resolver<ApplicationFormData>,
    mode: "onBlur",
    defaultValues: {
      discordTag: "",
      cocTag: "",
      message: "",
      // hotelDeVille omis volontairement — undefined initial, géré par le Select
    },
  })

  const { isSubmitting, isValid } = form.formState

  async function onSubmit(data: ApplicationFormData) {
    try {
      const res = await fetch("/api/v1/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      // 409 = candidature déjà en attente pour ce coc_tag — message spécifique, pas de Réessayer
      if (res.status === 409) {
        const errorBody = (await res.json()) as { error?: { message?: string } }
        toast.error(
          errorBody.error?.message ?? "Candidature déjà en attente pour ce tag CoC",
          { duration: 5000 }
        )
        return
      }

      if (!res.ok) throw new Error("Erreur serveur")

      toast.success("Candidature envoyée !", {
        description: "Nous te recontacterons sur Discord.",
        duration: 3000,
      })
      form.reset()
    } catch {
      toast.error("Erreur lors de l'envoi", {
        description: "Vérifie ta connexion et réessaie.",
        duration: Infinity,
        action: {
          label: "Réessayer",
          onClick: () => void form.handleSubmit(onSubmit)(),
        },
      })
      // Ne PAS appeler form.reset() ici — données préservées (AC-4)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 mt-8"
        noValidate
      >
        {/* Discord tag */}
        <FormField
          control={form.control}
          name="discordTag"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300">Discord Tag</FormLabel>
              <FormControl>
                <Input
                  placeholder="PseudoDiscord#1234 ou @pseudo"
                  className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-rose-400" />
            </FormItem>
          )}
        />

        {/* CoC Tag */}
        <FormField
          control={form.control}
          name="cocTag"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300">Tag Clash of Clans</FormLabel>
              <FormControl>
                <Input
                  placeholder="#ABC12345"
                  className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage className="text-rose-400" />
            </FormItem>
          )}
        />

        {/* Hôtel de Ville */}
        <FormField
          control={form.control}
          name="hotelDeVille"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300">Niveau Hôtel de Ville</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(Number(v))}
                value={field.value !== undefined ? String(field.value) : ""}
              >
                <FormControl>
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {HDV_LEVELS.map((level) => (
                    <SelectItem key={level} value={String(level)}>
                      HdV {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-rose-400" />
            </FormItem>
          )}
        />

        {/* Message optionnel */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300">
                Message{" "}
                <span className="text-zinc-600 font-normal">(optionnel)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Présente-toi en quelques mots... (max 500 caractères)"
                  maxLength={500}
                  className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-rose-400" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting || !isValid}
          className="w-full min-h-[44px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Envoi en cours...
            </>
          ) : (
            "Envoyer ma candidature"
          )}
        </Button>
      </form>
    </Form>
  )
}
