package com.satyam.quiz_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetScoreRequestDto {
    private Integer id;
    private Long quizId;
    private String userSelectOption;
}
