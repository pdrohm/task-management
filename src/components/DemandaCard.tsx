import type { EntryWithDemanda } from '../hooks/useDailyEntries'

interface Props {
  item: EntryWithDemanda
  onCheckSetor: (entryId: string, demandaId: string) => void
  onCheckPendencia: (entryId: string, demandaId: string, pendencia: string, checked: boolean) => void
  onFinalize: (entryId: string, demandaId: string) => void
  onReopen: (entryId: string, demandaId: string) => void
  onEdit: (item: EntryWithDemanda) => void
}

export function DemandaCard({ item, onCheckSetor, onCheckPendencia, onFinalize, onReopen, onEdit }: Props) {
  const { entry, demanda } = item
  const finalizado = entry.statusNoDia === 'finalizada'

  const allPendenciasChecked =
    demanda.pendencias.length === 0 ||
    demanda.pendencias.every(p => entry.pendenciasChecks[p])

  return (
    <div className={`demanda-card ${finalizado ? 'finalizado' : ''}`}>
      <div className="card-header">
        <span className="codigo">{demanda.codigo}</span>
        <div className="card-header-right">
          <span className="tipo-badge">{demanda.tipo}</span>
          <button className="btn-icon" onClick={() => onEdit(item)} title="Editar">✎</button>
        </div>
      </div>
      <div className="card-body">
        <div className="card-setor">
          <span className="label-text">Setor:</span>
          <span className="setor">{demanda.setorAtual}</span>
          <label className="check-setor-label">
            <input
              type="checkbox"
              checked={entry.checkSetor}
              onChange={() => !entry.checkSetor && onCheckSetor(entry.id, demanda.id)}
              disabled={entry.checkSetor}
            />
            <span>Check</span>
          </label>
        </div>
        {demanda.pendencias.length > 0 && (
          <div className="card-pendencias">
            <span className="label-text">Pendências:</span>
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
          </div>
        )}
      </div>
      <div className="card-footer">
        {finalizado ? (
          <>
            <span className="badge-finalizado">✓ Finalizada</span>
            <button className="btn-sm btn-reopen" onClick={() => onReopen(entry.id, demanda.id)}>Reabrir</button>
          </>
        ) : (
          <>
            <span className="badge-aberta">Aberta</span>
            {allPendenciasChecked && (
              <button className="btn-sm btn-finalize" onClick={() => onFinalize(entry.id, demanda.id)}>Finalizar</button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
