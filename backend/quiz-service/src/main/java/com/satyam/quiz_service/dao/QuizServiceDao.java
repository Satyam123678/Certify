package com.satyam.quiz_service.dao;

import com.satyam.quiz_service.dto.CorrectAnsResponseDto;
import com.satyam.quiz_service.dto.GetScoreRequestDto;
import com.satyam.quiz_service.dto.QuizServiceDtoResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface QuizServiceDao {
    QuizServiceDtoResponse generateQuiz(String catagory,Long limit);
    String getScore(List<GetScoreRequestDto> response) throws Exception;
}
