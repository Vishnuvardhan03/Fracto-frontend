import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { api } from '../axios.setup';
import { Doctor, Specialization, DoctorCreateRequest, AvailabilitySlot, CreateAvailabilityRequest } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  getAllDoctors(city?: string, specializationId?: number): Observable<Doctor[]> {
    let url = `/doctor`;
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (specializationId) params.append('specializationId', specializationId.toString());
    if (params.toString()) url += `?${params.toString()}`;
    return from(api.get<Doctor[]>(url).then(res => res.data));
  }

  getDoctor(id: number): Observable<Doctor> {
    return from(api.get<Doctor>(`/doctor/${id}`).then(res => res.data));
  }

  addDoctor(data: DoctorCreateRequest): Observable<any> {
    return from(api.post(`/doctor`, data).then(res => res.data));
  }

  updateDoctor(id: number, data: DoctorCreateRequest): Observable<any> {
    return from(api.put(`/doctor/${id}`, data).then(res => res.data));
  }

  deleteDoctor(id: number): Observable<any> {
    return from(api.delete(`/doctor/${id}`).then(res => res.data));
  }

  getSpecializations(): Observable<Specialization[]> {
    return from(api.get<Specialization[]>(`/doctor/specializations`).then(res => res.data));
  }

  // --- Availability ---

  getAvailability(doctorId: number): Observable<AvailabilitySlot[]> {
    return from(api.get<AvailabilitySlot[]>(`/availability/doctor/${doctorId}`).then(res => res.data));
  }

  getAvailableSlots(doctorId: number, date: string): Observable<{ date: string, slots: string[] }> {
    return from(api.get<{ date: string, slots: string[] }>(`/availability/doctor/${doctorId}/slots?date=${date}`).then(res => res.data));
  }

  setAvailability(doctorId: number, data: CreateAvailabilityRequest): Observable<any> {
    return from(api.post(`/availability/doctor/${doctorId}`, data).then(res => res.data));
  }

  deleteAvailability(doctorId: number, dayOfWeek: number): Observable<any> {
    return from(api.delete(`/availability/doctor/${doctorId}/${dayOfWeek}`).then(res => res.data));
  }
}
