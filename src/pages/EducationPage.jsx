import PageLayout from '../components/PageLayout';
import { portfolioData } from '../data';

function EducationPage() {
  const education = portfolioData.education;

  return (
    <PageLayout eyebrow="Education" title="Education & Highlights" description="Academic background and milestones from Gargi’s resume.">
      <section className="bento-card resume-card page-card reveal-on-scroll">
        <div className="resume-grid">
          <article className="resume-panel education-panel">
            <p className="resume-label">Education</p>
            <h2>{education.degree}</h2>
            <p>{education.institution} · {education.location}</p>
            <p>{education.specialization} · Expected {education.expected}</p>
            <div className="education-stats">
              <div><span>CGPA</span><strong>{education.cgpa}</strong></div>
              <div><span>Semester SGPA</span><strong>{education.semesterResults.join(' · ')}</strong></div>
            </div>
            <p className="coursework"><strong>Relevant coursework:</strong> {education.coursework.join(', ')}</p>
          </article>
          <article className="resume-panel">
            <p className="resume-label">Work Experience</p>
            <h2>No formal work experience yet</h2>
            <p>{portfolioData.workExperience.replace('No formal work experience yet. ', '')}</p>
          </article>
          <article className="resume-panel">
            <p className="resume-label">Hackathons</p>
            {portfolioData.hackathons.map(item => (
              <div className="resume-highlight" key={item.name}>
                <h2>{item.name}</h2>
                <p>{item.detail}</p>
              </div>
            ))}
          </article>
          <article className="resume-panel">
            <p className="resume-label">Academic Achievement · {portfolioData.academicAchievement.period}</p>
            <h2>{portfolioData.academicAchievement.title}</h2>
            <p>{portfolioData.academicAchievement.detail}</p>
          </article>
        </div>
        <section className="resume-certifications">
          <h2>Certifications & Workshops</h2>
          <div className="skills-list">
            {portfolioData.certifications.map(certification => <span key={certification} className="skill-pill">{certification}</span>)}
          </div>
        </section>
        <p className="spoken-languages"><strong>Languages:</strong> {portfolioData.spokenLanguages.join(' · ')}</p>
      </section>
    </PageLayout>
  );
}

export default EducationPage;