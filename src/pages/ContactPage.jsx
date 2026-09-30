import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import { portfolioData } from '../data';

function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);

  async function sendMessage(event) {
    event.preventDefault();
    setIsSending(true);
    setStatus('');
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Could not send your message.');
      setStatus('Message sent! ✓');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('Could not send your note. Please try again.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <PageLayout eyebrow="Contact" title="Get in touch" description="For software development and AI opportunities, reach out by email or send a quick note.">
      <section className="bento-card contact-card page-card reveal-on-scroll">
        <div className="contact-links">
          <a className="btn btn-primary" href={`https://mail.google.com/mail/?view=cm&fs=1&to=${portfolioData.email}`} target="_blank" rel="noopener noreferrer">
            Mail via Gmail ↗
          </a>
          <p>{portfolioData.email}</p>
          {portfolioData.socials.map(social => (
            <a key={social.name} className="btn btn-outline" href={social.url} target="_blank" rel="noopener noreferrer">
              {social.icon} {social.name}
            </a>
          ))}
        </div>
        <form className="note-form" onSubmit={sendMessage}>
          <h2>Send a Quick Note</h2>
          <div className="note-fields">
            <label>
              Name
              <input name="name" autoComplete="name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} required />
            </label>
            <label>
              Email
              <input name="email" type="email" autoComplete="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} required />
            </label>
          </div>
          <label>
            Message
            <textarea name="message" rows="4" value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} required />
          </label>
          <button className="btn btn-primary" type="submit" disabled={isSending}>{isSending ? 'Sending...' : 'Send Note'}</button>
          {status && <p className="form-feedback" role="status">{status}</p>}
        </form>
      </section>
    </PageLayout>
  );
}

export default ContactPage;