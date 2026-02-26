import { NavLink } from 'react-router-dom'

export function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar-brand">Agenda de Demandas</span>
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Hoje
        </NavLink>
        <NavLink to="/historico" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Histórico
        </NavLink>
        <NavLink to="/estatisticas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Estatísticas
        </NavLink>
      </div>
    </nav>
  )
}
