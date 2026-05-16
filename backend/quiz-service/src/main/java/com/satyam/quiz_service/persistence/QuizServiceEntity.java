package com.satyam.quiz_service.persistence;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "quiz")
public class QuizServiceEntity {
    @Id
    private Long quizId;

    private String title;           // Name of the quiz
    private String category;        // Category (since you mentioned it)
    private Long numOfQuestions;     // Limit of questions (since you mentioned it)
    private String score;           // Score after submission
    private String userEmail;
    @ElementCollection
    @CollectionTable(name = "quiz_questions", joinColumns = @JoinColumn(name = "quiz_id"))
    @Column(name = "question_id")
    private List<Integer> questionIds;

}
