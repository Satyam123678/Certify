import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_BASE } from '../../../config';
import { ToastService } from '../../../shared/components/toast/toast';

@Component({
  selector: 'app-quiz-play',
  imports: [CommonModule],
  templateUrl: './quiz-play.html',
  styleUrl: './quiz-play.css',
})
export class QuizPlay implements OnInit, OnDestroy {
  quizTitle = 'Quiz';
  isPrevShow=false;
  categoryName: string | null = null;
  readonly timeLimitSeconds = 300;
  questions: Array<{ id?: string; text: string; options: string[] }> = [
    {
      id: '1',
      text: 'Which keyword is used to define a function in Python?',
      options: ['class', 'def', 'func', 'lambda'],
    },
    {
      id: '2',
      text: 'Which data type is immutable in Python?',
      options: ['List', 'Dictionary', 'Set', 'Tuple'],
    },
    {
      id: '3',
      text: 'What does PEP stand for?',
      options: ['Python Enhancement Proposal', 'Python Easy Program', 'Programming Entry Point', 'Public Execution Plan'],
    },
    {
      id: '4',
      text: 'Which operator checks identity in Python?',
      options: ['==', '===', 'is', 'equals'],
    },
    {
      id: '5',
      text: 'Which keyword is used to handle exceptions?',
      options: ['catch', 'try', 'except', 'handle'],
    },
  ];

  quizId: string | null = null;
  submitError: string | null = null;
  isSubmitting = false;

  private readonly resultApiUrl = `${API_BASE}/api/quiz/get-result`;
  private readonly quizApiUrl = `${API_BASE}/api/quiz/get-question/by-catagory-and-limit`;
  private readonly questionLimit = 5;

  remainingSeconds = this.timeLimitSeconds;
  currentQuestionIndex = 0;
  selectedOptions: Array<string | null> = Array.from({ length: this.questions.length }, () => null);
  isSubmitted = false;

