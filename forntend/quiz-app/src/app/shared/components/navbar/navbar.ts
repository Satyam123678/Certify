import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/service/auth-service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  readonly isLoggedIn = signal(false);
  readonly isAdmin = signal(false);
  readonly userName = signal('');

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.syncAuthState();

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.syncAuthState());
  }

  private syncAuthState(): void {
    const loggedIn = this.authService.isLoggedIn();
    const role = this.authService.getUserRole();

    this.isLoggedIn.set(loggedIn);
    this.isAdmin.set(loggedIn && role === 'ADMIN');
    this.userName.set(this.authService.getUserName() ?? '');
  }
}
