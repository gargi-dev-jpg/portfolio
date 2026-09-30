import { useState, useEffect } from 'react';
import { portfolioData } from './data';
import AiAssistantCard from './components/AiAssistantCard';
import './index.css';

function App() {
  // State for Dark/Light mode, defaults to dark
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // State for copy email button feedback
  const [emailCopied, setEmailCopied] = useState(false);

  // State for image modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [kudosCount, setKudosCount] = useState(null);
  const [kudosError, setKudosError] = useState('');
  const [isGivingKudos, setIsGivingKudos] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [messageStatus, setMessageStatus] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Apply theme to document on mount and when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
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

    // Reveal each card when it enters view, then stop observing it.
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
  }, []);

  // Fetch the saved count once when the page loads, then show it in the card.
  useEffect(() => {
    async function loadKudos() {
      try {
        // fetch() asks the backend for data; await lets us use its response below.
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error('Could not load kudos.');
        const data = await response.json();
        setKudosCount(data.kudos);
      } catch {
        setKudosError('Kudos are unavailable right now.');
      }
    }

    loadKudos();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(portfolioData.email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      setEmailCopied(false);
    }
  };

  async function giveKudos() {
    setIsGivingKudos(true);
    setKudosError('');
    try {
      // POST tells Express to update the counter; the returned count keeps the UI in sync.
      const response = await fetch('/api/kudos', { method: 'POST' });
      if (!response.ok) throw new Error('Could not add kudos.');
      const data = await response.json();
      setKudosCount(data.kudos);
    } catch {
      setKudosError('Could not send kudos. Please try again.');
    } finally {
      setIsGivingKudos(false);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    setIsSendingMessage(true);
    setMessageStatus('');
    try {
      // JSON.stringify turns the form values into JSON that the Express route can read.
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (!response.ok) throw new Error('Could not send your message.');
      setMessageStatus('Message sent! ✓');
      setContactForm({ name: '', email: '', message: '' });
    } catch {
      setMessageStatus('Could not send your note. Please try again.');
    } finally {
      setIsSendingMessage(false);
    }
  }

  return (
    <>
      <header className="header">
        <div className="navbar-inner">
          <a className="brand-link" href="#about">{portfolioData.name}</a>
          <nav className="nav-links" aria-label="Main navigation">
            <a href="#about">About</a>
            <a href="#skills">Skills</a>
            <a href="#education">Education</a>
            <a href="#projects">Projects</a>
            <a href="#ai">Ask AI</a>
            <a href="#contact">Contact</a>
          </nav>
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      <main className="bento-container">
        {/* Intro & Profile Card */}
        <section id="about" className="bento-card profile-card reveal-on-scroll">
          <div className="profile-header">
            <img 
              src={portfolioData.assets.photo} 
              alt={portfolioData.name} 
              className="profile-img" 
              onClick={() => setIsModalOpen(true)}
              title="Click to enlarge"
            />
            <div>
              <h1 className="profile-title">Hi, I'm {portfolioData.name.split(' ')[0]} 👋</h1>
              <p className="profile-role">{portfolioData.role}</p>
            </div>
          </div>
          <p className="profile-bio">{portfolioData.bio}</p>
          <div className="status-badge">
            <div className="status-dot"></div>
            Currently learning & building
          </div>
        </section>

        {/* Resume & Quick Links Card */}
        <section className="bento-card links-card reveal-on-scroll">
          <div className="links-grid">
            <a href={portfolioData.assets.resume} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              📄 View Resume
            </a>
            <div className="email-actions">
              <button onClick={copyEmail} className="btn btn-outline">
                ✉️ {emailCopied ? 'Copied! ✓' : 'Copy Email'}
              </button>
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${portfolioData.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                Mail via Gmail ↗
              </a>
            </div>
            {portfolioData.socials.map(social => (
              <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                {social.icon} {social.name}
              </a>
            ))}
          </div>
        </section>

        {/* Kudos Card */}
        <section className="bento-card kudos-card reveal-on-scroll">
          <h2>Enjoying the portfolio?</h2>
          <p className="card-copy">Leave a little encouragement for the next build.</p>
          <button type="button" className="btn btn-primary" onClick={giveKudos} disabled={isGivingKudos || kudosCount === null}>
            👋 Give Kudos{ kudoCountLabel(kudosCount) }
          </button>
          {kudosError && <p className="form-feedback" role="status">{kudosError}</p>}
        </section>

        {/* Quick Note Card */}
        <section id="contact" className="bento-card note-card reveal-on-scroll">
          <h2>Send a Quick Note</h2>
          <form className="note-form" onSubmit={sendMessage}>
            <div className="note-fields">
              <label>
                Name
                <input
                  name="name"
                  autoComplete="name"
                  value={contactForm.name}
                  onChange={event => setContactForm({ ...contactForm, name: event.target.value })}
                  required
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={contactForm.email}
                  onChange={event => setContactForm({ ...contactForm, email: event.target.value })}
                  required
                />
              </label>
            </div>
            <label>
              Message
              <textarea
                name="message"
                rows="3"
                value={contactForm.message}
                onChange={event => setContactForm({ ...contactForm, message: event.target.value })}
                required
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={isSendingMessage}>
              {isSendingMessage ? 'Sending...' : 'Send Note'}
            </button>
            {messageStatus && <p className="form-feedback" role="status">{messageStatus}</p>}
          </form>
        </section>

        <AiAssistantCard />

        {/* Skills Card */}
        <section id="skills" className="bento-card skills-card reveal-on-scroll">
          <h2>Technical Skills</h2>
          <div className="skills-grid">
            <div className="skill-category-card">
              <div className="skill-category-header">💻 Languages</div>
              <div className="skills-list">
                {portfolioData.skills.languages.map(skill => (
                  <span key={skill} className="skill-pill">{skill}</span>
                ))}
              </div>
            </div>
            <div className="skill-category-card">
              <div className="skill-category-header">🌐 Web Technologies</div>
              <div className="skills-list">
                {portfolioData.skills.web.map(skill => (
                  <span key={skill} className="skill-pill">{skill}</span>
                ))}
              </div>
            </div>
            <div className="skill-category-card">
              <div className="skill-category-header">🧠 Core CS</div>
              <div className="skills-list">
                {portfolioData.skills.core.map(skill => (
                  <span key={skill} className="skill-pill">{skill}</span>
                ))}
              </div>
            </div>
            <div className="skill-category-card">
              <div className="skill-category-header">🛠️ Tools & Concepts</div>
              <div className="skills-list">
                {portfolioData.skills.tools.map(skill => (
                  <span key={skill} className="skill-pill">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Education and Resume Highlights */}
        <section id="education" className="bento-card chart-card resume-card reveal-on-scroll">
          <h2>Education & Highlights</h2>
          <div className="resume-grid">
            <article className="resume-panel education-panel">
              <p className="resume-label">Education</p>
              <h3>{portfolioData.education.degree}</h3>
              <p>{portfolioData.education.institution} · {portfolioData.education.location}</p>
              <p>{portfolioData.education.specialization} · Expected {portfolioData.education.expected}</p>
              <div className="education-stats">
                <div><span>CGPA</span><strong>{portfolioData.education.cgpa}</strong></div>
                <div><span>Semester SGPA</span><strong>{portfolioData.education.semesterResults.join(' · ')}</strong></div>
              </div>
              <p className="coursework"><strong>Relevant coursework:</strong> {portfolioData.education.coursework.join(', ')}</p>
            </article>
            <article className="resume-panel">
              <p className="resume-label">Work Experience</p>
              <h3>No formal work experience yet</h3>
              <p>{portfolioData.workExperience.replace('No formal work experience yet. ', '')}</p>
            </article>
            <article className="resume-panel">
              <p className="resume-label">Hackathons</p>
              {portfolioData.hackathons.map(item => (
                <div className="resume-highlight" key={item.name}>
                  <h3>{item.name}</h3>
                  <p>{item.detail}</p>
                </div>
              ))}
            </article>
            <article className="resume-panel">
              <p className="resume-label">Academic Achievement · {portfolioData.academicAchievement.period}</p>
              <h3>{portfolioData.academicAchievement.title}</h3>
              <p>{portfolioData.academicAchievement.detail}</p>
            </article>
          </div>
          <div className="resume-certifications">
            <h3>Certifications & Workshops</h3>
            <div className="skills-list">
              {portfolioData.certifications.map(certification => (
                <span key={certification} className="skill-pill">{certification}</span>
              ))}
            </div>
          </div>
          <p className="spoken-languages"><strong>Languages:</strong> {portfolioData.spokenLanguages.join(' · ')}</p>
        </section>

        {/* Projects Card container */}
        <section id="projects" className="bento-card projects-card">
          {portfolioData.projects.map(project => (
            <article key={project.title} className="project-item reveal-on-scroll">
              <h3 className="project-title">{project.title}</h3>
              <p className="project-desc">{project.description}</p>
              <div className="project-tags">
                {project.tags.map(tag => (
                  <span key={tag} className="project-tag">{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>

      {/* Circular Image Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="circular-modal" onClick={(e) => e.stopPropagation()}>
            <img src={portfolioData.assets.photo} alt="Profile Enlarged" />
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
          </div>
        </div>
      )}

    </>
  );
}

function kudoCountLabel(count) {
  return count === null ? ' (...)' : ` (${count})`;
}

export default App;
