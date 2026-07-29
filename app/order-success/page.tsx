export default function OrderSuccessPage() {
  return (
    <main className="cart-page">
      <header className="site-header cart-header">
        <a href="/" className="logo" aria-label="LUNE — главная">LUNE</a>
      </header>
      <section className="cart-shell">
        <div className="order-success">
          <span>✓</span>
          <h2>Спасибо за заказ</h2>
          <p>Мы получили ваш выбор и скоро свяжемся с вами для подтверждения деталей.</p>
          <a className="btn btn-dark" href="/">
            Вернуться на главную <span className="arrow-icon" aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}
