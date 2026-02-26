export type TipoDemanda = 'SNF' | 'Desenvolvimento' | 'Melhoria' | 'Outros'

export type StatusDemanda = 'aberta' | 'finalizada'

export type StatusNoDia = 'aberta' | 'finalizada'

export type HistoryEventType =
  | 'CREATED'
  | 'DEMANDA_UPDATED'
  | 'SETOR_CHECKED'
  | 'PENDENCIA_ADDED'
  | 'PENDENCIA_CHECKED'
  | 'MOVED_TO_DAY'
  | 'FINALIZED'
  | 'REOPENED'

export interface Demanda {
  id: string
  codigo: string
  tipo: TipoDemanda
  setorAtual: string
  pendencias: string[]
  status: StatusDemanda
  createdAt: string
  updatedAt: string
}

export interface DailyEntry {
  id: string
  date: string
  demandaId: string
  ordem: number
  checkSetor: boolean
  pendenciasChecks: Record<string, boolean>
  statusNoDia: StatusNoDia
  notes?: string
}

export interface HistoryEvent {
  id: string
  demandaId: string
  dateRef: string
  timestamp: string
  type: HistoryEventType
  payload: Record<string, unknown>
}
