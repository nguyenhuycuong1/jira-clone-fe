import { Directive, inject } from '@angular/core';
import { AccountService } from '../../core/auth/account.service';
import { Router } from '@angular/router';
import { UserAccount } from '../../core/models/account.model';
import { AppNotificationService } from '../app-notification/app-notification.service';

@Directive()
export class BaseComponent {
  protected readonly accountService = inject(AccountService);
  protected readonly router = inject(Router);
  protected readonly toast = inject(AppNotificationService);


  protected account: UserAccount | null = null;

  constructor() {
    this.accountService.identity().subscribe(account => {
      this.account = account;
    })
  }
}
