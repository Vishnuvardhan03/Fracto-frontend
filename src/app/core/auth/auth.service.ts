import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, from, tap } from 'rxjs';
import axios from 'axios';
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
  private apiUrl = 'http://localhost:5209/api/auth';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // --- Registration Flow ---

  initiateSignup(data: InitiateSignupRequest): Observable<AuthResponse> {
    return from(axios.post<AuthResponse>(`${this.apiUrl}/initiate-signup`, data).then(res => res.data));
  }

  verifyEmail(data: VerifyEmailRequest): Observable<AuthResponse> {
    return from(axios.post<AuthResponse>(`${this.apiUrl}/verify-email`, data).then(res => res.data));
  }

  completeSignup(data: SignupRequest): Observable<AuthResponse> {
    return from(axios.post<AuthResponse>(`${this.apiUrl}/signup`, data).then(res => res.data));
  }

  // --- Login Flow ---

  login(data: LoginRequest): Observable<AuthResponse> {
    return from(axios.post<AuthResponse>(`${this.apiUrl}/login`, data).then(res => res.data))
      .pipe(
        tap(response => {
          if (this.isBrowser && response.accessToken && response.refreshToken) {
            this.setTokens(response.accessToken, response.refreshToken);
          }
        })
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
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
