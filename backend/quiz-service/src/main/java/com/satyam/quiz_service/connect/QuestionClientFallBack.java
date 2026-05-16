package com.satyam.quiz_service.connect;

import com.satyam.quiz_service.dto.CorrectAnsResponseDto;
import com.satyam.quiz_service.dto.QuestionServiceDto;
import org.apache.http.HttpStatus;
import org.hibernate.annotations.QueryCacheLayout;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
@Component
public class QuestionClientFallBack implements  QuestionClient{
    @Override
    public ResponseEntity<?> fetchAll() {
        System.out.println("Circuit OPEN - Question Service is down!!");
        return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).body("Circuit OPEN - Question Service is dowm!!");
    }

    @Override
    public List<QuestionServiceDto> findByCatagory(String catagory, Long limit) {
        System.out.println("Circuit OPEN - Question Service is down!!");
        return Collections.emptyList();
    }

    @Override
    public List<CorrectAnsResponseDto> getCorrectAns(List<Integer> ids) throws Exception {
        System.out.println("Circuit OPEN - Question Service is down" +
                " can not fetch answer right now!!");
        return Collections.emptyList();
    }
}
