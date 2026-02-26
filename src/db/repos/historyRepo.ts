import { v4 as uuidv4 } from 'uuid'
import { db } from '../schema'
import type { HistoryEvent, HistoryEventType } from '../../domain/types'

interface AddHistoryParams {
  demandaId: string
  dateRef: string
  type: HistoryEventType
  payload: Record<string, unknown>
}

export async function addHistoryEvent(params: AddHistoryParams): Promise<void> {
  const event: HistoryEvent = {
    id: uuidv4(),
    demandaId: params.demandaId,
    dateRef: params.dateRef,
    timestamp: new Date().toISOString(),
    type: params.type,
    payload: params.payload,
  }
  await db.historyEvents.add(event)
}

export async function getHistoryByDemanda(demandaId: string): Promise<HistoryEvent[]> {
  return db.historyEvents.where('demandaId').equals(demandaId).sortBy('timestamp')
}

export async function getHistoryByDate(dateRef: string): Promise<HistoryEvent[]> {
  return db.historyEvents.where('dateRef').equals(dateRef).sortBy('timestamp')
}
