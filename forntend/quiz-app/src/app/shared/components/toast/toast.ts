import { CommonModule } from '@angular/common';
import { Component, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<ToastItem[]>([]);
  private nextId = 1;

  readonly toasts$ = this.toastsSubject.asObservable();

  show(message: string, variant: ToastVariant = 'info', durationMs = 3500): void {
    const id = this.nextId++;
    const toast: ToastItem = { id, message, variant };
    const current = this.toastsSubject.getValue();
    this.toastsSubject.next([...current, toast]);

    setTimeout(() => this.dismiss(id), durationMs);
  }

  success(message: string, durationMs?: number): void {
    this.show(message, 'success', durationMs);
  }

  error(message: string, durationMs?: number): void {
    this.show(message, 'error', durationMs);
  }

  dismiss(id: number): void {
    const current = this.toastsSubject.getValue();
    this.toastsSubject.next(current.filter((toast) => toast.id !== id));
  }
}

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class ToastContainer {
  constructor(public readonly toastService: ToastService) {}

  trackById(index: number, toast: ToastItem): number {
    return toast.id;
  }
}
