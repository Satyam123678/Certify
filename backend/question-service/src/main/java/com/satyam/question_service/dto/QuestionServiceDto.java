package com.satyam.question_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionServiceDto {
    private Integer id;
    private String question;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;

}
