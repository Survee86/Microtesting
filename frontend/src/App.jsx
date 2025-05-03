import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Auth from './pages/Auth/Auth';
import Dashboard from './pages/Dashboard/Dashboard';
import ContentPage from './pages/ContentPage/ContentPage';
import Header from './components/Header/Header';
import Register from './pages/Auth/Register';
import AppBreadcrumbs from './components/Breadcrumbs/Breadcrumbs';

function App() {
  return (
    <div className="app">
      <Header />
      

      <main className="main-content">
        
        <AppBreadcrumbs />
        
        <Routes>
          {/* Основные маршруты */}
          
          <Route path="/"           element={<Home />} />
          <Route path="/auth"       element={<Auth />} />
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/register"   element={<Register />} />

          {/* Маршруты компании */}

          <Route path="/company" element={<div>Страница компании</div>} />
          <Route path="/about" element={<ContentPage title="О компании" />} />
          <Route path="/team" element={<ContentPage title="Команда" />} />
          <Route path="/mission" element={<ContentPage title="Миссия" />} />
          <Route path="/contacts" element={<ContentPage title="Контакты" />} />

          {/* Маршруты сервисов */}

          <Route path="/services" element={<div>Страница сервисов</div>} />
          <Route
            path="/bannikoff"
            element={<ContentPage title="Bannikoff" />}
          />
          <Route
            path="/moex-notes"
            element={<ContentPage title="Замечания Moex" />}
          />

          {/* Маршруты услуг */}

          <Route path="/offerings" element={<div>Страница услуг</div>} />
          <Route
            path="/web-dev"
            element={<ContentPage title="Разработка сайтов" />}
          />
          <Route
            path="/app-dev"
            element={<ContentPage title="Разработка приложений" />}
          />
          <Route
            path="/project-management"
            element={<ContentPage title="Управление проектом" />}
          />
          <Route
            path="/consulting"
            element={<ContentPage title="Консалтинг" />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
