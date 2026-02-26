import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Hoje } from './pages/Hoje'
import { Historico } from './pages/Historico'
import { Estatisticas } from './pages/Estatisticas'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Hoje />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/estatisticas" element={<Estatisticas />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
