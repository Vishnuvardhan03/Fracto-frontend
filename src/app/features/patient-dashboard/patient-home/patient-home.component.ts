import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { UserProfile, Doctor, Appointment, Specialization } from '../../../core/models/api.model';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-patient-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe],
  template: `
    <div class="layout">

      <!-- ── Sidebar ── -->
      <aside class="sidebar">
        <div class="brand">Fracto<span>.</span></div>

        <nav class="nav">
          <button class="nav-item" [class.active]="tab === 'home'"    (click)="tab='home'">
            <svg viewBox="0 0 24 24"><path d="M3 12L12 3l9 9M5 10v9h5v-6h4v6h5v-9"/></svg>
            Home
          </button>
          <button class="nav-item" [class.active]="tab === 'book'"    (click)="tab='book'; ensureDoctors()">
            <svg viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zm-9 9H7m4-4H7m10 0h-4"/></svg>
            Book Appointment
          </button>
          <button class="nav-item" [class.active]="tab === 'appts'"   (click)="tab='appts'; loadAppointments()">
            <svg viewBox="0 0 24 24"><path d="M8 7V3M16 7V3M3 11h18M5 5h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"/></svg>
            My Appointments
          </button>
          <a class="nav-item" routerLink="/patient/doctor-reviews">
            <svg viewBox="0 0 24 24"><path d="M11.049 2.927l1.764 3.575 3.95.574-2.857 2.784.674 3.933-3.531-1.856-3.53 1.856.674-3.933L5.336 7.076l3.95-.574z"/></svg>
            Reviews
          </a>
        </nav>

        <button class="logout-btn" (click)="logout()">
          <svg viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Log Out
        </button>
      </aside>

      <!-- ── Main ── -->
      <main class="main">

        <!-- Topbar -->
        <header class="topbar">
          <div>
            <h1 class="page-title">{{ pageTitle }}</h1>
            <p class="page-sub">{{ pageSub }}</p>
          </div>
          <div class="user-chip">
            <span class="avatar-circle">{{ initial }}</span>
            <div>
              <p class="chip-name">{{ userProfile ? userProfile.firstName + ' ' + userProfile.lastName : 'Patient' }}</p>
              <p class="chip-role">{{ userProfile?.role || 'User' }}</p>
            </div>
          </div>
        </header>

        <!-- ── HOME TAB ── -->
        <section *ngIf="tab === 'home'" class="tab-body fade-in">

          <!-- Stat cards -->
          <div class="stats-row">
            <div class="stat-card blue">
              <div class="stat-icon">📅</div>
              <div>
                <p class="stat-label">Total Bookings</p>
                <p class="stat-val">{{ appointments.length }}</p>
              </div>
            </div>
            <div class="stat-card green">
              <div class="stat-icon">✅</div>
              <div>
                <p class="stat-label">Confirmed</p>
                <p class="stat-val">{{ countByStatus('Confirmed') }}</p>
              </div>
            </div>
            <div class="stat-card amber">
              <div class="stat-icon">⏳</div>
              <div>
                <p class="stat-label">Pending</p>
                <p class="stat-val">{{ countByStatus('Pending') }}</p>
              </div>
            </div>
            <div class="stat-card purple">
              <div class="stat-icon">🏥</div>
              <div>
                <p class="stat-label">Completed</p>
                <p class="stat-val">{{ countByStatus('Completed') }}</p>
              </div>
            </div>
          </div>

          <!-- Recent appointments preview -->
          <div class="card mt-6">
            <div class="card-header">
              <h3>Recent Appointments</h3>
              <button class="link-btn" (click)="tab='appts'">View All →</button>
            </div>
            <div *ngIf="loadingAppts" class="loading-state">Loading appointments…</div>
            <div *ngIf="!loadingAppts && appointments.length === 0" class="empty-state">
              <p>No appointments yet.</p>
              <button class="btn-primary" (click)="tab='book'; ensureDoctors()">Book Your First</button>
            </div>
            <table *ngIf="!loadingAppts && appointments.length > 0" class="table">
              <thead><tr><th>Doctor</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                <tr *ngFor="let a of appointments.slice(0,5)">
                  <td class="font-medium">{{ a.doctorName }}</td>
                  <td>{{ a.appointmentDate | date:'MMM d, y' }}</td>
                  <td><span class="badge" [ngClass]="badgeClass(a.status)">{{ a.status }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ── BOOK APPOINTMENT TAB ── -->
        <section *ngIf="tab === 'book'" class="tab-body fade-in">

          <!-- Filters -->
          <div class="card mb-5">
            <h3 class="section-title">Find a Doctor</h3>
            <div class="filters-row">
              <div class="field">
                <label>Specialization</label>
                <select [(ngModel)]="filterSpec" (change)="filterDoctors()" class="input">
                  <option [ngValue]="null">All Specializations</option>
                  <option *ngFor="let s of specializations" [ngValue]="s.specializationId">
                    {{ s.specializationName }}
                  </option>
                </select>
              </div>
              <div class="field">
                <label>City</label>
                <input type="text" [(ngModel)]="filterCity" (input)="filterDoctors()"
                       placeholder="e.g. Karachi" class="input">
              </div>
              <button class="btn-outline" (click)="clearFilters()">Clear</button>
            </div>
          </div>

          <!-- Doctor cards -->
          <div *ngIf="loadingDoctors" class="loading-state">Loading doctors…</div>
          <div *ngIf="!loadingDoctors && filteredDoctors.length === 0" class="empty-state">
            <p>No doctors match your search.</p>
          </div>

          <div class="doctors-grid" *ngIf="!loadingDoctors && filteredDoctors.length > 0">
            <div class="doctor-card" *ngFor="let doc of filteredDoctors">
              <div class="doc-header">
                <div class="doc-avatar">{{ doc.name.charAt(0) }}</div>
                <div class="doc-info">
                  <h4>{{ doc.name }}</h4>
                  <p class="text-muted text-sm">{{ doc.specializationName }}</p>
                  <p class="text-muted text-sm">📍 {{ doc.city }}</p>
                </div>
                <div class="doc-rating">
                  <span class="stars">★</span> {{ doc.rating | number:'1.1-1' }}
                </div>
              </div>

              <!-- Booking form -->
              <div class="booking-form" *ngIf="bookingData[doc.doctorId]">
                <div class="form-row">
                  <div class="field">
                    <label>Date</label>
                    <input type="date" [(ngModel)]="bookingData[doc.doctorId].date"
                           [min]="todayStr" class="input input-sm">
                  </div>
                  <div class="field">
                    <label>Time Slot</label>
                    <select [(ngModel)]="bookingData[doc.doctorId].time" class="input input-sm">
                      <option value="">-- Select --</option>
                      <option *ngFor="let t of timeSlots" [value]="t.value">{{ t.label }}</option>
                    </select>
                  </div>
                </div>
                <button class="btn-primary w-full mt-3"
                        [disabled]="isBooking[doc.doctorId]"
                        (click)="bookAppointment(doc.doctorId)">
                  {{ isBooking[doc.doctorId] ? 'Booking…' : 'Confirm Booking' }}
                </button>
                <p *ngIf="bookingError[doc.doctorId]" class="error-text">{{ bookingError[doc.doctorId] }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ── MY APPOINTMENTS TAB ── -->
        <section *ngIf="tab === 'appts'" class="tab-body fade-in">
          <div class="card">
            <div class="card-header">
              <h3>My Appointments</h3>
              <span class="badge badge-info">{{ appointments.length }} total</span>
            </div>
            <div *ngIf="loadingAppts" class="loading-state">Loading…</div>
            <div *ngIf="!loadingAppts && appointments.length === 0" class="empty-state">
              <p>No appointments found.</p>
              <button class="btn-primary" (click)="tab='book'; ensureDoctors()">Book Now</button>
            </div>
            <table *ngIf="!loadingAppts && appointments.length > 0" class="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let a of appointments; let i = index">
                  <td class="text-muted">{{ i + 1 }}</td>
                  <td class="font-medium">{{ a.doctorName }}</td>
                  <td class="text-muted">{{ a.specializationName }}</td>
                  <td>{{ a.appointmentDate | date:'MMM d, y' }}</td>
                  <td>{{ formatTime(a.timeSlot) }}</td>
                  <td><span class="badge" [ngClass]="badgeClass(a.status)">{{ a.status }}</span></td>
                  <td>
                    <button *ngIf="a.status === 'Pending' || a.status === 'Confirmed'"
                            class="btn-danger-sm"
                            (click)="cancelAppointment(a.appointmentId)">Cancel</button>
                    <span *ngIf="a.status === 'Cancelled' || a.status === 'Completed'"
                          class="text-muted text-sm">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  `,
  styles: [`
    /* ─── Layout ─── */
    :host { display: block; }
    .layout { display: flex; min-height: 100vh; background: #f1f5f9; font-family: 'Inter', system-ui, sans-serif; }

    /* ─── Sidebar ─── */
    .sidebar {
      width: 260px; min-width: 260px;
      background: #0f172a;
      padding: 2rem 1.25rem;
      display: flex; flex-direction: column;
      gap: 0.5rem;
    }
    .brand {
      font-size: 1.75rem; font-weight: 800;
      color: #f8fafc; padding: 0 0.5rem;
      margin-bottom: 2.5rem; letter-spacing: -0.5px;
    }
    .brand span { color: #38bdf8; }
    .nav { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; }
    .nav-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 1rem; border-radius: 10px;
      color: #94a3b8; font-size: 0.9rem; font-weight: 500;
      background: none; border: none; cursor: pointer;
      text-align: left; text-decoration: none;
      transition: all 0.15s;
    }
    .nav-item svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
    .nav-item:hover { background: rgba(255,255,255,0.06); color: #e2e8f0; }
    .nav-item.active { background: #1e40af; color: #fff; }
    .logout-btn {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 1rem; border-radius: 10px;
      color: #f87171; font-size: 0.9rem; font-weight: 500;
      background: rgba(248,113,113,0.1); border: none; cursor: pointer;
      margin-top: 1rem; width: 100%; transition: all 0.15s;
    }
    .logout-btn svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .logout-btn:hover { background: rgba(248,113,113,0.2); }

    /* ─── Main ─── */
    .main { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }

    /* ─── Topbar ─── */
    .topbar {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.5rem 2.5rem; background: #fff;
      border-bottom: 1px solid #e2e8f0;
      position: sticky; top: 0; z-index: 10;
    }
    .page-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; }
    .page-sub { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; }
    .user-chip { display: flex; align-items: center; gap: 0.75rem; }
    .avatar-circle {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #1e40af, #38bdf8);
      color: #fff; font-weight: 700; font-size: 1.1rem;
      display: flex; align-items: center; justify-content: center;
    }
    .chip-name { font-size: 0.9rem; font-weight: 600; color: #1e293b; }
    .chip-role { font-size: 0.75rem; color: #94a3b8; }

    /* ─── Tab body ─── */
    .tab-body { padding: 2rem 2.5rem; }
    .fade-in { animation: fadein 0.25s ease; }
    @keyframes fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

    /* ─── Stat cards ─── */
    .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 1.25rem; }
    .stat-card {
      display: flex; align-items: center; gap: 1rem;
      background: #fff; border-radius: 14px; padding: 1.25rem 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border-left: 4px solid transparent;
    }
    .stat-card.blue  { border-color: #3b82f6; }
    .stat-card.green { border-color: #10b981; }
    .stat-card.amber { border-color: #f59e0b; }
    .stat-card.purple{ border-color: #8b5cf6; }
    .stat-icon { font-size: 1.75rem; }
    .stat-label { font-size: 0.78rem; color: #64748b; font-weight: 500; }
    .stat-val { font-size: 1.75rem; font-weight: 800; color: #0f172a; line-height: 1; }

    /* ─── Card ─── */
    .card { background: #fff; border-radius: 14px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
    .card-header h3 { font-size: 1rem; font-weight: 700; color: #0f172a; }
    .mt-6 { margin-top: 1.5rem; }
    .mb-5 { margin-bottom: 1.25rem; }
    .mt-3 { margin-top: 0.75rem; }
    .w-full { width: 100%; }

    /* ─── Table ─── */
    .table { width: 100%; border-collapse: collapse; }
    .table th { padding: 0.65rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; border-bottom: 2px solid #f1f5f9; }
    .table td { padding: 0.85rem 1rem; font-size: 0.875rem; color: #334155; border-bottom: 1px solid #f8fafc; }
    .table tr:last-child td { border: none; }
    .table tr:hover td { background: #f8fafc; }
    .font-medium { font-weight: 600; }
    .text-muted { color: #94a3b8; }
    .text-sm { font-size: 0.8rem; }

    /* ─── Badges ─── */
    .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; }
    .badge-pending   { background: #fef3c7; color: #92400e; }
    .badge-confirmed { background: #d1fae5; color: #065f46; }
    .badge-completed { background: #dbeafe; color: #1e40af; }
    .badge-cancelled { background: #fee2e2; color: #991b1b; }
    .badge-info      { background: #ede9fe; color: #5b21b6; }

    /* ─── Filters ─── */
    .section-title { font-size: 1rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem; }
    .filters-row { display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; }
    .field { display: flex; flex-direction: column; gap: 0.35rem; flex: 1; min-width: 160px; }
    .field label { font-size: 0.78rem; font-weight: 600; color: #475569; }
    .input {
      padding: 0.6rem 0.9rem; border: 1.5px solid #e2e8f0;
      border-radius: 8px; font-size: 0.875rem; color: #0f172a;
      background: #f8fafc; outline: none; transition: border 0.15s;
    }
    .input:focus { border-color: #3b82f6; background: #fff; }
    .input-sm { font-size: 0.82rem; padding: 0.5rem 0.75rem; }

    /* ─── Doctor cards ─── */
    .doctors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; }
    .doctor-card { background: #fff; border-radius: 14px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1.5px solid #f1f5f9; transition: border 0.15s; }
    .doctor-card:hover { border-color: #bfdbfe; }
    .doc-header { display: flex; align-items: flex-start; gap: 0.9rem; margin-bottom: 1rem; }
    .doc-avatar { width: 46px; height: 46px; min-width: 46px; border-radius: 12px; background: linear-gradient(135deg, #1e40af, #38bdf8); color: #fff; font-size: 1.25rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .doc-info { flex: 1; }
    .doc-info h4 { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
    .doc-rating { font-size: 0.8rem; font-weight: 700; color: #0f172a; background: #fef9c3; border-radius: 6px; padding: 0.2rem 0.5rem; white-space: nowrap; align-self: flex-start; }
    .stars { color: #f59e0b; }
    .booking-form { border-top: 1.5px solid #f1f5f9; padding-top: 1rem; margin-top: 0.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

    /* ─── Buttons ─── */
    .btn-primary {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 0.65rem 1.25rem; border-radius: 8px;
      background: #1e40af; color: #fff; font-weight: 600; font-size: 0.875rem;
      border: none; cursor: pointer; transition: background 0.15s;
    }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
    .btn-outline {
      padding: 0.6rem 1.1rem; border-radius: 8px;
      border: 1.5px solid #e2e8f0; background: #fff;
      color: #334155; font-weight: 500; font-size: 0.875rem; cursor: pointer;
      align-self: flex-end; white-space: nowrap; transition: all 0.15s;
    }
    .btn-outline:hover { border-color: #94a3b8; }
    .link-btn { background: none; border: none; color: #3b82f6; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
    .btn-danger-sm { padding: 0.35rem 0.75rem; font-size: 0.78rem; border-radius: 6px; border: 1.5px solid #fca5a5; background: #fef2f2; color: #dc2626; cursor: pointer; font-weight: 600; transition: all 0.15s; }
    .btn-danger-sm:hover { background: #dc2626; color: #fff; }

    /* ─── States ─── */
    .loading-state { text-align: center; padding: 3rem; color: #94a3b8; font-size: 0.9rem; }
    .empty-state { text-align: center; padding: 3rem; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .error-text { color: #dc2626; font-size: 0.78rem; margin-top: 0.4rem; }
  `]
})
export class PatientHomeComponent implements OnInit {
  tab: 'home' | 'book' | 'appts' = 'home';

