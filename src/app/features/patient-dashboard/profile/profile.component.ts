import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/auth/auth.service';
import { UserProfile } from '../../../core/models/api.model';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DatePipe],
  template: `
    <div class="layout">
      <!-- ── Sidebar (Simplified) ── -->
      <aside class="sidebar">
        <div class="brand">Fracto<span>.</span></div>
        <nav class="nav">
          <a routerLink="/patient/dashboard" class="nav-item">← Back to Dashboard</a>
        </nav>
      </aside>

      <!-- ── Main ── -->
      <main class="main">
        <header class="topbar">
          <div>
            <h1 class="page-title">My Profile</h1>
            <p class="page-sub">Manage your personal and medical information</p>
          </div>
        </header>

        <section class="content-section">
          <div class="card max-w-2xl animate-fade-in">
            <div *ngIf="loading" class="text-center p-4 text-muted">Loading profile...</div>
            
            <div *ngIf="!loading && !isEditing" class="profile-view">
              <div class="profile-header flex-between mb-4">
                <div class="flex items-center gap-4">
                  <div class="avatar-lg">{{ profile?.firstName?.charAt(0) }}</div>
                  <div>
                    <h2 class="text-xl font-bold">{{ profile?.firstName }} {{ profile?.lastName }}</h2>
                    <p class="text-muted">{{ profile?.email }}</p>
                  </div>
                </div>
                <button class="btn-primary" (click)="editProfile()">Edit Profile</button>
              </div>

              <div class="info-grid">
                <div class="info-item">
                  <label>Phone</label>
                  <p>{{ profile?.phone || 'Not provided' }}</p>
                </div>
                <div class="info-item">
                  <label>Date of Birth</label>
                  <p>{{ (profile?.dateOfBirth | date:'longDate') || 'Not provided' }}</p>
                </div>
                <div class="info-item">
                  <label>Gender</label>
                  <p>{{ profile?.gender || 'Not provided' }}</p>
                </div>
                <div class="info-item">
                  <label>Blood Group</label>
                  <p>{{ profile?.bloodGroup || 'Not provided' }}</p>
                </div>
                <div class="info-item full-width">
                  <label>Address</label>
                  <p>{{ profile?.address || 'Not provided' }}</p>
                </div>
              </div>
            </div>

            <form *ngIf="isEditing" [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="profile-form">
              <h3 class="mb-4">Edit Profile details</h3>
              
              <div class="form-row">
                <div class="field">
                  <label>First Name</label>
                  <input type="text" formControlName="firstName" class="input">
                </div>
                <div class="field">
                  <label>Last Name</label>
                  <input type="text" formControlName="lastName" class="input">
                </div>
              </div>

               <div class="form-row">
                <div class="field">
                  <label>Phone Number</label>
                  <input type="text" formControlName="phone" class="input">
                </div>
                <div class="field">
                  <label>Date of Birth</label>
                  <input type="date" formControlName="dateOfBirth" class="input">
                </div>
              </div>

               <div class="form-row">
                <div class="field">
                  <label>Gender</label>
                  <select formControlName="gender" class="input">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="field">
                  <label>Blood Group</label>
                  <select formControlName="bloodGroup" class="input">
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option><option value="A-">A-</option>
                    <option value="B+">B+</option><option value="B-">B-</option>
                    <option value="O+">O+</option><option value="O-">O-</option>
                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div class="field mb-4">
                  <label>Address</label>
                  <textarea formControlName="address" class="input" rows="3"></textarea>
              </div>

              <div class="form-actions flex gap-3">
                <button type="button" class="btn-outline" (click)="isEditing = false">Cancel</button>
                <button type="submit" class="btn-primary" [disabled]="profileForm.invalid || isSaving">
                   {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>

          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .layout { display: flex; min-height: 100vh; background: #f1f5f9; font-family: 'Inter', system-ui, sans-serif; }
    
    .sidebar { width: 260px; min-width: 260px; background: #0f172a; padding: 2rem 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .brand { font-size: 1.75rem; font-weight: 800; color: #f8fafc; padding: 0 0.5rem; margin-bottom: 2.5rem; letter-spacing: -0.5px; }
    .brand span { color: #38bdf8; }
    .nav { display: flex; flex-direction: column; gap: 0.25rem; }
    .nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 10px; color: #94a3b8; font-size: 0.9rem; font-weight: 600; text-decoration: none; transition: all 0.15s; }
    .nav-item:hover { background: rgba(255,255,255,0.06); color: #e2e8f0; }
    
    .main { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }
    .topbar { padding: 1.5rem 2.5rem; background: #fff; border-bottom: 1px solid #e2e8f0; }
    .page-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; }
    .page-sub { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; }
    .content-section { padding: 2rem 2.5rem; }
    
    .card { background: #fff; border-radius: 14px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    .max-w-2xl { max-width: 42rem; margin: 0 auto; }
    .flex-between { display: flex; justify-content: space-between; align-items: center; }
    .flex { display: flex; } .items-center { align-items: center; } .gap-4 { gap: 1rem; } .gap-3 { gap: 0.75rem; }
    
    .avatar-lg { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #1e40af, #38bdf8); color: #fff; font-weight: 700; font-size: 1.75rem; display: flex; align-items: center; justify-content: center; }
    .text-xl { font-size: 1.25rem; } .font-bold { font-weight: 700; }
    .text-muted { color: #64748b; font-size: 0.9rem;} .mb-4 { margin-bottom: 1rem; }
    
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
    .info-item label { display: block; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
    .info-item p { font-size: 0.95rem; color: #0f172a; font-weight: 500; }
    .full-width { grid-column: span 2; }
    
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.35rem; }
    .field label { font-size: 0.8rem; font-weight: 600; color: #475569; }
    .input { padding: 0.65rem 0.9rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; color: #0f172a; outline: none; transition: border 0.15s; }
    .input:focus { border-color: #3b82f6; }
    
    .btn-primary { padding: 0.65rem 1.25rem; border-radius: 8px; background: #1e40af; color: #fff; font-weight: 600; font-size: 0.875rem; border: none; cursor: pointer; transition: background 0.15s; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
    .btn-outline { padding: 0.6rem 1.1rem; border-radius: 8px; border: 1.5px solid #e2e8f0; background: #fff; color: #334155; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.15s; }
    .btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; }
    
    .animate-fade-in { animation: fadein 0.3s ease; }
    @keyframes fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  profile: UserProfile | null = null;
  loading = true;
  isEditing = false;
  isSaving = false;
  profileForm!: FormGroup;

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user && user.userId) {
          this.loadProfile(user.userId);
        } else {
          this.loading = false;
        }
      },
      error: () => this.loading = false
    });

    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: [''],
      dateOfBirth: [''],
      gender: [''],
      bloodGroup: [''],
      address: ['']
    });
  }

  loadProfile(userId: number) {
    this.userService.getProfile(userId).subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  editProfile() {
    if (this.profile) {
      // Form expects YYYY-MM-DD string for input type="date"
      let dob = '';
      if (this.profile.dateOfBirth) {
        dob = new Date(this.profile.dateOfBirth).toISOString().split('T')[0];
      }

      this.profileForm.patchValue({
        firstName: this.profile.firstName,
        lastName: this.profile.lastName,
        phone: this.profile.phone,
        dateOfBirth: dob,
        gender: this.profile.gender || '',
        bloodGroup: this.profile.bloodGroup || '',
        address: this.profile.address || ''
      });
    }
    this.isEditing = true;
  }

  saveProfile() {
    if (this.profileForm.invalid) return;

    this.isSaving = true;
    const formVals = this.profileForm.value;
    
    // Convert dob to iso string for backend
    if (formVals.dateOfBirth) {
        formVals.dateOfBirth = new Date(formVals.dateOfBirth).toISOString();
    }

    this.userService.updateProfile(formVals).subscribe({
      next: () => {
        this.isSaving = false;
        this.isEditing = false;
        if (this.profile) {
           this.loadProfile(this.profile.userId); // Reload to reflect changes
        }
      },
      error: (err) => {
        this.isSaving = false;
        alert(err.response?.data?.message || err.error?.message || 'Failed to update profile');
      }
    });
  }
}
