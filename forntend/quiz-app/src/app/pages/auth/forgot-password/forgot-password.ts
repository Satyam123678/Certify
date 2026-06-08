import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { API_BASE } from '../../../config';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  forgotForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get email() {
    return this.forgotForm.get('email')!;
  }

  onSubmit() {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.email.value as string;

    this.http.post(
      `${API_BASE}/api/auth/forget/password/otp?email=${encodeURIComponent(email)}`,
      {},
      { responseType: 'text' }
    )
      .subscribe({
        next: (message) => {
          this.loading = false;
          this.successMessage = message || 'OTP sent to your email.';
          this.router.navigate(['/forgot-verify-otp'], {
            queryParams: { email },
          });
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = this.getErrorMessage(err, 'Failed to send OTP. Please try again.');
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
