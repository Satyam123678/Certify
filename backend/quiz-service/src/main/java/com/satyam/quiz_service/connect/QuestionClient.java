package com.satyam.quiz_service.connect;

import com.satyam.quiz_service.dto.CorrectAnsResponseDto;
import com.satyam.quiz_service.dto.QuestionServiceDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient("QUESTION-SERVICE")
public interface QuestionClient {
@GetMapping("api/questionController/fetch/all")
    ResponseEntity<?> fetchAll();
@GetMapping("api/questionController/fetch/byCatagory/{catagory}/{limit}")
    public List<QuestionServiceDto> findByCatagory(@PathVariable String catagory, @PathVariable Long limit);
@PostMapping("api/questionController/correct-ans")
   public List<CorrectAnsResponseDto> getCorrectAns(@RequestBody List<Integer> ids) throws Exception;
}
