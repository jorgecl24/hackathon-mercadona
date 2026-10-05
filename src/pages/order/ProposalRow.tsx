import { ArrowDown, ArrowUp, Check, Equal, Pencil, Undo2 } from 'lucide-react'
import { ConfidenceBadge } from '@/components/ConfidenceBadge'
import { FactorChip } from '@/components/FactorChip'
import { ProductThumb } from '@/components/ProductThumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatNumber, formatSigned } from '@/lib/format'
import { finalQuantity } from '@/lib/tasks'
import { cn } from '@/lib/utils'
import { ADJUST_REASONS, type AdjustReason, type OrderTask } from '@/types'

export interface AdjustDraft {
  quantity: string
  reason?: AdjustReason
}

interface ProposalRowProps {
  task: OrderTask
  saving: boolean
  draft: AdjustDraft | null
  onAccept: () => void
  onStartAdjust: () => void
  onDraftChange: (draft: AdjustDraft) => void
  onSaveAdjust: () => void
  onCancelAdjust: () => void
  onUndo: () => void
}

const COLUMN_COUNT = 8

/** Por debajo de 1280 px la tabla puede desbordar: Acciones queda fija a la derecha. */
export const STICKY_CELL =
  'max-xl:sticky max-xl:right-0 max-xl:bg-inherit max-xl:shadow-[inset_1px_0_0_var(--border)]'

