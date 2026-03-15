import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <div class="container flex-between">
        <div class="footer-brand">
          <h3>Fracto<span>.</span></h3>
          <p>Next-generation healthcare scheduling.</p>
        </div>
        <div class="footer-copy">
          &copy; 2026 Fracto Healthcare. All rights reserved.
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: var(--color-background-dark);
      color: var(--text-light);
      padding: 3rem 0;
      margin-top: auto;
    }
    .footer-brand h3 {
      font-size: 1.5rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
    }
    .footer-brand span {
      color: var(--color-primary);
    }
    .footer-brand p {
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    .footer-copy {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
  `]
})
export class FooterComponent {}
