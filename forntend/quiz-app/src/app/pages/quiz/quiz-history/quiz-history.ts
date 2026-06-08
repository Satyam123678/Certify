import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { API_BASE } from '../../../config';

interface QuizHistoryItem {
  quizTitle: string;
  totalQuestion: string;
  score: string;
  status: string;
}

@Component({
  selector: 'app-quiz-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz-history.html',
  styleUrl: './quiz-history.css',
})
export class QuizHistory implements OnInit {
  history: QuizHistoryItem[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';
  currentPage = 1;
  pageSize = 6;

  private readonly historyApiUrl = `${API_BASE}/api/quiz/get/user-history`;

  constructor(
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<unknown>(this.historyApiUrl).subscribe({
      next: (response) => {
        this.history = this.normalizeHistory(response);
        this.loading = false;
        this.currentPage = 1;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = this.getErrorMessage(err, 'Failed to load history. Please try again.');
        this.cdr.markForCheck();
      }
    });
  }

  getPercentage(item: QuizHistoryItem): string {
    const score = Number.parseInt(item.score, 10);
    const total = Number.parseInt(item.totalQuestion, 10);
    if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) {
      return '0%';
    }
    const percent = Math.round((score / total) * 100);
    return `${percent}%`;
  }

  setSearchTerm(value: string): void {
    this.searchTerm = value;
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
      this.cdr.markForCheck();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
      this.cdr.markForCheck();
    }
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredHistory.length / this.pageSize));
  }

  get pagedHistory(): QuizHistoryItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredHistory.slice(start, start + this.pageSize);
  }

  private get filteredHistory(): QuizHistoryItem[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.history;
    }

    return this.history.filter((item) => item.quizTitle.toLowerCase().includes(term));
  }

  getStatusClass(status: string): string {
    const normalized = status.trim().toUpperCase();
    if (normalized === 'PASS' || normalized === 'PASSED') {
      return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30';
    }
    if (normalized === 'FAIL' || normalized === 'FAILED') {
      return 'bg-rose-500/10 text-rose-300 border border-rose-500/30';
    }
    return 'bg-amber-500/10 text-amber-300 border border-amber-500/30';
  }

  private normalizeHistory(response: unknown): QuizHistoryItem[] {
    const data = (response as { data?: unknown })?.data;
    const raw = Array.isArray(data)
      ? data
      : Array.isArray(response)
        ? response
        : [];

    return raw
      .map((item) => {
        const record = item as Partial<QuizHistoryItem> | null;
        const quizTitle = String(record?.quizTitle ?? '').trim();
        const totalQuestion = String(record?.totalQuestion ?? '').trim();
        const score = String(record?.score ?? '').trim();
        const status = String(record?.status ?? '').trim();

        if (!quizTitle) {
          return null;
        }

        return {
          quizTitle,
          totalQuestion: totalQuestion || '0',
          score: score || '0',
          status: status || 'UNKNOWN',
        };
      })
      .filter((item): item is QuizHistoryItem => item !== null);
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
