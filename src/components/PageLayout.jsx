function PageLayout({ eyebrow, title, description, children }) {
  return (
    <main className="bento-container page-layout">
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