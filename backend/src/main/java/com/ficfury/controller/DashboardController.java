package com.ficfury.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ficfury.dto.DashboardStats;
import com.ficfury.dto.DelegateDashboardResponse;
import com.ficfury.dto.RecentRegistrationDTO;
import com.ficfury.service.DashboardService;
import com.ficfury.dto.ChairDashboardResponse;
import com.ficfury.dto.CommitteeDelegateDTO;

import java.util.List;
@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(
            DashboardService dashboardService
    ) {
        this.dashboardService = dashboardService;
    }
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public DashboardStats getStats() {

        return dashboardService.getStats();

    }
@PreAuthorize("hasRole('DELEGATE')")
@GetMapping("/delegate")
public DelegateDashboardResponse getDelegateDashboard() {
    return dashboardService.getDelegateDashboard();
}
@PreAuthorize("hasRole('CHAIR')")
@GetMapping("/chair")
public ChairDashboardResponse getChairDashboard() {
    return dashboardService.getChairDashboard();
}
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/recent-registrations")
public List<RecentRegistrationDTO> getRecentRegistrations(){

    return dashboardService.getRecentRegistrations();

}
@PreAuthorize("hasRole('CHAIR')")
@GetMapping("/chair/committee/{committeeId}/delegates")
public ResponseEntity<List<CommitteeDelegateDTO>> getCommitteeDelegates(
        @PathVariable Long committeeId) {

    return ResponseEntity.ok(
            dashboardService.getCommitteeDelegates(committeeId)
    );
}
@PreAuthorize("hasRole('CHAIR')")
@PostMapping("/chair/committee/{committeeId}/leave")
public ResponseEntity<String> leaveCommittee(
        @PathVariable Long committeeId) {

    return ResponseEntity.ok(
            dashboardService.leaveCommittee(
                    committeeId
            )
    );
}

}
