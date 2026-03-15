import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Review } from '../../../core/models/review.model';

@Component({
  selector: 'app-doctor-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-reviews.component.html',
  styleUrls: ['./doctor-reviews.component.css']
})
export class DoctorReviewsComponent implements OnInit {
  doctorName = 'Dr. Sarah Jenkins';
  specialty = 'Cardiologist';
  averageRating = 4.8;
  totalReviews = 124;

  reviews: Review[] = [
    {
      id: 'rev-1',
      patientId: 'pat-001',
      patientName: 'Alice Smith',
      doctorId: 'doc-123',
      rating: 5,
      comment: 'Excellent doctor! Very attentive and explained everything clearly. I highly recommend Dr. Jenkins.',
      createdAt: new Date('2026-03-10T10:30:00Z')
    },
    {
      id: 'rev-2',
      patientId: 'pat-002',
      patientName: 'John Doe',
      doctorId: 'doc-123',
      rating: 4,
      comment: 'Good experience overall. Only waited 10 minutes past my appointment time. Friendly staff.',
      createdAt: new Date('2026-03-05T14:15:00Z')
    },
    {
      id: 'rev-3',
      patientId: 'pat-003',
      patientName: 'Anonymous Patient',
      doctorId: 'doc-123',
      rating: 5,
      comment: 'She really takes the time to listen to your concerns. Very empathetic.',
      createdAt: new Date('2026-02-28T09:00:00Z')
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  getStarsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}
