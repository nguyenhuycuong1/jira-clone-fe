import { Component, ElementRef, OnDestroy, inject, QueryList, signal, ViewChildren } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { JwtResponse, LoginRequest, RegisterRequest, VerifyOtpRequest } from './models/login.model';
import { LoginService } from './services/login.service';
import { AppNotificationService } from '../../shared/app-notification/app-notification.service';
import { AppButtonComponent } from '../../shared/app-button/app-button.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    AppButtonComponent,
    FormsModule,
    NzIconModule,
    NzInputModule,
    NzGridModule,
    ReactiveFormsModule,
  ],
})
export default class LoginComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly loginService = inject(LoginService);
  private readonly toast = inject(AppNotificationService);
  private readonly router = inject(Router);

  protected readonly passwordVisible = signal(false);

  protected loginForm = this.fb.group({
    usernameOrEmail: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  protected readonly view = signal<'login' | 'register' | 'otp'>('login');

  protected readonly otpDigits = signal<string[]>(['', '', '', '', '', '']);

  protected readonly resendCooldown = signal(0);
  protected readonly resendLoading = signal(false);

  private resendTimer: ReturnType<typeof setInterval> | null = null;

  @ViewChildren('otpBox') private readonly otpInputs = new QueryList<ElementRef<HTMLInputElement>>();

  protected registerForm = this.fb.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    displayName: [''],
  });

  togglePassword(): void {
    this.passwordVisible.update((value) => !value);
  }

  switchToRegister(): void {
    this.view.set('register');
  }

  switchToLogin(): void {
    this.view.set('login');
  }

  switchToOtp(): void {
    this.view.set('otp');
    this.otpInputs.first?.nativeElement.focus();
  }

  onLogin(): void {
    const request: LoginRequest = this.loginForm.value as LoginRequest;
    this.loginService.login(request).subscribe({
      next: () => {
        this.router.navigate(['/']).then(() => {});
      },
      error: (err) => {
        this.toast.error(err.error.error);
      },
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.handleErrorRegisterForm();
      return;
    }

    const request: RegisterRequest = this.registerForm.getRawValue() as RegisterRequest;
    this.loginService.register(request).subscribe({
      next: () => {
        this.toast.info('Hệ thống đang thực hiện gửi mã OTP đến Email bạn đăng ký. Hãy chờ trong giây lát!');
        this.otpDigits.set(['', '', '', '', '', '']);
        this.switchToOtp();
        this.startResendCooldown();
      },
      error: (err) => {
        this.toast.error(err.error.error);
      }
    })
  }

  onOtpInput(event: Event, index: number): void {
    const el = event.target as HTMLInputElement;
    const value = el.value.replace(/\D/g, '').slice(-1);
    if (el.value !== value) {
      el.value = value;
    }
    this.setOtpDigit(index, value);
    if (value) {
      this.focusOtpBox(index + 1);
    }
    this.tryCompleteOtp();
  }

  onOtpKeydown(event: KeyboardEvent, index: number): void {
    const digits = this.otpDigits();
    if (event.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        event.preventDefault();
        this.setOtpDigit(index - 1, '');
        this.focusOtpBox(index - 1);
      }
      return;
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusOtpBox(index - 1);
    } else if (event.key === 'ArrowRight' && index < digits.length - 1) {
      event.preventDefault();
      this.focusOtpBox(index + 1);
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    const digits = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '');
    if (!digits) {
      return;
    }
    event.preventDefault();
    this.otpDigits.set(this.otpDigits().map((d, i) => (i < digits.length ? digits[i] : '')));
    this.focusOtpBox(Math.min(digits.length, 5));
    this.tryCompleteOtp();
  }

  resendOtp(): void {
    if (this.resendCooldown() > 0 || this.resendLoading()) {
      return;
    }
    const email = this.registerForm.get('email')?.value;
    if (!email) {
      return;
    }
    this.resendLoading.set(true);
    this.loginService.resendOtp(email).subscribe({
      next: () => {
        this.toast.success('Đã gửi lại mã OTP. Vui lòng kiểm tra email của bạn.');
        this.otpDigits.set(['', '', '', '', '', '']);
        this.otpInputs.first?.nativeElement.focus();
        this.startResendCooldown();
      },
      error: (err) => {
        this.toast.error(err.error.error);
        this.otpDigits.set(['', '', '', '', '', '']);
      },
      complete: () => {
        this.resendLoading.set(false);
      },
    });
  }

  private startResendCooldown(seconds = 30): void {
    this.stopResendCooldown();
    this.resendCooldown.set(seconds);
    this.resendTimer = setInterval(() => {
      this.resendCooldown.update((s) => Math.max(0, s - 1));
      if (this.resendCooldown() === 0) {
        this.stopResendCooldown();
      }
    }, 1000);
  }

  private stopResendCooldown(): void {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
      this.resendTimer = null;
    }
    this.resendCooldown.set(0);
  }

  ngOnDestroy(): void {
    this.stopResendCooldown();
  }

  private onOtpComplete(): void {
    const request: VerifyOtpRequest = {
      email: this.registerForm.value.email || '',
      otp: this.otpDigits().join('')
    }
    this.loginService.verifyOtp(request).subscribe({
      next: () => {
        this.toast.success('Đăng ký thành công. Hãy đăng nhập để tiếp tục.');
        this.registerForm.reset();
        this.otpDigits.set(['', '', '', '', '', '']);
        this.stopResendCooldown();
        this.switchToLogin();
      }, error: (err) => {
        this.toast.error(err.error.error);
      }
    })
  }

  private setOtpDigit(index: number, value: string): void {
    this.otpDigits.update((digits) => digits.map((d, i) => (i === index ? value : d)));
  }

  private focusOtpBox(index: number): void {
    this.otpInputs.get(index)?.nativeElement.focus();
  }

  private tryCompleteOtp(): void {
    if (this.otpDigits().every((digit) => digit !== '')) {
      this.onOtpComplete();
    }
  }

  handleErrorRegisterForm() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.getError('required', 'username')) {
      this.toast.error('Tên tài khoản không được bỏ trống!');
      return;
    }
    if (this.registerForm.getError('email', 'email')) {
      this.toast.error('Email không hợp lệ!');
      return;
    }
    if (this.registerForm.getError('required', 'password')) {
      this.toast.error('Mật khẩu không được bỏ trống!');
      return;
    }
    if (this.registerForm.getError('required', 'email')) {
      this.toast.error('Email không được bỏ trống!');
      return;
    }
    if (this.registerForm.getError('minlength', 'password')) {
      this.toast.error('Mật khẩu phải tối thiểu 6 ký tự!');
      return;
    }
  }
}
