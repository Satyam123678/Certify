package com.satyam.user_service.persistence;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefereshTokenEntity,Long> {

    boolean existsByEmail(String email);

    @Transactional
    @Modifying
    void deleteByEmail(String email);



   Optional<RefereshTokenEntity> findByToken(String token);
}
