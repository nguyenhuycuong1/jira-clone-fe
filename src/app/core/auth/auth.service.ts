import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, tap } from 'rxjs';
import { JwtResponse } from '../../features/login/models/login.model';
import { environment } from '../../../environments/environment';
import { AccountService } from './account.service';
import { UserAccount } from '../models/account.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private authApiEndpoint = environment.api_endpoint + '/auth';

  private accessToken: string | null = null;
  private accountService = inject(AccountService);

  setAccessToken(accessToken: string): void {
    this.accessToken = accessToken;
  }

  getAccessToken() {
    return this.accessToken;
  }

  clearAccessToken() {
    this.accessToken = null;
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  refreshToken(): Observable<UserAccount> {
    return this.httpClient
      .post<JwtResponse>(`${this.authApiEndpoint}/refresh`,{},
        {
          withCredentials: true,
        },
      ).pipe(
        tap((res) => {
          this.setAccessToken(res.accessToken);
        }),
        switchMap(() => this.accountService.getAccount()),
      );
  }

  logout(): Observable<void> {
    return this.httpClient.post<void>(`${this.authApiEndpoint}/logout`, {}, {
      withCredentials: true,
    }).pipe(
      tap(() => this.clearAccessToken())
    )
  }

}
