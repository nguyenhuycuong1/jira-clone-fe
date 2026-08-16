import { Component, inject } from '@angular/core';
import { AppButtonComponent } from '../../shared/app-button/app-button.component';
import { BaseComponent } from '../../shared/base/base.component';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'home',
  imports: [AppButtonComponent],
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
})
export default class HomeComponent extends BaseComponent{

  private readonly authService = inject(AuthService);

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['login']).then();
    });
  }
}
