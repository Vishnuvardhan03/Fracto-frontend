import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, from } from 'rxjs';
import axios from 'axios';
import { UserProfile } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5209/api/user';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  getProfile(userId: number): Observable<UserProfile> {
    const token = this.isBrowser ? localStorage.getItem('accessToken') : null;
    const headers = { Authorization: `Bearer ${token}` };
    return from(axios.get<UserProfile>(`${this.apiUrl}/profile/${userId}`, { headers }).then(res => res.data));
  }
}
