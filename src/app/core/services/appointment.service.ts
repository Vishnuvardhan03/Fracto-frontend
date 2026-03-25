import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { api } from '../axios.setup';
import { Appointment, BookAppointmentRequest, UpdateAppointmentStatusRequest } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  
  bookAppointment(data: BookAppointmentRequest): Observable<any> {
    return from(api.post(`/appointment`, data).then(res => res.data));
  }

  getUserAppointments(): Observable<Appointment[]> {
    return from(api.get<Appointment[]>(`/appointment/user`).then(res => res.data));
  }

  getAllAppointmentsAdmin(): Observable<Appointment[]> {
    return from(api.get<Appointment[]>(`/appointment/admin`).then(res => res.data));
  }

  updateAppointmentStatus(id: number, data: UpdateAppointmentStatusRequest): Observable<any> {
    return from(api.put(`/appointment/${id}/status`, data).then(res => res.data));
  }

  updateAppointmentNotes(id: number, notes: string): Observable<any> {
    return from(api.put(`/appointment/${id}/notes`, { notes }).then(res => res.data));
  }

  cancelAppointment(id: number): Observable<any> {
    return from(api.delete(`/appointment/${id}`).then(res => res.data));
  }
}
