package com.satyam.quiz_service.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizServiceRepository extends JpaRepository<QuizServiceEntity,Long> {
}
