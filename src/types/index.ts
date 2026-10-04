export type EventMode = 'in-person' | 'virtual' | 'hybrid';
export type EventCategory = 'Hackathon' | 'Workshop' | 'Tech Talk' | 'Competition' | 'Ideathon' | 'Cultural Tech';
export type PaymentStatus = 'free' | 'paid' | 'pending' | 'failed' | 'refunded';
export type RegistrationStatus = 'confirmed' | 'pending_payment' | 'cancelled';
export type UserRole = 'student' | 'admin';

export interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
  speaker?: string;
}

export interface Speaker {
  name: string;
  role: string;
  company: string;
  avatarUrl?: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  category: EventCategory;
  mode: EventMode;
  venue: string;
  date: string; // ISO date string e.g. 2026-10-15
  time: string; // e.g. "09:30 AM - 05:00 PM"
  registrationDeadline: string; // ISO string
  bannerUrl: string;
  fee: number; // 0 for free
  currency: string;
  capacity: number;
  registeredCount: number;
  checkedInCount: number;
  tags: string[];
  isFeatured?: boolean;
  isSoldOut?: boolean;
  speakers?: Speaker[];
  schedule?: ScheduleItem[];
  perks?: string[];
  rules?: string[];
  organizerEmail: string;
  organizerPhone: string;
  createdAt: string;
}

export interface AttendeeProfile {
  name: string;
  email: string;
  phone: string;
  usn: string;
  college: string;
  branch: string;
  semester: string;
  teamName?: string;
}

export interface PaymentDetails {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: 'UPI' | 'Card' | 'NetBanking' | 'Free Pass';
  paidAt?: string;
  idempotencyKey: string;
  transactionHash: string;
}

export interface CheckInStatus {
  isCheckedIn: boolean;
  checkedInAt?: string;
  verifiedBy?: string;
  deviceId?: string;
}

export interface Registration {
  id: string;
  ticketNumber: string; // e.g. JITACM-2026-B812
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  attendee: AttendeeProfile;
  payment: PaymentDetails;
  status: RegistrationStatus;
  registeredAt: string;
  qrToken: string; // signed validation string
  checkIn: CheckInStatus;
}

export interface CheckInVerificationResult {
  success: boolean;
  message: string;
  registration?: Registration;
  event?: EventItem;
  alreadyCheckedIn?: boolean;
  checkedInAt?: string;
  code: 'CHECK_IN_SUCCESS' | 'ALREADY_CHECKED_IN' | 'INVALID_TOKEN' | 'EVENT_MISMATCH' | 'PAYMENT_NOT_VERIFIED';
}

export interface FilterState {
  search: string;
  category: string;
  mode: string;
  feeType: 'all' | 'free' | 'paid';
}
