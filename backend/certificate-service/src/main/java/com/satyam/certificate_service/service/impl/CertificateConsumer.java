package com.satyam.certificate_service.service.impl;

import com.satyam.certificate_service.config.RabbitMqConfig;
import com.satyam.certificate_service.dto.CertificateGenerateRequest;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CertificateConsumer {
    @Autowired
    CertificateGenerateServiceImpl certificateGenerateService;
    @RabbitListener(queues = RabbitMqConfig.QUEUE)
    public void consumeMessage(CertificateGenerateRequest request){
        System.out.println("Received request for: " + request.getUserName());
        try{

            certificateGenerateService.generateAndSend(request);

        } catch (Exception e) {
            throw new RuntimeException("certificate fail "+e.getMessage());
        }
    }
}
