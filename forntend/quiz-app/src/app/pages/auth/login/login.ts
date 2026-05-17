import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';



@Component({
  selector: 'app-login',
   standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

   loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;
 
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
 
  get email()    { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }
 
  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
 
    this.loading = true;
    this.errorMessage = '';
 
    this.http.post<any>('http://localhost:8088/api/auth/login', this.loginForm.value)
      .subscribe({
        next: (res) => {
          this.loading = false;
          // Save tokens in localStorage
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
          localStorage.setItem('userEmail', res.email);
          localStorage.setItem('userName', res.name);
          // Navigate to dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Login failed! Please try again.';
        }
      });
  }
   
}
