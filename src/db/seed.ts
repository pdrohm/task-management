import { db } from './schema'
import { createDemanda } from './repos/demandaRepo'
import { createEntry } from './repos/dailyEntryRepo'

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export async function runSeedIfEmpty(): Promise<void> {
  const count = await db.demandas.count()
  if (count > 0) return

  const today = todayStr()

  const d1 = await createDemanda(
    { codigo: 'SNF-1700', tipo: 'SNF', setorAtual: 'Engenharia', pendencias: ['R', 'V'] },
    today
  )
  const d2 = await createDemanda(
    { codigo: 'Servitech-1658', tipo: 'Desenvolvimento', setorAtual: 'Comercial', pendencias: ['Aprovação'] },
    today
  )
  const d3 = await createDemanda(
    { codigo: 'Projeto X', tipo: 'Melhoria', setorAtual: 'TI', pendencias: [] },
    today
  )

  await createEntry({ date: today, demandaId: d1.id, pendencias: d1.pendencias }, 0)
  await createEntry({ date: today, demandaId: d2.id, pendencias: d2.pendencias }, 1)
  await createEntry({ date: today, demandaId: d3.id, pendencias: d3.pendencias }, 2)
}
