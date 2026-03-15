import { Routes } from '@angular/router';

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
    path: 'patient/dashboard',
    loadComponent: () => import('./features/patient-dashboard/patient-home/patient-home.component').then(m => m.PatientHomeComponent)
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./features/admin-dashboard/admin-home/admin-home.component').then(m => m.AdminHomeComponent)
  },
  {
    path: 'patient/doctor-reviews',
    loadComponent: () => import('./features/patient-dashboard/doctor-reviews/doctor-reviews.component').then(m => m.DoctorReviewsComponent)
  },
  {
    path: 'patient/leave-review',
    loadComponent: () => import('./features/patient-dashboard/leave-review/leave-review.component').then(m => m.LeaveReviewComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
