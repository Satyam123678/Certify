package com.satyam.quiz_service.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizServiceRepository extends JpaRepository<QuizServiceEntity,Long> {
    List<QuizServiceEntity> findAllByUserEmail(String email);
}
