package com.satyam.certificate_service.controller;

import com.satyam.certificate_service.commonUtils.QuestionServiceCommonUtils;
import com.satyam.certificate_service.dto.CertificateGenerateRequest;
import com.satyam.certificate_service.service.CertificateGenerateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/certificate-controller")
public class CertificateController {
    @Autowired
   private CertificateGenerateService certificateGenerateService;

    @PostMapping("/send-certificate")
    public ResponseEntity<?> generatePdf(@RequestBody CertificateGenerateRequest certificateGenerateRequest){
        try {
            certificateGenerateService.generateAndSend(certificateGenerateRequest);
            return ResponseEntity.ok(new QuestionServiceCommonUtils<>(200,"S","Success","Certificate sent to " + certificateGenerateRequest.getEmail()));
        } catch (Exception e) {
            throw new RuntimeException("Certificate generation failed: "
                    + e.getMessage());
        }
    }

}
