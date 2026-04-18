package com.satyam.question_service.dao.impl;

import com.satyam.question_service.dao.QuestionServiceDao;

import com.satyam.question_service.dto.CorrectAnsResponseDto;
import com.satyam.question_service.dto.QuestionServiceDto;
import com.satyam.question_service.persistence.QuestionServiceEntity;
import com.satyam.question_service.persistence.QuestionServiceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionServiceDao {
private final QuestionServiceRepository questionServiceRepository;
    @Override
    public List<QuestionServiceEntity> getAllQuestion() throws Exception {
        List<QuestionServiceEntity> result=questionServiceRepository.findAll();
        if(result.isEmpty() || result == null){
            throw new Exception("No Data Found");
        }
        return result;
    }

    @Override
    public List<QuestionServiceDto> getQuestionByCatagor(String catagory,Long limit) throws Exception {
        List<QuestionServiceEntity> resultByCatagory=questionServiceRepository.findByCategory(catagory);
        if(resultByCatagory.isEmpty() || resultByCatagory == null){
            throw new Exception("No Data Found");
        }
        Collections.shuffle(resultByCatagory);
         List<QuestionServiceDto> result= resultByCatagory.stream().limit(limit).map(s->new QuestionServiceDto(s.getId(),s.getQuestion(),s.getOptionA(),s.getOptionB(),s.getOptionC(),s.getOptionD())).toList();
         return result;
    }

    @Override
    @Transactional
    public String createQuestoin(QuestionServiceEntity questionServiceEntity) throws Exception {
        if(questionServiceEntity.getQuestion()==null || questionServiceEntity.getQuestion().isEmpty()){
            throw new Exception("Question Can Not be null or empty");
        }
        if(questionServiceEntity.getOptionA()==null || questionServiceEntity.getOptionA().isEmpty()){
            throw new Exception("option A Can Not be null or empty");
        }
        if(questionServiceEntity.getOptionB()==null || questionServiceEntity.getOptionB().isEmpty()){
            throw new Exception("option B Can Not be null or empty");
        }
        if(questionServiceEntity.getOptionC()==null || questionServiceEntity.getOptionC().isEmpty()){
            throw new Exception("option C Can Not be null or empty");
        }
        if(questionServiceEntity.getOptionD()==null || questionServiceEntity.getOptionD().isEmpty()){
            throw new Exception("option D Can Not be null or empty");
        }
        if(questionServiceEntity.getCorrectAns()==null || questionServiceEntity.getCorrectAns().isEmpty()){
            throw new Exception("Correct Answer Can Not be null or empty");
        }
        if(questionServiceEntity.getCategory()==null || questionServiceEntity.getCategory().isEmpty()){
            throw new Exception("Catagory Can Not be null or empty");
        }
        if(questionServiceEntity.getDifficulty()==null || questionServiceEntity.getDifficulty().isEmpty()){
            throw new Exception("Difficulty Can Not be null or empty");
        }
        try {
            if(questionServiceEntity.getId() !=null){
                if(questionServiceRepository.existsById(questionServiceEntity.getId())){
                    QuestionServiceEntity questionServiceEntity1=questionServiceRepository.findById(questionServiceEntity.getId()).get();
                    questionServiceEntity1.setCorrectAns(questionServiceEntity.getCorrectAns());
                     return "Updated Successfully";
                }
                else{
                    return "Not Updated Successfully";
                }
            }
            else {
                questionServiceRepository.save(questionServiceEntity);
                return "Created SussecFully";
            }
        } catch (Exception e) {
            throw new Exception("error msg:"+e.getMessage());
        }
    }

    @Override
    public String deleteQuestionById(Integer id) throws Exception {
        try {
            questionServiceRepository.deleteById(id);
            return "Deleted Successfully";
        } catch (Exception e) {
            throw new  Exception("error msg:"+e.getMessage());
        }

    }

    @Override
    public List<CorrectAnsResponseDto> getAns(List<Integer> ids) throws Exception {
      try{
          List<QuestionServiceEntity> res=questionServiceRepository.findAllById(ids);
          if(res.isEmpty() || res.size() == 0){
              throw new Exception("please give valid question ids");
          }
          List<CorrectAnsResponseDto> ans=res.stream().map(e->new CorrectAnsResponseDto(e.getId(),e.getCorrectAns())).toList();
          return ans;
      } catch (Exception e) {
          throw new Exception("eror msg:"+e.getMessage());
      }
    }
}

