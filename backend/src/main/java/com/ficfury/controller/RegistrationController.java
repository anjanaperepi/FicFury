package com.ficfury.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.ficfury.dto.ApprovalRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import com.ficfury.dto.RejectionRequest;
import com.ficfury.dto.RegistrationRequest;
import com.ficfury.model.Registration;
import com.ficfury.service.RegistrationService;

@RestController
@RequestMapping("/api/registrations")
@CrossOrigin("*")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(
            RegistrationService registrationService
    ) {
        this.registrationService =
                registrationService;
    }

 @PostMapping("/register")
public Registration registerDelegate(

        @RequestBody
        RegistrationRequest request

) {

    return registrationService
            .createRegistration(
                    request
            );

}

@PreAuthorize("hasRole('ADMIN')")
@GetMapping
public List<Registration> getAll() {

        return registrationService.getAll();

    }

    @PreAuthorize("hasRole('DELEGATE')")
@GetMapping("/user/{userId}")
    public List<Registration> getByUser(
            @PathVariable Long userId
    ) {

        return registrationService
                .getUserRegistrations(
                        userId
                );

    }
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/pending-admin")
public List<Registration> getPendingAdmin() {

    return registrationService.getPendingAdminRegistrations();

}

@PreAuthorize("hasRole('CHAIR')")
@GetMapping("/pending-chair")
public List<Registration> getPendingChair() {

    return registrationService.getPendingChairRegistrations();

}
@PreAuthorize("hasRole('ADMIN')")
@PutMapping("/{id}/approve")
public Registration approve(
        @PathVariable Long id,
        @RequestBody ApprovalRequest request
) {

    return registrationService
            .approveRegistration(
                    id
            );

}
@PutMapping("/{id}/chair-approve")
public Registration chairApprove(
        @PathVariable Long id) {

    return registrationService
            .chairApproveRegistration(id);

}
@PreAuthorize("hasRole('ADMIN')")
@PutMapping("/{id}/reject")
public Registration reject(
        @PathVariable Long id,
        @RequestBody RejectionRequest request
) {

    return registrationService.rejectRegistration(
            id,
            request.getReason()
    );

}
@PutMapping("/{id}/chair-reject")
public Registration chairReject(
        @PathVariable Long id,
        @RequestBody RejectionRequest request
) {

    return registrationService.chairRejectRegistration(
            id,
            request.getReason()
    );

}
@PreAuthorize("hasRole('CHAIR')")
@PutMapping("/{id}/complete")
public Registration completeRegistration(
        @PathVariable Long id) {

    return registrationService.completeRegistration(id);

}

@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/active")
public List<Registration> getActiveRegistrations() {

    return registrationService
            .getActiveRegistrations();

}
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/completed")
public List<Registration> getCompletedRegistrations() {

    return registrationService
            .getCompletedRegistrations();

}
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/rejected")
public List<Registration> getRejectedRegistrations() {

    return registrationService
            .getRejectedRegistrations();

}

@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/{id}")
public Registration getRegistration(
        @PathVariable Long id) {

    return registrationService.getById(id);

}
@PreAuthorize("hasRole('ADMIN')")
@PutMapping("/{id}")
public Registration updateRegistration(
        @PathVariable Long id,
        @RequestBody Registration registration) {

    return registrationService.updateRegistration(id, registration);

}
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/{id}")
public void deleteRegistration(
        @PathVariable Long id) {

    registrationService.deleteRegistration(id);

}
@PreAuthorize("hasRole('CHAIR')")
@GetMapping("/chair")
public List<Registration> getChairRegistrations() {
    return registrationService.getChairRegistrations();
}
}
