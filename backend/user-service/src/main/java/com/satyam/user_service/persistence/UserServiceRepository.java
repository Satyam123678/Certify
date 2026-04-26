package com.satyam.user_service.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface UserServiceRepository extends JpaRepository<UserServiceEntity,Long> {

    boolean existsByEmail(String email);

    UserServiceEntity findByEmail(String email);
}
