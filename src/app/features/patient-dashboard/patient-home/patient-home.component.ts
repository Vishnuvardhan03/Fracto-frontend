import { Component, OnInit, PLATFORM_ID, Inject, inject, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UserProfile, Doctor, Appointment, Specialization, AppNotification, FavoriteDoctor } from '../../../core/models/api.model';
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
          <button class="nav-item" [class.active]="tab === 'home'" (click)="tab='home'; showNotifications=false;">
            <svg viewBox="0 0 24 24"><path d="M3 12L12 3l9 9M5 10v9h5v-6h4v6h5v-9"/></svg>
            Home
          </button>
          <button class="nav-item" [class.active]="tab === 'book'" (click)="tab='book'; ensureDoctors(); showNotifications=false;">
            <svg viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zm-9 9H7m4-4H7m10 0h-4"/></svg>
            Book Appointment
          </button>
          <button class="nav-item" [class.active]="tab === 'appts'" (click)="tab='appts'; loadAppointments(); showNotifications=false;">
            <svg viewBox="0 0 24 24"><path d="M8 7V3M16 7V3M3 11h18M5 5h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"/></svg>
            My Appointments
          </button>
          <button class="nav-item" [class.active]="tab === 'favs'" (click)="tab='favs'; loadFavorites(); showNotifications=false;">
            <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            Favorites
          </button>
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
          <div class="user-chip-container">
            <!-- Notifications Bell -->
            <div class="notification-bell" (click)="toggleNotifications()">
              <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              <span class="badge-count" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
              
              <!-- Dropdown -->
              <div class="notification-dropdown glass-panel fade-in" *ngIf="showNotifications">
                <div class="nd-header flex-between">
                  <h4>Notifications</h4>
                  <button class="link-btn text-sm" (click)="markAllAsRead()">Mark all read</button>
                </div>
                <div class="nd-body">
                  <div *ngIf="notifications.length === 0" class="p-4 text-center text-muted">No notifications</div>
                  <div class="nd-item" *ngFor="let n of notifications" [class.unread]="!n.isRead" (click)="markAsRead(n)">
                    <p class="nd-title">{{ n.title }}</p>
                    <p class="nd-message">{{ n.message }}</p>
                    <p class="nd-time">{{ n.createdAt | date:'short' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Profile Chip -->
            <div class="user-chip cursor-pointer" routerLink="/patient/profile">
              <span class="avatar-circle">{{ initial }}</span>
              <div>
                <p class="chip-name">{{ userProfile ? userProfile.firstName + ' ' + userProfile.lastName : 'Patient' }}</p>
                <p class="chip-role">{{ userProfile?.role || 'User' }}</p>
              </div>
            </div>
          </div>
        </header>

        <!-- ── HOME TAB ── -->
        <section *ngIf="tab === 'home'" class="tab-body fade-in" (click)="showNotifications=false">
          <!-- Stat cards -->
          <div class="stats-row">
            <div class="stat-card blue">
              <div class="stat-icon">📅</div>
              <div><p class="stat-label">Total Bookings</p><p class="stat-val">{{ appointments.length }}</p></div>
            </div>
            <div class="stat-card green">
              <div class="stat-icon">✅</div>
              <div><p class="stat-label">Confirmed</p><p class="stat-val">{{ countByStatus('Confirmed') }}</p></div>
            </div>
            <div class="stat-card amber">
              <div class="stat-icon">⏳</div>
              <div><p class="stat-label">Pending</p><p class="stat-val">{{ countByStatus('Pending') }}</p></div>
            </div>
            <div class="stat-card purple">
              <div class="stat-icon">🏥</div>
              <div><p class="stat-label">Completed</p><p class="stat-val">{{ countByStatus('Completed') }}</p></div>
            </div>
          </div>

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
        <section *ngIf="tab === 'book'" class="tab-body fade-in" (click)="showNotifications=false">
          <div class="card mb-5">
            <h3 class="section-title">Find a Doctor</h3>
            <div class="filters-row">
              <div class="field">
                <label>Specialization</label>
                <select [(ngModel)]="filterSpec" (change)="filterDoctors()" class="input">
                  <option [ngValue]="null">All Specializations</option>
                  <option *ngFor="let s of specializations" [ngValue]="s.specializationId">{{ s.specializationName }}</option>
                </select>
              </div>
              <div class="field">
                <label>City</label>
                <input type="text" [(ngModel)]="filterCity" (input)="filterDoctors()" placeholder="e.g. Karachi" class="input">
              </div>
              <button class="btn-outline" (click)="clearFilters()">Clear</button>
            </div>
          </div>

          <div *ngIf="loadingDoctors" class="loading-state">Loading doctors…</div>
          <div *ngIf="!loadingDoctors && filteredDoctors.length === 0" class="empty-state"><p>No doctors match your search.</p></div>

          <div class="doctors-grid" *ngIf="!loadingDoctors && filteredDoctors.length > 0">
            <div class="doctor-card" *ngFor="let doc of filteredDoctors">
              <div class="doc-header">
                <div class="doc-avatar">{{ doc.name.charAt(0) }}</div>
                <div class="doc-info">
                  <div class="flex-between">
                      <h4 routerLink="/patient/doctor-reviews" [queryParams]="{doctorId: doc.doctorId, doctorName: doc.name}" class="cursor-pointer hover-link">{{ doc.name }}</h4>
                      <button class="fav-btn" 
                              [class.favorited]="isFavorite(doc.doctorId)" 
                              (click)="toggleFavorite(doc.doctorId)">
                          ♥
                      </button>
                  </div>
                  <p class="text-muted text-sm">{{ doc.specializationName }}</p>
                  <p class="text-muted text-sm" *ngIf="doc.experienceYears">{{ doc.experienceYears }} yrs exp</p>
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
                    <input type="date" [name]="'date_' + doc.doctorId" [(ngModel)]="bookingData[doc.doctorId].date"
                           [min]="todayStr" class="input input-sm" (change)="onDateChange(doc.doctorId)">
                  </div>
                  <div class="field">
                    <label>Time Slot</label>
                    <select [name]="'time_' + doc.doctorId" [(ngModel)]="bookingData[doc.doctorId].time" class="input input-sm" [disabled]="!bookingData[doc.doctorId].date || loadingSlots[doc.doctorId] || availableSlots[doc.doctorId]?.length === 0">
                      <option value="">-- Select --</option>
                      <option *ngFor="let t of availableSlots[doc.doctorId] || []" [value]="t">{{ formatTime(t) }}</option>
                    </select>
                  </div>
                </div>
                <!-- UX feedback for empty slots -->
                <p class="text-sm error-text mt-1" *ngIf="bookingData[doc.doctorId].date && !loadingSlots[doc.doctorId] && (!availableSlots[doc.doctorId] || availableSlots[doc.doctorId].length === 0)">
                   No slots available for this date.
                </p>
                <div class="field mt-3">
                    <label>Reason (Optional)</label>
                    <input type="text" [name]="'reason_' + doc.doctorId" [(ngModel)]="bookingData[doc.doctorId].reason" class="input input-sm" placeholder="e.g. routine checkup">
                </div>
                <button class="btn-primary w-full mt-3"
                        [disabled]="isBooking[doc.doctorId] || !bookingData[doc.doctorId].time"
                        (click)="bookAppointment(doc.doctorId)">
                  {{ isBooking[doc.doctorId] ? 'Booking…' : 'Confirm Booking' }}
                </button>
                <p *ngIf="bookingError[doc.doctorId]" class="error-text">{{ bookingError[doc.doctorId] }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ── MY APPOINTMENTS TAB ── -->
        <section *ngIf="tab === 'appts'" class="tab-body fade-in" (click)="showNotifications=false">
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
                  <th>#</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Notes</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let a of appointments; let i = index">
                  <td class="text-muted">{{ i + 1 }}</td>
                  <td class="font-medium">{{ a.doctorName }}</td>
                  <td>{{ a.appointmentDate | date:'MMM d, y' }}</td>
                  <td>{{ formatTime(a.timeSlot) }}</td>
                  <td><span class="badge" [ngClass]="badgeClass(a.status)">{{ a.status }}</span></td>
                  <td><span class="text-sm text-muted line-clamp">{{ a.notes || '—' }}</span></td>
                  <td>
                    <button *ngIf="a.status === 'Pending' || a.status === 'Confirmed'"
                            class="btn-danger-sm"
                            (click)="cancelAppointment(a.appointmentId)">Cancel</button>
                    <button *ngIf="a.status === 'Completed'" 
                            class="btn-outline-sm"
                            routerLink="/patient/leave-review" 
                            [queryParams]="{doctorId: a.doctorId, doctorName: a.doctorName, appointmentId: a.appointmentId}">
                        Review
                    </button>
                    <span *ngIf="a.status === 'Cancelled'" class="text-muted text-sm">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ── FAVORITES TAB ── -->
        <section *ngIf="tab === 'favs'" class="tab-body fade-in" (click)="showNotifications=false">
          <div class="card">
            <div class="card-header">
              <h3>My Favorite Doctors</h3>
            </div>
            <div class="doctors-grid" *ngIf="favoriteDoctors.length > 0">
                <div class="doctor-card" *ngFor="let doc of favoriteDoctors">
                    <div class="doc-header">
                        <div class="doc-avatar">{{ doc.doctorName.charAt(0) }}</div>
                        <div class="doc-info">
                            <h4 class="font-bold">{{ doc.doctorName }}</h4>
                            <p class="text-muted text-sm">{{ doc.specializationName }}</p>
                        </div>
                        <button class="fav-btn favorited" (click)="toggleFavorite(doc.doctorId)">♥</button>
                    </div>
                    <button class="btn-outline w-full mt-3" (click)="tab='book'; ensureDoctors(); filterCity=''; filterSpec=null; filterDoctors()">Book Appointment</button>
                </div>
            </div>
            <div *ngIf="favoriteDoctors.length === 0" class="empty-state">
                <p>You haven't bookmarked any doctors yet.</p>
                <button class="btn-primary" (click)="tab='book'; ensureDoctors()">Find Doctors</button>
            </div>
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
    .sidebar { width: 260px; min-width: 260px; background: #0f172a; padding: 2rem 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .brand { font-size: 1.75rem; font-weight: 800; color: #f8fafc; padding: 0 0.5rem; margin-bottom: 2.5rem; letter-spacing: -0.5px; }
    .brand span { color: #38bdf8; }
    .nav { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; }
    .nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 10px; color: #94a3b8; font-size: 0.9rem; font-weight: 500; background: none; border: none; cursor: pointer; text-align: left; text-decoration: none; transition: all 0.15s; }
    .nav-item svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
    .nav-item:hover { background: rgba(255,255,255,0.06); color: #e2e8f0; }
    .nav-item.active { background: #1e40af; color: #fff; }
    .logout-btn { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 10px; color: #f87171; font-size: 0.9rem; font-weight: 500; background: rgba(248,113,113,0.1); border: none; cursor: pointer; margin-top: 1rem; width: 100%; transition: all 0.15s; }
    .logout-btn svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .logout-btn:hover { background: rgba(248,113,113,0.2); }

    /* ─── Main ─── */
    .main { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }

    /* ─── Topbar & Notification ─── */
    .topbar { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2.5rem; background: #fff; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 10; }
    .page-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; }
    .page-sub { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; }
    .user-chip-container { display: flex; align-items: center; gap: 1.5rem; }
    .user-chip { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-radius: 8px; transition: background 0.2s;}
    .user-chip:hover { background: #f1f5f9; }
    .avatar-circle { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #1e40af, #38bdf8); color: #fff; font-weight: 700; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; }
    .chip-name { font-size: 0.9rem; font-weight: 600; color: #1e293b; }
    .chip-role { font-size: 0.75rem; color: #94a3b8; }
    
    .notification-bell { position: relative; cursor: pointer; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: #f8fafc; transition: background 0.2s;}
    .notification-bell:hover { background: #f1f5f9; }
    .notification-bell svg { width: 22px; height: 22px; stroke: #475569; fill: none; }
    .badge-count { position: absolute; top: 2px; right: 2px; background: #ef4444; color: white; font-size: 0.65rem; font-weight:bold; height: 16px; min-width: 16px; padding: 0 4px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid white;}
    .notification-dropdown { position: absolute; top: 50px; right: 0; width: 320px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 50; overflow: hidden; }
    .nd-header { padding: 1rem; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
    .nd-header h4 { font-size: 0.9rem; font-weight: 700; color: #1e293b; }
    .nd-body { max-height: 350px; overflow-y: auto; }
    .nd-item { padding: 1rem; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.2s; }
    .nd-item.unread { background: #f0f9ff; }
    .nd-item:hover { background: #f1f5f9; }
    .nd-title { font-size: 0.85rem; font-weight: 600; color: #0f172a; margin-bottom: 0.25rem; }
    .nd-message { font-size: 0.8rem; color: #475569; line-height: 1.4; margin-bottom: 0.4rem; }
    .nd-time { font-size: 0.7rem; color: #94a3b8; }

    /* ─── Tab body ─── */
    .tab-body { padding: 2rem 2.5rem; }
    .fade-in { animation: fadein 0.25s ease; }
    @keyframes fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

    /* ─── Stat cards ─── */
    .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 1.25rem; }
    .stat-card { display: flex; align-items: center; gap: 1rem; background: #fff; border-radius: 14px; padding: 1.25rem 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border-left: 4px solid transparent; }
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
    .mt-6 { margin-top: 1.5rem; } .mb-5 { margin-bottom: 1.25rem; } .mt-3 { margin-top: 0.75rem; } .w-full { width: 100%; }

    /* ─── Table ─── */
    .table { width: 100%; border-collapse: collapse; }
    .table th { padding: 0.65rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; border-bottom: 2px solid #f1f5f9; }
    .table td { padding: 0.85rem 1rem; font-size: 0.875rem; color: #334155; border-bottom: 1px solid #f8fafc; }
    .table tr:last-child td { border: none; }
    .table tr:hover td { background: #f8fafc; }
    .font-medium { font-weight: 600; } .font-bold { font-weight: 700; }
    .text-muted { color: #94a3b8; } .text-sm { font-size: 0.8rem; }
    .line-clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

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
    .input { padding: 0.6rem 0.9rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; color: #0f172a; background: #f8fafc; outline: none; transition: border 0.15s; }
    .input:focus { border-color: #3b82f6; background: #fff; }
    .input:disabled { background: #e2e8f0; cursor: not-allowed; }
    .input-sm { font-size: 0.82rem; padding: 0.5rem 0.75rem; }

    /* ─── Doctor cards ─── */
    .doctors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem; }
    .doctor-card { background: #fff; border-radius: 14px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1.5px solid #f1f5f9; transition: border 0.15s; }
    .doctor-card:hover { border-color: #bfdbfe; }
    .doc-header { display: flex; align-items: flex-start; gap: 0.9rem; margin-bottom: 1rem; }
    .doc-avatar { width: 46px; height: 46px; min-width: 46px; border-radius: 12px; background: linear-gradient(135deg, #1e40af, #38bdf8); color: #fff; font-size: 1.25rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .doc-info { flex: 1; }
    .doc-info h4 { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
    .doc-rating { font-size: 0.8rem; font-weight: 700; color: #0f172a; background: #fef9c3; border-radius: 6px; padding: 0.2rem 0.5rem; white-space: nowrap; align-self: flex-start; }
    .hover-link:hover { color: #3b82f6; text-decoration: underline; }
    .fav-btn { background: none; border: none; font-size: 1.25rem; color: #cbd5e1; cursor: pointer; transition: color 0.2s, transform 0.2s; padding: 0; line-height: 1; outline: none;}
    .fav-btn:hover { color: #f43f5e; transform: scale(1.1); }
    .fav-btn.favorited { color: #f43f5e; }
    .stars { color: #f59e0b; }
    .booking-form { border-top: 1.5px solid #f1f5f9; padding-top: 1rem; margin-top: 0.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

    /* ─── Buttons ─── */
    .btn-primary { display: inline-flex; align-items: center; justify-content: center; padding: 0.65rem 1.25rem; border-radius: 8px; background: #1e40af; color: #fff; font-weight: 600; font-size: 0.875rem; border: none; cursor: pointer; transition: background 0.15s; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
    .btn-outline { padding: 0.6rem 1.1rem; border-radius: 8px; border: 1.5px solid #e2e8f0; background: #fff; color: #334155; font-weight: 500; font-size: 0.875rem; cursor: pointer; align-self: flex-end; white-space: nowrap; transition: all 0.15s; }
    .btn-outline:hover { border-color: #94a3b8; }
    .link-btn { background: none; border: none; color: #3b82f6; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
    .btn-danger-sm { padding: 0.35rem 0.75rem; font-size: 0.78rem; border-radius: 6px; border: 1.5px solid #fca5a5; background: #fef2f2; color: #dc2626; cursor: pointer; font-weight: 600; transition: all 0.15s; }
    .btn-danger-sm:hover { background: #dc2626; color: #fff; }
    .btn-outline-sm { padding: 0.35rem 0.75rem; font-size: 0.78rem; border-radius: 6px; border: 1.5px solid #cbd5e1; background: #fff; color: #475569; cursor: pointer; font-weight: 600; transition: all 0.15s; }
    .btn-outline-sm:hover { background: #f1f5f9; border-color: #94a3b8; }
    .cursor-pointer { cursor: pointer; }

    /* ─── States ─── */
    .loading-state { text-align: center; padding: 3rem; color: #94a3b8; font-size: 0.9rem; }
    .empty-state { text-align: center; padding: 3rem; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .error-text { color: #dc2626; font-size: 0.78rem; margin-top: 0.4rem; }
  `]
})
export class PatientHomeComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  tab: 'home' | 'book' | 'appts' | 'favs' = 'home';

  // Data
  userProfile: UserProfile | null = null;
  appointments: Appointment[] = [];
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  specializations: Specialization[] = [];
  favoriteDoctors: FavoriteDoctor[] = [];
  notifications: AppNotification[] = [];

  // Filters
  filterSpec: number | null = null;
  filterCity = '';

  // UI states
  loadingAppts = false;
  loadingDoctors = false;
  doctorsLoaded = false;
  showNotifications = false;
  unreadCount = 0;

  // Booking
  bookingData: { [id: number]: { date: string; time: string; reason: string } } = {};
  isBooking: { [id: number]: boolean } = {};
  bookingError: { [id: number]: string } = {};
  availableSlots: { [id: number]: string[] } = {};
  loadingSlots: { [id: number]: boolean } = {};
  todayStr = new Date().toISOString().split('T')[0];

  private isBrowser: boolean;

  get initial(): string { return this.userProfile?.firstName?.charAt(0)?.toUpperCase() || 'P'; }
  get pageTitle(): string {
    if (this.tab === 'book') return 'Book Appointment';
    if (this.tab === 'appts') return 'My Appointments';
    if (this.tab === 'favs') return 'Favorite Doctors';
    return 'Patient Portal';
  }
  get pageSub(): string {
    if (this.tab === 'book') return 'Search and book a time with your preferred doctor';
    if (this.tab === 'appts') return 'View and manage all your scheduled appointments';
    if (this.tab === 'favs') return 'Quick access to your preferred healthcare providers';
    return `Welcome back${this.userProfile ? ', ' + this.userProfile.firstName : ''}!`;
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private favoriteService: FavoriteService,
    private notificationService: NotificationService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.loadUserProfile();
    this.loadAppointments();
    this.loadSpecializations();
    this.loadFavorites();
    this.loadNotifications();
  }

  // ── Loaders ──
  loadUserProfile() {
    this.authService.getCurrentUser().subscribe({
        next: (p) => { this.userProfile = p; this.cdr.detectChanges(); },
        error: () => { }
    });
  }

  loadAppointments() {
    this.loadingAppts = true;
    this.appointmentService.getUserAppointments().subscribe({
      next: (data) => { this.appointments = data || []; this.loadingAppts = false; this.cdr.detectChanges(); },
      error: () => { this.loadingAppts = false; this.cdr.detectChanges(); }
    });
  }

  loadSpecializations() {
    this.doctorService.getSpecializations().subscribe({
      next: (data) => { if (data?.length) this.specializations = data; this.cdr.detectChanges(); },
      error: () => { this.cdr.detectChanges(); }
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
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingDoctors = false;
        this.doctorsLoaded = true;
        this.cdr.detectChanges();
      }
    });
  }

  private initBookingData() {
    this.doctors.forEach(d => {
      if (!this.bookingData[d.doctorId]) {
          this.bookingData[d.doctorId] = { date: '', time: '', reason: '' };
          this.availableSlots[d.doctorId] = [];
      }
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

  // ── Booking & Slots ──
  onDateChange(doctorId: number) {
      const date = this.bookingData[doctorId].date;
      if (!date) return;
      this.bookingData[doctorId].time = ''; // reset time
      this.loadingSlots[doctorId] = true;
      
      this.doctorService.getAvailableSlots(doctorId, date).subscribe({
          next: (res) => {
              this.availableSlots[doctorId] = res.slots || [];
              this.loadingSlots[doctorId] = false;
              this.cdr.detectChanges();
          },
          error: () => {
              this.availableSlots[doctorId] = [];
              this.loadingSlots[doctorId] = false;
              this.cdr.detectChanges();
          }
      });
  }

  bookAppointment(doctorId: number) {
    const d = this.bookingData[doctorId];
    if (!d?.date) { this.bookingError[doctorId] = 'Please select a date.'; return; }
    if (!d?.time) { this.bookingError[doctorId] = 'Please select a time slot.'; return; }

    this.bookingError[doctorId] = '';
    this.isBooking[doctorId] = true;

    this.appointmentService.bookAppointment({
      doctorId,
      appointmentDate: d.date + 'T00:00:00Z',
      timeSlot: d.time,
      reason: d.reason || undefined
    }).subscribe({
      next: () => {
        this.isBooking[doctorId] = false;
        this.bookingData[doctorId] = { date: '', time: '', reason: '' };
        this.loadAppointments();
        this.tab = 'appts';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isBooking[doctorId] = false;
        const msg = err?.response?.data?.message || err?.error?.message || 'Booking failed. Try again.';
        this.bookingError[doctorId] = msg;
        this.cdr.detectChanges();
      }
    });
  }

  cancelAppointment(id: number) {
    if (!confirm('Cancel this appointment?')) return;
    this.appointmentService.cancelAppointment(id).subscribe({
      next: () => { this.loadAppointments(); this.cdr.detectChanges(); },
      error: (err) => { alert(err?.response?.data?.message || err?.error?.message || 'Could not cancel.'); this.cdr.detectChanges(); }
    });
  }

  // ── Favorites ──
  loadFavorites() {
      this.favoriteService.getFavorites().subscribe({
          next: (res) => {
              this.favoriteDoctors = res || [];
              this.cdr.detectChanges();
          },
          error: () => {}
      });
  }

  isFavorite(doctorId: number): boolean {
      return this.favoriteDoctors.some(f => f.doctorId === doctorId);
  }

  toggleFavorite(doctorId: number) {
      if (this.isFavorite(doctorId)) {
          this.favoriteService.removeFavorite(doctorId).subscribe({
              next: () => this.loadFavorites(),
              error: () => alert('Failed to remove favorite')
          });
      } else {
          this.favoriteService.addFavorite(doctorId).subscribe({
              next: () => this.loadFavorites(),
              error: () => alert('Failed to add favorite')
          });
      }
  }

  // ── Notifications ──
  loadNotifications() {
      this.notificationService.getUnreadCount().subscribe({
          next: (res) => { this.unreadCount = res.count; this.cdr.detectChanges(); },
          error: () => {}
      });
  }

  toggleNotifications(event?: Event) {
      if(event) event.stopPropagation();
      this.showNotifications = !this.showNotifications;
      if (this.showNotifications && this.notifications.length === 0) {
          this.notificationService.getNotifications().subscribe({
              next: (res) => { this.notifications = res || []; this.cdr.detectChanges(); }
          });
      }
  }

  markAsRead(n: AppNotification) {
      if (n.isRead) return;
      this.notificationService.markAsRead(n.notificationId).subscribe({
          next: () => { n.isRead = true; this.loadNotifications(); }
      });
  }

  markAllAsRead() {
      this.notificationService.markAllAsRead().subscribe({
          next: () => { 
              this.notifications.forEach(n => n.isRead = true);
              this.unreadCount = 0;
              this.cdr.detectChanges();
          }
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
    if(isNaN(hr)) return t;
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
