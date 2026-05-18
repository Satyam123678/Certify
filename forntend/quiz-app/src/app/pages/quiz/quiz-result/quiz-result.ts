import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quiz-result',
  imports: [CommonModule],
  templateUrl: './quiz-result.html',
  styleUrl: './quiz-result.css',
})
export class QuizResult implements OnInit {
  readonly passMark = 70;

  score = 4;
  total = 5;
  percent = 80;
  passed = true;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    const state = this.router.getCurrentNavigation()?.extras.state ?? history.state;
    const scoreFromState = Number(state?.score);
    const totalFromState = Number(state?.total);

    if (!Number.isNaN(scoreFromState) && !Number.isNaN(totalFromState) && totalFromState > 0) {
      this.score = scoreFromState;
      this.total = totalFromState;
      this.percent = Math.round((this.score / this.total) * 100);
      this.passed = this.percent >= this.passMark;
    }
  }
}
