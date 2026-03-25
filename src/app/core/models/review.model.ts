export interface Review {
  id?: number;
  patientId?: number;
  patientName?: string;
  doctorId: number;
  appointmentId?: number;
  rating: number; // 1 to 5
  comment?: string;
  createdAt?: string;
}
