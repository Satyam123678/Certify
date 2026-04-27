package com.satyam.user_service.service.impl;

import com.satyam.user_service.persistence.RefereshTokenEntity;
import com.satyam.user_service.persistence.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-expiration}")
    private Long REFRESH_EXPAIRATION;

    public RefereshTokenEntity createRefreshToken(String email){
        if(refreshTokenRepository.existsByEmail(email)){
            refreshTokenRepository.deleteByEmail(email);
        }
        RefereshTokenEntity entity=new RefereshTokenEntity();
        entity.setEmail(email);
        entity.setToken(UUID.randomUUID().toString());
        entity.setExpairyTime(LocalDateTime.now().plusSeconds(REFRESH_EXPAIRATION/1000));
        entity.setRevoked(false);
        refreshTokenRepository.save(entity);
        return entity;

    }
    public RefereshTokenEntity validateRefreshToken(String token) throws Exception{
        Optional<RefereshTokenEntity> refereshTokenEntity= Optional.ofNullable(refreshTokenRepository.findByToken(token).orElseThrow(() -> new RuntimeException("user not found")));

                if(refereshTokenEntity.get().isRevoked()){
                    throw new Exception("Refresh token revoked");
                }
                if(refereshTokenEntity.get().getExpairyTime().isBefore(LocalDateTime.now())){
                    refreshTokenRepository.delete(refereshTokenEntity.get());
                    throw new Exception("Refresh token expired! Please login again.");

                }
                return refereshTokenEntity.get();
    }
    public void revokeRefreshToken(String token) throws Exception{
        Optional<RefereshTokenEntity> refereshTokenEntity= Optional.ofNullable(refreshTokenRepository.findByToken(token).orElseThrow(()->new RuntimeException("not found")));
        refereshTokenEntity.get().setRevoked(true);
        refreshTokenRepository.save(refereshTokenEntity.get());
    }
}
