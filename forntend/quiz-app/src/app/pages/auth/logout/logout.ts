import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/service/auth-service';
import { API_BASE } from '../../../config';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './logout.html',
  styleUrl: './logout.css',
})
export class Logout implements OnInit {
  constructor(
    private readonly authService: AuthService,
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const refreshToken = this.authService.getRefreshToken();

    if (!refreshToken) {
      this.authService.clearAuthData();
      this.router.navigate(['/login']);
      return;
    }

    const url = `${API_BASE}/api/auth/logout?refreshToken=${encodeURIComponent(refreshToken)}`;

    this.http.post(url, {}, { responseType: 'text' }).subscribe({
      next: () => {
        this.authService.clearAuthData();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.authService.clearAuthData();
        this.router.navigate(['/login']);
      }
    });
  }
}