  // Data
  userProfile: UserProfile | null = null;
  appointments: Appointment[] = [];
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  specializations: Specialization[] = [
    { specializationId: 1, specializationName: 'Cardiologist' },
    { specializationId: 2, specializationName: 'Dermatologist' },
    { specializationId: 3, specializationName: 'Neurologist' },
    { specializationId: 4, specializationName: 'Orthopedic Surgeon' }
  ];

  // Filters
  filterSpec: number | null = null;
  filterCity = '';

  // UI states
  loadingAppts = false;
  loadingDoctors = false;
  doctorsLoaded = false;

  // Booking
  bookingData: { [id: number]: { date: string; time: string } } = {};
  isBooking: { [id: number]: boolean } = {};
  bookingError: { [id: number]: string } = {};
  todayStr = new Date().toISOString().split('T')[0];

  timeSlots = [
    { label: '09:00 AM', value: '09:00:00' },
    { label: '10:00 AM', value: '10:00:00' },
    { label: '10:30 AM', value: '10:30:00' },
    { label: '11:00 AM', value: '11:00:00' },
    { label: '12:00 PM', value: '12:00:00' },
    { label: '01:00 PM', value: '13:00:00' },
    { label: '02:00 PM', value: '14:00:00' },
    { label: '02:30 PM', value: '14:30:00' },
    { label: '03:00 PM', value: '15:00:00' },
    { label: '04:00 PM', value: '16:00:00' },
    { label: '05:00 PM', value: '17:00:00' },
  ];

