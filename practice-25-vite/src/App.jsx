import { lazy, Suspense } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';

// Главная — в основном бандле
import Home from './pages/Home.jsx';

// Тяжёлые страницы — отдельные чанки (lazy loading)
const Catalog = lazy(() => import('./pages/Catalog.jsx'));
const About   = lazy(() => import('./pages/About.jsx'));

function Loader() {
  return <div className="loader">Загрузка чанка…</div>;
}

export default function App() {
  return (
    <div className="page">
      <header className="header">
        <h1 className="brand">🚗 Cars Catalog</h1>
        <nav className="nav">
          <NavLink to="/"        end className={({isActive}) => isActive ? 'nav__link active' : 'nav__link'}>Главная</NavLink>
          <NavLink to="/catalog"     className={({isActive}) => isActive ? 'nav__link active' : 'nav__link'}>Каталог</NavLink>
          <NavLink to="/about"       className={({isActive}) => isActive ? 'nav__link active' : 'nav__link'}>О нас</NavLink>
        </nav>
      </header>

      <main className="main">
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/"        element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/about"   element={<About />} />
          </Routes>
        </Suspense>
      </main>

      <footer className="footer">Vite + React + Lazy Loading + Bundle Analyzer</footer>
    </div>
  );
}
