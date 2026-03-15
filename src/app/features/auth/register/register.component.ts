import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  template: `
    <div class="auth-layout flex-center">
      <div class="auth-card glass-panel-light animate-fade-in">
        <div class="auth-header">
          <a routerLink="/" class="logo">Fracto<span>.</span></a>
          <h2>Create an Account</h2>
          <p *ngIf="currentStep === 1">Join our secure healthcare network today.</p>
          <p *ngIf="currentStep === 2">Enter the verification code sent to your email.</p>
          <p *ngIf="currentStep === 3">Almost there! Complete your profile.</p>
        </div>
        
        <!-- Error Alert -->
        <div *ngIf="errorMessage" class="alert error-alert animate-fade-in">
            {{ errorMessage }}
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          
            <!-- Step 1: Request OTP (Email) -->
            <div *ngIf="currentStep === 1" formGroupName="step1">
                <div class="form-group">
                    <label class="form-label">Email Address</label>
                    <input type="email" formControlName="email" class="form-control" placeholder="john@example.com" />
                    <div *ngIf="registerForm.get('step1.email')?.touched && registerForm.get('step1.email')?.invalid" class="error-text">
                        Valid email is required.
                    </div>
                </div>
            </div>

            <!-- Step 2: Verify OTP -->
            <div *ngIf="currentStep === 2" formGroupName="step2">
                <div class="form-group">
                    <label class="form-label">Verification Code (OTP)</label>
                    <input type="text" formControlName="otpCode" class="form-control" placeholder="123456" maxlength="6" />
                    <div *ngIf="registerForm.get('step2.otpCode')?.touched && registerForm.get('step2.otpCode')?.invalid" class="error-text">
                        6-digit OTP is required.
                    </div>
                </div>
            </div>

            <!-- Step 3: Complete Details -->
            <div *ngIf="currentStep === 3" formGroupName="step3">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">First Name</label>
                        <input type="text" formControlName="firstName" class="form-control" placeholder="John" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Last Name</label>
                        <input type="text" formControlName="lastName" class="form-control" placeholder="Doe" />
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Phone Number</label>
                    <input type="tel" formControlName="phone" class="form-control" placeholder="9876543210" />
                </div>

                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" formControlName="password" class="form-control" placeholder="••••••••" />
                    <div *ngIf="registerForm.get('step3.password')?.touched && registerForm.get('step3.password')?.invalid" class="error-text">
                        Password must be at least 6 characters.
                    </div>
                </div>
            </div>

          <button type="submit" class="btn btn-primary w-full mt-4" [disabled]="isLoading">
            <span *ngIf="isLoading">Processing...</span>
            <span *ngIf="!isLoading && currentStep === 1">Send Verification Code</span>
            <span *ngIf="!isLoading && currentStep === 2">Verify Code</span>
            <span *ngIf="!isLoading && currentStep === 3">Complete Signup</span>
          </button>
          
          <button *ngIf="currentStep > 1 && !isLoading" type="button" class="btn btn-outline w-full mt-2" (click)="goBack()">
            Back
          </button>
        </form>
        
        <div class="auth-footer" *ngIf="currentStep === 1">
          Already have an account? <a routerLink="/login">Log In</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 2rem;
    }
    
    .auth-card {
      width: 100%;
      max-width: 500px;
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
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .w-full {
      width: 100%;
    }
    
    .mt-4 {
      margin-top: 1rem;
    }
    
    .mt-2 {
      margin-top: 0.5rem;
    }
    
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  registerForm: FormGroup;
  currentStep = 1;
  isLoading = false;
  errorMessage = '';
  verificationToken = '';

  constructor() {
    this.registerForm = this.fb.group({
        step1: this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        }),
        step2: this.fb.group({
            otpCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
        }),
        step3: this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            phone: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(6)]]
        })
    });
  }

  goBack() {
      this.currentStep--;
      this.errorMessage = '';
  }

  onSubmit() {
    this.errorMessage = '';
    
    if (this.currentStep === 1) {
        console.log('[RegisterComponent] Step 1: Initiating signup');
        const step1Form = this.registerForm.get('step1');
        if (step1Form?.invalid) {
            console.log('[RegisterComponent] Step 1 Form invalid');
            step1Form.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.authService.initiateSignup({ email: step1Form?.value.email }).subscribe({
            next: (res) => {
                console.log('[RegisterComponent] Step 1 Success, moving to Step 2');
                this.isLoading = false;
                this.currentStep = 2; // Move to OTP
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('[RegisterComponent] Step 1 Error:', err);
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Failed to send OTP. Please try again.';
                this.cdr.detectChanges();
            }
        });
    } else if (this.currentStep === 2) {
        console.log('[RegisterComponent] Step 2: Verifying email OTp');
        const step2Form = this.registerForm.get('step2');
        if (step2Form?.invalid) {
            console.log('[RegisterComponent] Step 2 Form invalid');
            step2Form.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        const email = this.registerForm.get('step1.email')?.value;
        const otpCode = step2Form?.value.otpCode;
        
        this.authService.verifyEmail({ email, otpCode }).subscribe({
            next: (res: any) => {
                console.log('[RegisterComponent] Step 2 Success, response:', res);
                this.isLoading = false;
                if (res.verificationToken) {
                    console.log('[RegisterComponent] Verification token received, moving to Step 3');
                    this.verificationToken = res.verificationToken;
                    this.currentStep = 3; // Move to Final Details
                } else {
                    this.errorMessage = 'Verification failed. No token received.';
                }
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('[RegisterComponent] Step 2 Error:', err);
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Invalid OTP.';
                this.cdr.detectChanges();
            }
        });
    } else if (this.currentStep === 3) {
        console.log('[RegisterComponent] Step 3: Completing signup');
        const step3Form = this.registerForm.get('step3');
        if (step3Form?.invalid) {
            console.log('[RegisterComponent] Step 3 Form invalid');
            step3Form.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        const email = this.registerForm.get('step1.email')?.value;
        const details = step3Form?.value;

        const payload = {
            email,
            password: details.password,
            firstName: details.firstName,
            lastName: details.lastName,
            phone: details.phone,
            roleTypeId: 1, // Patient explicitly
            verificationToken: this.verificationToken
        };
        console.log('[RegisterComponent] Final Signup Payload:', payload);

        this.authService.completeSignup(payload).subscribe({
            next: () => {
                console.log('[RegisterComponent] Step 3 Success, navigating to login');
                this.isLoading = false;
                // Registration success, navigate to login
                this.router.navigate(['/login']);
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('[RegisterComponent] Step 3 Error:', err);
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Failed to complete signup.';
                this.cdr.detectChanges();
            }
        });
    }
  }
}

