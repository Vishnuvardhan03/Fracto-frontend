import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, from, tap, of } from 'rxjs';
import { api } from '../axios.setup';
import { 
  AuthResponse, 
  InitiateSignupRequest, 
  VerifyEmailRequest, 
  SignupRequest, 
  LoginRequest 
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // --- Registration Flow ---
  initiateSignup(data: InitiateSignupRequest): Observable<AuthResponse> {
    return from(api.post<AuthResponse>(`/auth/initiate-signup`, data).then(res => res.data));
  }

  verifyEmail(data: VerifyEmailRequest): Observable<AuthResponse> {
    return from(api.post<AuthResponse>(`/auth/verify-email`, data).then(res => res.data));
  }

  completeSignup(data: SignupRequest): Observable<AuthResponse> {
    return from(api.post<AuthResponse>(`/auth/signup`, data).then(res => res.data));
  }

  // --- Login Flow ---
  login(data: LoginRequest): Observable<AuthResponse> {
    return from(api.post<AuthResponse>(`/auth/login`, data).then(res => res.data))
      .pipe(
        tap(response => {
          if (this.isBrowser && response.accessToken && response.refreshToken) {
            this.setTokens(response.accessToken, response.refreshToken);
            if (response.user) {
              localStorage.setItem('user', JSON.stringify(response.user));
            }
          }
        })
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  // --- New Methods ---
  getCurrentUser(): Observable<any> {
    if (!this.getAccessToken()) return of(null);
    if (this.isBrowser) {
      const localUser = localStorage.getItem('user');
      if (localUser) {
        try {
          return of(JSON.parse(localUser));
        } catch (e) {}
      }
    }
    return from(api.get(`/auth/me`).then(res => res.data));
  }

  forgotPassword(email: string): Observable<any> {
    return from(api.post(`/auth/forgot-password`, { email }).then(res => res.data));
  }

  resetPassword(data: { email: string; otpCode: string; newPassword: string }): Observable<any> {
    return from(api.post(`/auth/reset-password`, data).then(res => res.data));
  }

  // --- Token Management ---
  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken(): string | null {
    return this.isBrowser ? localStorage.getItem('accessToken') : null;
  }

  getRefreshToken(): string | null {
    return this.isBrowser ? localStorage.getItem('refreshToken') : null;
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }
}