export function ProposalRow({
  task,
  saving,
  draft,
  onAccept,
  onStartAdjust,
  onDraftChange,
  onSaveAdjust,
  onCancelAdjust,
  onUndo,
}: ProposalRowProps) {
  const { product, stock, confidence } = task
  const editing = draft !== null
  const quantity = finalQuantity(task)
  const diff = quantity - task.usualOrder
  const diffPct = task.usualOrder > 0 ? Math.round((diff / task.usualOrder) * 100) : null
  const DiffIcon = diff > 0 ? ArrowUp : diff < 0 ? ArrowDown : Equal
  const draftQuantity = Number(draft?.quantity)
  const draftValid = editing && draft.quantity !== '' && Number.isInteger(draftQuantity) && draftQuantity >= 0

  return (
    <>
      <TableRow
        className={cn(
          // Fondos opacos: la columna Acciones es fija y hereda el color de la fila.
          'h-14',
          editing
            ? 'border-b-0 bg-muted hover:bg-muted'
            : task.status === 'pending'
              ? 'bg-background hover:bg-muted'
              : 'bg-success-soft hover:bg-success-soft',
        )}
      >
        <TableCell className="py-2">
          <div className="flex items-center gap-3">
            <ProductThumb category={product.category} imageUrl={product.imageUrl} name={product.name} />
            <div className="min-w-0">
              <div className="max-w-48 text-base leading-snug font-medium whitespace-normal">{product.name}</div>
              <div className="text-sm text-muted-foreground">
                {product.section} · bulto de {product.packSize}
              </div>
            </div>
          </div>
        </TableCell>

        <TableCell className="text-right">
          <div className="text-base tabular-nums">{formatNumber(stock.store + stock.warehouse)}</div>
          <div
            className="text-sm whitespace-nowrap text-muted-foreground tabular-nums"
            title={`Tienda ${formatNumber(stock.store)} · Almacén ${formatNumber(stock.warehouse)}`}
          >
            Almacén {formatNumber(stock.warehouse)}
          </div>
        </TableCell>

        <TableCell className="text-right text-base tabular-nums">{formatNumber(task.usualOrder)}</TableCell>

        <TableCell className="text-right">
          {editing ? (
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              step={product.packSize}
              autoFocus
              aria-label={`Cantidad para ${product.name}`}
              aria-invalid={!draftValid}
              value={draft.quantity}
              onChange={(e) => onDraftChange({ ...draft, quantity: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && draftValid) onSaveAdjust()
                if (e.key === 'Escape') onCancelAdjust()
              }}
              className="ml-auto h-11 w-24 text-right text-lg font-bold tabular-nums"
            />
          ) : (
            <div>
              <div className="text-xl font-bold text-primary tabular-nums">{formatNumber(quantity)}</div>
              {task.status === 'adjusted' && (
                <div className="text-sm text-muted-foreground tabular-nums">
                  Propuesta <span className="line-through">{formatNumber(task.suggested)}</span>
                </div>
              )}
            </div>
          )}
        </TableCell>

        <TableCell className="text-right">
          <div className="inline-flex items-center gap-1 text-base font-semibold tabular-nums">
            <DiffIcon aria-hidden className="size-4" />
            {formatSigned(diff)}
          </div>
          {diffPct !== null && diff !== 0 && (
            <div className="text-sm text-muted-foreground tabular-nums">{formatSigned(diffPct)} %</div>
          )}
        </TableCell>

        <TableCell>
          <div className="flex max-w-48 flex-wrap gap-1.5">
            {task.factors.map((factor) => (
              <FactorChip key={factor.kind + factor.label} factor={factor} />
            ))}
          </div>
        </TableCell>

        <TableCell>
          <ConfidenceBadge confidence={confidence} />
        </TableCell>

        <TableCell className={STICKY_CELL}>
          <div className="flex items-center justify-end gap-2">
            {editing ? (
              <>
                <Button size="default" onClick={onSaveAdjust} disabled={!draftValid || saving}>
                  Guardar
                </Button>
                <Button variant="ghost" onClick={onCancelAdjust} disabled={saving}>
                  Cancelar
                </Button>
              </>
            ) : task.status === 'pending' ? (
              <>
                <Button
                  variant="outline"
                  className="px-4"
                  onClick={onAccept}
                  disabled={saving}
                  aria-label={`Aceptar ${formatNumber(task.suggested)} de ${product.name}`}
                >
                  <Check aria-hidden />
                  Aceptar
                </Button>
                <Button
                  variant="ghost"
                  className="px-3"
                  onClick={onStartAdjust}
                  disabled={saving}
                  aria-label={`Ajustar ${product.name}`}
                  title="Ajustar"
                >
                  <Pencil aria-hidden />
                  <span className="max-xl:sr-only">Ajustar</span>
                </Button>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 text-sm font-semibold whitespace-nowrap text-primary">
                  <Check aria-hidden className="size-4" />
                  {task.status === 'accepted' ? 'Aceptado' : `Ajustado${task.adjustReason ? ` · ${task.adjustReason}` : ''}`}
                </span>
                <Button
                  variant="ghost"
                  className="px-3"
                  onClick={onUndo}
                  disabled={saving}
                  aria-label={`Deshacer ${product.name}`}
                  title="Deshacer"
                >
                  <Undo2 aria-hidden />
                  <span className="max-xl:sr-only">Deshacer</span>
                </Button>
              </>
            )}
          </div>
        </TableCell>
      </TableRow>

      {editing && (
        <TableRow className="bg-muted hover:bg-muted">
          <TableCell colSpan={COLUMN_COUNT} className="pt-0 pb-3">
            <div className="flex flex-wrap items-center gap-2 pl-[52px]">
              <span id={`reason-${task.id}`} className="text-sm text-muted-foreground">
                Motivo del ajuste (opcional):
              </span>
              <div role="group" aria-labelledby={`reason-${task.id}`} className="flex gap-2">
                {ADJUST_REASONS.map((reason) => {
                  const selected = draft.reason === reason
                  return (
                    <button
                      key={reason}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onDraftChange({ ...draft, reason: selected ? undefined : reason })}
                      className={cn(
                        'h-11 rounded-full border px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                        selected
                          ? 'border-primary bg-success-soft text-primary'
                          : 'bg-background text-foreground hover:bg-muted',
                      )}
                    >
                      {reason}
                    </button>
                  )
                })}
              </div>
              <span className="text-sm text-muted-foreground">
                Tu ajuste ayuda a afinar las próximas previsiones.
              </span>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
