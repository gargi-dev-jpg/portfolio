import { Link } from 'react-router-dom';
import KudosCard from '../components/KudosCard';
import PageLayout from '../components/PageLayout';
import { portfolioData } from '../data';

const pageCards = [
  { path: '/about', title: 'About', detail: 'Meet Gargi and explore her background.' },
  { path: '/skills', title: 'Skills', detail: 'Programming, web development, and core CS.' },
  { path: '/education', title: 'Education', detail: 'Degree, academic highlights, and certifications.' },
  { path: '/projects', title: 'Projects', detail: `${portfolioData.projects.length} projects across web, AI, and systems.` },
  { path: '/contact', title: 'Contact', detail: 'Send a note or find Gargi online.' },
];

function HomePage() {
  return (
    <PageLayout eyebrow="Portfolio · 2026" title={`Hi, I'm ${portfolioData.name}`} description={portfolioData.bio}>
      <section className="page-links-grid" aria-label="Explore portfolio pages">
        {pageCards.map(card => (
          <Link className="page-link-card" key={card.path} to={card.path}>
            <span className="page-card-arrow" aria-hidden="true">↗</span>
            <h2>{card.title}</h2>
            <p>{card.detail}</p>
          </Link>
        ))}
      </section>
      <KudosCard />
    </PageLayout>
  );
}

export default HomePage;