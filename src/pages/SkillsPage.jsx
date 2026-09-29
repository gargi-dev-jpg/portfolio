import PageLayout from '../components/PageLayout';
import { portfolioData } from '../data';

const skillGroups = [
  { title: '💻 Languages', skills: portfolioData.skills.languages },
  { title: '🌐 Web Technologies', skills: portfolioData.skills.web },
  { title: '🧠 Core CS', skills: portfolioData.skills.core },
  { title: '🛠️ Tools & Concepts', skills: portfolioData.skills.tools },
];

function SkillsPage() {
  return (
    <PageLayout eyebrow="Skills" title="Technical Skills" description="Tools and concepts from Gargi’s coursework and projects.">
      <section className="skills-grid skills-page-grid">
        {skillGroups.map(group => (
          <article className="skill-category-card reveal-on-scroll" key={group.title}>
            <h2 className="skill-category-header">{group.title}</h2>
            <div className="skills-list">
              {group.skills.map(skill => <span key={skill} className="skill-pill">{skill}</span>)}
            </div>
          </article>
        ))}
      </section>
    </PageLayout>
  );
}

export default SkillsPage;