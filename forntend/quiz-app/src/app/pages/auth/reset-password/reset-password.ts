import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  resetForm: FormGroup;
  loading = false;
  errorMessage = '';
  email = '';
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    }, { validators: [this.passwordsMatchValidator] });

    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      const resetToken = sessionStorage.getItem('reset_token') || '';
      if (!this.email || !resetToken) {
        this.router.navigate(['/login']);
      }
    });
  }

  get newPassword() {
    return this.resetForm.get('newPassword')!;
  }

  get confirmPassword() {
    return this.resetForm.get('confirmPassword')!;
  }

  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (!newPassword || !confirmPassword) {
      return null;
    }
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

     const payload={
      email:this.email,
      password:this.newPassword.value
    }

    this.http.post(
      `http://localhost:8088/api/auth/forget/password`,
      payload,
      {
        responseType: 'text',
      }
    )
      .subscribe({
        next: () => {
          this.loading = false;
          sessionStorage.removeItem('reset_token');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = this.getErrorMessage(err, 'Password reset failed! Please try again.');
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
