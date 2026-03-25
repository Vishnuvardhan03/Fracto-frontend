import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  template: `
    <div class="auth-layout flex-center">
      <div class="auth-card glass-panel-light animate-fade-in">
        <div class="auth-header">
          <a routerLink="/" class="logo">Fracto<span>.</span></a>
          <h2>Forgot Password</h2>
          <p>Enter your email to receive a password reset OTP.</p>
        </div>
        
        <div *ngIf="message" class="alert success-alert animate-fade-in">
            {{ message }}
        </div>
        <div *ngIf="errorMessage" class="alert error-alert animate-fade-in">
            {{ errorMessage }}
        </div>

        <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" *ngIf="!message">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" formControlName="email" class="form-control" placeholder="john@example.com" />
            <div *ngIf="forgotForm.get('email')?.touched && forgotForm.get('email')?.invalid" class="error-text">
              Valid email is required.
            </div>
          </div>
          
          <button type="submit" class="btn btn-primary w-full mt-4" [disabled]="forgotForm.invalid || isLoading">
            <span *ngIf="isLoading">Sending...</span>
            <span *ngIf="!isLoading">Send OTP</span>
          </button>
        </form>
        
        <div class="auth-footer">
          <a *ngIf="message" routerLink="/reset-password" class="btn btn-outline w-full mb-4">Proceed to Reset Password</a>
          Remembered your password? <a routerLink="/login">Log In</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout { min-height: 100vh; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 2rem; }
    .auth-card { width: 100%; max-width: 450px; padding: 3rem; border-radius: var(--radius-lg); }
    .auth-header { text-align: center; margin-bottom: 2.5rem; }
    .logo { font-size: 2rem; font-weight: 800; color: var(--color-primary-dark); display: inline-block; margin-bottom: 1rem; }
    .logo span { color: var(--color-primary); }
    .auth-header h2 { font-size: 1.75rem; font-weight: 700; color: var(--text-dark); }
    .auth-header p { color: var(--text-muted); margin-top: 0.5rem; }
    .w-full { width: 100%; }
    .mt-4 { margin-top: 1rem; }
    .mb-4 { margin-bottom: 1.5rem; display: block; }
    .error-text { color: var(--error); font-size: 0.75rem; margin-top: 0.25rem; }
    .alert { padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; font-size: 0.875rem; }
    .error-alert { background-color: rgba(239, 68, 68, 0.1); color: var(--error); border: 1px solid rgba(239, 68, 68, 0.2); }
    .success-alert { background-color: rgba(34, 197, 94, 0.1); color: var(--success); border: 1px solid rgba(34, 197, 94, 0.2); }
    .auth-footer { text-align: center; margin-top: 2rem; font-size: 0.875rem; color: var(--text-muted); }
    .auth-footer a:not(.btn) { color: var(--color-primary); font-weight: 600; }
    .auth-footer a:not(.btn):hover { text-decoration: underline; }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  forgotForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  message = '';

  constructor() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.message = res.message || 'OTP sent successfully. Please check your email.';
        },
        error: (err: any) => {
          this.isLoading = false;
          this.errorMessage = err.response?.data?.message || err.error?.message || 'Failed to send OTP.';
        }
      });
    }
  }
}
