import { useEffect, useState } from 'react';

function KudosCard() {
  const [count, setCount] = useState(null);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    async function loadCount() {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error('Could not load kudos.');
        const data = await response.json();
        setCount(data.kudos);
      } catch {
        setError('Kudos are unavailable right now.');
      }
    }

    loadCount();
  }, []);

  async function giveKudos() {
    setIsSending(true);
    setError('');
    try {
      const response = await fetch('/api/kudos', { method: 'POST' });
      if (!response.ok) throw new Error('Could not add kudos.');
      const data = await response.json();
      setCount(data.kudos);
    } catch {
      setError('Could not send kudos. Please try again.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="bento-card kudos-card reveal-on-scroll">
      <h2>Enjoying the portfolio?</h2>
      <p className="card-copy">Leave a little encouragement for the next build.</p>
      <button type="button" className="btn btn-primary" onClick={giveKudos} disabled={isSending || count === null}>
        👋 Give Kudos{count === null ? ' (...)' : ` (${count})`}
      </button>
      {error && <p className="form-feedback" role="status">{error}</p>}
    </section>
  );
}

export default KudosCard;