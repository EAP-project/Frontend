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

// Service APIs
export interface Service {
  id: number;
  serviceName: string;
  description?: string;
  price?: number;
}

export async function getAllServices(): Promise<Service[]> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/services`, {
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

// Appointment APIs
export interface AppointmentRequestDTO {
  vehicleId: number;
  serviceId: number;
  appointmentDateTime: string; // ISO format
  customerNotes?: string;
}

export interface Appointment {
  id: number;
  vehicle: Vehicle;
  service: Service;
  appointmentDateTime: string;
  customerNotes?: string;
  status?: string;
  employee?: {
    id?: number;
    firstName?: string;
    lastName?: string;
  };
  createdAt?: string;
  updatedAt?: string;
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
