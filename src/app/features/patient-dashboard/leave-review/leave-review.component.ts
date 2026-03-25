import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ReviewService } from '../../../core/services/review.service';

@Component({
  selector: 'app-leave-review',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './leave-review.component.html',
  styleUrls: ['./leave-review.component.css']
})
export class LeaveReviewComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private reviewService = inject(ReviewService);

  reviewForm!: FormGroup;
  stars: number[] = [1, 2, 3, 4, 5];
  hoveredStar = 0;
  isSubmitting = false;
  
  doctorId: number | null = null;
  doctorName = 'Unknown Doctor';
  appointmentId: number | null = null;

  ngOnInit(): void {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.maxLength(1000)]]
    });

    this.route.queryParams.subscribe(params => {
      if (params['doctorId']) this.doctorId = +params['doctorId'];
      if (params['doctorName']) this.doctorName = params['doctorName'];
      if (params['appointmentId']) this.appointmentId = +params['appointmentId'];
    });
  }

  setRating(rating: number): void {
    this.reviewForm.patchValue({ rating });
  }

  setHover(rating: number): void {
    this.hoveredStar = rating;
  }

  onSubmit(): void {
    if (!this.doctorId) {
      alert('Error: No doctor specified for this review.');
      return;
    }

    if (this.reviewForm.valid) {
      this.isSubmitting = true;
      const payload = {
        doctorId: this.doctorId,
        appointmentId: this.appointmentId || undefined,
        rating: this.reviewForm.value.rating,
        comment: this.reviewForm.value.comment
      };
      
      this.reviewService.submitReview(payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          alert('Review successfully submitted. Thank you!');
          this.router.navigate(['/patient/dashboard']);
        },
        error: (err) => {
          this.isSubmitting = false;
          alert(err.response?.data?.message || err.error?.message || 'Failed to submit review.');
        }
      });
    } else {
      this.reviewForm.markAllAsTouched();
    }
  }

  cancel(): void {
    this.router.navigate(['/patient/dashboard']);
  }
}
