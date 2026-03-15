import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, from } from 'rxjs';
import axios from 'axios';
import { Appointment, BookAppointmentRequest, UpdateAppointmentStatusRequest } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:5209/api/appointment';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getAuthHeaders() {
    const token = this.isBrowser ? localStorage.getItem('accessToken') : null;
    return { Authorization: `Bearer ${token}` };
  }

  bookAppointment(data: BookAppointmentRequest): Observable<any> {
    return from(axios.post(`${this.apiUrl}`, data, { headers: this.getAuthHeaders() }).then(res => res.data));
  }

  getUserAppointments(): Observable<Appointment[]> {
    return from(axios.get<Appointment[]>(`${this.apiUrl}/user`, { headers: this.getAuthHeaders() }).then(res => res.data));
  }

  getAllAppointmentsAdmin(): Observable<Appointment[]> {
    return from(axios.get<Appointment[]>(`${this.apiUrl}/admin`, { headers: this.getAuthHeaders() }).then(res => res.data));
  }

  updateAppointmentStatus(id: number, data: UpdateAppointmentStatusRequest): Observable<any> {
    return from(axios.put(`${this.apiUrl}/${id}/status`, data, { headers: this.getAuthHeaders() }).then(res => res.data));
  }

  cancelAppointment(id: number): Observable<any> {
    return from(axios.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).then(res => res.data));
  }
}
