"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const products = [
  { name: "The Sculpted Coat", price: "$420", image: "/images/product-coat.jpg", note: "Wool & cashmere" },
  { name: "Fluid Column Dress", price: "$260", image: "/images/product-dress.jpg", note: "Silk blend" },
  { name: "Architect Trouser", price: "$190", image: "/images/product-trouser.jpg", note: "Italian wool" },
  { name: "Soft Structure Knit", price: "$170", image: "/images/product-knit.jpg", note: "Merino wool" },
];

const faqs = [
  ["Where are LUNE pieces made?", "Our collections are developed in our Copenhagen studio and produced in small runs by specialist ateliers in Portugal and northern Italy."],
  ["What is your approach to materials?", "We choose traceable natural fibres, recycled materials and certified mills whenever possible. Every fabric is selected for feel, longevity and graceful wear."],
  ["Do you offer international shipping?", "Yes. We ship worldwide with duties calculated at checkout. Complimentary express shipping is available on orders over $250."],
  ["Can I return or exchange an item?", "You may return unworn pieces in their original condition within 30 days. Exchanges are complimentary in all markets we serve."],
];

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}

function Button({ children, href, dark = false }: { children: React.ReactNode; href: string; dark?: boolean }) {
  return <a href={href} className={`btn ${dark ? "btn-dark" : "btn-light"}`}>{children}<ArrowIcon /></a>;
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`reveal ${className}`}>{children}</div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function addToCart(name: string) {
    setCartCount((count) => count + 1);
    setToast(`${name} added to your bag`);
    window.setTimeout(() => setToast(""), 2200);
  }

  return (
    <main>
      <header className="site-header">
        <a href="#top" className="logo" aria-label="LUNE home">LUNE</a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#shop">Shop</a><a href="#story">Our Story</a><a href="#process">Craft</a><a href="#journal">Journal</a>
        </nav>
        <div className="header-actions">
          <button aria-label="Search collection" onClick={() => document.querySelector<HTMLInputElement>("#shop-search")?.focus()}>Search</button>
          <a href="#shop" aria-label={`${cartCount} items in shopping bag`}>Bag ({cartCount})</a>
          <button className="menu-btn" aria-expanded={menuOpen} aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span />
          </button>
        </div>
        <nav className={`mobile-nav ${menuOpen ? "open" : ""}`} aria-label="Mobile navigation">
          {["Shop", "Our Story", "Craft", "Journal"].map((item, i) => (
            <a key={item} href={["#shop", "#story", "#process", "#journal"][i]} onClick={() => setMenuOpen(false)}>{item}</a>
          ))}
        </nav>
      </header>

      <section id="top" className="hero">
        <Image src="/images/hero.jpg" alt="Model wearing a sculptural neutral LUNE look" fill priority sizes="100vw" className="hero-image" />
        <div className="hero-overlay" />
        <div className="hero-copy reveal">
          <p className="eyebrow light-text">Autumn / Winter 2026</p>
          <h1>Quiet forms.<br /><em>Lasting presence.</em></h1>
          <p className="hero-sub">Considered essentials, shaped with restraint and made to live beautifully with you.</p>
          <Button href="#shop">Explore the collection</Button>
        </div>
        <p className="hero-side">Copenhagen · Est. 2018</p>
      </section>

      <section id="shop" className="section categories">
        <Reveal className="section-head">
          <div><p className="eyebrow">The Edit</p><h2>Designed for<br /><em>everyday rituals.</em></h2></div>
          <p>Essential silhouettes with a quiet point of view. Made to be worn, remembered, and returned to.</p>
        </Reveal>
        <div className="category-grid stagger">
          {[
            ["New Arrivals", "/images/category-new.jpg", "01"],
            ["Soft Tailoring", "/images/category-tailoring.jpg", "02"],
            ["Knitwear", "/images/category-knit.jpg", "03"],
          ].map(([title, image, number]) => (
            <a href="#best-sellers" className="category-card reveal" key={title}>
              <div className="image-wrap"><Image src={image} alt={title} fill sizes="(max-width: 700px) 100vw, 33vw" /></div>
              <div className="category-label"><span>{number}</span><h3>{title}</h3><ArrowIcon /></div>
            </a>
          ))}
        </div>
      </section>

      <section className="manifesto">
        <Reveal><p className="eyebrow">Our Perspective</p><p className="manifesto-copy">We believe the most compelling wardrobe is one that asks for <em>less</em> — fewer, better pieces with the clarity to transcend seasons.</p></Reveal>
        <div className="principles stagger">
          {[["01", "Natural materials", "Fibres chosen for their hand-feel, drape and ability to age with grace."], ["02", "Considered design", "Purposeful details. Refined proportions. Nothing added without reason."], ["03", "Made to endure", "Small-batch production and enduring construction, never disposable trends."]].map(([n, t, d]) => (
            <Reveal className="principle" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></Reveal>
          ))}
        </div>
      </section>

      <section id="best-sellers" className="section products">
        <Reveal className="section-head inline">
          <div><p className="eyebrow">Most Loved</p><h2>Modern signatures.</h2></div>
          <label className="search-label"><span className="sr-only">Search products</span><input id="shop-search" placeholder="Search collection" /></label>
        </Reveal>
        <div className="product-grid stagger">
          {products.map((product) => (
            <article className="product-card reveal" key={product.name}>
              <div className="image-wrap">
                <Image src={product.image} alt={product.name} fill sizes="(max-width: 700px) 50vw, 25vw" />
                <button onClick={() => addToCart(product.name)}>Quick add</button>
              </div>
              <div className="product-meta"><div><h3>{product.name}</h3><p>{product.note}</p></div><span>{product.price}</span></div>
            </article>
          ))}
        </div>
      </section>

      <section id="story" className="story">
        <div className="story-image reveal"><Image src="/images/story.jpg" alt="LUNE studio interior with natural materials" fill sizes="(max-width: 900px) 100vw, 50vw" /></div>
        <Reveal className="story-copy">
          <p className="eyebrow">The LUNE Story</p><h2>A study in<br /><em>quiet confidence.</em></h2>
          <p>Founded in Copenhagen, LUNE began with a simple conviction: clothing can be deeply expressive without being loud.</p>
          <p>We draw from architecture, movement and the tactile beauty of natural materials to create a wardrobe that feels both current and enduring.</p>
          <Button href="#process" dark>Discover our philosophy</Button>
        </Reveal>
      </section>

      <section id="process" className="section process">
        <Reveal className="section-head"><div><p className="eyebrow">From Fibre to Form</p><h2>Made slowly.<br /><em>Made with intention.</em></h2></div><p>Every LUNE piece passes through many skilled hands. We work closely with our makers, tracing each decision from first sketch to final stitch.</p></Reveal>
        <div className="process-visual reveal"><Image src="/images/process.jpg" alt="Artisan carefully working with natural fabric" fill sizes="100vw" /></div>
        <div className="process-steps stagger">
          {[["01", "Material", "Responsibly sourced fibres selected for character and longevity."], ["02", "Form", "Patterns refined through fittings for effortless movement."], ["03", "Craft", "Small production runs made by specialist ateliers."], ["04", "Finish", "Every seam and surface inspected by hand."]].map(([n,t,d]) => <Reveal className="process-step" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></Reveal>)}
        </div>
      </section>

      <section id="journal" className="reviews">
        <Reveal><p className="eyebrow">In Their Words</p><blockquote>“The kind of pieces you reach for without thinking — and somehow always feel like yourself in.”</blockquote><div className="review-author"><span>Élodie M.</span><span>Paris, France</span><span>Verified purchase</span></div></Reveal>
        <div className="review-stats reveal"><span>4.9 / 5</span><span>Based on 248 reviews</span></div>
      </section>

      <section id="faq" className="section faq">
        <Reveal><p className="eyebrow">Client Services</p><h2>Questions,<br /><em>considered.</em></h2></Reveal>
        <div className="faq-list">
          {faqs.map(([q, a], i) => (
            <div className={`faq-item ${openFaq === i ? "open" : ""}`} key={q}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}><span>{String(i + 1).padStart(2, "0")}</span><strong>{q}</strong><i>+</i></button>
              <div className="faq-answer"><p>{a}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <Image src="/images/cta.jpg" alt="Timeless LUNE outerwear in a natural landscape" fill sizes="100vw" />
        <div className="hero-overlay" />
        <Reveal><p className="eyebrow light-text">The New Collection</p><h2>Dress for the life<br /><em>you are creating.</em></h2><Button href="#best-sellers">Shop Autumn / Winter</Button></Reveal>
      </section>

      <footer>
        <div className="footer-top">
          <div><a href="#top" className="logo">LUNE</a><p>Quiet forms for modern life.<br />Copenhagen, Denmark.</p></div>
          <div><h3>Explore</h3><a href="#shop">New arrivals</a><a href="#best-sellers">Best sellers</a><a href="#story">Our story</a><a href="#journal">Journal</a></div>
          <div><h3>Client care</h3><a href="#process">Shipping & returns</a><a href="#process">Size guide</a><a href="mailto:care@lune-studio.com">Contact</a><a href="#faq">FAQ</a></div>
          <form onSubmit={(e) => { e.preventDefault(); setToast("Welcome to the LUNE journal"); }}>
            <h3>The LUNE journal</h3><p>Notes on craft, culture and considered living.</p>
            <label><span className="sr-only">Email address</span><input required type="email" placeholder="Email address" /><button aria-label="Subscribe"><ArrowIcon /></button></label>
          </form>
        </div>
        <div className="footer-bottom"><span>© 2026 LUNE Studio</span><div><a href="#top">Privacy</a><a href="#top">Terms</a><a href="#top">Instagram</a></div></div>
      </footer>
      <div className={`toast ${toast ? "show" : ""}`} role="status">{toast}</div>
    </main>
  );
}
