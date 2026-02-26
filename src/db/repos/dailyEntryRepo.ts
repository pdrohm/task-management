import { v4 as uuidv4 } from 'uuid'
import { db } from '../schema'
import type { DailyEntry } from '../../domain/types'
import { addHistoryEvent } from './historyRepo'
import { updateDemanda } from './demandaRepo'

export async function getEntriesByDate(date: string): Promise<DailyEntry[]> {
  const entries = await db.dailyEntries.where('date').equals(date).toArray()
  return entries.sort((a, b) => a.ordem - b.ordem)
}

export async function getEntryById(id: string): Promise<DailyEntry | undefined> {
  return db.dailyEntries.get(id)
}

export async function getEntryByDateAndDemanda(date: string, demandaId: string): Promise<DailyEntry | undefined> {
  return db.dailyEntries.where('date').equals(date).and(e => e.demandaId === demandaId).first()
}

export async function createEntry(
  data: { date: string; demandaId: string; pendencias: string[] },
  ordem?: number
): Promise<DailyEntry> {
  const existingEntries = await getEntriesByDate(data.date)
  const nextOrdem = ordem ?? (existingEntries.length > 0 ? Math.max(...existingEntries.map(e => e.ordem)) + 1 : 0)
  const entry: DailyEntry = {
    id: uuidv4(),
    date: data.date,
    demandaId: data.demandaId,
    ordem: nextOrdem,
    checkSetor: false,
    pendenciasChecks: Object.fromEntries(data.pendencias.map(p => [p, false])),
    statusNoDia: 'aberta',
  }
  await db.dailyEntries.add(entry)
  await addHistoryEvent({
    demandaId: data.demandaId,
    dateRef: data.date,
    type: 'MOVED_TO_DAY',
    payload: { date: data.date },
  })
  return entry
}

export async function checkSetor(entryId: string, date: string, demandaId: string): Promise<void> {
  await db.dailyEntries.update(entryId, { checkSetor: true })
  await addHistoryEvent({
    demandaId,
    dateRef: date,
    type: 'SETOR_CHECKED',
    payload: { entryId },
  })
}

export async function checkPendencia(
  entryId: string,
  date: string,
  demandaId: string,
  pendencia: string,
  checked: boolean
): Promise<void> {
  const entry = await db.dailyEntries.get(entryId)
  if (!entry) return
  const updatedChecks = { ...entry.pendenciasChecks, [pendencia]: checked }
  await db.dailyEntries.update(entryId, { pendenciasChecks: updatedChecks })
  await addHistoryEvent({
    demandaId,
    dateRef: date,
    type: 'PENDENCIA_CHECKED',
    payload: { pendencia, checked },
  })
}

export async function finalizeEntry(entryId: string, date: string, demandaId: string): Promise<void> {
  await db.dailyEntries.update(entryId, { statusNoDia: 'finalizada' })
  await updateDemanda(demandaId, { status: 'finalizada' }, date)
}

export async function reopenEntry(entryId: string, date: string, demandaId: string): Promise<void> {
  await db.dailyEntries.update(entryId, { statusNoDia: 'aberta' })
  await updateDemanda(demandaId, { status: 'aberta' }, date)
}

export async function updateEntryOrdem(entries: { id: string; ordem: number }[]): Promise<void> {
  await db.transaction('rw', db.dailyEntries, async () => {
    for (const e of entries) {
      await db.dailyEntries.update(e.id, { ordem: e.ordem })
    }
  })
}

export async function updateEntryNotes(entryId: string, notes: string): Promise<void> {
  await db.dailyEntries.update(entryId, { notes })
}

export async function syncPendenciasInEntry(entryId: string, allPendencias: string[]): Promise<void> {
  const entry = await db.dailyEntries.get(entryId)
  if (!entry) return
  const updatedChecks: Record<string, boolean> = {}
  for (const p of allPendencias) {
    updatedChecks[p] = entry.pendenciasChecks[p] ?? false
  }
  await db.dailyEntries.update(entryId, { pendenciasChecks: updatedChecks })
}

export async function getAllDates(): Promise<string[]> {
  const entries = await db.dailyEntries.toArray()
  const dates = [...new Set(entries.map(e => e.date))]
  return dates.sort((a, b) => b.localeCompare(a))
}
