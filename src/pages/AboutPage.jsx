import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { portfolioData } from '../data';

function AboutPage() {
  const [emailCopied, setEmailCopied] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(portfolioData.email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      setEmailCopied(false);
    }
  }

  return (
    <PageLayout eyebrow="About" title={`A little about ${portfolioData.name}`} description={portfolioData.bio}>
      <section className="bento-card profile-card reveal-on-scroll">
        <div className="profile-header">
          <button type="button" className="profile-photo-button" onClick={() => setIsPhotoOpen(true)} aria-label="Enlarge profile photo">
            <img src={portfolioData.assets.photo} alt={portfolioData.name} className="profile-img" />
          </button>
          <div>
            <h2 className="profile-title">{portfolioData.name}</h2>
            <p className="profile-role">{portfolioData.role}</p>
          </div>
        </div>
        <p className="profile-bio">{portfolioData.bio}</p>
        <div className="status-badge"><div className="status-dot" />Currently learning & building</div>
      </section>

      <section className="bento-card about-links-card reveal-on-scroll">
        <h2>Quick Links</h2>
        <div className="links-grid">
          <a href={portfolioData.assets.resume} target="_blank" rel="noopener noreferrer" className="btn btn-primary">📄 View Resume</a>
          <button type="button" onClick={copyEmail} className="btn btn-outline">✉️ {emailCopied ? 'Copied! ✓' : 'Copy Email'}</button>
          {portfolioData.socials.map(social => (
            <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              {social.icon} {social.name}
            </a>
          ))}
          <Link to="/contact" className="btn btn-outline">Get in touch ↗</Link>
        </div>
      </section>

      {isPhotoOpen && (
        <div className="modal-overlay" onClick={() => setIsPhotoOpen(false)}>
          <div className="circular-modal" onClick={event => event.stopPropagation()}>
            <img src={portfolioData.assets.photo} alt={`${portfolioData.name} enlarged`} />
            <button type="button" className="close-btn" onClick={() => setIsPhotoOpen(false)} aria-label="Close photo">✕</button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default AboutPage;