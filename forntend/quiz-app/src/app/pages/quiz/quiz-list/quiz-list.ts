import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-quiz-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz-list.html',
  styleUrl: './quiz-list.css',
})
export class QuizList {
  readonly categories = [
    {
      name: 'Python',
      description: 'Core syntax, OOP, and data structures.',
      quizzes: 10,
      questions: 84,
      tone: 'from-indigo-500/20 to-indigo-500/0',
    },
    {
      name: 'Java',
      description: 'Collections, streams, and JVM fundamentals.',
      quizzes: 8,
      questions: 62,
      tone: 'from-amber-500/20 to-amber-500/0',
    },
    {
      name: 'SQL',
      description: 'Queries, joins, and schema design.',
      quizzes: 6,
      questions: 40,
      tone: 'from-emerald-500/20 to-emerald-500/0',
    },
  ];

  isLoadingCategory: string | null = null;
  errorMessage: string | null = null;

  private readonly quizApiUrl = 'http://localhost:8088/api/quiz/get-question/by-catagory-and-limit';
  private readonly questionLimit = 5;

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

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
}
