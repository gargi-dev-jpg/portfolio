import { useState } from 'react';

const quickQuestions = [
  'What are your core skills?',
  'Tell me about your projects',
  'What is your education background?',
];

function AiAssistantCard() {
  const [question, setQuestion] = useState('');
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  async function askQuestion(value = question) {
    const message = value.trim();
    if (!message || isThinking) return;

    setQuestion(message);
    setReply('');
    setError('');
    setIsThinking(true);

    try {
      // fetch() sends the question to Express; await lets us display its JSON reply.
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      if (data.reply) setReply(data.reply);
      if (!response.ok && !data.reply) throw new Error('The assistant could not answer.');
    } catch {
      setError('The assistant is unavailable right now. Please try again.');
    } finally {
      setIsThinking(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    askQuestion();
  }

  return (
    <section id="ai" className="bento-card ai-assistant-card reveal-on-scroll" aria-labelledby="ai-assistant-title">
      <div className="ai-assistant-heading">
        <span className="ai-assistant-badge">✦ Ask AI About Me</span>
        <h2 id="ai-assistant-title">Curious about my work?</h2>
      </div>

      <div className="ai-quick-questions" aria-label="Suggested questions">
        {quickQuestions.map(item => (
          <button
            key={item}
            type="button"
            className="ai-question-pill"
            disabled={isThinking}
            onClick={() => askQuestion(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <form className="ai-question-form" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="ai-question">Ask a question about the portfolio</label>
        <input
          id="ai-question"
          value={question}
          onChange={event => setQuestion(event.target.value)}
          placeholder="Ask about skills, projects, or experience..."
          maxLength={500}
          disabled={isThinking}
        />
        <button className="btn btn-primary" type="submit" disabled={isThinking || !question.trim()}>
          {isThinking ? 'Thinking...' : 'Ask'}
        </button>
      </form>

      {(isThinking || reply || error) && (
        <div className="ai-response" aria-live="polite" role="status">
          {isThinking ? <p>Thinking...</p> : <p>{reply || error}</p>}
        </div>
      )}
    </section>
  );
}

export default AiAssistantCard;