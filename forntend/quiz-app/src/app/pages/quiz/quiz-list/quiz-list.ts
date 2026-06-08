import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { API_BASE } from '../../../config';

@Component({
  selector: 'app-quiz-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz-list.html',
  styleUrl: './quiz-list.css',
})
export class QuizList implements OnInit {
  categories: Array<{ name: string; tone: string }> = [];
  userName = '';

  isLoadingCategory: string | null = null;
  errorMessage: string | null = null;

  private readonly categoriesApiUrl = `${API_BASE}/api/question/get/categories`;
  private readonly quizApiUrl = `${API_BASE}/api/quiz/get-question/by-catagory-and-limit`;
  private readonly questionLimit = 5;
  private readonly tones = [
    'from-indigo-500/20 to-indigo-500/0',
    'from-amber-500/20 to-amber-500/0',
    'from-emerald-500/20 to-emerald-500/0',
    'from-sky-500/20 to-sky-500/0',
    'from-rose-500/20 to-rose-500/0',
    'from-teal-500/20 to-teal-500/0',
  ];

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('userName') || '';
    this.cdr.markForCheck();
    this.loadCategories();
  }

  private loadCategories(): void {
    this.errorMessage = null;

    this.http.get<unknown>(this.categoriesApiUrl).subscribe({
      next: (response) => {
        this.categories = this.normalizeCategories(response);
        this.cdr.markForCheck();
        if (!this.categories.length) {
          this.errorMessage = 'No categories available right now.';
        }
      },
      error: (err) => {
        this.errorMessage = this.getErrorMessage(err, 'Failed to load categories. Please try again.');
        this.cdr.markForCheck();
      }
    });
  }

  categorySlug(category: string): string {
    console.log('Original category:', category);
    return category.trim().toLowerCase().replace(/\s+/g, '-');
  }

  startCategoryQuiz(category: string): void {
    if (this.isLoadingCategory) {
      return;
    }

    this.errorMessage = null;
    this.isLoadingCategory = category;

    const payload = {
      catagory: category,
      limit: this.questionLimit.toString(),
    };

    this.http.post<unknown>(this.quizApiUrl, payload).subscribe({
      next: (response) => {
        const questions = this.normalizeQuestions(response);
        const quizId = this.extractQuizId(response);

        if (!questions.length) {
          this.errorMessage = 'No questions found for this category.';
          return;
        }

        void this.router.navigate(['/quizzes', this.categorySlug(category)], {
          state: {
            category,
            limit: this.questionLimit,
            questions,
            quizId,
          },
        });
      },
      error: () => {
        this.errorMessage = 'Failed to load quiz questions. Please try again.';
        this.isLoadingCategory = null;
      },
      complete: () => {
        this.isLoadingCategory = null;
      },
    });
  }

  private normalizeCategories(response: unknown): Array<{ name: string; tone: string }> {
    const data = (response as { data?: unknown })?.data;
    const categories = (response as { categories?: unknown })?.categories;
    const raw = Array.isArray(data)
      ? data
      : Array.isArray(categories)
        ? categories
        : Array.isArray(response)
          ? response
          : [];

    return raw
      .map((item, index) => {
        const name = String(item ?? '').trim();
        if (!name) {
          return null;
        }

        return {
          name,
          tone: this.tones[index % this.tones.length],
        };
      })
      .filter((item): item is { name: string; tone: string } => item !== null);
  }

  private normalizeQuestions(response: unknown): Array<{ id?: string; text: string; options: string[] }> {
    const raw = (response as { questionServiceDto?: unknown; questions?: unknown; data?: unknown })?.questionServiceDto
      ?? (response as { questions?: unknown })?.questions
      ?? (response as { data?: unknown })?.data
      ?? response;

    if (!Array.isArray(raw)) {
      return [];
    }

    return raw
      .map((item) => {
        const record = item as {
          id?: unknown;
          text?: unknown;
          question?: unknown;
          questionText?: unknown;
          options?: unknown;
          choices?: unknown;
          answers?: unknown;
          optionA?: unknown;
          optionB?: unknown;
          optionC?: unknown;
          optionD?: unknown;
        } | null;
        const text = record?.text ?? record?.question ?? record?.questionText ?? '';
        const options = record?.options
          ?? record?.choices
          ?? record?.answers
          ?? this.collectLetterOptions(record);

        return {
          id: record?.id !== undefined && record?.id !== null ? String(record.id) : undefined,
          text: String(text),
          options: Array.isArray(options) ? options.map((option) => String(option)) : [],
        };
      })
      .filter((question) => question.text && question.options.length > 0);
  }

  private extractQuizId(response: unknown): string | null {
    const quizId = (response as { quizId?: unknown })?.quizId;

    if (quizId === undefined || quizId === null) {
      return null;
    }

    return String(quizId);
  }

  private collectLetterOptions(record: {
    optionA?: unknown;
    optionB?: unknown;
    optionC?: unknown;
    optionD?: unknown;
  } | null): string[] {
    if (!record) {
      return [];
    }

    return [record.optionA, record.optionB, record.optionC, record.optionD]
      .filter((option): option is unknown => option !== undefined && option !== null)
      .map((option) => String(option))
      .filter((option) => option.trim().length > 0);
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
