import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, from } from 'rxjs';
import axios from 'axios';
import { Doctor, Specialization, DoctorCreateRequest } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = 'http://localhost:5209/api/doctor';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getAuthHeaders() {
    const token = this.isBrowser ? localStorage.getItem('accessToken') : null;
    return { Authorization: `Bearer ${token}` };
  }

  getAllDoctors(city?: string, specializationId?: number): Observable<Doctor[]> {
    let url = this.apiUrl;
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (specializationId) params.append('specializationId', specializationId.toString());
    if (params.toString()) url += `?${params.toString()}`;
    return from(axios.get<Doctor[]>(url).then(res => res.data));
  }

  getDoctor(id: number): Observable<Doctor> {
    return from(axios.get<Doctor>(`${this.apiUrl}/${id}`).then(res => res.data));
  }

  addDoctor(data: DoctorCreateRequest): Observable<any> {
    return from(axios.post(`${this.apiUrl}`, data, { headers: this.getAuthHeaders() }).then(res => res.data));
  }

  updateDoctor(id: number, data: DoctorCreateRequest): Observable<any> {
    return from(axios.put(`${this.apiUrl}/${id}`, data, { headers: this.getAuthHeaders() }).then(res => res.data));
  }

  deleteDoctor(id: number): Observable<any> {
    return from(axios.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).then(res => res.data));
  }

  getSpecializations(): Observable<Specialization[]> {
    return from(axios.get<Specialization[]>(`${this.apiUrl}/specializations`).then(res => res.data));
  }
}
