import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { API_BASE } from '../../../config';

@Component({
  selector: 'app-forgot-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-verify-otp.html',
  styleUrl: './forgot-verify-otp.css',
})
export class ForgotVerifyOtp implements OnInit, OnDestroy {
  email = '';
  otp: string[] = ['', '', '', '', '', ''];
  loading = false;
  resendLoading = false;
  errorMessage = '';
  successMessage = '';
  @ViewChildren('otpInput') inputs!: QueryList<ElementRef<HTMLInputElement>>;

  countdown = 300;
  canResend = false;
  private timer: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      if (!this.email) {
        this.router.navigate(['/forgot-password']);
      }
    });
    this.startCountdown();
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  startCountdown() {
    this.countdown = 300;
    this.canResend = false;
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.timer);
        this.canResend = true;
        this.cdr.markForCheck();
      }
      this.cdr.markForCheck();
    }, 1000);
  }

  onOtpInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').slice(-1);
    this.otp[index] = digit;
    input.value = digit;
    if (digit && index < 5) {
      this.inputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace') {
      if (input.value) {
        this.otp[index] = '';
        input.value = '';
      } else if (index > 0) {
        this.otp[index - 1] = '';
        const prev = this.inputs.toArray()[index - 1].nativeElement;
        prev.value = '';
        prev.focus();
      }
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') || '';
    const digits = pasted.replace(/\D/g, '').slice(0, 6);
    digits.split('').forEach((d, i) => {
      this.otp[i] = d;
    });
    const lastIndex = Math.min(digits.length, 5);
    document.getElementById('otp-' + lastIndex)?.focus();
  }

  get isOtpComplete() {
    return this.otp.every(d => d !== '');
  }

  onSubmit() {
    if (!this.isOtpComplete) return;

    this.loading = true;
    this.errorMessage = '';
    const otp = this.otp.join('');

    this.http.post(
      `${API_BASE}/api/auth/verify-otp?email=${this.email}&otp=${otp}`,
      {},
      { observe: 'response' }
    ).subscribe({
      next: (res) => {
        this.loading = false;
        const authHeader = res.headers.get('Authorization') || res.headers.get('authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        const body = res.body as { token?: string } | null;
        const resetToken = token || body?.token || '';

        if (resetToken) {
          sessionStorage.setItem('reset_token', resetToken);
        }

        this.router.navigate(['/reset-password'], {
          queryParams: { email: this.email },
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = this.getErrorMessage(err, 'Invalid OTP! Please try again.');
        this.otp = ['', '', '', '', '', ''];
        this.inputs.toArray().forEach(i => i.nativeElement.value = '');
        this.inputs.toArray()[0].nativeElement.focus();
      }
    });
  }

  resendOtp() {
    if (!this.canResend) return;

    this.resendLoading = true;
    this.errorMessage = '';

    this.http.post(
      `${API_BASE}/api/auth/resend-forgot-otp?email=${this.email}`,
      {}
    ).subscribe({
      next: () => {
        this.resendLoading = false;
        this.successMessage = 'OTP resent successfully!';
        this.startCountdown();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.resendLoading = false;
        this.errorMessage = err.error?.message || 'Failed to resend OTP!';
      }
    });
  }

  private getErrorMessage(err: any, fallback: string): string {
    if (!err) {
      return fallback;
    }

    if (typeof err.error === 'string') {
      try {
        const parsed = JSON.parse(err.error);
        return parsed?.message || fallback;
      } catch {
        return err.error || fallback;
      }
    }

    return err.error?.message || err.message || fallback;
  }
}
