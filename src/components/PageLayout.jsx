import { useNavigate, useLocation } from 'react-router-dom';

function PageLayout({ eyebrow, title, description, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const isHomePage = location.pathname === '/';

  return (
    <main className="bento-container page-layout">
      {!isHomePage && (
        <div style={{ marginBottom: '16px', marginTop: '-16px' }}>
          <button className="back-button" onClick={handleBack}>
            <span className="back-button-arrow">←</span> Back
          </button>
        </div>
      )}
      <header className="page-heading reveal-on-scroll">
        <p className="page-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </header>
      {children}
    </main>
  );
}

export default PageLayout;