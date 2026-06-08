package com.satyam.question_service.dao;

import com.satyam.question_service.dto.CorrectAnsResponseDto;
import com.satyam.question_service.dto.CreateQuestionDto;
import com.satyam.question_service.dto.QuestionServiceDto;
import com.satyam.question_service.persistence.QuestionServiceEntity;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface QuestionServiceDao {
    List<QuestionServiceEntity> getAllQuestion(String category) throws Exception;
    List<QuestionServiceDto> getQuestionByCatagor(String catagory, Long limit) throws Exception;

    String createQuestoin(List<QuestionServiceEntity> questionServiceEntity) throws Exception;
    String deleteQuestionById(Integer id) throws Exception;
    List<CorrectAnsResponseDto> getAns(List<Integer> ids) throws Exception;
    List<String> getCategories() throws Exception;
 }
