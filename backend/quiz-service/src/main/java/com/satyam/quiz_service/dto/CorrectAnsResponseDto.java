package com.satyam.quiz_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CorrectAnsResponseDto {
    private Integer id;
    private String correctAns;

}
