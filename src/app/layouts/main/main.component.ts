import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AccountService } from '../../core/auth/account.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  imports: [RouterOutlet],
})
export default class MainComponent {
  private readonly accountService = inject(AccountService);

  ngOnInit() {
    this.accountService.identity().subscribe(account => {
      console.log('mian: ',account);
    });
  }
}
