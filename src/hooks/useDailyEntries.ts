import { useState, useEffect, useCallback } from 'react'
import type { DailyEntry, Demanda } from '../domain/types'
import { getEntriesByDate, createEntry, checkSetor, checkPendencia, finalizeEntry, reopenEntry, updateEntryOrdem, syncPendenciasInEntry } from '../db/repos/dailyEntryRepo'
import { getDemandaById } from '../db/repos/demandaRepo'

export interface EntryWithDemanda {
  entry: DailyEntry
  demanda: Demanda
}

export function useDailyEntries(date: string) {
  const [entries, setEntries] = useState<EntryWithDemanda[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const rawEntries = await getEntriesByDate(date)
    const withDemandas = await Promise.all(
      rawEntries.map(async entry => {
        const demanda = await getDemandaById(entry.demandaId)
        return demanda ? { entry, demanda } : null
      })
    )
    setEntries(withDemandas.filter(Boolean) as EntryWithDemanda[])
    setLoading(false)
  }, [date])

  useEffect(() => {
    reload()
  }, [reload])

  const handleCheckSetor = useCallback(async (entryId: string, demandaId: string) => {
    await checkSetor(entryId, date, demandaId)
    await reload()
  }, [date, reload])

  const handleCheckPendencia = useCallback(async (
    entryId: string,
    demandaId: string,
    pendencia: string,
    checked: boolean
  ) => {
    await checkPendencia(entryId, date, demandaId, pendencia, checked)
    await reload()
  }, [date, reload])

  const handleFinalize = useCallback(async (entryId: string, demandaId: string) => {
    await finalizeEntry(entryId, date, demandaId)
    await reload()
  }, [date, reload])

  const handleReopen = useCallback(async (entryId: string, demandaId: string) => {
    await reopenEntry(entryId, date, demandaId)
    await reload()
  }, [date, reload])

  const handleReorder = useCallback(async (reordered: EntryWithDemanda[]) => {
    const updates = reordered.map((item, idx) => ({ id: item.entry.id, ordem: idx }))
    await updateEntryOrdem(updates)
    setEntries(reordered)
  }, [])

  const handleAddToDay = useCallback(async (demandaId: string, pendencias: string[]) => {
    await createEntry({ date, demandaId, pendencias })
    await reload()
  }, [date, reload])

  const handleSyncPendencias = useCallback(async (entryId: string, pendencias: string[]) => {
    await syncPendenciasInEntry(entryId, pendencias)
    await reload()
  }, [reload])

  return {
    entries,
    loading,
    reload,
    handleCheckSetor,
    handleCheckPendencia,
    handleFinalize,
    handleReopen,
    handleReorder,
    handleAddToDay,
    handleSyncPendencias,
  }
}
