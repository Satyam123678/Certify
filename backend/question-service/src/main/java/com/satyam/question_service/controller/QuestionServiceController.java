package com.satyam.question_service.controller;

import com.satyam.question_service.common.QuestionServiceCommonUtils;
//import com.satyam.question_service.dao.QuestionServiceDao;
import com.satyam.question_service.dao.QuestionServiceDao;
import com.satyam.question_service.dto.CorrectAnsResponseDto;
import com.satyam.question_service.dto.QuestionServiceDto;
import com.satyam.question_service.persistence.QuestionServiceEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/questionController")
@RequiredArgsConstructor
public class QuestionServiceController {
private  final QuestionServiceDao questionServiceDao;


    @GetMapping("/fetch/all")
    public ResponseEntity<?> fetchAll(){
        try{
            List<QuestionServiceEntity> result=questionServiceDao.getAllQuestion();

            return ResponseEntity.status(HttpStatus.OK).body(new QuestionServiceCommonUtils<>(200,"S","Data SucessFully Fetch",result));
        }
        catch (Exception e){
           return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new QuestionServiceCommonUtils<>(400,"F","SomeThing Went Wrong",null));
        }
    }
    @GetMapping("/fetch/byCatagory/{catagory}/{limit}")
    public List<QuestionServiceDto> findByCatagory(@PathVariable String catagory,@PathVariable Long limit){
        try {
            List<QuestionServiceDto> resultByCategory=questionServiceDao.getQuestionByCatagor(catagory,limit);
            System.out.println(resultByCategory);
            return resultByCategory;

        } catch (Exception e) {
            return null;
        }
    }
    @PostMapping("/create-new-question")
    public ResponseEntity<?> createNewQuestion(@RequestBody QuestionServiceEntity questionServiceEntity){
        try{
            if(questionServiceEntity==null){
                throw new Exception("questionServiceEntity can not be null");
            }
           String res= questionServiceDao.createQuestoin(questionServiceEntity);
            if(res.equals("Created SussecFully")) {
                return ResponseEntity.status(HttpStatus.CREATED).body(new QuestionServiceCommonUtils<>(201, "S", res, null));
            }
            if(res.equals("Updated Successfully")) {
                return ResponseEntity.status(HttpStatus.CREATED).body(new QuestionServiceCommonUtils<>(201, "S", res, null));
            }
            if(res.equals("Not Updated Successfully")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new QuestionServiceCommonUtils<>(400, "F", res, null));
            }



        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new QuestionServiceCommonUtils<>(400,"F","SomeThing went Wrong",null));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new QuestionServiceCommonUtils<>(400,"F","SomeThing went Wrong",null));
    }
    @DeleteMapping("/delete/{id}")
    public  ResponseEntity<?> deleteQuestion(@PathVariable Integer id){
        try {
            if(id == null){
                throw new Exception("id can not be blank otr null");
            }
            String res= questionServiceDao.deleteQuestionById(id);
            return ResponseEntity.status(HttpStatus.OK).body(new QuestionServiceCommonUtils<>(200, "S", res, null));

        } catch (Exception e) {
           return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new QuestionServiceCommonUtils<>(404, "S", "some thing went wrong", null));
        }
    }
    @PostMapping("/correct-ans")
    public List<CorrectAnsResponseDto> getCorrectAns(@RequestBody List<Integer> ids) throws Exception{
        try{
            List<CorrectAnsResponseDto> ans=questionServiceDao.getAns(ids);
            return ans;
        } catch (Exception e) {
            throw new Exception("error msg:"+e.getMessage());
        }
    }
}
