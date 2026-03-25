import { Routes } from '@angular/router';
import { patientGuard } from './core/guards/patient.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/public/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'patient/dashboard',
    canActivate: [patientGuard],
    loadComponent: () => import('./features/patient-dashboard/patient-home/patient-home.component').then(m => m.PatientHomeComponent)
  },
  {
    path: 'patient/profile',
    canActivate: [patientGuard],
    loadComponent: () => import('./features/patient-dashboard/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'admin/dashboard',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin-dashboard/admin-home/admin-home.component').then(m => m.AdminHomeComponent)
  },
  {
    path: 'patient/doctor-reviews',
    canActivate: [patientGuard],
    loadComponent: () => import('./features/patient-dashboard/doctor-reviews/doctor-reviews.component').then(m => m.DoctorReviewsComponent)
  },
  {
    path: 'patient/leave-review',
    canActivate: [patientGuard],
    loadComponent: () => import('./features/patient-dashboard/leave-review/leave-review.component').then(m => m.LeaveReviewComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
