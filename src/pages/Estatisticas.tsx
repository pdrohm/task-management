import { useStats } from '../hooks/useStats'
import type { TipoDemanda } from '../domain/types'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

const TIPO_COLORS: Record<TipoDemanda, string> = {
  SNF: '#2563eb',
  Desenvolvimento: '#16a34a',
  Melhoria: '#d97706',
  Outros: '#6b7280',
}

export function Estatisticas() {
  const today = todayStr()
  const stats = useStats(today)

  return (
    <div className="page">
      <h1 className="page-title">Estatísticas</h1>

      <section className="stats-section">
        <h2>Hoje</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.hoje.total}</div>
            <div className="stat-label">Total no dia</div>
          </div>
          <div className="stat-card stat-card-green">
            <div className="stat-value">{stats.hoje.finalizadas}</div>
            <div className="stat-label">Finalizadas</div>
          </div>
          <div className="stat-card stat-card-blue">
            <div className="stat-value">{stats.hoje.abertas}</div>
            <div className="stat-label">Abertas</div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <h2>Semana (últimos 7 dias)</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.semana.total}</div>
            <div className="stat-label">Total de entradas</div>
          </div>
          <div className="stat-card stat-card-green">
            <div className="stat-value">{stats.semana.finalizadas}</div>
            <div className="stat-label">Finalizadas</div>
          </div>
          <div className="stat-card stat-card-blue">
            <div className="stat-value">{stats.semana.abertas}</div>
            <div className="stat-label">Abertas</div>
          </div>
          <div className="stat-card stat-card-gray">
            <div className="stat-value">{stats.semana.mediaDiaria}</div>
            <div className="stat-label">Média diária</div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <h2>Por Tipo (semana, demandas únicas)</h2>
        <div className="tipo-bars">
          {(Object.entries(stats.semana.porTipo) as [TipoDemanda, number][]).map(([tipo, count]) => (
            <div key={tipo} className="tipo-bar-row">
              <span className="tipo-bar-label" style={{ color: TIPO_COLORS[tipo] }}>{tipo}</span>
              <div className="tipo-bar-track">
                <div
                  className="tipo-bar-fill"
                  style={{
                    width: `${stats.semana.total > 0 ? Math.round((count / Math.max(...Object.values(stats.semana.porTipo), 1)) * 100) : 0}%`,
                    backgroundColor: TIPO_COLORS[tipo],
                  }}
                />
              </div>
              <span className="tipo-bar-count">{count}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
