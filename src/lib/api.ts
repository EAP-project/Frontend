interface LoginRequest {
  username: string;
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

interface ErrorResponse {
  error: string;
}

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
  } catch (error: any) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please check if the server is running.');
    }
    throw error;
  }
}
