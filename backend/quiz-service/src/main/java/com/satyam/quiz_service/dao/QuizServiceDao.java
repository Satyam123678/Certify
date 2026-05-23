package com.satyam.quiz_service.dao;

import com.satyam.quiz_service.dto.CorrectAnsResponseDto;
import com.satyam.quiz_service.dto.GetScoreRequestDto;
import com.satyam.quiz_service.dto.QuizServiceDtoResponse;
import com.satyam.quiz_service.dto.UserQuizAttempedHistory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface QuizServiceDao {
    QuizServiceDtoResponse generateQuiz(String catagory,Long limit, String userEmail);
    String getScore(List<GetScoreRequestDto> response,String username,String userEmail) throws Exception;
    List<UserQuizAttempedHistory> getUserHistory(String username) throws Exception;
}
