import { useState, useEffect } from 'react'
import { getAllDates, getEntriesByDate } from '../db/repos/dailyEntryRepo'
import { getDemandaById } from '../db/repos/demandaRepo'
import { getHistoryByDate } from '../db/repos/historyRepo'
import type { DailyEntry, Demanda, HistoryEvent } from '../domain/types'

interface DaySnapshot {
  entry: DailyEntry
  demanda: Demanda
}

function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function formatTS(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const EVENT_LABELS: Record<string, string> = {
  CREATED: 'Criada',
  DEMANDA_UPDATED: 'Atualizada',
  SETOR_CHECKED: 'Setor marcado',
  PENDENCIA_ADDED: 'Pendência adicionada',
  PENDENCIA_CHECKED: 'Pendência marcada',
  MOVED_TO_DAY: 'Adicionada ao dia',
  FINALIZED: 'Finalizada',
  REOPENED: 'Reaberta',
}

export function Historico() {
  const [dates, setDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<DaySnapshot[]>([])
  const [history, setHistory] = useState<HistoryEvent[]>([])

  useEffect(() => {
    getAllDates().then(setDates)
  }, [])

  useEffect(() => {
    if (!selectedDate) return
    async function load() {
      const entries = await getEntriesByDate(selectedDate!)
      const withDemandas = await Promise.all(
        entries.map(async entry => {
          const demanda = await getDemandaById(entry.demandaId)
          return demanda ? { entry, demanda } : null
        })
      )
      setSnapshot(withDemandas.filter(Boolean) as DaySnapshot[])
      const h = await getHistoryByDate(selectedDate!)
      setHistory(h)
    }
    load()
  }, [selectedDate])

  return (
    <div className="page">
      <h1 className="page-title">Histórico</h1>
      <div className="historico-layout">
        <aside className="dates-sidebar">
          <h3>Dias</h3>
          {dates.length === 0 && <p className="empty-hint">Nenhum dia registrado.</p>}
          <ul className="dates-list">
            {dates.map(d => (
              <li
                key={d}
                className={`date-item ${selectedDate === d ? 'active' : ''}`}
                onClick={() => setSelectedDate(d)}
              >
                {formatDateDisplay(d)}
              </li>
            ))}
          </ul>
        </aside>

        <main className="historico-main">
          {!selectedDate ? (
            <div className="empty-state">Selecione um dia para ver o histórico.</div>
          ) : (
            <>
              <h2 className="date-display">{formatDateDisplay(selectedDate)}</h2>

              <section className="snapshot-section">
                <h3>Demandas do Dia</h3>
                {snapshot.length === 0 ? (
                  <p className="empty-hint">Sem demandas neste dia.</p>
                ) : (
                  <table className="demanda-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Tipo</th>
                        <th>Setor</th>
                        <th>Pendências</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshot.map(({ entry, demanda }) => (
                        <tr key={entry.id} className={entry.statusNoDia === 'finalizada' ? 'finalizado' : ''}>
                          <td><span className="codigo">{demanda.codigo}</span></td>
                          <td><span className="tipo-badge">{demanda.tipo}</span></td>
                          <td><span className="setor">{demanda.setorAtual}</span></td>
                          <td>
                            {demanda.pendencias.length === 0 ? '—' : (
                              <div className="pendencias-list">
                                {demanda.pendencias.map(p => (
                                  <span key={p} className={`pendencia-tag ${entry.pendenciasChecks[p] ? 'checked' : ''}`}>
                                    {entry.pendenciasChecks[p] ? '✓' : '○'} {p}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td>
                            {entry.statusNoDia === 'finalizada'
                              ? <span className="badge-finalizado">✓ Finalizada</span>
                              : <span className="badge-aberta">Aberta</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              <section className="events-section">
                <h3>Eventos do Dia</h3>
                {history.length === 0 ? (
                  <p className="empty-hint">Sem eventos registrados.</p>
                ) : (
                  <ul className="events-list">
                    {history.map(event => {
                      const dem = snapshot.find(s => s.demanda.id === event.demandaId)
                      return (
                        <li key={event.id} className="event-item">
                          <span className="event-time">{formatTS(event.timestamp)}</span>
                          <span className="event-codigo">{dem?.demanda.codigo ?? event.demandaId.slice(0, 8)}</span>
                          <span className="event-type">{EVENT_LABELS[event.type] ?? event.type}</span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
