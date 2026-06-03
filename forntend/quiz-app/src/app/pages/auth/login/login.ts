import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/service/auth-service';
import { ToastService } from '../../../shared/components/toast/toast';



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
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
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
    const payload={
      email:this.email.value,
      password:this.password.value
    }
 
    this.http.post<any>('http://localhost:8088/api/auth/login', payload)
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.authService.setAuthTokens(res.token, res.refreshToken);
          localStorage.setItem('userEmail', res.email);
          localStorage.setItem('userName', res.name);
          if (res.role) {
            localStorage.setItem('userRole', res.role);
          }
          this.toastService.success(`Welcome back, ${res.name || 'learner'}!`);
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
          this.handleError(err, 'Login failed! Please try again.');
        }
      });
  }

  private handleError(err: any, fallback: string): void {
    if (!err) {
      this.errorMessage = fallback;
      this.toastService.error(this.errorMessage);
      return;
    }

    if (err.error instanceof Blob) {
      err.error.text().then((text: string) => {
        this.errorMessage = this.parseErrorText(text, fallback);
        this.toastService.error(this.errorMessage);
      }).catch(() => {
        this.errorMessage = fallback;
        this.toastService.error(this.errorMessage);
      });
      return;
    }

    if (typeof err.error === 'string') {
      this.errorMessage = this.parseErrorText(err.error, fallback);
      this.toastService.error(this.errorMessage);
      return;
    }

    this.errorMessage = err.error?.message || err.message || fallback;
    this.toastService.error(this.errorMessage);
  }

  private parseErrorText(text: string, fallback: string): string {
    if (!text) {
      return fallback;
    }

    try {
      const parsed = JSON.parse(text);
      return parsed?.message || fallback;
    } catch {
      return text || fallback;
    }
  }
   
}
