package com.satyam.question_service.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionServiceRepository extends JpaRepository<QuestionServiceEntity,Integer> {
    List<QuestionServiceEntity> findByCategory(String catagory);

    @Query(value = "select distinct e.category from questions e",nativeQuery = true)
    List<String> getCategories();
}
