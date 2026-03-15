export interface AuthResponse {
    message?: string;
    accessToken?: string;
    refreshToken?: string;
    verificationToken?: string;
    user?: {
        userId: number;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    };
}

export interface InitiateSignupRequest {
    email: string;
}

export interface VerifyEmailRequest {
    email: string;
    otpCode: string;
}

export interface SignupRequest {
    email: string;
    password?: string; // Optional for earlier steps
    firstName?: string;
    lastName?: string;
    phone?: string;
    roleTypeId?: number;
    verificationToken?: string;
}

export interface LoginRequest {
    email: string;
    password?: string;
}

export interface RefreshTokenRequest {
    accessToken: string;
    refreshToken: string;
}
