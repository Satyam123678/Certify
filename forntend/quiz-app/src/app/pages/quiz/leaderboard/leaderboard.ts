import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { API_BASE } from '../../../config';
import { ToastService } from '../../../shared/components/toast/toast';

type QuestionItem = {
  id: string | null;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAns: string;
  difficulty: string;
  category: string;
};

@Component({
  selector: 'app-leaderboard',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css',
})
export class Leaderboard implements OnInit {
  categoryLabel = 'All categories';
  categoryName = '';
  showQuestionDialog = false;
  submittingQuestions = false;
  loadingQuestions = false;
  savingCorrectAnswer = false;
  editingAnswerQuestionId: string | null = null;
  questions: QuestionItem[] = [];
  readonly questionDialogForm: FormGroup;
  readonly answerEditForm: FormGroup;
  private readonly questionFetchApiUrl = `${API_BASE}/api/question/fetch/all`;
  private readonly createQuestionApiUrl = `${API_BASE}/api/question/create-new-question`;

  readonly topScorers = [
    { name: 'Satyam Sinha', score: 98, rank: 1 },
    { name: 'Aarav Singh', score: 94, rank: 2 },
    { name: 'Meera Joshi', score: 91, rank: 3 },
    { name: 'Rohan Patel', score: 88, rank: 4 },
    { name: 'Isha Verma', score: 85, rank: 5 },
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly http: HttpClient,
    private readonly fb: FormBuilder,
    private readonly toastService: ToastService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.questionDialogForm = this.fb.group({
      questions: this.fb.array([this.createQuestionGroup()]),
    });
    this.answerEditForm = this.fb.group({
      correctAns: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    const category = this.route.snapshot.paramMap.get('category');
    if (category) {
      this.categoryName = category.replace(/-/g, ' ');
      this.categoryLabel = this.categoryName.toUpperCase();
      this.questionRows.controls.forEach((group) => group.patchValue({ category: this.categoryName }));
    }
  }

  get questionRows(): FormArray<FormGroup> {
    return this.questionDialogForm.get('questions') as FormArray<FormGroup>;
  }

  get maxScore(): number {
    return Math.max(...this.topScorers.map((scorer) => scorer.score));
  }

  scorePercent(score: number): number {
    return Math.round((score / this.maxScore) * 100);
  }

  openQuestionDialog(): void {
    this.showQuestionDialog = true;

    if (!this.questionRows.length) {
      this.addQuestionRow();
    }

    this.loadQuestionsForCurrentCategory();
  }

  closeQuestionDialog(): void {
    if (this.submittingQuestions) {
      return;
    }

    this.showQuestionDialog = false;
  }

  addQuestionRow(): void {
    this.questionRows.push(this.createQuestionGroup());
  }

  removeQuestionRow(index: number): void {
    if (this.questionRows.length === 1) {
      this.questionRows.at(0).reset({ category: this.getDefaultCategory() });
      return;
    }

    this.questionRows.removeAt(index);
  }

  submitQuestions(): void {
    if (this.questionDialogForm.invalid || this.submittingQuestions) {
      this.questionDialogForm.markAllAsTouched();
      return;
    }

    const payloads = this.questionRows.controls.map((group) => ({
      question: String(group.value.question ?? '').trim(),
      optionA: String(group.value.optionA ?? '').trim(),
      optionB: String(group.value.optionB ?? '').trim(),
      optionC: String(group.value.optionC ?? '').trim(),
      optionD: String(group.value.optionD ?? '').trim(),
      correctAns: String(group.value.correctAns ?? '').trim(),
      difficulty: String(group.value.difficulty ?? '').trim(),
      category: String(group.value.category ?? '').trim(),
    }));

    this.submittingQuestions = true;

    this.http.post<any>(this.createQuestionApiUrl, payloads).subscribe({
      next: (response) => {
        if (!this.isSuccessResponse(response)) {
          this.toastService.error('Some questions were not added. Please check and try again.');
          this.cdr.markForCheck();
          return;
        }

        this.toastService.success(`${payloads.length} question${payloads.length > 1 ? 's' : ''} successfully added.`);
        this.resetQuestionDialog();
        this.loadQuestionsForCurrentCategory();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastService.error(this.getErrorMessage(err, 'Failed to add questions. Please try again.'));
        this.cdr.markForCheck();
      },
      complete: () => {
        this.submittingQuestions = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadQuestionsForCurrentCategory(): void {
    const category = this.getDefaultCategory().trim();

    if (!category) {
      return;
    }

    this.loadingQuestions = true;

    this.http.get<unknown>(`${this.questionFetchApiUrl}/${encodeURIComponent(category)}`).subscribe({
      next: (response) => {
        this.questions = this.normalizeQuestionLibrary(response);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastService.error(this.getErrorMessage(err, 'Failed to load questions.'));
        this.cdr.markForCheck();
      },
      complete: () => {
        this.loadingQuestions = false;
        this.cdr.markForCheck();
      },
    });
  }

  startCorrectAnswerEdit(question: QuestionItem): void {
    if (!question.id) {
      this.toastService.error('This question cannot be edited because it has no id.');
      return;
    }

    this.editingAnswerQuestionId = question.id;
    this.answerEditForm.reset({ correctAns: question.correctAns });
  }

  cancelCorrectAnswerEdit(): void {
    this.editingAnswerQuestionId = null;
    this.answerEditForm.reset();
  }

  saveCorrectAnswer(question: QuestionItem): void {
    if (!question.id || this.answerEditForm.invalid || this.savingCorrectAnswer) {
      this.answerEditForm.markAllAsTouched();
      return;
    }

    const correctAns = String(this.answerEditForm.value.correctAns ?? '').trim();
    const updatedQuestion: QuestionItem = { ...question, correctAns };

    this.savingCorrectAnswer = true;

    this.http.post<any>(this.createQuestionApiUrl, [updatedQuestion]).subscribe({
      next: (response) => {
        this.questions = this.questions.map((item) => item.id === question.id ? updatedQuestion : item);
        this.editingAnswerQuestionId = null;
        this.answerEditForm.reset();

        if (this.isSuccessResponse(response)) {
          this.toastService.success('Correct answer updated.');
          return;
        }

        this.toastService.success('Correct answer updated in the page.');
      },
      error: (err) => {
        this.toastService.error(this.getErrorMessage(err, 'Failed to update correct answer.'));
        this.cdr.markForCheck();
      },
      complete: () => {
        this.savingCorrectAnswer = false;
        this.cdr.markForCheck();
      },
    });
  }

  private createQuestionGroup(): FormGroup {
    return this.fb.group({
      question: ['', [Validators.required]],
      optionA: ['', [Validators.required]],
      optionB: ['', [Validators.required]],
      optionC: ['', [Validators.required]],
      optionD: ['', [Validators.required]],
      correctAns: ['', [Validators.required]],
      difficulty: ['', [Validators.required]],
      category: [this.getDefaultCategory(), [Validators.required]],
    });
  }

  private resetQuestionDialog(): void {
    this.questionRows.clear();
    this.addQuestionRow();
  }

  private getDefaultCategory(): string {
    return this.categoryName;
  }

  private normalizeQuestionLibrary(response: unknown): QuestionItem[] {
    const data = (response as { data?: unknown })?.data;
    const questions = (response as { questions?: unknown })?.questions;
    const questionServiceDto = (response as { questionServiceDto?: unknown })?.questionServiceDto;
    const raw = Array.isArray(data)
      ? data
      : Array.isArray(questions)
        ? questions
        : Array.isArray(questionServiceDto)
          ? questionServiceDto
          : Array.isArray(response)
            ? response
            : [];

    return raw
      .map((item) => {
        const record = item as {
          id?: unknown;
          question?: unknown;
          questionText?: unknown;
          text?: unknown;
          optionA?: unknown;
          optionB?: unknown;
          optionC?: unknown;
          optionD?: unknown;
          correctAns?: unknown;
          correctAnswer?: unknown;
          difficulty?: unknown;
          category?: unknown;
        } | null;

        if (!record) {
          return null;
        }

        const question = String(record.question ?? record.questionText ?? record.text ?? '').trim();

        if (!question) {
          return null;
        }

        return {
          id: record.id !== undefined && record.id !== null ? String(record.id) : null,
          question,
          optionA: String(record.optionA ?? '').trim(),
          optionB: String(record.optionB ?? '').trim(),
          optionC: String(record.optionC ?? '').trim(),
          optionD: String(record.optionD ?? '').trim(),
          correctAns: String(record.correctAns ?? record.correctAnswer ?? '').trim(),
          difficulty: String(record.difficulty ?? '').trim(),
          category: String(record.category ?? this.getDefaultCategory()).trim(),
        };
      })
      .filter((item): item is QuestionItem => item !== null);
  }

  private isSuccessResponse(response: any): boolean {
    const status = String(response?.status ?? '').trim().toLowerCase();
    const message = String(response?.message ?? '').trim().toLowerCase();
    const statusCode = Number(response?.statusCode);
    const raw = String(response ?? '').trim().toLowerCase();

    return status === 's'
      || statusCode === 200
      || statusCode === 201
      || raw === 's'
      || message === 'processed successfully';
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