  private isBrowser: boolean;

  get initial(): string { return this.userProfile?.firstName?.charAt(0)?.toUpperCase() || 'P'; }
  get pageTitle(): string {
    if (this.tab === 'book') return 'Book Appointment';
    if (this.tab === 'appts') return 'My Appointments';
    return 'Patient Portal';
  }
  get pageSub(): string {
    if (this.tab === 'book') return 'Search and book a time with your preferred doctor';
    if (this.tab === 'appts') return 'View and manage all your scheduled appointments';
    return `Welcome back${this.userProfile ? ', ' + this.userProfile.firstName : ''}!`;
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.loadUserProfile();
    this.loadAppointments();
    this.loadSpecializations();
  }

  // ── Loaders ──

  loadUserProfile() {
    if (!this.isBrowser) return;
    const raw = localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u.userId) {
        this.userService.getProfile(u.userId).subscribe({
          next: (p) => this.userProfile = p,
          error: () => { /* set a minimal profile from localStorage so name still shows */
            this.userProfile = { userId: u.userId, firstName: u.firstName, lastName: u.lastName, email: u.email, phone: '', role: u.role, isEmailVerified: true };
          }
        });
      }
    }
  }

  loadAppointments() {
    this.loadingAppts = true;
    this.appointmentService.getUserAppointments().subscribe({
      next: (data) => { this.appointments = data || []; this.loadingAppts = false; },
      error: () => { this.loadingAppts = false; }
    });
  }

  loadSpecializations() {
    this.doctorService.getSpecializations().subscribe({
      next: (data) => { if (data?.length) this.specializations = data; },
      error: () => { /* keep static fallback */ }
    });
  }

  ensureDoctors() {
    if (!this.doctorsLoaded) this.loadDoctors();
  }

  loadDoctors() {
    this.loadingDoctors = true;
    this.doctorService.getAllDoctors().subscribe({
      next: (data) => {
        this.doctors = data || [];
        this.filteredDoctors = [...this.doctors];
        this.initBookingData();
        this.loadingDoctors = false;
        this.doctorsLoaded = true;
      },
      error: () => {
        this.loadingDoctors = false;
        this.doctorsLoaded = true;
      }
    });
  }

  private initBookingData() {
    this.doctors.forEach(d => {
      if (!this.bookingData[d.doctorId]) this.bookingData[d.doctorId] = { date: '', time: '' };
    });
  }

  filterDoctors() {
    this.filteredDoctors = this.doctors.filter(d => {
      const matchSpec = !this.filterSpec || d.specializationId === this.filterSpec;
      const matchCity = !this.filterCity || d.city.toLowerCase().includes(this.filterCity.toLowerCase());
      return matchSpec && matchCity;
    });
  }

  clearFilters() {
    this.filterSpec = null;
    this.filterCity = '';
    this.filteredDoctors = [...this.doctors];
  }

  // ── Booking ──

  bookAppointment(doctorId: number) {
    const d = this.bookingData[doctorId];
    if (!d?.date) { this.bookingError[doctorId] = 'Please select a date.'; return; }
    if (!d?.time) { this.bookingError[doctorId] = 'Please select a time slot.'; return; }

    this.bookingError[doctorId] = '';
    this.isBooking[doctorId] = true;

    this.appointmentService.bookAppointment({
      doctorId,
      appointmentDate: d.date + 'T00:00:00Z',
      timeSlot: d.time
    }).subscribe({
      next: () => {
        this.isBooking[doctorId] = false;
        this.bookingData[doctorId] = { date: '', time: '' };
        this.loadAppointments();
        this.tab = 'appts';
      },
      error: (err) => {
        this.isBooking[doctorId] = false;
        const msg = err?.response?.data?.message || err?.error?.message || 'Booking failed. Try again.';
        this.bookingError[doctorId] = msg;
      }
    });
  }

  cancelAppointment(id: number) {
    if (!confirm('Cancel this appointment?')) return;
    this.appointmentService.cancelAppointment(id).subscribe({
      next: () => this.loadAppointments(),
      error: (err) => alert(err?.response?.data?.message || 'Could not cancel.')
    });
  }

  // ── Helpers ──

  countByStatus(status: string) { return this.appointments.filter(a => a.status === status).length; }

  badgeClass(status: string) {
    return {
      'badge-pending':   status === 'Pending',
      'badge-confirmed': status === 'Confirmed',
      'badge-completed': status === 'Completed',
      'badge-cancelled': status === 'Cancelled',
    };
  }

  formatTime(t: string): string {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  }

  logout() {
    this.authService.logout();
    if (this.isBrowser) {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    this.router.navigate(['/login']);
  }
}
