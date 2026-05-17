package com.satyam.user_service.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class OtpService {
    private final StringRedisTemplate redisTemplate;
    private final JavaMailSender mailSender;

    @Value("${otp.expiry}")
    private long OTP_EXPIRY;

    public void generateAndSendOtp(String email) {
        String otp = String.valueOf(
                (int) (Math.random() * 900000) + 100000
        );
        redisTemplate.opsForValue().set(
                "OTP:"+email,
                otp,
                OTP_EXPIRY,
                TimeUnit.MINUTES
        );

    }
    public boolean validateOtp(String mail,String otp){
        String savedOtp=redisTemplate.opsForValue().get("OTP:" + mail);
        if(!savedOtp.equals(otp)){
             throw new RuntimeException("Invalid OTP!");
        }
        if(savedOtp == null){
            throw new RuntimeException("OTP expired! Please request a new one.");
        }
        redisTemplate.delete("OTP:"+mail);
        return true;
    }
    private void SendOtpToEmail(String email,String otp){
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(email);
            helper.setSubject("Your OTP for Quiz App");
            helper.setText(
                    "<h2>Your OTP is: <b>" + otp + "</b></h2>" +
                            "<p>This OTP will expire in " + OTP_EXPIRY + " minutes.</p>" +
                            "<p>Do not share this OTP with anyone.</p>",
                    true
            );
            mailSender.send(message);
        }    catch (MessagingException e) {
            throw new RuntimeException("Failed to send OTP: " + e.getMessage());
        }
    }







}
