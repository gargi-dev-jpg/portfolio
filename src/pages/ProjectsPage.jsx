import PageLayout from '../components/PageLayout';
import { portfolioData } from '../data';

function ProjectsPage() {
  return (
    <PageLayout eyebrow="Projects" title="Selected Projects" description="Web applications, AI experiments, and systems built during coursework and independent practice.">
      <section className="projects-card projects-page-grid">
        {portfolioData.projects.map(project => (
          <article key={project.title} className="project-item reveal-on-scroll">
            <p className="project-period">{project.period}</p>
            <h2 className="project-title">{project.title}</h2>
            <p className="project-desc">{project.description}</p>
            <div className="project-tags">
              {project.tags.map(tag => <span key={tag} className="project-tag">{tag}</span>)}
            </div>
          </article>
        ))}
      </section>
    </PageLayout>
  );
}

export default ProjectsPage;