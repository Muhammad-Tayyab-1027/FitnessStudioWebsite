/* eslint-disable @next/next/no-img-element */
"use client"

import type { KeyboardEvent, ReactNode } from "react"
import {
  Clapperboard,
  Dumbbell,
  Megaphone,
  UserRound,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Templates — FitLife's "what you can make" examples. A `TemplateItem` seeds the
 * prompt dock (prompt text + optional model/settings) when its Try action fires.
 * `TemplateCard` and `ExamplePresets` render them; the Explore tab on Home uses
 * `ExamplePresets`.
 */

// FitLife's own gym photography, served from /presets.
const PHOTO = {
  barbell: "/presets/barbell.jpg",
  cardioDeck: "/presets/cardio-deck.jpg",
  classStudio: "/presets/class-studio.jpg",
  gymFloor: "/presets/gym-floor.jpg",
  runner: "/presets/runner.jpg",
  trainerCoaching: "/presets/trainer-coaching.jpg",
  trainerPortrait: "/presets/trainer-portrait.jpg",
  trainerSeated: "/presets/trainer-seated.jpg",
  treadmills: "/presets/treadmills.jpg",
  weights: "/presets/weights.jpg",
} as const

export interface TemplateItem {
  id: string
  title: string
  subtitle: string
  /** Free-form filter category used by the picker tabs. */
  category: string
  kind: "image" | "video"
  images: [string, string, string]
  icon: LucideIcon
  /** What the Try action puts in the dock. */
  prompt: string
  /** Catalog model id to switch to, when the template needs a specific one. */
  modelId?: string
  settings?: Record<string, unknown>
}

export const TEMPLATES: TemplateItem[] = [
  {
    id: "gym-promo-reel",
    title: "Gym promo reel",
    subtitle: "Cinematic tour of the training floor",
    category: "promo",
    kind: "video",
    images: [PHOTO.gymFloor, PHOTO.barbell, PHOTO.weights],
    icon: Clapperboard,
    prompt:
      "Cinematic promo of a modern gym at dawn: slow dolly past dumbbell racks, a member lifting a loaded barbell with chalk dust in the air, warm rim light, energetic pace.",
  },
  {
    id: "class-teaser",
    title: "Class teaser",
    subtitle: "Yoga, Pilates or Zumba in motion",
    category: "classes",
    kind: "video",
    images: [PHOTO.classStudio, PHOTO.treadmills, PHOTO.cardioDeck],
    icon: UserRound,
    prompt:
      "Bright group yoga class in a sunlit studio, members flowing into side stretches in unison, smooth tracking shot along the mats, calm and uplifting mood.",
  },
  {
    id: "trainer-spotlight",
    title: "Trainer spotlight",
    subtitle: "Editorial portrait for the team page",
    category: "people",
    kind: "image",
    images: [PHOTO.trainerPortrait, PHOTO.trainerSeated, PHOTO.trainerCoaching],
    icon: Dumbbell,
    prompt:
      "Editorial portrait of a personal trainer in a black tank top, dramatic side light, dark gym background, confident smile, 85mm, shallow depth of field.",
  },
  {
    id: "membership-poster",
    title: "Membership poster",
    subtitle: "Bold key visual for the Join Us offer",
    category: "promo",
    kind: "image",
    images: [PHOTO.runner, PHOTO.treadmills, PHOTO.cardioDeck],
    icon: Megaphone,
    prompt:
      "Bold fitness poster: athlete running on a treadmill in a dark gym, electric blue accents, motion blur, clean empty space at the top for a membership headline.",
  },
]

function gradientFromSeed(seed: string): string {
  let hash = 0
  for (const c of seed) hash = (hash * 31 + c.charCodeAt(0)) >>> 0
  const start = hash % 360
  const end = (start + 36 + ((hash >>> 8) % 72)) % 360
  return `linear-gradient(135deg, hsl(${start} 62% 52%) 0%, hsl(${end} 76% 27%) 100%)`
}

function GradientBadge({ as: Glyph, seed }: { as: LucideIcon; seed: string }) {
  return (
    <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-white/25 text-white shadow-[0_5px_3px_rgba(0,0,0,0.08),inset_0_3px_5px_rgba(255,255,255,0.24)]">
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundImage: gradientFromSeed(seed) }}
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 mix-blend-overlay"
      />
      <Glyph className="relative size-5" />
    </span>
  )
}

const TRIPTYCH = [
  "rounded-l-2xl rounded-r-sm",
  "rounded-sm",
  "rounded-r-2xl rounded-l-sm",
] as const

export interface TemplateCardProps {
  template: TemplateItem
  variant?: "single" | "triptych"
  onTry: (template: TemplateItem) => void
  tryLabel?: ReactNode
}

export function TemplateCard({
  template,
  variant = "single",
  onTry,
  tryLabel = "Try",
}: TemplateCardProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target) return
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onTry(template)
    }
  }
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Use template: ${template.title}`}
      className="relative flex cursor-pointer flex-col gap-2 rounded-[20px] bg-white/5 p-2 shadow-[0_2px_6px_rgba(0,0,0,0.15)] transition-[transform,background-color] duration-200 hover:z-[1] hover:-translate-y-0.5 hover:bg-white/8 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:hover:translate-y-0"
      onClick={() => onTry(template)}
      onKeyDown={onKeyDown}
    >
      <div className="flex h-60 items-stretch gap-1.5">
        {variant === "triptych" ? (
          template.images.map((src, i) => (
            <div
              key={i}
              className={cn(
                "min-w-0 flex-1 overflow-hidden border border-white/10",
                TRIPTYCH[i]
              )}
            >
              <img
                src={src}
                alt={`${template.title} — shot ${i + 1}`}
                className="size-full object-cover"
              />
            </div>
          ))
        ) : (
          <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/10">
            <img
              src={template.images[0]}
              alt={template.title}
              className="size-full object-cover"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 px-2 py-1">
        <GradientBadge as={template.icon} seed={template.id} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-foreground">
            {template.title}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {template.subtitle}
          </span>
        </div>
        <Button
          size="sm"
          className="rounded-full font-semibold"
          onClick={(event) => {
            event.stopPropagation()
            onTry(template)
          }}
        >
          {tryLabel}
        </Button>
      </div>
    </div>
  )
}

export interface ExamplePresetsProps {
  items: TemplateItem[]
  onUse: (template: TemplateItem) => void
  tryLabel?: ReactNode
  className?: string
}

/** The Explore grid: two columns of `TemplateCard`s. */
export function ExamplePresets({
  items,
  onUse,
  tryLabel = "Try",
  className = "w-full max-w-[900px]",
}: ExamplePresetsProps) {
  return (
    <div
      className={cn("grid w-full grid-cols-1 gap-5 sm:grid-cols-2", className)}
    >
      {items.map((t) => (
        <TemplateCard
          key={t.id}
          template={t}
          onTry={onUse}
          tryLabel={tryLabel}
        />
      ))}
    </div>
  )
}
