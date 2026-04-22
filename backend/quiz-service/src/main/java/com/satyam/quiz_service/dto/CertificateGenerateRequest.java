package com.satyam.quiz_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CertificateGenerateRequest {
    private String userName;
    private String quizTitle;
    private String score;
    private String email;
    private String date;
}
