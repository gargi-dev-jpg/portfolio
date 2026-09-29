import { useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import AboutPage from './pages/AboutPage';
import AskAiPage from './pages/AskAiPage';
import ContactPage from './pages/ContactPage';
import EducationPage from './pages/EducationPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import ProjectsPage from './pages/ProjectsPage';
import SkillsPage from './pages/SkillsPage';
import { portfolioData } from './data';
import './index.css';

const navItems = [
  { label: 'About', path: '/about' },
  { label: 'Skills', path: '/skills' },
  { label: 'Education', path: '/education' },
  { label: 'Projects', path: '/projects' },
  { label: 'Ask AI', path: '/ask-ai' },
  { label: 'Contact', path: '/contact' },
];

function AppRouter() {
  return (
    <BrowserRouter>
      <PortfolioLayout />
    </BrowserRouter>
  );
}

function PortfolioLayout() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const cards = document.querySelectorAll('.reveal-on-scroll');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (document.hidden) {
      cards.forEach(card => {
        card.style.transition = 'none';
        card.classList.add('is-visible');
      });
      return;
    }

    if (!('IntersectionObserver' in window) || reduceMotion) {
      cards.forEach(card => card.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

    cards.forEach((card, index) => {
      card.style.setProperty('--reveal-delay', `${(index % 4) * 70}ms`);
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme(current => current === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <header className="header">
        <div className="navbar-inner">
          <NavLink className="brand-link" to="/" end>{portfolioData.name}</NavLink>
          <nav className="nav-links" aria-label="Main navigation">
            {navItems.map(item => (
              <NavLink key={item.path} to={item.path}>{item.label}</NavLink>
            ))}
          </nav>
          <button type="button" onClick={toggleTheme} className="theme-toggle">
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/education" element={<EducationPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/ask-ai" element={<AskAiPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default AppRouter;