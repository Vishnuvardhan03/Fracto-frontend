import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Review } from '../../../core/models/review.model';
import { ReviewService } from '../../../core/services/review.service';

@Component({
  selector: 'app-doctor-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-reviews.component.html',
  styleUrls: ['./doctor-reviews.component.css']
})
export class DoctorReviewsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private reviewService = inject(ReviewService);

  doctorId: number | null = null;
  doctorName = 'Selected Doctor'; // Would ideally sync with Doctor fetch
  specialty = 'Specialist';
  averageRating = 0;
  totalReviews = 0;

  reviews: Review[] = [];
  isLoading = false;
  error = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['doctorId'];
      if (id) {
        this.doctorId = +id;
        this.doctorName = params['doctorName'] || 'Doctor';
        this.loadReviews(this.doctorId);
      } else {
        this.error = 'No doctor selected. Please go back and select a doctor to view reviews.';
      }
    });
  }

  loadReviews(doctorId: number) {
    this.isLoading = true;
    this.reviewService.getReviewsByDoctor(doctorId).subscribe({
      next: (data) => {
        this.reviews = data || [];
        this.totalReviews = this.reviews.length;
        if (this.totalReviews > 0) {
          const sum = this.reviews.reduce((acc, curr) => acc + curr.rating, 0);
          this.averageRating = sum / this.totalReviews;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load reviews.';
        this.isLoading = false;
      }
    });
  }

  getStarsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}
