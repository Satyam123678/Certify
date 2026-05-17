package com.satyam.api_getway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/fallback")
public class FallbackController {
    @RequestMapping("/user")
    public ResponseEntity<String> userFallback() {
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("User Service is down! Please try again later.");
    }

    @RequestMapping("/question")
    public ResponseEntity<String> questionFallback() {
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("Question Service is down! Please try again later.");
    }

    @RequestMapping("/quiz")
    public ResponseEntity<String> quizFallback() {
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("Quiz Service is down! Please try again later.");
    }


}
