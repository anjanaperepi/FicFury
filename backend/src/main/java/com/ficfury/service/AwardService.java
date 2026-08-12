package com.ficfury.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ficfury.debate.entity.DebateSession;
import com.ficfury.debate.enums.SessionStatus;

import com.ficfury.dto.AwardRequest;
import com.ficfury.model.Award;
import com.ficfury.model.AwardType;
import com.ficfury.model.Committee;
import com.ficfury.model.User;
import com.ficfury.repository.AwardRepository;
import com.ficfury.repository.CommitteeRepository;
import com.ficfury.repository.UserRepository;
import com.ficfury.repository.RegistrationRepository;
import com.ficfury.debate.repository.DebateSessionRepository;
import com.ficfury.model.Registration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.ficfury.model.Role;
@Service
public class AwardService {


private final AwardRepository awardRepository;
private final UserRepository userRepository;
private final CommitteeRepository committeeRepository;
private final RegistrationRepository registrationRepository;
private final DebateSessionRepository debateSessionRepository;

public AwardService(

        AwardRepository awardRepository,
        UserRepository userRepository,
        CommitteeRepository committeeRepository,
        RegistrationRepository registrationRepository,
        DebateSessionRepository debateSessionRepository

) {

    this.awardRepository =
            awardRepository;

    this.userRepository =
            userRepository;

    this.committeeRepository =
            committeeRepository;
         this.registrationRepository = registrationRepository;
    
    this.debateSessionRepository =
            debateSessionRepository = debateSessionRepository;

}
 public List<Award> getAllAwards() {

        return awardRepository.findAll();

    }

        public Award getAward(Long id) {

        return awardRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Award not found"));

    }


 public Award createAward(Award award) {

        Long registrationId = award.getRegistration().getId();

        Registration registration = registrationRepository
                .findById(registrationId)
                .orElseThrow(() ->
                        new RuntimeException("Registration not found"));


                        User user = getLoggedInUser();

validateChairOwnsCommittee(
        registration,
        user);

        if (awardRepository.existsByRegistration_Id(registrationId)) {

            throw new RuntimeException(
                    "This delegate has already received an award.");

        }
   award.setRegistration(registration);

        if (award.getPresentedDate() == null) {

            award.setPresentedDate(LocalDate.now());

        }

        return awardRepository.save(award);

    }

    public Award updateAward(Long id, Award updatedAward) {

        Award award = getAward(id);
        User user = getLoggedInUser();

validateChairOwnsCommittee(
        award.getRegistration(),
        user);
        if (updatedAward.getAwardType() != null) {

            award.setAwardType(updatedAward.getAwardType());

        }

        if (updatedAward.getCitation() != null) {

            award.setCitation(updatedAward.getCitation());

        }

        if (updatedAward.getPresentedBy() != null) {

            award.setPresentedBy(updatedAward.getPresentedBy());

        }

        if (updatedAward.getPresentedDate() != null) {

            award.setPresentedDate(updatedAward.getPresentedDate());

        }

        if (updatedAward.getRemarks() != null) {

            award.setRemarks(updatedAward.getRemarks());

        }

        return awardRepository.save(award);

    }

    public void deleteAward(Long id) {

        Award award = getAward(id);

        User user = getLoggedInUser();

validateChairOwnsCommittee(
        award.getRegistration(),
        user);

        awardRepository.delete(award);

    }

    public List<Award> getAwardsByCommittee(Long committeeId) {

        return awardRepository.findByRegistration_Committee_Id(committeeId);

    }

    public List<Award> getAwardsByRegistration(Long registrationId) {

        return awardRepository.findByRegistration_Id(registrationId);

    }



private User getLoggedInUser() {

    Authentication authentication =
            SecurityContextHolder
                    .getContext()
                    .getAuthentication();

    String username = authentication.getName();

    return userRepository
            .findByEmail(username)
            .or(() -> userRepository.findByUsername(username))
            .orElseThrow(() ->
                    new RuntimeException("Logged-in user not found."));
}
private void validateChairOwnsCommittee(
        Registration registration,
        User user) {

    if (user.getRole() == Role.ADMIN) {
        return;
    }

    if (user.getRole() != Role.CHAIR) {
        throw new RuntimeException(
                "Only admins or committee chairs can manage awards.");
    }

    if (!registration.getCommittee()
            .getChairpersonEmail()
            .equalsIgnoreCase(user.getEmail())) {

        throw new RuntimeException(
                "You are not assigned to this committee.");
    }
}

private void validateDebateCompleted(
        Registration registration) {

    Long committeeId =
            registration
                    .getCommittee()
                    .getId();


    DebateSession session =
            debateSessionRepository
                    .findTopByCommittee_IdOrderByCreatedAtDesc(
                            committeeId
                    )
                    .orElseThrow(() ->
                            new IllegalStateException(
                                    "No debate session found for this committee."
                            )
                    );


    if (session.getStatus() != SessionStatus.STOPPED) {

        throw new IllegalStateException(
                "Awards can only be managed after the debate session is completed."
        );

    }

}

}

