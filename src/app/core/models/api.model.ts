export interface UserProfile {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isEmailVerified: boolean;
}

export interface Doctor {
  doctorId: number;
  name: string;
  city: string;
  rating: number;
  profileImagePath: string;
  specializationId: number;
  specializationName: string;
}

export interface Specialization {
  specializationId: number;
  specializationName: string;
}

export interface DoctorCreateRequest {
  name: string;
  city: string;
  profileImagePath?: string;
  specializationId: number;
}

export interface Appointment {
  appointmentId: number;
  userId: number;
  userName: string;
  doctorId: number;
  doctorName: string;
  specializationName: string;
  appointmentDate: string;
  timeSlot: string;
  status: string;
}

export interface BookAppointmentRequest {
  doctorId: number;
  appointmentDate: string;
  timeSlot: string;
}

export interface UpdateAppointmentStatusRequest {
  status: string;
}
