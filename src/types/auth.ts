export interface User {
  id: number;
  name: string;
  email: string;
  role: "customer" | "technician" | "admin";
}

export interface AuthResponse {
  token: string;
  user: User;
}
