import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

function NotFoundPage() {
  return (
    <PageLayout eyebrow="404" title="Page not found" description="That portfolio page does not exist.">
      <Link className="btn btn-primary page-card" to="/">Back to home</Link>
    </PageLayout>
  );
}

export default NotFoundPage;