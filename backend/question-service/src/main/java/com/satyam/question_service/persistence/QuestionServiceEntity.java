package com.satyam.question_service.persistence;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="questions")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionServiceEntity {
    @Id
    @Column(name="id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name="question")
    private String question;
    @Column(name="option_a")
    private String optionA;
    @Column(name="option_b")
    private String optionB;
    @Column(name="option_c")
    private String optionC;
    @Column(name="option_d")
    private String optionD;
    @Column(name="correct_answer")
    private String correctAns;
    @Column(name="difficulty")
    private String difficulty;
    @Column(name="category")
    private String category;


}
