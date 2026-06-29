import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/service/auth-service';
import { API_BASE } from '../../../config';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.css',
})
export class VerifyOtp implements OnInit, OnDestroy {
  email = '';
  otp: string[] = ['', '', '', '', '', ''];
  loading = false;
  resendLoading = false;
  errorMessage = '';
  successMessage = '';
  @ViewChildren('otpInput') inputs!: QueryList<ElementRef<HTMLInputElement>>;

  // Countdown timer for resend
  countdown = 300;
  canResend = false;
  private timer: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Get email from query params
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      if (!this.email) {
        this.router.navigate(['/register']);
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

  // Handle OTP input — auto move to next box
  onOtpInput(event: Event, index: number) {

    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').slice(-1);
    this.otp[index] = digit;
    input.value = digit; // enforce single digit
    if (digit && index < 5) {
      this.inputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  // Handle backspace — move to previous box
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

  // Handle paste — fill all boxes
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') || '';
    const digits = pasted.replace(/\D/g, '').slice(0, 6);
    digits.split('').forEach((d, i) => {
      this.otp[i] = d;
    });
    // Focus last filled box
    const lastIndex = Math.min(digits.length, 5);
    document.getElementById('otp-' + lastIndex)?.focus();
  }

  get otpValue() {
    return this.otp.join('');
  }

  get isOtpComplete() {
    return this.otp.every(d => d !== '');
  }

  onSubmit() {
    if (!this.isOtpComplete) return;

    this.loading = true;
    this.errorMessage = '';
    const otp = this.otp.join('');

    this.http.post<any>(
      `${API_BASE}/api/auth/verify-otp?email=${this.email}&otp=${otp}`,
      {}
    ).subscribe({
      next: (res) => {
        this.loading = false;
        this.authService.setAuthTokens(res.token, res.refreshToken);
        localStorage.setItem('userEmail', res.email);
        localStorage.setItem('userName', res.name);
        if (res.role) {
          localStorage.setItem('userRole', res.role);
        }
        // Navigate to dashboard
        if (res.role === 'ADMIN') {
          this.router.navigate(['/dashboard']);
        }
        else {
          this.router.navigate(['/quizzes']);
        }

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
      `${API_BASE}/api/auth/resend-otp?email=${this.email}`,
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
        this.errorMessage = this.getErrorMessage(err, 'Failed to resend OTP!');
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
