import error from "next/error";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  token: string;
  tokenType: string;
}

// ErrorResponse not needed here; callers parse thrown Error messages

// Helper to get the API base URL - ensures we always use absolute URLs
const getApiBase = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  
  // For client-side, ensure we use the full backend URL
  if (typeof window !== 'undefined') {
    return 'http://localhost:8080/api';
  }
  
  return 'http://localhost:8080/api';
};

const API_BASE = getApiBase();

export async function login(data: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
      mode: 'cors', // Explicitly set CORS mode
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error || `HTTP error! status: ${response.status}`
      );
    }

    try {
      const result = await response.json();
      return result as LoginResponse;
    } catch (e) {
      throw new Error('Invalid JSON response from server');
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please check if the server is running.');
    }
    if (error instanceof Error) throw error;
    throw new Error(String(error));
  }
}

export interface RegistrationRequest {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
}

export interface RegistrationResponse {
  message: string;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export async function register(data: RegistrationRequest): Promise<RegistrationResponse> {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result as RegistrationResponse;
}

// Vehicle APIs
export interface VehicleDTO {
  model: string;
  year: number;
  licensePlate: string;
}

export interface Vehicle {
  id: number;
  model: string;
  year: number;
  licensePlate: string;
  owner?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  };
}

export async function createVehicle(data: VehicleDTO): Promise<Vehicle> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/vehicles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function getMyVehicles(): Promise<Vehicle[]> {
  const token = localStorage.getItem('token');
  const url = `${API_BASE}/vehicles`;
  console.log('Fetching vehicles from:', url); // Debug log
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}


// Update the Service interface to match your backend model
export interface Service {
  id: number;
  name: string; // Changed from serviceName to name
  description?: string;
  estimatedCost?: number;
  estimatedDurationMinutes?: number;
  imageUrl?: string;
  category?: {
    id: number;
    name: string;
  };
}

export interface ServiceDTO {
  name: string; // Changed from serviceName to name
  description?: string;
  estimatedCost: number;
  estimatedDurationMinutes: number;
  categoryId: number;
}

// Add this function to get service categories
export interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
}

// Service Category APIs
export interface ServiceCategoryDTO {
  name: string;
  description?: string;
}



export async function getAllServices(): Promise<Service[]> {
  const token = localStorage.getItem('token');
  const url = `${API_BASE}/services`;
  console.log('Fetching services from:', url); // Debug log

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  console.log('Services response status:', response.status); // Debug log

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('Services fetch error:', errorData); // Debug log
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log('Services response data:', data); // Debug log
  return data;
}

export async function createService(serviceData: ServiceDTO, imageFile?: File): Promise<Service> {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  
  // Add service data as JSON string
  formData.append('service', JSON.stringify(serviceData));
  
  // Add image file if provided
  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await fetch(`${API_BASE}/services`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type - let browser set it with boundary for multipart/form-data
    },
    body: formData,
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}


export async function createServiceCategory(data: ServiceCategoryDTO): Promise<ServiceCategory> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/service-categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}



export async function updateServiceCategory(categoryId: number, data: ServiceCategoryDTO): Promise<ServiceCategory> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/service-categories/${categoryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function deleteServiceCategory(categoryId: number): Promise<void> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE}/service-categories/${categoryId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }
}

// Get single service by ID
export async function getServiceById(serviceId: number): Promise<Service> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/services/${serviceId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Get service categories
export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/service-categories`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// /lib/api.ts (Add these two blocks near your existing interfaces/functions)

// --- New Interface for Category with Services (Needed for Nested Data) ---
export interface ServiceCategoryWithServices extends ServiceCategory {
  // We assume the backend nests the list of services under this field
  services: Service[]; 
}

// --- New API Call to fetch Categories with Services ---
export async function getServiceCategoriesWithServices(): Promise<ServiceCategoryWithServices[]> {
  const token = localStorage.getItem('token');
  // NOTE: This endpoint needs to be implemented on your Spring Boot backend
  const response = await fetch(`${API_BASE}/service-categories`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// ... (Rest of your existing /lib/api.ts code)









// Update service
export async function updateService(
  serviceId: number, 
  serviceData: ServiceDTO, 
  imageFile?: File
): Promise<Service> {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  
  // Add service data as JSON string
  formData.append('service', JSON.stringify(serviceData));
  
  // Add image file if provided
  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await fetch(`${API_BASE}/services/${serviceId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function deleteService(serviceId: number): Promise<void> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE}/services/${serviceId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }
}

// Appointment APIs
export interface AppointmentRequestDTO {
  vehicleId: number;
  serviceId?: number; // Keep for backward compatibility
  serviceIds?: number[]; // Support multiple services
  appointmentDateTime: string; // ISO format
  customerNotes?: string;
}

