package com.ficfury.debate.controller;

import com.ficfury.debate.dto.response.ActivityLogResponse;
import com.ficfury.debate.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/debate/activity")
public class ActivityLogController {

    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping("/timeline/{sessionId}")
    public ResponseEntity<List<ActivityLogResponse>> getTimeline(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                activityLogService.getTimeline(sessionId));

    }

}
