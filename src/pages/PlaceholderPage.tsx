import { Hammer } from 'lucide-react'

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="px-8 pt-8">
      <h1 className="mb-6 text-[28px] leading-tight font-bold">{title}</h1>
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-muted p-12 text-center">
        <Hammer aria-hidden className="size-10 text-muted-foreground" />
        <p className="text-base text-muted-foreground">Estamos preparando esta pantalla.</p>
      </div>
    </div>
  )
}
