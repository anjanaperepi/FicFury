package com.ficfury.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import com.ficfury.model.Committee;
import com.ficfury.service.CommitteeService;

@RestController
@RequestMapping("/api/committees")
@CrossOrigin("*")
public class CommitteeController {

    private final CommitteeService committeeService;

    public CommitteeController(
            CommitteeService committeeService
    ) {
        this.committeeService = committeeService;
    }

    @GetMapping
    public List<Committee> getAllCommittees() {

        return committeeService
                .getAllCommittees();

    }

    @GetMapping("/{id}")
    public Committee getCommittee(
            @PathVariable Long id
    ) {

        return committeeService
                .getCommitteeById(id);

    }

@GetMapping("/my-committees")
@PreAuthorize("hasRole('CHAIR')")
public ResponseEntity<List<Committee>> getMyCommittees() {

    String email =
            SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getName();

    return ResponseEntity.ok(
            committeeService
                    .getCommitteesByChairEmail(email)
    );
}
    @PreAuthorize("hasRole('ADMIN')")
@PostMapping

    public Committee createCommittee(
            @RequestBody Committee committee
    ) {

        return committeeService
                .createCommittee(committee);

    }
    @PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/{id}")
    
    public void deleteCommittee(
            @PathVariable Long id
    ) {

        committeeService.deleteCommittee(id);

    }

    @PreAuthorize("hasRole('ADMIN')")
@PutMapping("/{id}")
public Committee updateCommittee(
        @PathVariable Long id,
        @RequestBody Committee committee
) {
    return committeeService.updateCommittee(id, committee);
}


}