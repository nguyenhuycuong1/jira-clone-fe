export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResult {

}

export interface JwtResponse {
  accessToken: string;
  username: string;
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}
