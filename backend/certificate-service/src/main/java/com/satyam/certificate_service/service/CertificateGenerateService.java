package com.satyam.certificate_service.service;

import com.satyam.certificate_service.dto.CertificateGenerateRequest;
import org.springframework.stereotype.Service;

@Service
public interface CertificateGenerateService {
  void generateAndSend(CertificateGenerateRequest certificateGenerateRequest) throws Exception;
  public byte[] generatePdf(CertificateGenerateRequest certificateGenerateRequest) throws Exception;
  void sendEmail(String email,byte[] pdf,String userName) throws Exception;
}
