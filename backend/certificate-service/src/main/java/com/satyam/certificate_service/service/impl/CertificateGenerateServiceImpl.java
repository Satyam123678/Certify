package com.satyam.certificate_service.service.impl;

import java.io.ByteArrayOutputStream;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.satyam.certificate_service.dto.CertificateGenerateRequest;
import com.satyam.certificate_service.service.CertificateGenerateService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class CertificateGenerateServiceImpl implements CertificateGenerateService {
    @Autowired
   private JavaMailSender javaMailSender;

    @Override
    public void generateAndSend(CertificateGenerateRequest request) throws Exception {
        byte[] pdfBytes = generatePdf(request);

        // Step 2 — Send Email with PDF attached
        sendEmail(request.getEmail(), pdfBytes, request.getUserName());
    }

    @Override
    public byte[] generatePdf(CertificateGenerateRequest request) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        PageSize pageSize = PageSize.A4;

        PdfPage page = pdf.addNewPage(pageSize);
        PdfCanvas canvas = new PdfCanvas(page);

        float width = pageSize.getWidth();
        float height = pageSize.getHeight();

        // 🎨 Gradient Background (Blue → Light)
        for (int i = 0; i < height; i++) {
            float ratio = i / height;
            int r = (int) (200 + (55 * ratio));   // light gradient
            int g = (int) (220 + (35 * ratio));
            int b = (int) (255);

            canvas.setFillColor(new DeviceRgb(r, g, b));
            canvas.rectangle(0, i, width, 1);
            canvas.fill();
        }

        // 🟦 Outer Border
        canvas.setStrokeColor(new DeviceRgb(0, 51, 102));
        canvas.setLineWidth(8);
        canvas.rectangle(10, 10, width - 20, height - 20);
        canvas.stroke();

        // 🟨 Inner Gold Border
        canvas.setStrokeColor(new DeviceRgb(212, 175, 55));
        canvas.setLineWidth(2);
        canvas.rectangle(25, 25, width - 50, height - 50);
        canvas.stroke();

        Document doc = new Document(pdf);

        doc.setMargins(80, 50, 80, 50);

        // 🖼 LOGO TOP
        Image logoTop = new Image(
                ImageDataFactory.create(getClass().getResource("/Certify App Logi.png"))
        ).scaleToFit(120, 120)
                .setHorizontalAlignment(HorizontalAlignment.CENTER);

        // 🏆 TITLE
        Paragraph title = new Paragraph("CERTIFICATE OF COMPLETION")
                .setFontSize(26)
                .setBold()
                .setFontColor(new DeviceRgb(0, 51, 102))
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(10);

        // 📄 TEXT
        Paragraph text1 = new Paragraph("This is to certify that")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(15)
                .setFontColor(new DeviceRgb(30, 50, 80))
                .setItalic()
                .setMarginTop(20);

        // 👤 NAME
        Paragraph name = new Paragraph(request.getUserName())
                .setFontSize(30)
                .setBold()
                .setFontColor(new DeviceRgb(0, 51, 102))
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(10);

        // 📘 COURSE TEXT
        Paragraph text2 = new Paragraph("has successfully completed the quiz")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(15)
                .setFontColor(new DeviceRgb(30, 50, 80))
                .setItalic()
                .setMarginTop(20);

        Paragraph quiz = new Paragraph(request.getQuizTitle())
                .setFontSize(20)
                .setBold()
                .setFontColor(new DeviceRgb(0, 51, 102))
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(10);

        // 📊 SCORE + DATE
        Paragraph score = new Paragraph("Score: " + request.getScore())
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(15)
                .setFontColor(new DeviceRgb(30, 50, 80))
                .setItalic()
                .setMarginTop(20);

        Paragraph date = new Paragraph("Date: " + request.getDate())
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(15)
                .setFontColor(new DeviceRgb(30, 50, 80))
                .setItalic()
                .setMarginTop(20);

        // 🖼 LOGO BOTTOM
        Image logoBottom = new Image(
                ImageDataFactory.create(getClass().getResource("/passQuiz logo.png"))
        ).scaleToFit(80, 80)
                .setHorizontalAlignment(HorizontalAlignment.CENTER);

        Paragraph platform = new Paragraph("Pass The Quiz")
                .setBold()
                .setFontSize(16)
                .setFontColor(new DeviceRgb(0, 102, 51))
                .setTextAlignment(TextAlignment.CENTER);

        // ✅ ADD ELEMENTS
        doc.add(logoTop);
        doc.add(title);
        doc.add(text1);
        doc.add(name);
        doc.add(text2);
        doc.add(quiz);
        doc.add(score);
        doc.add(date);
        doc.add(logoBottom);
        doc.add(platform);

        doc.close();

        return baos.toByteArray();

    }

    @Override
    public void sendEmail(String email, byte[] pdf, String userName) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(email);
        helper.setSubject("Your Quiz Certificate!");
        helper.setText("Congratulations " + userName +
                "! Please find your certificate attached.");
        helper.addAttachment("certificate.pdf",
                new ByteArrayResource(pdf), "application/pdf");
        System.out.println("Sending mail to: " + email);
        System.out.println((message));
        System.out.println("USERNAME = " + System.getenv("Mail_Id"));
        System.out.println("PASSWORD = " + System.getenv("Pass"));
        javaMailSender.send(message);

    }

}
