import { v4 as uuidv4 } from 'uuid'
import { db } from '../schema'
import type { Demanda, TipoDemanda } from '../../domain/types'
import { addHistoryEvent } from './historyRepo'

export async function getDemandas(): Promise<Demanda[]> {
  return db.demandas.toArray()
}

export async function getDemandaById(id: string): Promise<Demanda | undefined> {
  return db.demandas.get(id)
}

export async function getDemandaByCodigo(codigo: string): Promise<Demanda | undefined> {
  return db.demandas.where('codigo').equals(codigo).first()
}

export async function createDemanda(
  data: { codigo: string; tipo: TipoDemanda; setorAtual: string; pendencias: string[] },
  dateRef: string
): Promise<Demanda> {
  const now = new Date().toISOString()
  const demanda: Demanda = {
    id: uuidv4(),
    ...data,
    status: 'aberta',
    createdAt: now,
    updatedAt: now,
  }
  await db.demandas.add(demanda)
  await addHistoryEvent({
    demandaId: demanda.id,
    dateRef,
    type: 'CREATED',
    payload: { codigo: data.codigo, tipo: data.tipo, setorAtual: data.setorAtual },
  })
  return demanda
}

export async function updateDemanda(
  id: string,
  changes: Partial<Pick<Demanda, 'tipo' | 'setorAtual' | 'pendencias' | 'status'>>,
  dateRef: string
): Promise<void> {
  await db.demandas.update(id, { ...changes, updatedAt: new Date().toISOString() })
  await addHistoryEvent({
    demandaId: id,
    dateRef,
    type: changes.status === 'finalizada' ? 'FINALIZED' : changes.status === 'aberta' ? 'REOPENED' : 'DEMANDA_UPDATED',
    payload: changes as Record<string, unknown>,
  })
}
