import { useState } from 'react'

interface Props {
  defaultDate: string
  onConfirm: (date: string, pullPrevious: boolean) => void
  onClose: () => void
}

export function NewDayModal({ defaultDate, onConfirm, onClose }: Props) {
  const [date, setDate] = useState(defaultDate)
  const [pullPrevious, setPullPrevious] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return
    onConfirm(date, pullPrevious)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Criar Novo Dia</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Data
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </label>
          <label className="label-checkbox">
            <input
              type="checkbox"
              checked={pullPrevious}
              onChange={e => setPullPrevious(e.target.checked)}
            />
            Puxar demandas não finalizadas do dia anterior
          </label>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Criar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
