import { useState, useEffect } from 'react'
import { db } from '../db/schema'
import type { TipoDemanda } from '../domain/types'

interface DayStats {
  total: number
  finalizadas: number
  abertas: number
}

interface WeekStats {
  total: number
  finalizadas: number
  abertas: number
  porTipo: Record<TipoDemanda, number>
  mediaDiaria: number
}

interface Stats {
  hoje: DayStats
  semana: WeekStats
}

function getWeekDates(): string[] {
  const dates: string[] = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

export function useStats(today: string) {
  const [stats, setStats] = useState<Stats>({
    hoje: { total: 0, finalizadas: 0, abertas: 0 },
    semana: { total: 0, finalizadas: 0, abertas: 0, porTipo: { SNF: 0, Desenvolvimento: 0, Melhoria: 0, Outros: 0 }, mediaDiaria: 0 },
  })

  useEffect(() => {
    async function compute() {
      const todayEntries = await db.dailyEntries.where('date').equals(today).toArray()
      const hojeTotal = todayEntries.length
      const hojeFinalizadas = todayEntries.filter(e => e.statusNoDia === 'finalizada').length

      const weekDates = getWeekDates()
      const weekEntries = await db.dailyEntries.where('date').anyOf(weekDates).toArray()

      const seenDemandaIds = new Set<string>()
      const porTipo: Record<TipoDemanda, number> = { SNF: 0, Desenvolvimento: 0, Melhoria: 0, Outros: 0 }
      let weekFinalizadas = 0

      for (const entry of weekEntries) {
        if (!seenDemandaIds.has(entry.demandaId)) {
          seenDemandaIds.add(entry.demandaId)
          const demanda = await db.demandas.get(entry.demandaId)
          if (demanda) porTipo[demanda.tipo] = (porTipo[demanda.tipo] ?? 0) + 1
        }
        if (entry.statusNoDia === 'finalizada') weekFinalizadas++
      }

      const daysWithEntries = new Set(weekEntries.map(e => e.date)).size
      const mediaDiaria = daysWithEntries > 0 ? weekEntries.length / daysWithEntries : 0

      setStats({
        hoje: {
          total: hojeTotal,
          finalizadas: hojeFinalizadas,
          abertas: hojeTotal - hojeFinalizadas,
        },
        semana: {
          total: weekEntries.length,
          finalizadas: weekFinalizadas,
          abertas: weekEntries.length - weekFinalizadas,
          porTipo,
          mediaDiaria: Math.round(mediaDiaria * 10) / 10,
        },
      })
    }
    compute()
  }, [today])

  return stats
}
