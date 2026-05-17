import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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
    private router: Router
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
 
    this.http.post('http://localhost:8088/api/auth/register', this.registerForm.value)
      .subscribe({
        next: () => {
          this.loading = false;
          // Navigate to OTP page with email
          this.router.navigate(['/verify-otp'], {
            queryParams: { email: this.email.value }
          });
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Registration failed! Please try again.';
        }
      });
  }
}
