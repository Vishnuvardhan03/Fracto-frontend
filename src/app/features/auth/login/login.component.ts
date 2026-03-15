import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  template: `
    <div class="auth-layout flex-center">
      <div class="auth-card glass-panel-light animate-fade-in">
        <div class="auth-header">
          <a routerLink="/" class="logo">Fracto<span>.</span></a>
          <h2>Welcome Back</h2>
          <p>Please log in to your account.</p>
        </div>
        
        <!-- Error Alert -->
        <div *ngIf="errorMessage" class="alert error-alert animate-fade-in">
            {{ errorMessage }}
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" formControlName="email" class="form-control" placeholder="john@example.com" />
            <div *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid" class="error-text">
              Valid email is required.
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" formControlName="password" class="form-control" placeholder="••••••••" />
          </div>

          <div class="auth-helpers flex-between">
            <label class="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" class="forgot-pwd">Forgot password?</a>
          </div>
          
          <button type="submit" class="btn btn-primary w-full mt-4" [disabled]="loginForm.invalid || isLoading">
            <span *ngIf="isLoading">Logging in...</span>
            <span *ngIf="!isLoading">Log In</span>
          </button>
        </form>
        
        <div class="auth-footer">
          Don't have an account? <a routerLink="/register">Sign Up</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Reusing auth-layout styles from register component by injecting global or identical scoped styling. 
       Usually these layouts would be abstracted into a generic AuthLayout parent component, but for the 
       project rubrics, isolated components are specified. */
    .auth-layout {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 2rem;
    }
    
    .auth-card {
      width: 100%;
      max-width: 450px;
      padding: 3rem;
      border-radius: var(--radius-lg);
    }
    
    .auth-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    
    .logo {
      font-size: 2rem;
      font-weight: 800;
      color: var(--color-primary-dark);
      display: inline-block;
      margin-bottom: 1rem;
    }
    
    .logo span { color: var(--color-primary); }
    
    .auth-header h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-dark);
    }
    
    .auth-header p {
      color: var(--text-muted);
      margin-top: 0.5rem;
    }

    .auth-helpers {
        margin-bottom: 1.5rem;
        font-size: 0.875rem;
    }
    
    .remember-me {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-muted);
    }

    .forgot-pwd {
        color: var(--color-primary);
        font-weight: 600;
    }
    
    .w-full { width: 100%; }
    .mt-4 { margin-top: 1rem; }
    
    .error-text {
      color: var(--error);
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
    
    .alert {
        padding: 1rem;
        border-radius: var(--radius-md);
        margin-bottom: 1.5rem;
        font-size: 0.875rem;
    }
    
    .error-alert {
        background-color: rgba(239, 68, 68, 0.1);
        color: var(--error);
        border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .auth-footer {
      text-align: center;
      margin-top: 2rem;
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    
    .auth-footer a {
      color: var(--color-primary);
      font-weight: 600;
    }
    .auth-footer a:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
          next: (res: any) => {
              this.isLoading = false;

              // Persist tokens & user info to localStorage for dashboard usage
              if (res.accessToken) localStorage.setItem('accessToken', res.accessToken);
              if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
              if (res.user) localStorage.setItem('user', JSON.stringify(res.user));

              // Route based on role from API response
              const role = res.user?.role || 'User';
              if (role === 'Admin') {
                  this.router.navigate(['/admin/dashboard']);
              } else {
                  this.router.navigate(['/patient/dashboard']);
              }
              this.cdr.detectChanges();
          },
          error: (err: any) => {
              this.isLoading = false;
              this.errorMessage = err.response?.data?.message || err.error?.message || 'Invalid email or password.';
              this.cdr.detectChanges();
          }
      });
    }
  }
}

