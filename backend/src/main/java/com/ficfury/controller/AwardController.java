package com.ficfury.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import com.ficfury.model.Award;
import com.ficfury.service.AwardService;

@RestController
@RequestMapping("/api/awards")
@CrossOrigin("*")
public class AwardController {

    private final AwardService awardService;

    public AwardController(AwardService awardService) {

        this.awardService = awardService;
    }

    @GetMapping
    public List<Award> getAllAwards() {

        return awardService.getAllAwards();

    }

    @GetMapping("/{id}")
    public Award getAward(@PathVariable Long id) {

        return awardService.getAward(id);

    }
      @PreAuthorize("hasAnyRole('ADMIN','CHAIR')")
    @PostMapping
    public Award createAward(@RequestBody Award award) {

        return awardService.createAward(award);

    }
    @PreAuthorize("hasAnyRole('ADMIN','CHAIR')")
    @PutMapping("/{id}")
    public Award updateAward(
            @PathVariable Long id,
            @RequestBody Award award) {

        return awardService.updateAward(id, award);

    }
    @PreAuthorize("hasAnyRole('ADMIN','CHAIR')")
    @DeleteMapping("/{id}")
    public void deleteAward(@PathVariable Long id) {

        awardService.deleteAward(id);

    }

    @GetMapping("/committee/{committeeId}")
    public List<Award> getCommitteeAwards(
            @PathVariable Long committeeId) {

        return awardService.getAwardsByCommittee(committeeId);

    }

    @GetMapping("/registration/{registrationId}")
    public List<Award> getRegistrationAwards(
            @PathVariable Long registrationId) {

        return awardService.getAwardsByRegistration(registrationId);

    }

}
