import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="navbar glass-panel">
      <div class="container flex-between">
        <div class="nav-container">
            <a routerLink="/" class="logo">Fracto<span>.</span></a>
            
            <div class="main-nav">
                <a href="#features" class="nav-link">Features</a>
                <a href="#specialties" class="nav-link">Specialties</a>
                <a href="#testimonials" class="nav-link">Testimonials</a>
            </div>
            
            <div class="nav-links">
              <a routerLink="/login" class="nav-link">Log In</a>
              <a routerLink="/register" class="btn btn-primary">Get Started</a>
            </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      width: 100%;
      height: 70px;
      position: fixed;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      background: rgba(15, 23, 42, 0.8); /* Dark slate background to make it stand out */
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff; /* White text for contrast */
      margin-right: 2rem;
    }
    .logo span {
      color: var(--color-secondary); /* Bright Emerald Green dot */
    }
    .nav-container {
        display: flex;
        align-items: center;
        width: 100%;
    }
    .main-nav {
        display: flex;
        gap: 1.5rem;
        flex: 1;
    }
    .nav-links {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }
    .nav-link {
      font-weight: 500;
      color: #f8fafc; /* Light text for dark header */
      transition: color var(--transition-fast);
      font-size: 0.95rem;
    }
    .nav-link:hover {
      color: var(--color-secondary);
    }
  `]
})
export class NavbarComponent {}
