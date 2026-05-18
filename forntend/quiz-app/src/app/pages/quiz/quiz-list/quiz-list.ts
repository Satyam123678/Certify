import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-quiz-list',
  imports: [CommonModule, RouterLink],
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

  categorySlug(category: string): string {
    return category.trim().toLowerCase().replace(/\s+/g, '-');
  }
}