  private timerId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly toastService: ToastService
  ) {}

  ngOnInit(): void {
    const state = this.router.getCurrentNavigation()?.extras.state
      ?? (typeof history !== 'undefined' ? history.state : null);
    const incomingQuestions = this.normalizeQuestions(state?.questions);
    const category = typeof state?.category === 'string' ? state.category : null;
    this.quizId = typeof state?.quizId === 'string' ? state.quizId : null;

    if (incomingQuestions.length) {
      this.categoryName = category ?? null;
      this.quizTitle = this.categoryName ? `${this.categoryName} Quiz` : this.quizTitle;
      this.setQuestions(incomingQuestions);
    } else if (category) {
      this.categoryName = category;
      this.quizTitle = `${category} Quiz`;
      this.loadQuestionsForCategory(category);
    } else {
      const routeCategory = this.route.snapshot.paramMap.get('id');
      if (routeCategory) {
        this.categoryName = this.categoryFromSlug(routeCategory);
        this.quizTitle = `${this.categoryName} Quiz`;
        this.loadQuestionsForCategory(this.categoryName);
      }
    }

    this.startTimer();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  selectOption(option: string): void {
    if (this.isSubmitted) {
      return;
    }
    this.selectedOptions[this.currentQuestionIndex] = option;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex += 1;
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex -= 1;
    }
  }

  submitQuiz(): void {
    if (this.isSubmitted || this.isSubmitting) {
      return;
    }
    this.isSubmitted = true;
    this.isSubmitting = true;
    this.submitError = null;
    this.isPrevShow=true;
    this.clearTimer();

    const payload = this.buildResultPayload();

    this.http.post<unknown>(this.resultApiUrl, payload).subscribe({
      next: (response) => {
        const { score, total } = this.extractResultStats(response, payload.length || this.totalQuestions);

        this.toastService.success('Quiz submitted successfully.');

        void this.router.navigate(['result'], {
          relativeTo: this.route,
          state: {
            score,
            total,
            result: response,
            category: this.categoryName,
          },
        });
      },
      error: () => {
        this.submitError = 'Failed to submit quiz results. Please try again.';
        this.toastService.error(this.submitError);
        this.isSubmitted = false;
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  get totalQuestions(): number {
    return this.questions.length;
  }

  get currentQuestion(): { id?: string; text: string; options: string[] } {
    return this.questions[this.currentQuestionIndex];
  }

  get currentSelection(): string | null {
    return this.selectedOptions[this.currentQuestionIndex] ?? null;
  }

  get allAnswered(): boolean {
    return this.selectedOptions.every((option) => option !== null);
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private startTimer(): void {
    this.timerId = setInterval(() => {
      if (this.remainingSeconds <= 1) {
        this.remainingSeconds = 0;
        this.submitQuiz();
        return;
      }
      this.remainingSeconds -= 1;
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private setQuestions(questions: Array<{ id?: string; text: string; options: string[] }>): void {
    this.questions = questions;
    this.selectedOptions = Array.from({ length: this.questions.length }, () => null);
    this.currentQuestionIndex = 0;
  }

  private normalizeQuestions(value: unknown): Array<{ id?: string; text: string; options: string[] }> {
    const raw = (value as { questionServiceDto?: unknown; questions?: unknown; data?: unknown })?.questionServiceDto
      ?? (value as { questions?: unknown })?.questions
      ?? (value as { data?: unknown })?.data
      ?? value;

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

  private buildResultPayload(): Array<{ id: string; quizId: string; userSelectOption: string; quizTitle: string }> {
    const quizId = this.quizId ?? '';
    const quizTitle = this.quizTitle.toUpperCase();

    return this.questions
      .map((question, index) => {
        const selected = this.selectedOptions[index];
        const letter = selected !== null ? this.optionLetterForIndex(index, question.options) : null;
        const id = question.id ?? String(index + 1);

        return {
          id,
          quizId,
          userSelectOption: letter ?? '',
          quizTitle,
        };
      })
      .filter((entry) => entry.quizId && entry.userSelectOption);
  }

  private optionLetterForIndex(questionIndex: number, options: string[]): string | null {
    const selected = this.selectedOptions[questionIndex];
    if (selected === null) {
      return null;
    }

    const optionIndex = options.findIndex((option) => option === selected);
    if (optionIndex < 0) {
      return null;
    }

    const letters = ['A', 'B', 'C', 'D'];
    return letters[optionIndex] ?? null;
  }

  private extractResultStats(response: unknown, fallbackTotal: number): { score: number; total: number } {
    const record = response as {
      score?: unknown;
      total?: unknown;
      totalQuestions?: unknown;
      correct?: unknown;
      correctCount?: unknown;
      data?: unknown;
    } | null;

    const scoreFromMessage = this.parseScoreMessage(record?.data);
    const score = Number(record?.score ?? record?.correct ?? record?.correctCount ?? scoreFromMessage?.score);
    const total = Number(record?.total ?? record?.totalQuestions ?? scoreFromMessage?.total ?? fallbackTotal);

    return {
      score: Number.isNaN(score) ? 0 : score,
      total: Number.isNaN(total) || total <= 0 ? fallbackTotal : total,
    };
  }

  private parseScoreMessage(value: unknown): { score: number; total: number } | null {
    if (typeof value !== 'string') {
      return null;
    }

    const match = value.match(/(?:Score:\s*)?([\d.]+)\s*\/\s*(\d+)/i);
    if (!match) {
      return null;
    }

    const score = Number(match[1]);
    const total = Number(match[2]);

    if (Number.isNaN(score) || Number.isNaN(total) || total <= 0) {
      return null;
    }

    return { score, total };
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

  private titleFromSlug(slug: string): string {
    const label = slug
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    return `${label} Quiz`;
  }

  private categoryFromSlug(slug: string): string {
    return slug
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private loadQuestionsForCategory(category: string): void {
    const payload = {
      catagory: category,
      limit: this.questionLimit.toString(),
    };

    this.http.post<unknown>(this.quizApiUrl, payload).subscribe({
      next: (response) => {
        const questions = this.normalizeQuestions(response);

        if (questions.length) {
          this.quizId = this.extractQuizId(response);
          this.setQuestions(questions);
        }
      },
      error: () => {
        this.submitError = 'Failed to load quiz questions. Please try again.';
      },
    });
  }

  private extractQuizId(response: unknown): string | null {
    const quizId = (response as { quizId?: unknown })?.quizId;

    if (quizId === undefined || quizId === null) {
      return null;
    }

    return String(quizId);
  }
}
