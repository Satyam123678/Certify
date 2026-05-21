import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-quiz-result',
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz-result.html',
  styleUrl: './quiz-result.css',
})
export class QuizResult implements OnInit {
  readonly passMark = 50;

  score = 4;
  total = 5;
  percent = 80;
  passed = true;
  category: string | null = null;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    const state = this.router.getCurrentNavigation()?.extras.state
      ?? (typeof history !== 'undefined' ? history.state : null);
    const scoreFromState = Number(state?.score);
    const totalFromState = Number(state?.total);
    this.category = typeof state?.category === 'string' ? state.category : null;

    if (!Number.isNaN(scoreFromState) && !Number.isNaN(totalFromState) && totalFromState > 0) {
      this.score = scoreFromState;
      this.total = totalFromState;
      this.percent = Math.round((this.score / this.total) * 100);
      this.passed = this.percent >= this.passMark;
    }
  }

  retryQuiz(): void {
    if (!this.category) {
      void this.router.navigate(['/quizzes']);
      return;
    }

    void this.router.navigate(['/quizzes', this.slugFromCategory(this.category)], {
      state: {
        category: this.category,
      },
    });
  }

  private slugFromCategory(category: string): string {
    return category.trim().toLowerCase().replace(/\s+/g, '-');
  }
}
