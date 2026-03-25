import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { api } from '../axios.setup';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  
  getReviewsByDoctor(doctorId: number): Observable<Review[]> {
    return from(api.get<Review[]>(`/review/doctor/${doctorId}`).then(res => res.data));
  }

  submitReview(data: Review): Observable<any> {
    return from(api.post(`/review`, data).then(res => res.data));
  }
}
