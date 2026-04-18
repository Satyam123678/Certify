package com.satyam.quiz_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuizServiceDtoResponse {
    private String quizId;
   private List<QuestionServiceDto> questionServiceDto;
}