export interface Appointment {
  id: number;
  vehicle: Vehicle;
  service: Service; // Keep for backward compatibility
  services?: Service[]; // Multiple services support
  appointmentDateTime: string;
  customerNotes?: string;
  technicianNotes?: string;
  status?: string;
  employee?: {
    id?: number;
    firstName?: string;
    lastName?: string;
  };
  assignedEmployees?: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

// Slot-based appointment request
export interface SlotBasedAppointmentRequestDTO {
  vehicleId: number;
  serviceId: number;
  appointmentDate: string; // YYYY-MM-DD format
  sessionPeriod: 'MORNING' | 'AFTERNOON';
  slotNumber: number; // 1-5
  customerNotes?: string;
}

// Available slot
export interface AvailableSlot {
  slotNumber: number;
  startTime: string; // HH:mm:ss format
  endTime: string; // HH:mm:ss format
  isAvailable: boolean;
}

// Slot template
export interface SlotTemplate {
  sessionPeriod: 'MORNING' | 'AFTERNOON';
  slotNumber: number;
  startTime: string;
  endTime: string;
}

export async function createAppointment(data: AppointmentRequestDTO): Promise<Appointment> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/appointments/standard-service`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Create slot-based appointment
export async function createSlotBasedAppointment(data: SlotBasedAppointmentRequestDTO): Promise<Appointment> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/appointments/slot-based-service`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error || `HTTP error! status: ${response.status}`;

    // Check for duplicate slot booking error
    if (errorMessage.includes('duplicate key value violates unique constraint') ||
        errorMessage.includes('slot_id') ||
        errorMessage.includes('uk8y6yin1cflvk14414e91mdcwm')) {
      throw new Error('This time slot has already been booked. Please select a different slot.');
    }

    // Check for other common constraint violations
    if (errorMessage.includes('constraint')) {
      throw new Error('Unable to book appointment. The selected slot may no longer be available.');
    }

    throw new Error(errorMessage);
  }

  return await response.json();
}

// Get available slots
export async function getAvailableSlots(date: string, period: 'MORNING' | 'AFTERNOON'): Promise<AvailableSlot[]> {
  const token = localStorage.getItem('token');
  const url = `${API_BASE}/appointments/available-slots?date=${date}&period=${period}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Get slot templates
export async function getSlotTemplates(): Promise<SlotTemplate[]> {
  const token = localStorage.getItem('token');
  const url = `${API_BASE}/appointments/slot-templates`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function getMyAppointments(): Promise<Appointment[]> {
  const token = localStorage.getItem('token');
  const url = `${API_BASE}/appointments/my-appointments`;
  console.log('Fetching appointments from:', url); // Debug log
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function getAppointmentById(id: number): Promise<Appointment> {
  const token = localStorage.getItem('token');
  const url = `${API_BASE}/appointments/${id}`;
  console.log('Fetching appointment from:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Get all appointments (for admin/employee)
export async function getAllAppointments(status?: string): Promise<Appointment[]> {
  const token = localStorage.getItem('token');
  const url = status 
    ? `${API_BASE}/appointments?status=${status}` 
    : `${API_BASE}/appointments`;
  console.log('Fetching all appointments from:', url); // Debug log
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Get active appointments (excluding COMPLETED and CANCELLED) for admin
export async function getActiveAppointments(): Promise<Appointment[]> {
  const token = localStorage.getItem('token');
  const url = `${API_BASE}/appointments`;
  console.log('Fetching active appointments from:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  const allAppointments = await response.json();
  // Filter out COMPLETED and CANCELLED appointments
  return allAppointments.filter((apt: Appointment) => 
    apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED'
  );
}

// Email verification API
export async function verifyEmail(token: string): Promise<string> {
  const response = await fetch(`${API_BASE}/verify-email?token=${token}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.text();
}

// Forgot password API
export interface ForgotPasswordRequest {
  email: string;
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<string> {
  const response = await fetch(`${API_BASE}/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.text();
}

// Reset password API
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export async function resetPassword(data: ResetPasswordRequest): Promise<string> {
  const response = await fetch(`${API_BASE}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.text();
}

// Validate reset password token
export async function validateResetToken(token: string): Promise<string> {
  const response = await fetch(`${API_BASE}/reset-password?token=${token}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.text();
}

// Get scheduled appointments (for employees)
export async function getScheduledAppointments(): Promise<Appointment[]> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/appointments/scheduled`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Accept appointment (employee)
export async function acceptAppointment(appointmentId: number): Promise<Appointment> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/appointments/${appointmentId}/accept`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Cancel appointment (employee)
export async function cancelAppointment(appointmentId: number): Promise<Appointment> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/appointments/${appointmentId}/cancel`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Get employee's in-progress appointments
export async function getMyInProgressAppointments(): Promise<Appointment[]> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/appointments/my-inprogress`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Get employee's awaiting parts appointments
export async function getMyAwaitingPartsAppointments(): Promise<Appointment[]> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/appointments/my-awaiting-parts`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Get employee's completed appointments
export async function getMyCompletedAppointments(): Promise<Appointment[]> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/appointments/my-completed`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Get customer's service history (completed appointments)
export async function getMyServiceHistory(): Promise<Appointment[]> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/appointments/my-history`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Get all service history for employees (all completed appointments with customer details)
export async function getAllServiceHistory(): Promise<Appointment[]> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/appointments/history`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Time Log interfaces
export interface TimeLog {
  id: number;
  startTime: string;
  endTime: string | null;
  notes: string;
  appointmentId: number;
  employeeId: number;
  employeeFirstName: string;
  employeeLastName: string;
  employeeEmail: string;
  durationMinutes: number | null;
  formattedDuration: string | null;
  serviceName: string;
  vehicleModel: string;
  vehicleNumber: string;
}

// Get employee's time logs
export async function getMyTimeLogs(): Promise<TimeLog[]> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/time-logs/my-logs`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Get all time logs across all employees (for admin)
export async function getAllTimeLogs(): Promise<TimeLog[]> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/time-logs/all`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

