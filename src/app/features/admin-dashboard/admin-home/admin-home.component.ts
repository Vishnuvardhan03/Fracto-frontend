import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../../core/services/doctor.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Doctor, Appointment, Specialization, DoctorCreateRequest } from '../../../core/models/api.model';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-layout admin-theme">
      <!-- Sidebar -->
      <aside class="sidebar glass-panel">
         <div class="logo">Fracto<span>Admin</span></div>
         <nav class="sidebar-nav">
             <a (click)="activeTab = 'dashboard'" [class.active]="activeTab === 'dashboard'" class="nav-item cursor-pointer"><i class="icon">📊</i> Overview</a>
             <a (click)="activeTab = 'doctors'" [class.active]="activeTab === 'doctors'" class="nav-item cursor-pointer"><i class="icon">👨‍⚕️</i> Manage Doctors</a>
             <a (click)="activeTab = 'appointments'" [class.active]="activeTab === 'appointments'" class="nav-item cursor-pointer"><i class="icon">🏥</i> All Appointments</a>
         </nav>
         
         <div class="sidebar-footer mt-auto">
             <button class="btn btn-outline-light w-full hover-danger" (click)="logout()">Log Out</button>
         </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="topbar flex-between">
            <h2>{{ getPageTitle() }}</h2>
            <div class="user-profile">
                <span class="user-name">System Administrator</span>
                <div class="avatar bg-gradient flex-center">👨‍💼</div>
            </div>
        </header>
        
        <div class="content-area">

            <!-- Overview Tab -->
            <div *ngIf="activeTab === 'dashboard'" class="fade-in">
                <div class="dashboard-grid">
                    <div class="stat-card glass-panel">
                        <h3>Total Doctors</h3>
                        <div class="stat-value text-gradient">{{ doctors.length }}</div>
                        <p class="stat-desc">Active in system</p>
                    </div>
                    
                    <div class="stat-card glass-panel">
                        <h3>Appointments System</h3>
                        <div class="stat-value text-gradient">{{ appointments.length }}</div>
                        <p class="stat-desc">Total tracked appointments</p>
                    </div>
                    
                    <div class="stat-card glass-panel">
                        <h3>System Status</h3>
                        <div class="stat-value text-success">Healthy</div>
                        <p class="stat-desc opacity-70">All services operational</p>
                    </div>
                </div>
            </div>

            <!-- Manage Doctors Tab (CRUD) -->
            <div *ngIf="activeTab === 'doctors'" class="fade-in">
                
                <!-- Add / Edit Doctor Form -->
                <div class="glass-panel p-6 mb-8 form-container border border-dark">
                    <h3 class="text-xl font-bold mb-4">{{ editMode ? 'Edit Doctor' : 'Add New Doctor' }}</h3>
                    <form (submit)="submitDoctorForm($event)" class="grid grid-2 gap-4">
                        <div>
                            <label class="form-label">Full Name</label>
                            <input type="text" [(ngModel)]="docForm.name" name="name" required class="form-input-dark">
                        </div>
                        <div>
                            <label class="form-label">City</label>
                            <input type="text" [(ngModel)]="docForm.city" name="city" required class="form-input-dark">
                        </div>
                        <div>
                            <label class="form-label">Specialization</label>
                            <select [(ngModel)]="docForm.specializationId" name="spec" required class="form-input-dark">
                                <option *ngFor="let s of specializations" [ngValue]="s.specializationId">{{s.specializationName}}</option>
                            </select>
                        </div>
                        <div class="flex items-end gap-2">
                           <button type="submit" class="btn btn-primary flex-1">{{ editMode ? 'Update' : 'Create' }}</button>
                           <button type="button" *ngIf="editMode" class="btn btn-outline-light" (click)="resetForm()">Cancel</button>
                        </div>
                    </form>
                </div>

                <!-- Doctors Data Table -->
                <div class="glass-panel p-6">
                    <h3 class="mb-4 text-xl font-bold">Doctor Roster</h3>
                    <div class="table-responsive">
                        <table class="data-table-dark w-full">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Specialization</th>
                                    <th>City</th>
                                    <th>Rating</th>
                                    <th class="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let doc of doctors" class="hover-bg-dark">
                                    <td class="text-muted">#{{ doc.doctorId }}</td>
                                    <td class="font-medium">{{ doc.name }}</td>
                                    <td>{{ doc.specializationName }}</td>
                                    <td>{{ doc.city }}</td>
                                    <td>⭐ {{ doc.rating }}</td>
                                    <td class="text-right flex-end gap-2">
                                        <button class="btn-sm btn-outline-info" (click)="editDoctor(doc)">Edit</button>
                                        <button class="btn-sm btn-outline-danger" (click)="deleteDoctor(doc.doctorId)">Delete</button>
                                    </td>
                                </tr>
                                <tr *ngIf="doctors.length === 0">
                                    <td colspan="6" class="text-center py-8 text-muted">No doctors found in system.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- All Appointments Tab -->
            <div *ngIf="activeTab === 'appointments'" class="fade-in">
                <div class="glass-panel p-6">
                    <h3 class="mb-6 text-xl font-bold">System Bookings</h3>
                    <div class="table-responsive">
                        <table class="data-table-dark w-full">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Doctor</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let appt of appointments" class="hover-bg-dark">
                                    <td class="font-medium">{{ appt.userName || 'User #'+appt.userId }}</td>
                                    <td>{{ appt.doctorName }}</td>
                                    <td>{{ appt.appointmentDate | date:'mediumDate' }}</td>
                                    <td>{{ appt.timeSlot }}</td>
                                    <td>
                                        <select class="status-select bg-darker text-sm" 
                                                [(ngModel)]="appt.status" 
                                                (change)="updateStatus(appt)">
                                            <option value="Pending">Pending</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button class="btn-sm btn-outline-danger" (click)="adminCancelAppointment(appt.appointmentId)">Delete</button>
                                    </td>
                                </tr>
                                <tr *ngIf="appointments.length === 0">
                                    <td colspan="6" class="text-center py-8 text-muted">No appointments found in system.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
      </main>
    </div>
  `,
  styles: [`
    /* Dark Theme specific layout */
    .admin-theme {
        --dash-bg: var(--color-background-dark);
        --sidebar-bg: #1e293b;
        --sidebar-border: rgba(255,255,255,0.05);
        --panel-bg: rgba(30, 41, 59, 0.7);
        --panel-border: rgba(255,255,255,0.08);
        --text: var(--text-light);
        --text-dim: #94a3b8;
        --input-bg: rgba(15, 23, 42, 0.6);
        background-color: var(--dash-bg);
        color: var(--text);
    }
    
    .dashboard-layout { display: flex; min-height: 100vh; }
    .sidebar { width: 280px; padding: 2rem 1.5rem; display: flex; flex-direction: column; border-right: 1px solid var(--sidebar-border); background-color: var(--sidebar-bg); }
    .logo { font-size: 1.75rem; font-weight: 800; color: var(--text); margin-bottom: 3rem; padding-left: 1rem; }
    .logo span { color: var(--color-secondary); font-size: 1rem; margin-left: 0.25rem; vertical-align: top;}
    
    .sidebar-nav { display: flex; flex-direction: column; gap: 0.5rem; }
    .nav-item { display: flex; align-items: center; gap: 1rem; padding: 0.875rem 1rem; border-radius: var(--radius-md); color: var(--text-dim); font-weight: 500; transition: all var(--transition-fast); cursor: pointer; }
    .nav-item:hover, .nav-item.active { background-color: rgba(255, 255, 255, 0.05); color: var(--text); }
    
    .main-content { flex: 1; padding: 2rem 3rem; overflow-y: auto; }
    .topbar { margin-bottom: 3rem; }
    .topbar h2 { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.025em; }
    .user-profile { display: flex; align-items: center; gap: 1rem; }
    .user-name { font-weight: 500; }
    .avatar { width: 44px; height: 44px; border-radius: 50%; font-size: 1.25rem; }
    .bg-gradient { background: linear-gradient(135deg, #3b82f6, #8b5cf6); }
    .flex-center { display: flex; align-items: center; justify-content: center; }
    
    .glass-panel { background: var(--panel-bg); backdrop-filter: blur(12px); border: 1px solid var(--panel-border); border-radius: var(--radius-lg); }
    
    .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
    .stat-card { padding: 2rem; margin-bottom: 2rem; }
    .stat-card h3 { font-size: 1.1rem; color: var(--text-dim); margin-bottom: 1rem; font-weight: 600; }
    .stat-value { font-size: 3rem; font-weight: 800; margin-bottom: 0.5rem; line-height: 1; }
    .stat-desc { color: var(--text-dim); font-size: 0.9rem; }
    
    .text-gradient { background: linear-gradient(to right, #60a5fa, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .text-success { color: var(--success); }
    .text-muted { color: var(--text-dim); }
    
    /* Layout Utilities */
    .mt-auto { margin-top: auto; }
    .w-full { width: 100%; }
    .p-6 { padding: 1.5rem; }
    .mb-8 { margin-bottom: 2rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
    .flex-between { display: flex; justify-content: space-between; align-items: center; }
    .flex-end { display: flex; justify-content: flex-end; align-items: center; }
    .gap-2 { gap: 0.5rem; }
    .gap-4 { gap: 1rem; }
    .flex-1 { flex: 1; }
    .grid { display: grid; }
    .grid-2 { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
    .items-end { align-items: flex-end; }
    .text-xl { font-size: 1.25rem; }
    .text-sm { font-size: 0.875rem; }
    .font-bold { font-weight: 700; }
    .font-medium { font-weight: 500; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .opacity-70 { opacity: 0.7; }
    
    .fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(10px); }
    @keyframes fadeIn { to { opacity: 1; transform: translateY(0); } }
    
    /* Buttons */
    .btn-outline-light { border: 1px solid rgba(255,255,255,0.2); background: transparent; color: var(--text); }
    .btn-outline-light:hover { background: rgba(255,255,255,0.1); }
    .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: var(--radius-sm); border: 1px solid transparent; cursor: pointer; transition: all 0.2s;}
    .btn-outline-danger { color: #f87171; border-color: rgba(248,113,113,0.3); background: rgba(248,113,113,0.05); }
    .btn-outline-danger:hover { background: #ef4444; color: white; }
    .btn-outline-info { color: #38bdf8; border-color: rgba(56,189,248,0.3); background: rgba(56,189,248,0.05); }
    .btn-outline-info:hover { background: #0ea5e9; color: white; }
    .hover-danger:hover { background: #ef4444; color: white; border-color: #ef4444; }

    /* Forms */
    .form-container { background: rgba(15, 23, 42, 0.3); }
    .border-dark { border-color: rgba(255,255,255,0.05); }
    .form-label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--text-dim); }
    .form-input-dark { width: 100%; padding: 0.75rem 1rem; background-color: var(--input-bg); border: 1px solid rgba(255,255,255,0.1); color: var(--text); border-radius: var(--radius-md); transition: all 0.2s; }
    .form-input-dark:focus { outline: none; border-color: var(--color-secondary); box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.2); }
    
    /* Tables */
    .data-table-dark { border-collapse: collapse; text-align: left; }
    .data-table-dark th { padding: 1rem; border-bottom: 2px solid rgba(255,255,255,0.1); color: var(--text-dim); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .data-table-dark td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: middle; }
    .hover-bg-dark:hover { background-color: rgba(255,255,255,0.02); }
    
    .status-select { background: var(--input-bg); color: var(--text); border: 1px solid rgba(255,255,255,0.1); padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); outline: none; }
    .status-select:focus { border-color: var(--color-primary); }
  `]
})
export class AdminHomeComponent implements OnInit {
  activeTab: 'dashboard' | 'doctors' | 'appointments' = 'dashboard';
  
  doctors: Doctor[] = [];
  appointments: Appointment[] = [];
  specializations: Specialization[] = [];

  // Form State
  editMode = false;
  editingId: number | null = null;
  docForm: DoctorCreateRequest = {
      name: '',
      city: '',
      specializationId: 1
  };

  private isBrowser: boolean;

  constructor(
      private router: Router, 
      private authService: AuthService,
      private doctorService: DoctorService,
      private appointmentService: AppointmentService,
      @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
      this.loadDoctors();
      this.loadAppointments();
      this.loadSpecializations();
  }
  
  getPageTitle() {
      if(this.activeTab === 'dashboard') return 'Admin Overview';
      if(this.activeTab === 'doctors') return 'Manage Doctors';
      return 'System Appointments';
  }

  loadDoctors() {
      this.doctorService.getAllDoctors().subscribe({
          next: (res) => this.doctors = res || [],
          error: (err) => console.error(err)
      });
  }

  loadAppointments() {
       this.appointmentService.getAllAppointmentsAdmin().subscribe({
          next: (res) => this.appointments = res || [],
          error: (err) => console.error(err)
      });
  }

  loadSpecializations() {
      this.doctorService.getSpecializations().subscribe({
          next: (res) => {
              this.specializations = res || [];
              if(this.specializations.length > 0 && !this.editMode) {
                  this.docForm.specializationId = this.specializations[0].specializationId;
              }
          },
          error: (err) => console.error(err)
      });
  }

  // --- Doctor CRUD ---

  submitDoctorForm(event: Event) {
      event.preventDefault();
      
      if(this.editMode && this.editingId) {
          this.doctorService.updateDoctor(this.editingId, this.docForm).subscribe({
              next: () => {
                  alert('Doctor updated successfully');
                  this.loadDoctors();
                  this.resetForm();
              },
              error: (err) => {
                  console.error(err);
                  alert('Failed to update doctor.');
              }
          });
      } else {
          this.doctorService.addDoctor(this.docForm).subscribe({
              next: () => {
                  alert('Doctor created successfully');
                  this.loadDoctors();
                  this.resetForm();
              },
              error: (err) => {
                  console.error(err);
                  alert('Failed to create doctor.');
              }
          });
      }
  }

  editDoctor(doc: Doctor) {
      this.editMode = true;
      this.editingId = doc.doctorId;
      this.docForm = {
          name: doc.name,
          city: doc.city,
          specializationId: doc.specializationId,
          profileImagePath: doc.profileImagePath
      };
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteDoctor(id: number) {
      if(confirm('Warning: Deleting a doctor may cascade and affect associated appointments. Continue?')) {
          this.doctorService.deleteDoctor(id).subscribe({
              next: () => {
                  alert('Doctor deleted');
                  this.loadDoctors();
                  // Check if we are deleting the one being edited
                  if(this.editingId === id) this.resetForm();
              },
              error: (err) => console.error(err)
          });
      }
  }

  resetForm() {
      this.editMode = false;
      this.editingId = null;
      this.docForm = {
          name: '',
          city: '',
          specializationId: this.specializations.length > 0 ? this.specializations[0].specializationId : 1
      };
  }

  // --- Appointment Management ---

  updateStatus(appt: Appointment) {
       this.appointmentService.updateAppointmentStatus(appt.appointmentId, { status: appt.status }).subscribe({
           next: () => {
               // Silently update success, no alert needed for slick UX
               console.log('Status updated to', appt.status);
           },
           error: (err) => {
               console.error(err);
               alert('Failed to update status.');
               this.loadAppointments(); // revert
           }
       });
  }

  adminCancelAppointment(id: number) {
      if(confirm('Permanently delete this appointment record from system?')) {
          this.appointmentService.cancelAppointment(id).subscribe({
              next: () => this.loadAppointments(),
              error: (err) => console.error(err)
          });
      }
  }

  logout() {
      this.authService.logout();
      if (this.isBrowser) localStorage.removeItem('user');
      this.router.navigate(['/login']);
  }
}
