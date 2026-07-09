import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="hm-page">

      <nav className="hm-nav">
        <div className="hm-nav-logo">⚡ Fixit</div>
        <div className="hm-nav-links">
          <a href="#services">Services</a>
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="hm-nav-actions">
          <button className="hm-btn-ghost" onClick={() => navigate('/login')}>Sign in</button>
          <button className="hm-btn-dark" onClick={() => navigate('/signup')}>Get started</button>
        </div>
        <button className="hm-hamburger">☰</button>
      </nav>

      <section className="hm-hero">
        <div className="hm-hero-left">
          <p className="hm-hero-tag">Fast · Certified · At your home</p>
          <h1 className="hm-hero-heading">
            Repair &amp; Fix<br />
            around the city
          </h1>
          <p className="hm-hero-sub">
            We provide expert repair solutions to your doorstep.<br />
            The best technicians for your devices — same day, every day.
          </p>
          <div className="hm-hero-actions">
            <button className="hm-btn-dark hm-btn-lg" onClick={() => navigate('/signup')}>Book a Repair</button>
            <button className="hm-btn-outline hm-btn-lg" onClick={() => navigate('/login')}>Sign in →</button>
          </div>
          <div className="hm-hero-meta">
            <span>+01 800 25923857</span>
            <span className="hm-meta-sep">|</span>
            <span>100 Main St, Kathmandu</span>
          </div>
        </div>
        <div className="hm-hero-right">
          <div className="hm-hero-img-wrap">
            <div className="hm-hero-circle" />
            <div className="hm-hero-device">🖥️</div>
          </div>
        </div>
        <div className="hm-side-nav">
          <span>Home</span>
          <span>Prices</span>
          <span>Products</span>
          <span>About us</span>
        </div>
      </section>

      <section className="hm-stats">
        <div className="hm-stat">
          <div className="hm-stat-num">2,400+</div>
          <div className="hm-stat-label">Repairs completed</div>
        </div>
        <div className="hm-stat-divider" />
        <div className="hm-stat">
          <div className="hm-stat-num">150+</div>
          <div className="hm-stat-label">Certified technicians</div>
        </div>
        <div className="hm-stat-divider" />
        <div className="hm-stat">
          <div className="hm-stat-num">4.9★</div>
          <div className="hm-stat-label">Average rating</div>
        </div>
        <div className="hm-stat-divider" />
        <div className="hm-stat">
          <div className="hm-stat-num">90-day</div>
          <div className="hm-stat-label">Warranty on all repairs</div>
        </div>
      </section>

      <section className="hm-services" id="services">
        <p className="hm-section-tag">What we fix</p>
        <h2 className="hm-section-heading">Our Services</h2>
        <div className="hm-services-grid">
          {[
            { icon: '💻', name: 'Laptop Repair', desc: 'Screen, battery, keyboard, motherboard & more' },
            { icon: '📱', name: 'Smartphone Repair', desc: 'Cracked screens, water damage, charging ports' },
            { icon: '📺', name: 'TV Repair', desc: 'LED, OLED, QLED — all brands covered' },
            { icon: '🖥️', name: 'Desktop Repair', desc: 'Hardware upgrades, virus removal, performance tuning' },
            { icon: '🎮', name: 'Gaming Console', desc: 'PS5, Xbox, Nintendo — disc & digital issues' },
            { icon: '🏠', name: 'Home Appliances', desc: 'Washing machines, fridges, microwaves & more' },
          ].map(s => (
            <div key={s.name} className="hm-service-card">
              <div className="hm-service-icon">{s.icon}</div>
              <div className="hm-service-name">{s.name}</div>
              <div className="hm-service-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="hm-how" id="how">
        <p className="hm-section-tag">Simple process</p>
        <h2 className="hm-section-heading">How it works</h2>
        <div className="hm-how-steps">
          <div className="hm-how-step">
            <div className="hm-how-num">01</div>
            <div className="hm-how-title">Book online</div>
            <div className="hm-how-desc">Select your device, describe the issue, and pick a time slot.</div>
          </div>
          <div className="hm-how-arrow">→</div>
          <div className="hm-how-step">
            <div className="hm-how-num">02</div>
            <div className="hm-how-title">Technician assigned</div>
            <div className="hm-how-desc">A certified technician is matched and confirms your booking.</div>
          </div>
          <div className="hm-how-arrow">→</div>
          <div className="hm-how-step">
            <div className="hm-how-num">03</div>
            <div className="hm-how-title">Repair at home</div>
            <div className="hm-how-desc">Your technician arrives and fixes your device on the spot.</div>
          </div>
          <div className="hm-how-arrow">→</div>
          <div className="hm-how-step">
            <div className="hm-how-num">04</div>
            <div className="hm-how-title">90-day warranty</div>
            <div className="hm-how-desc">Every repair is backed by our 90-day parts and labour warranty.</div>
          </div>
        </div>
      </section>

      <section className="hm-cta">
        <h2 className="hm-cta-heading">Ready to get your device fixed?</h2>
        <p className="hm-cta-sub">Join thousands of customers who trust Fixit for fast, reliable repairs.</p>
        <div className="hm-cta-actions">
          <button className="hm-btn-white hm-btn-lg" onClick={() => navigate('/signup')}>Create free account</button>
          <button className="hm-btn-outline-white hm-btn-lg" onClick={() => navigate('/login')}>Sign in →</button>
        </div>
      </section>

      <footer className="hm-footer" id="contact">
        <div className="hm-footer-top">
          <div className="hm-footer-brand">
            <div className="hm-footer-logo">⚡ Fixit</div>
            <p>Nepal's on-demand electronics repair platform. Certified technicians, same-day service.</p>
            <div className="hm-footer-social">
              <span>f</span><span>t</span><span>in</span>
            </div>
          </div>
          <div className="hm-footer-col">
            <h4>Services</h4>
            <a href="#">Laptop Repairs</a>
            <a href="#">Smartphone Repairs</a>
            <a href="#">TV Repairs</a>
            <a href="#">Desktop Repairs</a>
          </div>
          <div className="hm-footer-col">
            <h4>Company</h4>
            <a href="#">About Fixit</a>
            <a href="#">How it Works</a>
            <a href="/signup">Become a Technician</a>
            <a href="#">Blog</a>
          </div>
          <div className="hm-footer-col">
            <h4>Contact</h4>
            <a href="#">Help Center</a>
            <a href="mailto:support@fixit.com.np">support@fixit.com.np</a>
            <a href="tel:+97798400000">+977 984 000 000</a>
            <a href="#">Kathmandu, Nepal</a>
          </div>
        </div>
        <div className="hm-footer-bottom">
          <span>© 2026 Fixit. All rights reserved.</span>
          <div className="hm-footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
