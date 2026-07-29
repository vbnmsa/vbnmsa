export function SoonPage({ label, backHref }: { label: string; backHref: string }) {
  return (
    <main className="soon-page">
      <header className="site-header cart-header">
        <a href="/" className="logo" aria-label="LUNE — главная">LUNE</a>
        <a className="back-link" href={backHref}>← Вернуться</a>
      </header>
      <section className="soon-content">
        <p className="eyebrow">{label}</p>
        <h1>soon</h1>
        <p>Этот раздел находится в работе.</p>
        <a href="/" className="btn btn-dark">На главную <span className="arrow-icon" aria-hidden="true" /></a>
      </section>
    </main>
  );
}
