import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Auth from './pages/Auth/Auth'
import Dashboard from './pages/Dashboard/Dashboard'
import ContentPage from './pages/ContentPage/ContentPage'
import Header from './components/Header/Header'
import Register from './pages/Auth/Register'; 

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          
          {/* Динамические маршруты */}
          <Route path="/about" element={<ContentPage title="О компании" />} />
          <Route path="/team" element={<ContentPage title="Команда" />} />
          <Route path="/mission" element={<ContentPage title="Миссия" />} />
          <Route path="/contacts" element={<ContentPage title="Контакты" />} />
          <Route path="/bannikoff" element={<ContentPage title="Bannikoff" />} />
          <Route path="/moex-notes" element={<ContentPage title="Замечания Moex" />} />
          <Route path="/web-dev" element={<ContentPage title="Разработка сайтов" />} />
          <Route path="/app-dev" element={<ContentPage title="Разработка приложений" />} />
          <Route path="/project-management" element={<ContentPage title="Управление проектом" />} />
          <Route path="/consulting" element={<ContentPage title="Консалтинг" />} />
          <Route path="/survee" element={<ContentPage title="Опросы" />} />
        </Routes>
      </main>
    </div>
  )
}

export default App