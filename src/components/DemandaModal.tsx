import { useState, useEffect } from 'react'
import type { Demanda, TipoDemanda } from '../domain/types'

const TIPOS: TipoDemanda[] = ['SNF', 'Desenvolvimento', 'Melhoria', 'Outros']

interface Props {
  initial?: Partial<Demanda>
  onSave: (data: { codigo: string; tipo: TipoDemanda; setorAtual: string; pendencias: string[] }) => void
  onClose: () => void
  title?: string
}

export function DemandaModal({ initial, onSave, onClose, title = 'Nova Demanda' }: Props) {
  const [codigo, setCodigo] = useState(initial?.codigo ?? '')
  const [tipo, setTipo] = useState<TipoDemanda>(initial?.tipo ?? 'SNF')
  const [setorAtual, setSetorAtual] = useState(initial?.setorAtual ?? '')
  const [pendenciasRaw, setPendenciasRaw] = useState((initial?.pendencias ?? []).join(', '))

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!codigo.trim() || !setorAtual.trim()) return
    const pendencias = pendenciasRaw.split(',').map(p => p.trim()).filter(Boolean)
    onSave({ codigo: codigo.trim(), tipo, setorAtual: setorAtual.trim(), pendencias })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Código
            <input
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              placeholder="ex: SNF-1700"
              required
              disabled={!!initial?.id}
            />
          </label>
          <label>
            Tipo
            <select value={tipo} onChange={e => setTipo(e.target.value as TipoDemanda)}>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label>
            Setor Atual
            <input
              value={setorAtual}
              onChange={e => setSetorAtual(e.target.value)}
              placeholder="ex: Engenharia"
              required
            />
          </label>
          <label>
            Pendências
            <input
              value={pendenciasRaw}
              onChange={e => setPendenciasRaw(e.target.value)}
              placeholder="ex: R, V, Aprovação"
            />
            <span className="input-hint">Separadas por vírgula</span>
          </label>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
