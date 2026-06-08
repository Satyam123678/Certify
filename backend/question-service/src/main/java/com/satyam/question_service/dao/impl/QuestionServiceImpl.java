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
    public List<QuestionServiceEntity> getAllQuestion(String category) throws Exception {
        List<QuestionServiceEntity> result=questionServiceRepository.findByCategory(category);
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
    public String createQuestoin(List<QuestionServiceEntity> questionServiceEnt) throws Exception {
        for(QuestionServiceEntity questionServiceEntity:questionServiceEnt) {
            if (questionServiceEntity.getQuestion() == null || questionServiceEntity.getQuestion().isEmpty()) {
                throw new Exception("Question Can Not be null or empty");
            }
            if (questionServiceEntity.getOptionA() == null || questionServiceEntity.getOptionA().isEmpty()) {
                throw new Exception("option A Can Not be null or empty");
            }
            if (questionServiceEntity.getOptionB() == null || questionServiceEntity.getOptionB().isEmpty()) {
                throw new Exception("option B Can Not be null or empty");
            }
            if (questionServiceEntity.getOptionC() == null || questionServiceEntity.getOptionC().isEmpty()) {
                throw new Exception("option C Can Not be null or empty");
            }
            if (questionServiceEntity.getOptionD() == null || questionServiceEntity.getOptionD().isEmpty()) {
                throw new Exception("option D Can Not be null or empty");
            }
            if (questionServiceEntity.getCorrectAns() == null || questionServiceEntity.getCorrectAns().isEmpty()) {
                throw new Exception("Correct Answer Can Not be null or empty");
            }
            if (questionServiceEntity.getCategory() == null || questionServiceEntity.getCategory().isEmpty()) {
                throw new Exception("Catagory Can Not be null or empty");
            }
            if (questionServiceEntity.getDifficulty() == null || questionServiceEntity.getDifficulty().isEmpty()) {
                throw new Exception("Difficulty Can Not be null or empty");
            }
            try {
                if (questionServiceEntity.getId() != null) {
                    if (questionServiceRepository.existsById(questionServiceEntity.getId())) {
                        QuestionServiceEntity questionServiceEntity1 = questionServiceRepository.findById(questionServiceEntity.getId()).get();
                        questionServiceEntity1.setCorrectAns(questionServiceEntity.getCorrectAns());
                        questionServiceEntity1.setQuestion(questionServiceEntity.getQuestion());
                        questionServiceEntity1.setDifficulty(questionServiceEntity.getDifficulty());
                        questionServiceEntity1.setCategory(questionServiceEntity.getCategory());
                        return "Updated Successfully";
                    } else {
                        throw new Exception("Entity with id " + questionServiceEntity.getId() + " not found");
                    }
                } else {
                   if(questionServiceRepository.existsByQuestion(questionServiceEntity.getQuestion())){
                       throw new Exception("Question already exsits");

                    }
                   else {
                       questionServiceRepository.save(questionServiceEntity);
                   }

                }
            } catch (Exception e) {
                throw new Exception("error msg:" + e.getMessage());
            }
        }
        return "Processed Successfully";
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

    @Override
    public List<String> getCategories() throws Exception {
        try {
            List<String> categories = questionServiceRepository.getCategories();
            if (categories.isEmpty() || categories == null) {
                throw new Exception("Category is returin null");
            }
            return categories;
        }
        catch (Exception e){
            throw new Exception("error mssg:"+e.getMessage());
        }
    }
}

