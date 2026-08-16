import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

export function initializeAuth(): () => Promise<void> {
  const authService = inject(AuthService);
  const router = inject(Router);

  return async () => {
    try {
      await firstValueFrom(
        authService.refreshToken()
      )
      router.navigate(['/']).then();
    } catch {
      authService.logout().subscribe({
        next: () => {
          router.navigate(['/login']).then();
        }
      });
    }
  }
}
