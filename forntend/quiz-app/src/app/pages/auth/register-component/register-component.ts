import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../../shared/components/toast/toast';

@Component({
  selector: 'app-register-component',
   standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css',
})
export class RegisterComponent {
   registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;
 
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) {
    this.registerForm = this.fb.group({
      name:     ['', [Validators.required, Validators.minLength(2)]],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
 
  get name()     { return this.registerForm.get('name')!; }
  get email()    { return this.registerForm.get('email')!; }
  get password() { return this.registerForm.get('password')!; }
 
  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
 
    this.loading = true;
    this.errorMessage = '';
    const payload={
      name:this.name.value,
      email:this.email.value,
      password:this.password.value
    }
    this.http.post('http://localhost:8088/api/auth/register', payload, { responseType: 'text' })
      .subscribe({
        next: () => {
          this.loading = false;
          this.toastService.success('Registration successful. Check your email for the OTP.');
          // Navigate to OTP page with email
          console.log(this.email.value);
          this.router.navigate(['/verify-otp'], {
            queryParams: { email: this.email.value }
          });
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = this.getErrorMessage(err, 'Registration failed! Please try again.');
          this.toastService.error(this.errorMessage);
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
