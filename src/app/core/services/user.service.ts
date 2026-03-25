import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { api } from '../axios.setup';
import { UserProfile } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  getProfile(userId: number): Observable<UserProfile> {
    return from(api.get<UserProfile>(`/user/profile/${userId}`).then(res => res.data));
  }

  updateProfile(data: Partial<UserProfile>): Observable<any> {
    return from(api.put(`/user/profile`, data).then(res => res.data));
  }
}
