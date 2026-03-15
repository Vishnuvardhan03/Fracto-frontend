import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-leave-review',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './leave-review.component.html',
  styleUrls: ['./leave-review.component.css']
})
export class LeaveReviewComponent implements OnInit {
  reviewForm!: FormGroup;
  stars: number[] = [1, 2, 3, 4, 5];
  hoveredStar: number = 0;
  
  // Mock data for the doctor being reviewed
  doctorName = 'Dr. Sarah Jenkins';
  doctorId = 'doc-123';
  appointmentDate = new Date().toLocaleDateString();

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1)]],
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  setRating(rating: number): void {
    this.reviewForm.patchValue({ rating });
  }

  setHover(rating: number): void {
    this.hoveredStar = rating;
  }

  onSubmit(): void {
    if (this.reviewForm.valid) {
      console.log('Review Submitted:', {
        doctorId: this.doctorId,
        ...this.reviewForm.value
      });
      // In a real app, send to backend here
      
      // Navigate back to dashboard with success message (mocked)
      alert('Review successfully submitted. Thank you!');
      this.router.navigate(['/patient/dashboard']);
    } else {
      this.reviewForm.markAllAsTouched();
    }
  }

  cancel(): void {
    this.router.navigate(['/patient/dashboard']);
  }
}
