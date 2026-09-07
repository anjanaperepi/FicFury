package com.ficfury.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${ficfury.admin.email}")
    private String adminEmail;

    public EmailNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendAdminNotification(
            String subject,
            String message) {

        SimpleMailMessage email =
                new SimpleMailMessage();

email.setFrom("notifications@ficfury.com");
email.setTo(adminEmail);
email.setSubject(subject);
email.setText(message);

        mailSender.send(email);
    }


}