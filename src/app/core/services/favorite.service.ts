import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { api } from '../axios.setup';
import { FavoriteDoctor } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  
  getFavorites(): Observable<FavoriteDoctor[]> {
    return from(api.get<FavoriteDoctor[]>(`/favorites`).then(res => res.data));
  }

  addFavorite(doctorId: number): Observable<any> {
    return from(api.post(`/favorites`, { doctorId }).then(res => res.data));
  }

  removeFavorite(doctorId: number): Observable<any> {
    return from(api.delete(`/favorites/${doctorId}`).then(res => res.data));
  }
}
