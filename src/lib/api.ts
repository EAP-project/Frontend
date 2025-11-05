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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

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
