import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { useDailyEntries, type EntryWithDemanda } from '../hooks/useDailyEntries'
import { useDemandas } from '../hooks/useDemandas'
import { DemandaRow } from '../components/DemandaRow'
import { DemandaCard } from '../components/DemandaCard'
import { DemandaModal } from '../components/DemandaModal'
import { NewDayModal } from '../components/NewDayModal'
import { getEntriesByDate, createEntry, getEntryByDateAndDemanda } from '../db/repos/dailyEntryRepo'
import { getDemandas } from '../db/repos/demandaRepo'
import type { TipoDemanda } from '../domain/types'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function prevDay(date: string): string {
  const d = new Date(date)
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export function Hoje() {
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [showNewDemandaModal, setShowNewDemandaModal] = useState(false)
  const [showNewDayModal, setShowNewDayModal] = useState(false)
  const [editingItem, setEditingItem] = useState<EntryWithDemanda | null>(null)

  const { entries, loading, reload, handleCheckSetor, handleCheckPendencia, handleFinalize, handleReopen, handleReorder, handleAddToDay, handleSyncPendencias } = useDailyEntries(selectedDate)
  const { handleCreate, handleUpdate } = useDemandas()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = entries.findIndex(e => e.entry.id === active.id)
    const newIdx = entries.findIndex(e => e.entry.id === over.id)
    if (oldIdx === -1 || newIdx === -1) return
    const reordered = arrayMove(entries, oldIdx, newIdx)
    handleReorder(reordered)
  }, [entries, handleReorder])

  const handleNewDemanda = useCallback(async (data: { codigo: string; tipo: TipoDemanda; setorAtual: string; pendencias: string[] }) => {
    const { demanda } = await handleCreate(data, selectedDate)
    const existing = await getEntryByDateAndDemanda(selectedDate, demanda.id)
    if (!existing) {
      await handleAddToDay(demanda.id, demanda.pendencias)
    } else {
      await handleSyncPendencias(existing.id, demanda.pendencias)
      await reload()
    }
    setShowNewDemandaModal(false)
  }, [handleCreate, handleAddToDay, handleSyncPendencias, reload, selectedDate])

  const handleEditDemanda = useCallback(async (data: { codigo: string; tipo: TipoDemanda; setorAtual: string; pendencias: string[] }) => {
    if (!editingItem) return
    await handleUpdate(editingItem.demanda.id, { tipo: data.tipo, setorAtual: data.setorAtual, pendencias: data.pendencias }, selectedDate)
    await handleSyncPendencias(editingItem.entry.id, data.pendencias)
    setEditingItem(null)
  }, [editingItem, handleUpdate, handleSyncPendencias, selectedDate])

  const handleCreateNewDay = useCallback(async (date: string, pullPrevious: boolean) => {
    if (pullPrevious) {
      const prev = prevDay(date)
      const prevEntries = await getEntriesByDate(prev)
      const allDemandas = await getDemandas()
      const demandaMap = new Map(allDemandas.map(d => [d.id, d]))

      const existingOnNewDay = await getEntriesByDate(date)
      const existingDemandaIds = new Set(existingOnNewDay.map(e => e.demandaId))

      const toCarry = prevEntries.filter(e => {
        const d = demandaMap.get(e.demandaId)
        return d && d.status !== 'finalizada' && !existingDemandaIds.has(e.demandaId)
      })

      for (let i = 0; i < toCarry.length; i++) {
        const e = toCarry[i]
        const d = demandaMap.get(e.demandaId)!
        const uncheckedPendencias = d.pendencias.filter(p => !e.pendenciasChecks[p])
        await createEntry({ date, demandaId: e.demandaId, pendencias: d.pendencias }, existingOnNewDay.length + i)
        void uncheckedPendencias
      }
    }
    setSelectedDate(date)
    setShowNewDayModal(false)
    await reload()
  }, [reload])

  return (
    <div className="page">
      <div className="page-header">
        <div className="date-control">
          <span className="date-label">Data:</span>
          <span className="date-display">{formatDateDisplay(selectedDate)}</span>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="date-picker"
          />
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setShowNewDayModal(true)}>+ Novo Dia</button>
          <button className="btn btn-primary" onClick={() => setShowNewDemandaModal(true)}>+ Demanda</button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma demanda neste dia.</p>
          <button className="btn btn-primary" onClick={() => setShowNewDemandaModal(true)}>Adicionar Demanda</button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={entries.map(e => e.entry.id)} strategy={verticalListSortingStrategy}>
            <div className="desktop-view">
              <table className="demanda-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Código</th>
                    <th>Tipo</th>
                    <th>Setor</th>
                    <th>Pendências</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(item => (
                    <DemandaRow
                      key={item.entry.id}
                      item={item}
                      onCheckSetor={handleCheckSetor}
                      onCheckPendencia={handleCheckPendencia}
                      onFinalize={handleFinalize}
                      onReopen={handleReopen}
                      onEdit={setEditingItem}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mobile-view">
              {entries.map(item => (
                <DemandaCard
                  key={item.entry.id}
                  item={item}
                  onCheckSetor={handleCheckSetor}
                  onCheckPendencia={handleCheckPendencia}
                  onFinalize={handleFinalize}
                  onReopen={handleReopen}
                  onEdit={setEditingItem}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {showNewDemandaModal && (
        <DemandaModal
          onSave={handleNewDemanda}
          onClose={() => setShowNewDemandaModal(false)}
        />
      )}

      {editingItem && (
        <DemandaModal
          initial={editingItem.demanda}
          onSave={handleEditDemanda}
          onClose={() => setEditingItem(null)}
          title="Editar Demanda"
        />
      )}

      {showNewDayModal && (
        <NewDayModal
          defaultDate={todayStr()}
          onConfirm={handleCreateNewDay}
          onClose={() => setShowNewDayModal(false)}
        />
      )}
    </div>
  )
}
