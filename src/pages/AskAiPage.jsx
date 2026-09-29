import AiAssistantCard from '../components/AiAssistantCard';
import PageLayout from '../components/PageLayout';

function AskAiPage() {
  return (
    <PageLayout eyebrow="Ask AI" title="Ask about Gargi" description="Questions are answered using details from the portfolio and resume.">
      <AiAssistantCard />
    </PageLayout>
  );
}

export default AskAiPage;