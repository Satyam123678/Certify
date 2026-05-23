package com.satyam.quiz_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserQuizAttempedHistory {
    private String quizId;
    private String totalQuestion;
    private String score;
    private String status;
    private String quizTitle;
}
