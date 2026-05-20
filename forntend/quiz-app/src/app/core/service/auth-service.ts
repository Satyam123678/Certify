import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authCookieName = 'auth_token';
  private readonly refreshCookieName = 'refresh_token';

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    // Presence check only; adjust if you need to validate token content.
    return this.getCookie(this.authCookieName) !== null;
  }

  getAuthToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return this.getCookie(this.authCookieName);
  }

  setAuthTokens(token: string, refreshToken: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.setCookie(this.authCookieName, token);
    this.setCookie(this.refreshCookieName, refreshToken);
  }

  getUserRole(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return localStorage.getItem('userRole');
  }

  getUserName(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return localStorage.getItem('userName');
  }

  clearAuthData(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.deleteCookie(this.authCookieName);
    this.deleteCookie(this.refreshCookieName);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
  }

  private getCookie(name: string): string | null {
    const cookies = this.document.cookie ? this.document.cookie.split('; ') : [];

    for (const cookie of cookies) {
      const [cookieName, ...cookieValueParts] = cookie.split('=');
      if (cookieName === name) {
        return decodeURIComponent(cookieValueParts.join('='));
      }
    }

    return null;
  }

  private setCookie(name: string, value: string): void {
    const encodedValue = encodeURIComponent(value);
    const isSecure = this.document.location?.protocol === 'https:';
    const securePart = isSecure ? '; Secure' : '';

    this.document.cookie = `${name}=${encodedValue}; Path=/; SameSite=Lax${securePart}`;
  }

  private deleteCookie(name: string): void {
    const isSecure = this.document.location?.protocol === 'https:';
    const securePart = isSecure ? '; Secure' : '';

    this.document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${securePart}`;
  }
}
