package com.satyam.certificate_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;

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
