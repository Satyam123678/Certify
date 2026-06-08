import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { API_BASE } from '../../../config';
import { ToastService } from '../../../shared/components/toast/toast';

@Component({
  selector: 'app-dashboard-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css',
})
export class DashboardComponent implements OnInit {
  readonly user = {
    name: 'Satyam Sharma',
    role: 'Quiz Creator',
    level: 'Level 8',
    plan: 'Pro Plan',
    streak: 14,
    avatar: 'SS',
  };

  private readonly categoriesApiUrl = `${API_BASE}/api/question/get/categories`;
  private readonly questionFetchApiUrl = `${API_BASE}/api/question/fetch/all`;
  private readonly createQuestionApiUrl = `${API_BASE}/api/question/create-new-question`;
  private readonly updateQuestionApiUrl = `${API_BASE}/api/question/update-question`;
  private readonly tones = [
    'from-indigo-500/20 to-indigo-500/0',
    'from-amber-500/20 to-amber-500/0',
    'from-emerald-500/20 to-emerald-500/0',
    'from-sky-500/20 to-sky-500/0',
    'from-rose-500/20 to-rose-500/0',
    'from-teal-500/20 to-teal-500/0',
  ];

  categories: Array<{ name: string; quizzes: number | null; questions: number | null; tone: string }> = [];
  private readonly manualCategories: Array<{ name: string; quizzes: number | null; questions: number | null; tone: string }> = [];
  questions: Array<{
    id: string | null;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAns: string;
    difficulty: string;
    category: string;
  }> = [];

  readonly questionForm: FormGroup;
  readonly questionBatchForm: FormGroup;
  readonly categoryForm: FormGroup;
  readonly answerEditForm: FormGroup;

  showQuestionForm = false;
  showCategoryForm = false;
  showQuestionLibrary = false;
  submittingQuestion = false;
  submittingCategory = false;
  savingCorrectAnswer = false;
  loadingQuestions = false;
  selectedCategory = '';
  editingQuestionId: string | null = null;
  editingAnswerQuestionId: string | null = null;
  questionSearchTerm = '';
  currentQuestionPage = 1;
  readonly questionPageSize = 5;

