import type { EntryWithDemanda } from '../hooks/useDailyEntries'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Props {
  item: EntryWithDemanda
  onCheckSetor: (entryId: string, demandaId: string) => void
  onCheckPendencia: (entryId: string, demandaId: string, pendencia: string, checked: boolean) => void
  onFinalize: (entryId: string, demandaId: string) => void
  onReopen: (entryId: string, demandaId: string) => void
  onEdit: (item: EntryWithDemanda) => void
}

export function DemandaRow({ item, onCheckSetor, onCheckPendencia, onFinalize, onReopen, onEdit }: Props) {
  const { entry, demanda } = item
  const finalizado = entry.statusNoDia === 'finalizada'

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: entry.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const allPendenciasChecked =
    demanda.pendencias.length === 0 ||
    demanda.pendencias.every(p => entry.pendenciasChecks[p])

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`demanda-row ${finalizado ? 'finalizado' : ''}`}
    >
      <td className="drag-handle" {...attributes} {...listeners}>⠿</td>
      <td className="col-codigo">
        <span className="codigo">{demanda.codigo}</span>
      </td>
      <td className="col-tipo">
        <span className="tipo-badge">{demanda.tipo}</span>
      </td>
      <td className="col-setor">
        <span className="setor">{demanda.setorAtual}</span>
        <input
          type="checkbox"
          checked={entry.checkSetor}
          onChange={() => !entry.checkSetor && onCheckSetor(entry.id, demanda.id)}
          title="Check setor"
          disabled={entry.checkSetor}
          className="check-setor"
        />
      </td>
      <td className="col-pendencias">
        {demanda.pendencias.length === 0 ? (
          <span className="no-pendencias">—</span>
        ) : (
          <div className="pendencias-list">
            {demanda.pendencias.map(p => (
              <label key={p} className="pendencia-item">
                <input
                  type="checkbox"
                  checked={!!entry.pendenciasChecks[p]}
                  onChange={e => onCheckPendencia(entry.id, demanda.id, p, e.target.checked)}
                  disabled={finalizado}
                />
                <span className={entry.pendenciasChecks[p] ? 'checked-text' : ''}>{p}</span>
              </label>
            ))}
          </div>
        )}
      </td>
      <td className="col-status">
        {finalizado ? (
          <div className="status-col">
            <span className="badge-finalizado">✓ Finalizada</span>
            <button className="btn-sm btn-reopen" onClick={() => onReopen(entry.id, demanda.id)}>Reabrir</button>
          </div>
        ) : (
          <div className="status-col">
            <span className="badge-aberta">Aberta</span>
            {allPendenciasChecked && (
              <button className="btn-sm btn-finalize" onClick={() => onFinalize(entry.id, demanda.id)}>Finalizar</button>
            )}
          </div>
        )}
      </td>
      <td className="col-actions">
        <button className="btn-icon" onClick={() => onEdit(item)} title="Editar">✎</button>
      </td>
    </tr>
  )
}
