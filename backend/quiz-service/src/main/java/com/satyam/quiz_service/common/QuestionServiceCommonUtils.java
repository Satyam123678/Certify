package com.satyam.quiz_service.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor

public class QuestionServiceCommonUtils<T> {
    private int statusCode;
    private String status;
    private String message;
    private T data;



}
