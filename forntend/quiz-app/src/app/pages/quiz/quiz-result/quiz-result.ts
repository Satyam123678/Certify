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
  readonly highScoreMark = 85;

  score = 4;
  total = 5;
  percent = 80;
  displayPercent = 0;
  passed = true;
  category: string | null = null;
  showConfetti = false;
  confettiPieces = Array.from({ length: 14 }, (_, index) => index);
  confettiLeft = [6, 18, 28, 39, 52, 63, 75, 86, 12, 33, 46, 69, 81, 92];
  confettiDelay = [0, 0.1, 0.2, 0.15, 0.3, 0.05, 0.25, 0.12, 0.18, 0.08, 0.22, 0.14, 0.28, 0.2];
  confettiColors = [
    '#34d399',
    '#38bdf8',
    '#f472b6',
    '#a78bfa',
    '#fbbf24',
    '#60a5fa',
    '#fb7185',
    '#22c55e',
    '#e879f9',
    '#2dd4bf',
    '#f97316',
    '#4ade80',
    '#c084fc',
    '#fde047',
  ];

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

    this.showConfetti = this.percent >= this.highScoreMark;
    this.animatePercent();
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

  private animatePercent(): void {
    const duration = 420;
    const start = performance.now();
    const startValue = 0;
    const target = this.percent;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.displayPercent = Math.round(startValue + (target - startValue) * eased);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }
}
