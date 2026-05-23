import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-leaderboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css',
})
export class Leaderboard implements OnInit {
  categoryLabel = 'All categories';

  readonly topScorers = [
    { name: 'Satyam Sinha', score: 98, rank: 1 },
    { name: 'Aarav Singh', score: 94, rank: 2 },
    { name: 'Meera Joshi', score: 91, rank: 3 },
    { name: 'Rohan Patel', score: 88, rank: 4 },
    { name: 'Isha Verma', score: 85, rank: 5 },
  ];

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    const category = this.route.snapshot.paramMap.get('category');
    if (category) {
      this.categoryLabel = category.replace(/-/g, ' ').toUpperCase();
    }
  }

  get maxScore(): number {
    return Math.max(...this.topScorers.map((scorer) => scorer.score));
  }

  scorePercent(score: number): number {
    return Math.round((score / this.maxScore) * 100);
  }
}
