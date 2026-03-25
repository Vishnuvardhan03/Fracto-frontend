export interface UserProfile {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isEmailVerified: boolean;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
}

export interface Doctor {
  doctorId: number;
  name: string;
  city: string;
  rating: number;
  profileImagePath: string;
  specializationId: number;
  specializationName: string;
  bio?: string;
  experienceYears?: number;
  consultationFee?: number;
  languages?: string;
  email?: string;
  phone?: string;
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
  notes?: string;
}

export interface BookAppointmentRequest {
  doctorId: number;
  appointmentDate: string;
  timeSlot: string;
  reason?: string;
}

export interface UpdateAppointmentStatusRequest {
  status: string;
}

export interface AvailabilitySlot {
  doctorAvailabilityId: number;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
}

export interface CreateAvailabilityRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface AppNotification {
  notificationId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
  referenceId?: number;
}

export interface FavoriteDoctor {
  favoriteId: number;
  doctorId: number;
  doctorName: string;
  specializationName: string;
  city: string;
  rating: number;
  profileImagePath: string;
  createdAt: string;
}