  errorMessage: string | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly toastService: ToastService
  ) {
    this.questionForm = this.fb.group({
      question: ['', [Validators.required]],
      optionA: ['', [Validators.required]],
      optionB: ['', [Validators.required]],
      optionC: ['', [Validators.required]],
      optionD: ['', [Validators.required]],
      correctAns: ['', [Validators.required]],
      difficulty: ['', [Validators.required]],
      category: ['', [Validators.required]],
    });

    this.questionBatchForm = this.fb.group({
      questions: this.fb.array([this.createQuestionGroup()]),
    });

    this.categoryForm = this.fb.group({
      name: ['', [Validators.required]],
      questions: this.fb.array([this.createQuestionGroup('', false)]),
    });

    this.answerEditForm = this.fb.group({
      correctAns: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.user.name = localStorage.getItem('userName') || 'Admin';
  }

  get statsCards() {
    return [
      { label: 'Active Categories', value: String(this.categories.length || 0), delta: this.categorySummary },
      { label: 'Total Quizzes', value: '24', delta: '+4 this month' },
      { label: 'Questions Added', value: '186', delta: '+18 this week' },
      { label: 'Completion Rate', value: '76%', delta: '+6% uplift' },
    ];
  }

  get categorySummary(): string {
    if (!this.categories.length) {
      return 'Waiting for categories from backend';
    }

    return this.categories.map((category) => category.name).join(', ');
  }

  get filteredQuestions(): Array<{
    id: string | null;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAns: string;
    difficulty: string;
    category: string;
  }> {
    const term = this.questionSearchTerm.trim().toLowerCase();

    if (!term) {
      return this.questions;
    }

    return this.questions.filter((question) => {
      const haystack = [
        question.question,
        question.correctAns,
        question.difficulty,
        question.category,
        question.optionA,
        question.optionB,
        question.optionC,
        question.optionD,
      ].join(' ').toLowerCase();

      return haystack.includes(term);
    });
  }

  get totalQuestionPages(): number {
    return Math.max(1, Math.ceil(this.filteredQuestions.length / this.questionPageSize));
  }

  get paginatedQuestions(): Array<{
    id: string | null;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAns: string;
    difficulty: string;
    category: string;
  }> {
    const startIndex = (this.currentQuestionPage - 1) * this.questionPageSize;

    return this.filteredQuestions.slice(startIndex, startIndex + this.questionPageSize);
  }

  get questionStartIndex(): number {
    if (!this.filteredQuestions.length) {
      return 0;
    }

    return (this.currentQuestionPage - 1) * this.questionPageSize + 1;
  }

  get questionEndIndex(): number {
    return Math.min(this.currentQuestionPage * this.questionPageSize, this.filteredQuestions.length);
  }

  get questionPageNumbers(): number[] {
    return Array.from({ length: this.totalQuestionPages }, (_, index) => index + 1);
  }

  get categoryQuestionRows(): FormArray<FormGroup> {
    return this.categoryForm.get('questions') as FormArray<FormGroup>;
  }

  get questionRows(): FormArray<FormGroup> {
    return this.questionBatchForm.get('questions') as FormArray<FormGroup>;
  }

  openQuestionForm(categoryName?: string): void {
    this.showQuestionForm = true;
    this.editingQuestionId = null;

    if (categoryName) {
      this.selectedCategory = categoryName;
      this.questionRows.controls.forEach((group) => group.patchValue({ category: categoryName }));
    }
  }

  openCategoryForm(): void {
    this.showCategoryForm = true;
  }

  closeCategoryForm(): void {
    this.showCategoryForm = false;
  }

  addCategoryQuestionRow(): void {
    this.categoryQuestionRows.push(this.createQuestionGroup('', false));
  }

  removeCategoryQuestionRow(index: number): void {
    if (this.categoryQuestionRows.length === 1) {
      this.categoryQuestionRows.at(0).reset();
      return;
    }

    this.categoryQuestionRows.removeAt(index);
  }

  addQuestionRow(): void {
    this.questionRows.push(this.createQuestionGroup(this.selectedCategory));
  }

  removeQuestionRow(index: number): void {
    if (this.questionRows.length === 1) {
      this.questionRows.at(0).reset({ category: this.selectedCategory });
      return;
    }

    this.questionRows.removeAt(index);
  }

  openQuestionEdit(question: {
    id: string | null;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAns: string;
    difficulty: string;
    category: string;
  }): void {
    this.editingQuestionId = question.id;
    this.selectedCategory = question.category;
    this.showQuestionForm = true;
    this.showQuestionLibrary = true;
    this.questionForm.patchValue({
      question: question.question,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctAns: question.correctAns,
      difficulty: question.difficulty,
      category: question.category,
    });
  }

  closeQuestionForm(): void {
    this.showQuestionForm = false;
    this.editingQuestionId = null;
  }

  startCorrectAnswerEdit(question: {
    id: string | null;
    correctAns: string;
  }): void {
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

  saveCorrectAnswer(question: {
    id: string | null;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAns: string;
    difficulty: string;
    category: string;
  }): void {
    if (!question.id || this.answerEditForm.invalid || this.savingCorrectAnswer) {
      this.answerEditForm.markAllAsTouched();
      return;
    }

    const updatedQuestion = {
      ...question,
      correctAns: String(this.answerEditForm.value.correctAns ?? '').trim(),
    };

    this.savingCorrectAnswer = true;

    this.http.post<any>(this.createQuestionApiUrl, [updatedQuestion]).subscribe({
      next: (response) => {
        this.applyLocalQuestionUpdate(updatedQuestion);
        this.editingAnswerQuestionId = null;
        this.answerEditForm.reset();

        if (this.isSuccessResponse(response)) {
          this.toastService.success('Correct answer updated.');
          return;
        }

        this.toastService.success('Correct answer updated in the admin panel view.');
      },
      error: (err) => {
        this.toastService.error(this.getErrorMessage(err, 'Failed to update correct answer.'));
      },
      complete: () => {
        this.savingCorrectAnswer = false;
        this.cdr.markForCheck();
      },
    });
  }

  submitCategory(): void {
    if (this.categoryForm.invalid || this.submittingCategory) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const name = String(this.categoryForm.value.name ?? '').trim();

    if (!name) {
      return;
    }

    const exists = this.categories.some((category) => category.name.toLowerCase() === name.toLowerCase());

    if (exists) {
      this.toastService.error('That category already exists.');
      return;
    }

    this.submittingCategory = true;

    const payloads = this.categoryQuestionRows.controls.map((group) => this.buildQuestionPayload(group, name));

    this.http.post<any>(this.createQuestionApiUrl, payloads).subscribe({
      next: (response) => {
        if (!this.isSuccessResponse(response)) {
          this.toastService.error('Category was not saved because the questions were not added.');
          return;
        }

        const tone = this.tones[this.categories.length % this.tones.length];
        this.manualCategories.push({ name, quizzes: 0, questions: payloads.length, tone });
        this.categories = [...this.categories, { name, quizzes: 0, questions: payloads.length, tone }];
        this.resetCategoryForm();
        this.showCategoryForm = false;
        this.selectedCategory = name;
        this.toastService.success(`Category added with ${payloads.length} question${payloads.length > 1 ? 's' : ''}.`);
      },
      error: (err) => {
        this.toastService.error(this.getErrorMessage(err, 'Category was not saved because the questions failed.'));
      },
      complete: () => {
        this.submittingCategory = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadQuestionsForCategory(categoryName: string): void {
    const category = categoryName.trim();

    if (!category) {
      return;
    }

    this.selectedCategory = category;
    this.showQuestionLibrary = true;
    this.loadingQuestions = true;
    this.errorMessage = null;
    this.questionSearchTerm = '';
    this.currentQuestionPage = 1;

    this.http.get<unknown>(`${this.questionFetchApiUrl}/${encodeURIComponent(category)}`).subscribe({
      next: (response) => {
        this.questions = this.normalizeQuestionLibrary(response);
        if (!this.questions.length) {
          this.errorMessage = 'No questions found for this category.';
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = this.getErrorMessage(err, 'Failed to load questions for this category.');
        this.cdr.markForCheck();
      },
      complete: () => {
        this.loadingQuestions = false;
        this.cdr.markForCheck();
      },
    });
  }

  promptCategoryGuidance(): void {
    this.showCategoryForm = true;
    this.toastService.show('Add minimum 10 questions for this category to appear in the quiz list.', 'info');
  }

  setQuestionSearchTerm(value: string): void {
    this.questionSearchTerm = value;
    this.currentQuestionPage = 1;
  }

  previousQuestionPage(): void {
    if (this.currentQuestionPage > 1) {
      this.currentQuestionPage -= 1;
    }
  }

  nextQuestionPage(): void {
    if (this.currentQuestionPage < this.totalQuestionPages) {
      this.currentQuestionPage += 1;
    }
  }

  goToQuestionPage(page: number): void {
    if (page >= 1 && page <= this.totalQuestionPages) {
      this.currentQuestionPage = page;
    }
  }

  submitQuestion(): void {
    const activeForm = this.editingQuestionId ? this.questionForm : this.questionBatchForm;

    if (activeForm.invalid || this.submittingQuestion) {
      activeForm.markAllAsTouched();
      return;
    }

    const payload = this.buildQuestionPayload(this.questionForm);

    this.submittingQuestion = true;

    if (this.editingQuestionId) {
      const editedQuestion = {
        id: this.editingQuestionId,
        question: payload.question ?? '',
        optionA: payload.optionA ?? '',
        optionB: payload.optionB ?? '',
        optionC: payload.optionC ?? '',
        optionD: payload.optionD ?? '',
        correctAns: payload.correctAns ?? '',
        difficulty: payload.difficulty ?? '',
        category: payload.category ?? '',
      };

      this.http.put<any>(this.updateQuestionApiUrl, {
        ...payload,
        id: this.editingQuestionId,
      }).subscribe({
        next: (response) => {
          if (this.isSuccessResponse(response)) {
            this.applyLocalQuestionUpdate(editedQuestion, true);
            this.toastService.success('Question successfully updated.');
            return;
          }

          this.applyLocalQuestionUpdate(editedQuestion);
          this.toastService.success('Question updated in the admin panel view.');
        },
        error: () => {
          this.applyLocalQuestionUpdate(editedQuestion);
          this.toastService.success('Question updated in the admin panel view. Backend save endpoint is not responding.');
        },
        complete: () => {
          this.questionForm.reset();
          this.showQuestionForm = false;
          this.editingQuestionId = null;
          this.submittingQuestion = false;
          this.cdr.markForCheck();
        },
      });

      return;
    }

    const payloads = this.questionRows.controls.map((group) => this.buildQuestionPayload(group));

    this.http.post<any>(this.createQuestionApiUrl, payloads).subscribe({
      next: (response) => {
        if (this.isSuccessResponse(response)) {
          this.toastService.success(`${payloads.length} question${payloads.length > 1 ? 's' : ''} successfully added.`);
          this.resetQuestionBatchForm();
          this.showQuestionForm = false;
          this.selectedCategory = payloads[0]?.category ?? this.selectedCategory;
          this.loadCategories();
          if (this.selectedCategory) {
            this.loadQuestionsForCategory(this.selectedCategory);
          }
          return;
        }

        this.toastService.error('Question was not added. Please try again.');
      },
      error: (err) => {
        this.toastService.error(this.getErrorMessage(err, 'Failed to add question. Please try again.'));
      },
      complete: () => {
        this.submittingQuestion = false;
        this.cdr.markForCheck();
      },
    });
  }

  readonly recentQuizzes = [
    {
      title: 'Python Basics',
      category: 'Python',
      score: '88%',
      time: '20m',
      status: 'Published',
    },
    {
      title: 'Java Collections',
      category: 'Java',
      score: '82%',
      time: '24m',
      status: 'Draft',
    },
    {
      title: 'SQL Joins Mastery',
      category: 'SQL',
      score: '85%',
      time: '16m',
      status: 'Published',
    },
    {
      title: 'Python OOP',
      category: 'Python',
      score: '79%',
      time: '18m',
      status: 'Draft',
    },
  ];

  readonly categoryMastery = [
    { label: 'Python', value: 72 },
    { label: 'Java', value: 64 },
    { label: 'SQL', value: 69 },
  ];

  readonly goals = [
    { label: 'Add 10 Python questions', progress: '6 / 10 complete' },
    { label: 'Publish Java fundamentals quiz', progress: 'Draft ready' },
    { label: 'Create SQL advanced category', progress: 'Outline started' },
  ];

  private loadCategories(): void {
    this.errorMessage = null;

    this.http.get<unknown>(this.categoriesApiUrl).subscribe({
      next: (response) => {
        const backendCategories = this.normalizeCategories(response);
        this.categories = this.mergeCategories(backendCategories, this.manualCategories);

        if (!this.categories.length) {
          this.errorMessage = 'No categories available right now.';
        }

        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = this.getErrorMessage(err, 'Failed to load categories. Please try again.');
        this.cdr.markForCheck();
      },
    });
  }

  private applyLocalQuestionUpdate(
    updatedQuestion: {
    id: string | null;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAns: string;
    difficulty: string;
    category: string;
  },
    refreshFromBackend = false
  ): void {
    this.questions = this.questions.map((question) => question.id === updatedQuestion.id ? updatedQuestion : question);
    this.selectedCategory = updatedQuestion.category || this.selectedCategory;

    if (refreshFromBackend) {
      this.loadQuestionsForCategory(this.selectedCategory);
      return;
    }

    this.currentQuestionPage = 1;
    this.cdr.markForCheck();
  }

  private mergeCategories(
    backendCategories: Array<{ name: string; quizzes: number | null; questions: number | null; tone: string }>,
    manualCategories: Array<{ name: string; quizzes: number | null; questions: number | null; tone: string }>
  ): Array<{ name: string; quizzes: number | null; questions: number | null; tone: string }> {
    const merged = [...backendCategories];

    for (const category of manualCategories) {
      if (!merged.some((item) => item.name.toLowerCase() === category.name.toLowerCase())) {
        merged.push(category);
      }
    }

    return merged;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Published':
        return 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300';
      case 'Draft':
        return 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300';
      case 'Archived':
        return 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-700 text-gray-300';
      default:
        return 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-400';
    }
  }

  private createQuestionGroup(category = '', includeCategory = true): FormGroup {
    return this.fb.group({
      question: ['', [Validators.required]],
      optionA: ['', [Validators.required]],
      optionB: ['', [Validators.required]],
      optionC: ['', [Validators.required]],
      optionD: ['', [Validators.required]],
      correctAns: ['', [Validators.required]],
      difficulty: ['', [Validators.required]],
      category: [category, includeCategory ? [Validators.required] : []],
    });
  }

  private buildQuestionPayload(group: FormGroup, categoryOverride?: string): {
    id: null;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAns: string;
    difficulty: string;
    category: string;
  } {
    return {
      id: null,
      question: String(group.value.question ?? '').trim(),
      optionA: String(group.value.optionA ?? '').trim(),
      optionB: String(group.value.optionB ?? '').trim(),
      optionC: String(group.value.optionC ?? '').trim(),
      optionD: String(group.value.optionD ?? '').trim(),
      correctAns: String(group.value.correctAns ?? '').trim(),
      difficulty: String(group.value.difficulty ?? '').trim(),
      category: String(categoryOverride ?? group.value.category ?? '').trim(),
    };
  }

  private resetCategoryForm(): void {
    this.categoryQuestionRows.clear();
    this.categoryQuestionRows.push(this.createQuestionGroup('', false));
    this.categoryForm.reset();
  }

  private resetQuestionBatchForm(): void {
    this.questionRows.clear();
    this.questionRows.push(this.createQuestionGroup());
    this.questionBatchForm.reset();
  }

  private normalizeCategories(response: unknown): Array<{ name: string; quizzes: number | null; questions: number | null; tone: string }> {
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
        const record = item as {
          name?: unknown;
          category?: unknown;
          label?: unknown;
          quizzes?: unknown;
          quizCount?: unknown;
          questions?: unknown;
          questionCount?: unknown;
        } | string | null;

        const name = this.extractCategoryName(record);

        if (!name) {
          return null;
        }

        return {
          name,
          quizzes: this.toNumber(this.getCategoryField(record, 'quizzes', 'quizCount')),
          questions: this.toNumber(this.getCategoryField(record, 'questions', 'questionCount')),
          tone: this.tones[index % this.tones.length],
        };
      })
      .filter((item): item is { name: string; quizzes: number | null; questions: number | null; tone: string } => item !== null);
  }

  private normalizeQuestionLibrary(response: unknown): Array<{
    id: string | null;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAns: string;
    difficulty: string;
    category: string;
  }> {
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
        const category = String(record.category ?? '').trim();

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
          category: category || this.selectedCategory,
        };
      })
      .filter((item): item is {
        id: string | null;
        question: string;
        optionA: string;
        optionB: string;
        optionC: string;
        optionD: string;
        correctAns: string;
        difficulty: string;
        category: string;
      } => item !== null);
  }

  private extractCategoryName(record: { name?: unknown; category?: unknown; label?: unknown } | string | null): string {
    if (typeof record === 'string') {
      return record.trim();
    }

    if (!record) {
      return '';
    }

    return String(record.name ?? record.category ?? record.label ?? '').trim();
  }

  private getCategoryField(
    record: { quizzes?: unknown; quizCount?: unknown; questions?: unknown; questionCount?: unknown } | string | null,
    primaryKey: 'quizzes' | 'questions',
    secondaryKey: 'quizCount' | 'questionCount'
  ): unknown {
    if (!record || typeof record === 'string') {
      return null;
    }

    return record[primaryKey] ?? record[secondaryKey] ?? null;
  }

  private toNumber(value: unknown): number | null {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
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
