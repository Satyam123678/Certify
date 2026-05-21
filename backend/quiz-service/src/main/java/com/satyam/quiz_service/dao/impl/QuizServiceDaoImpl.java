package com.satyam.quiz_service.dao.impl;

import com.satyam.quiz_service.common.QuizServiceCommonMethodUtils;
import com.satyam.quiz_service.config.RabbitMqConfig;
import com.satyam.quiz_service.connect.QuestionClient;
import com.satyam.quiz_service.dao.JwtUtils;
import com.satyam.quiz_service.dao.QuizServiceDao;
import com.satyam.quiz_service.dto.*;
import com.satyam.quiz_service.persistence.QuizServiceEntity;
import com.satyam.quiz_service.persistence.QuizServiceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class QuizServiceDaoImpl implements QuizServiceDao {
    @Autowired
    AmqpTemplate amqpTemplate;
    @Autowired
    QuestionClient questionClient;
    @Autowired
    QuizServiceRepository quizServiceRepository;
    @Autowired
    QuizServiceCommonMethodUtils quizServiceCommonMethodUtils;
    @Autowired
    JwtUtils jwtUtils;
    @Override
    public QuizServiceDtoResponse generateQuiz(String catagory, Long limit,String userEmail) {
        List<QuestionServiceDto> getQuesations = questionClient.findByCatagory(catagory, limit);
        if(getQuesations.isEmpty()){
            return (QuizServiceDtoResponse) Collections.emptyList();
        }
        log.info("sddfd>>>>>"+getQuesations);
        //String token=authHeader.substring(7);
        //String useremail=jwtUtils.extractEmail(token);
        if (getQuesations != null) {
            QuizServiceEntity quizServiceEntity = new QuizServiceEntity();
            Long quizId=quizServiceCommonMethodUtils.generateId();
            quizServiceEntity.setQuizId(quizId);
            quizServiceEntity.setCategory(catagory);
            quizServiceEntity.setTitle(catagory);
            quizServiceEntity.setUserEmail(userEmail);
            quizServiceEntity.setNumOfQuestions(limit);
            List<Integer> questionIds=getQuesations.stream().map(QuestionServiceDto::getId).toList();
            quizServiceEntity.setQuestionIds(questionIds);
            quizServiceRepository.save(quizServiceEntity);
            QuizServiceDtoResponse quizServiceDtoResponse = new QuizServiceDtoResponse(quizId.toString(), getQuesations);
            return quizServiceDtoResponse;


        } else {
            return (QuizServiceDtoResponse) Collections.emptyList();
        }
    }

    @Override
    public String getScore(List<GetScoreRequestDto> response,String username,String userEmail) throws Exception {
        List<Integer> getQusIds=response.stream().map(e->e.getId()).toList();
       List<CorrectAnsResponseDto> res=questionClient.getCorrectAns(getQusIds);
       if(res.isEmpty()){
           return "Question Service is down";
       }
//       if(res.isEmpty() || res.size()==0){
//           throw new Exception("Answear List Empty");
//       }
       float result=0;
       for(int i=0;i<response.size();i++) {
           for (int j = 0; j < res.size(); j++) {
               if (res.get(j).getId().equals(response.get(i).getId())) {
                   if(res.get(j).getCorrectAns().equals(response.get(i).getUserSelectOption())){
                      result++;
                   }
               }
           }
       }
       if(quizServiceRepository.existsById(response.get(0).getQuizId())) {
           Optional<QuizServiceEntity> qu = quizServiceRepository.findById(response.get(0).getQuizId());
           qu.get().setScore("" + result);
           quizServiceRepository.save(qu.get());
       }

      if(result >= response.size()/2){
          CertificateGenerateRequest certificateGenerateRequest=new CertificateGenerateRequest();
          float percentage=(result/response.size())*100;
          LocalDate today=LocalDate.now();
          DateTimeFormatter dateTimeFormatter=DateTimeFormatter.ofPattern("dd/MM/yyyy");
          String day= today.format(dateTimeFormatter);
          certificateGenerateRequest.setUserName(username);
          certificateGenerateRequest.setEmail(userEmail);
          certificateGenerateRequest.setScore(""+percentage+"%");
          certificateGenerateRequest.setDate(day);
          certificateGenerateRequest.setQuizTitle(response.get(0).getQuizTitle());
          amqpTemplate.convertAndSend(
                  RabbitMqConfig.EXCHANGE,
                  RabbitMqConfig.KEY,
                  certificateGenerateRequest
          );
           return "You passed! Certificate will be sent to your register Email Id "+ result + "/" + response.size();

      }
        return "You failed! Score: " + result + "/" + response.size();

    }
}
