import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { api } from '../axios.setup';
import { AppNotification } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  getNotifications(): Observable<AppNotification[]> {
    return from(api.get<AppNotification[]>(`/notifications`).then(res => res.data));
  }

  getUnreadCount(): Observable<{ count: number }> {
    return from(api.get<{ count: number }>(`/notifications/unread-count`).then(res => res.data));
  }

  markAsRead(id: number): Observable<any> {
    return from(api.put(`/notifications/${id}/read`).then(res => res.data));
  }

  markAllAsRead(): Observable<any> {
    return from(api.put(`/notifications/read-all`).then(res => res.data));
  }
}
