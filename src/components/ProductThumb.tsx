import {
  Apple,
  Beef,
  Beer,
  Carrot,
  Citrus,
  Cookie,
  Croissant,
  CupSoda,
  Drumstick,
  Egg,
  Fish,
  GlassWater,
  IceCreamCone,
  Milk,
  Popcorn,
  Soup,
  type LucideIcon,
} from 'lucide-react'
import type { Category } from '@/types'

const ICONS: Record<Category, LucideIcon> = {
  milk: Milk,
  yogurt: Soup,
  cheese: Soup,
  water: GlassWater,
  beer: Beer,
  soda: CupSoda,
  juice: Citrus,
  'ice-cream': IceCreamCone,
  fruit: Apple,
  citrus: Citrus,
  vegetable: Carrot,
  meat: Beef,
  chicken: Drumstick,
  fish: Fish,
  bread: Croissant,
  snack: Popcorn,
  spread: Cookie,
  egg: Egg,
}

/** Miniatura de producto: mientras no haya fotos, icono de categoría. */
export function ProductThumb({ category }: { category: Category }) {
  const Icon = ICONS[category]
  return (
    <span
      aria-hidden
      className="grid size-10 shrink-0 place-items-center rounded-lg border bg-background text-muted-foreground"
    >
      <Icon className="size-5" strokeWidth={2} />
    </span>
  )
}
