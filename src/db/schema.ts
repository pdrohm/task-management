import Dexie, { type Table } from 'dexie'
import type { Demanda, DailyEntry, HistoryEvent } from '../domain/types'

class AgendaDB extends Dexie {
  demandas!: Table<Demanda, string>
  dailyEntries!: Table<DailyEntry, string>
  historyEvents!: Table<HistoryEvent, string>

  constructor() {
    super('AgendaDemandas')
    this.version(1).stores({
      demandas: 'id, codigo, status, createdAt',
      dailyEntries: 'id, date, demandaId, ordem',
      historyEvents: 'id, demandaId, dateRef, timestamp, type',
    })
  }
}

export const db = new AgendaDB()
