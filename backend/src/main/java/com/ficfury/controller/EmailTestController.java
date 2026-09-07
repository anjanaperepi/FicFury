package com.ficfury.controller;

import com.ficfury.service.EmailNotificationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test-email")
public class EmailTestController {

    private final EmailNotificationService emailNotificationService;

    public EmailTestController(
            EmailNotificationService emailNotificationService) {
        this.emailNotificationService = emailNotificationService;
    }


}