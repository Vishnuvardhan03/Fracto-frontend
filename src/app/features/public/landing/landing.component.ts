import { Component } from '@angular/core';
import { NavbarComponent } from '../../../shared/layouts/navbar/navbar.component';
import { FooterComponent } from '../../../shared/layouts/footer/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    
    <main class="landing-page">
      <!-- Hero Section -->
      <section class="hero flex-center">
        <div class="hero-bg-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
        </div>
        
        <div class="container animate-fade-in hero-content">
          <h1>Modern Healthcare Scheduling,<br><span>Simplified.</span></h1>
          <p>Experience the most seamless way to book appointments, manage patient streams, and deliver care with Fracto.</p>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg">Book an Appointment</button>
            <button class="btn btn-outline-light btn-lg">Learn More</button>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features">
        <div class="container">
          <h2 class="section-title">Why Choose Fracto<span class="dot">.</span></h2>
          <div class="feature-grid">
            
            <div class="feature-card glass-panel-light">
              <div class="icon-box">📅</div>
              <h3>Effortless Booking</h3>
              <p>Schedule your appointments in seconds with our intelligent calendar system.</p>
            </div>
            
            <div class="feature-card glass-panel-light">
              <div class="icon-box">🔒</div>
              <h3>Secure Records</h3>
              <p>Your data is encrypted and HIPAA compliant, ensuring total privacy.</p>
            </div>
            
            <div class="feature-card glass-panel-light">
              <div class="icon-box">⚡</div>
              <h3>Real-time Updates</h3>
              <p>Get instant notifications about your appointment status and queue position.</p>
            </div>
            
          </div>
        </div>
      </section>
    </main>
    
    <app-footer></app-footer>
  `,
  styles: [`
    .landing-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    /* Hero Section */
    .hero {
      position: relative;
      min-height: 100vh;
      width: 100%;
      background: linear-gradient(135deg, var(--color-background-dark) 0%, #1e1b4b 100%);
      color: var(--text-light);
      overflow: hidden;
      padding-top: 70px;
    }
    
    .hero-content {
      position: relative;
      z-index: 10;
      text-align: center;
      max-width: 800px;
    }
    
    .hero h1 {
      font-size: 4.5rem;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      letter-spacing: -1px;
    }
    
    .hero h1 span {
      background: linear-gradient(to right, #60a5fa, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .hero p {
      font-size: 1.25rem;
      color: rgba(255,255,255,0.8);
      margin-bottom: 3rem;
      max-width: 600px;
      margin-inline: auto;
    }
    
    .hero-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    
    .btn-lg {
      padding: 1rem 2rem;
      font-size: 1.125rem;
    }
    
    /* Abstract Background Shapes */
    .hero-bg-shapes {
      position: absolute;
      inset: 0;
      overflow: hidden;
      z-index: 1;
    }
    
    .shape {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.5;
    }
    
    .shape-1 {
      top: -10%;
      left: -10%;
      width: 500px;
      height: 500px;
      background-color: var(--color-primary);
    }
    
    .shape-2 {
      bottom: -20%;
      right: -10%;
      width: 600px;
      height: 600px;
      background-color: var(--color-secondary);
    }
    
    /* Features Section */
    .features {
      padding: 8rem 0;
      background-color: var(--color-background-light);
    }
    
    .section-title {
      text-align: center;
      font-size: 3rem;
      font-weight: 800;
      margin-bottom: 4rem;
      color: var(--text-dark);
    }
    
    .dot {
        color: var(--color-primary);
    }
    
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    
    .feature-card {
      padding: 2.5rem;
      border-radius: var(--radius-lg);
      transition: transform var(--transition-normal);
      text-align: left;
    }
    
    .feature-card:hover {
      transform: translateY(-10px);
    }
    
    .icon-box {
      font-size: 3rem;
      margin-bottom: 1.5rem;
      display: inline-block;
      padding: 1rem;
      background: rgba(37, 99, 235, 0.1);
      border-radius: var(--radius-md);
    }
    
    .feature-card h3 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    
    .feature-card p {
      color: var(--text-muted);
      line-height: 1.6;
    }
    
    @media (max-width: 768px) {
        .hero h1 { font-size: 3rem; }
        .hero-actions { flex-direction: column; }
    }
  `]
})
export class LandingComponent {}
