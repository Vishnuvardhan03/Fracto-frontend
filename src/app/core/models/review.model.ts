export interface Review {
  id?: string;
  patientId: string;
  patientName?: string; // Optional for display
  doctorId: string;
  doctorName?: string; // Optional for display
  appointmentId?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: Date;
}
