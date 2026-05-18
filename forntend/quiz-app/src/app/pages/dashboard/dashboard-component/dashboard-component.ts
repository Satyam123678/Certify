import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-component',
  imports: [CommonModule],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css',
})
export class DashboardComponent {
  readonly user = {
    name: 'Satyam Sharma',
    role: 'Quiz Creator',
    level: 'Level 8',
    plan: 'Pro Plan',
    streak: 14,
    avatar: 'SS',
  };

  readonly statsCards = [
    { label: 'Active Categories', value: '3', delta: 'Python, Java, SQL' },
    { label: 'Total Quizzes', value: '24', delta: '+4 this month' },
    { label: 'Questions Added', value: '186', delta: '+18 this week' },
    { label: 'Completion Rate', value: '76%', delta: '+6% uplift' },
  ];

  readonly categories = [
    { name: 'Python', quizzes: 10, questions: 84, tone: 'from-indigo-500/20 to-indigo-500/0' },
    { name: 'Java', quizzes: 8, questions: 62, tone: 'from-amber-500/20 to-amber-500/0' },
    { name: 'SQL', quizzes: 6, questions: 40, tone: 'from-emerald-500/20 to-emerald-500/0' },
  ];

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
}
