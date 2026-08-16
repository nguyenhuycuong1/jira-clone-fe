import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, switchMap, tap } from 'rxjs';
import {
  JwtResponse,
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
} from '../models/login.model';
import { request } from 'node:http';
import { AccountService } from '../../../core/auth/account.service';
import { AuthService } from '../../../core/auth/auth.service';
import { UserAccount } from '../../../core/models/account.model';


@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly authApiEndpoint = environment.api_endpoint + '/auth';
  private readonly accountService = inject(AccountService);
  private readonly authService = inject(AuthService);

  constructor(private http: HttpClient) {}

  public register(request: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.authApiEndpoint}/register`, request);
  }

  public login(request: LoginRequest): Observable<UserAccount> {
    return this.http
      .post<JwtResponse>(`${this.authApiEndpoint}/login`, request, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this.authService.setAccessToken(res.accessToken);
        }),
        switchMap(() => this.accountService.getAccount()),
      );
  }

  public verifyOtp(request: VerifyOtpRequest): Observable<boolean> {
    return this.http.post<boolean>(`${this.authApiEndpoint}/verify-otp`, request);
  }

  public resendOtp(email: string): Observable<void> {
    return this.http.post<void>(`${this.authApiEndpoint}/resend-otp/${email}`, {});
  }
}
