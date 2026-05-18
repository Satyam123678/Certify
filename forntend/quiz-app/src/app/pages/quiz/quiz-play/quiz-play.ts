import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-quiz-play',
  imports: [CommonModule],
  templateUrl: './quiz-play.html',
  styleUrl: './quiz-play.css',
})
export class QuizPlay implements OnInit, OnDestroy {
  readonly quizTitle = 'Python Basics';
  readonly timeLimitSeconds = 300;
  readonly questions = [
    {
      text: 'Which keyword is used to define a function in Python?',
      options: ['class', 'def', 'func', 'lambda'],
    },
    {
      text: 'Which data type is immutable in Python?',
      options: ['List', 'Dictionary', 'Set', 'Tuple'],
    },
    {
      text: 'What does PEP stand for?',
      options: ['Python Enhancement Proposal', 'Python Easy Program', 'Programming Entry Point', 'Public Execution Plan'],
    },
    {
      text: 'Which operator checks identity in Python?',
      options: ['==', '===', 'is', 'equals'],
    },
    {
      text: 'Which keyword is used to handle exceptions?',
      options: ['catch', 'try', 'except', 'handle'],
    },
  ];

  remainingSeconds = this.timeLimitSeconds;
  currentQuestionIndex = 0;
  selectedOptions: Array<string | null> = Array.from({ length: this.questions.length }, () => null);
  isSubmitted = false;

  private timerId: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly router: Router, private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
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
    if (this.isSubmitted) {
      return;
    }
    this.isSubmitted = true;
    this.clearTimer();

    const answeredCount = this.selectedOptions.filter((option) => option !== null).length;
    const total = this.totalQuestions;
    const score = Math.min(answeredCount, total);

    void this.router.navigate(['result'], {
      relativeTo: this.route,
      state: {
        score,
        total,
      },
    });
  }

  get totalQuestions(): number {
    return this.questions.length;
  }

  get currentQuestion(): { text: string; options: string[] } {
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
}
