export interface User {
	username: string;
	email: string;
	role: string;
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
}

export interface AuthResponse {
	token: string;
	user: User;
}
