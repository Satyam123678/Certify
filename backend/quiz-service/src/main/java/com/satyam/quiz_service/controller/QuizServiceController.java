package com.satyam.quiz_service.controller;

import com.satyam.quiz_service.common.QuestionServiceCommonUtils;
import com.satyam.quiz_service.connect.QuestionClient;
import com.satyam.quiz_service.dao.QuizServiceDao;
import com.satyam.quiz_service.dto.CreateQuizRequest;
import com.satyam.quiz_service.dto.GetScoreRequestDto;
import com.satyam.quiz_service.dto.QuizServiceDtoResponse;
import com.satyam.quiz_service.dto.UserQuizAttempedHistory;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
public class QuizServiceController {
    @Autowired
    QuestionClient questionClient;
    @Autowired
    QuizServiceDao quizServiceDao;
    @GetMapping("/all")
    ResponseEntity<?> getEmp(){
        return questionClient.fetchAll();
    }
    @PostMapping("/get-question/by-catagory-and-limit")
    public ResponseEntity<?> getQuestion(@RequestBody CreateQuizRequest createQuizRequest, @RequestHeader("X-User-Email") String userEmail){
        try {
            QuizServiceDtoResponse quizServiceDtoResponse=quizServiceDao.generateQuiz(createQuizRequest.getCatagory(), createQuizRequest.getLimit(),userEmail);
            if(quizServiceDtoResponse.getQuestionServiceDto().isEmpty()){
                return ResponseEntity
                        .status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body("Question Service is currently unavailable. " +
                                "Please try again later!");
            }
            else {
                return ResponseEntity.status(HttpStatus.OK).body(quizServiceDtoResponse);
            }
        }
        catch (Exception e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

    }
    @PostMapping("/get-result")
    public ResponseEntity<?> getresult(@RequestBody List<GetScoreRequestDto> response,@RequestHeader("X-User-Name") String username,@RequestHeader("X-User-Email") String userEmail) throws Exception{
        try {
            String result = quizServiceDao.getScore(response,username,userEmail);
            if(result.equals("Question Service is down")){
                return ResponseEntity
                        .status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body("Question Service is currently unavailable. " +
                                "Please try again later!");
            }
            else {
                return ResponseEntity.status(HttpStatus.OK).body(new QuestionServiceCommonUtils<>(200, "S", "result fetched succesfully", result));
            }
        } catch (Exception e) {
            {
                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new QuestionServiceCommonUtils<>(404,"F","Fail",e.getMessage()));
            }
        }

    }
    @GetMapping("/get/user-history")
    public ResponseEntity<?> getHistory(@RequestHeader("X-User-Email") String userEmail) throws Exception{
        try {
            List<UserQuizAttempedHistory> getDetails=quizServiceDao.getUserHistory(userEmail);
            return ResponseEntity.status(HttpStatus.OK).body(new QuestionServiceCommonUtils<>(200,"S","Fetched!!",getDetails));
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }

    }

}
