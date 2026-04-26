package com.satyam.user_service.service;

import com.satyam.user_service.persistence.UserServiceEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Base64;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String SECRET_KEY;
    @Value("${jwt.expiration}")
    private Long EXPAIRATION;

    public String generateToken(UserServiceEntity user){

      return   Jwts.builder().
                setSubject(user.getEmail()).
                claim("role",user.getRole()).
                claim("name",user.getName()).
                setIssuedAt(new Date(System.currentTimeMillis())).
                setExpiration(new Date(System.currentTimeMillis()+EXPAIRATION)).
                signWith(getSignKey(), SignatureAlgorithm.HS256).compact();
    }

    private Key getSignKey(){
       // byte[] key= Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    private Claims extractClaims(String token){
        return Jwts.
        parserBuilder().
        setSigningKey(getSignKey()).
        build().
        parseClaimsJws(token).
        getBody();
    }
    private String extractEmail(String token){
        return extractClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractClaims(token);
            return claims.getExpiration().after(new Date()); // check expiry
        } catch (Exception e) {
            return false;
        }
    }




}
