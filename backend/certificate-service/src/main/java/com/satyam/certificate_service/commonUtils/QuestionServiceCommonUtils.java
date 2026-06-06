package com.satyam.certificate_service.commonUtils;

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
