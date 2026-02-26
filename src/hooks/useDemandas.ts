import { useState, useEffect, useCallback } from 'react'
import type { Demanda, TipoDemanda } from '../domain/types'
import { getDemandas, createDemanda, updateDemanda, getDemandaByCodigo } from '../db/repos/demandaRepo'
import { addHistoryEvent } from '../db/repos/historyRepo'

export function useDemandas() {
  const [demandas, setDemandas] = useState<Demanda[]>([])

  const reload = useCallback(async () => {
    const all = await getDemandas()
    setDemandas(all)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const handleCreate = useCallback(async (
    data: { codigo: string; tipo: TipoDemanda; setorAtual: string; pendencias: string[] },
    dateRef: string
  ): Promise<{ demanda: Demanda; isNew: boolean }> => {
    const existing = await getDemandaByCodigo(data.codigo)
    if (existing) {
      if (data.tipo !== existing.tipo || data.setorAtual !== existing.setorAtual) {
        await updateDemanda(existing.id, { tipo: data.tipo, setorAtual: data.setorAtual, pendencias: data.pendencias }, dateRef)
        await reload()
        const updated = { ...existing, tipo: data.tipo, setorAtual: data.setorAtual, pendencias: data.pendencias }
        return { demanda: updated, isNew: false }
      }
      return { demanda: existing, isNew: false }
    }
    const demanda = await createDemanda(data, dateRef)
    await reload()
    return { demanda, isNew: true }
  }, [reload])

  const handleUpdate = useCallback(async (
    id: string,
    changes: Partial<Pick<Demanda, 'tipo' | 'setorAtual' | 'pendencias'>>,
    dateRef: string
  ) => {
    await updateDemanda(id, changes, dateRef)
    if (changes.pendencias) {
      await addHistoryEvent({
        demandaId: id,
        dateRef,
        type: 'PENDENCIA_ADDED',
        payload: { pendencias: changes.pendencias },
      })
    }
    await reload()
  }, [reload])

  return { demandas, reload, handleCreate, handleUpdate }
}
