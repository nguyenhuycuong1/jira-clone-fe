import { inject, Inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, map, Observable, switchMap, tap } from 'rxjs';
import { UserAccount } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly apiEndpoint = environment.api_endpoint + '/users';
  private httpClient = inject(HttpClient);

  private account$ = new BehaviorSubject<UserAccount | null>(null);
  private userIdentity = this.account$.asObservable();


  getAccount(): Observable<UserAccount> {
    return this.httpClient.get<UserAccount>(`${this.apiEndpoint}/account`).pipe(
      tap(account => {
        this.account$.next(account);
      })
    );
  }

  identity(): Observable<UserAccount | null> {
    return this.userIdentity;
  }

}
