import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/service/auth-service';

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
 
  // Countdown timer for resend
  countdown = 300;
  canResend = false;
  private timer: any;
 
  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}
 
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
      }
    }, 1000);
  }
 
  // Handle OTP input — auto move to next box
  onOtpInput(event: Event, index: number) {
    const inputEvent = event as InputEvent;
    const input = event.target as HTMLInputElement;
    const raw = input.value || '';

    if (!/^\d*$/.test(raw)) {
      input.value = '';
      this.otp[index] = '';
      return;
    }

    // Handle full OTP or multiple digits typed at once (autofill/paste).
    if (raw.length > 1) {
      const digits = raw.slice(0, 6 - index).split('');
      digits.forEach((d, i) => {
        this.otp[index + i] = d;
      });

      const nextIndex = Math.min(index + digits.length, 5);
      document.getElementById('otp-' + nextIndex)?.focus();
      return;
    }

    // Single-digit input; move focus to the next box.
    const digit = inputEvent.data ?? raw;
    this.otp[index] = digit;

    if (digit && index < 5) {
      document.getElementById('otp-' + (index + 1))?.focus();
    }
  }
 
  // Handle backspace — move to previous box
  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key !== 'Backspace') return;

    const current = this.otp[index];

    if (current) {
      event.preventDefault();
      this.otp[index] = '';
      return;
    }

    if (index > 0) {
      event.preventDefault();
      this.otp[index - 1] = '';
      document.getElementById('otp-' + (index - 1))?.focus();
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
 
    this.http.post<any>(
      `http://localhost:8088/api/auth/verify-otp?email=${this.email}&otp=${this.otpValue}`,
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
        if(res.role === 'ADMIN') {
          this.router.navigate(['/dashboard']);
        }
        else{
            this.router.navigate(['/quizzes']);
        }
        
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid OTP! Please try again.';
        // Clear OTP boxes on error
        this.otp = ['', '', '', '', '', ''];
        document.getElementById('otp-0')?.focus();
      }
    });
  }
 
  resendOtp() {
    if (!this.canResend) return;
 
    this.resendLoading = true;
    this.errorMessage = '';
 
    this.http.post(
      `http://localhost:8088/api/auth/resend-otp?email=${this.email}`,
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

}
