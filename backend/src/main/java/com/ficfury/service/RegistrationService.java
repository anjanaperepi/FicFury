package com.ficfury.service;


import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ficfury.dto.RegistrationRequest;
import com.ficfury.exception.RegistrationException;
import com.ficfury.model.ApprovalStatus;
import com.ficfury.model.Character;
import com.ficfury.model.Committee;
import com.ficfury.model.Registration;
import com.ficfury.model.RegistrationStatus;
import com.ficfury.model.User;
import com.ficfury.model.Role;
import com.ficfury.repository.CharacterRepository;
import com.ficfury.repository.CommitteeRepository;
import com.ficfury.repository.RegistrationRepository;
import com.ficfury.repository.UserRepository;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final CommitteeRepository committeeRepository;
    private final CharacterRepository characterRepository;

    public RegistrationService(
            RegistrationRepository registrationRepository,
            UserRepository userRepository,
            CommitteeRepository committeeRepository,
            CharacterRepository characterRepository
    ) {
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.committeeRepository = committeeRepository;
        this.characterRepository = characterRepository;
    }

   public Registration createRegistration(
        RegistrationRequest request
) {

Authentication authentication =
        SecurityContextHolder
                .getContext()
                .getAuthentication();

String username = authentication.getName();

User user = userRepository
        .findByEmail(username)
        .or(() -> userRepository.findByUsername(username))
        .orElseThrow(() ->
                new RuntimeException("Logged-in user not found"));



    Committee committee = committeeRepository
            .findById(request.getCommitteeId())
            .orElseThrow(() ->
                    new RuntimeException("Committee not found."));

    Character character = characterRepository
            .findById(request.getCharacterId())
            .orElseThrow(() ->
                    new RuntimeException("Character not found."));


    // ------------------------------------
    // Validation 1
    // Character belongs to committee
    // ------------------------------------

    if (!character.getCommittee().getId().equals(committee.getId())) {

        throw new RuntimeException(
                "Selected character does not belong to this committee.");

    }


   List<Registration> activeRegistrations =
    registrationRepository.findByUser_IdAndWorkflowStatusIn(
            user.getId(),
            List.of(
                    RegistrationStatus.PENDING_ADMIN,
                    RegistrationStatus.PENDING_CHAIR,
                    RegistrationStatus.ACTIVE
            )
    );

if (!activeRegistrations.isEmpty()) {

    throw new RegistrationException(
            "You already have an active committee registration."
    );

}

    // ------------------------------------
    // Validation 3
    // Character already assigned
    // ------------------------------------

if (registrationRepository
        .existsByCharacter_IdAndWorkflowStatusIn(

                character.getId(),

                List.of(

                        RegistrationStatus.PENDING_ADMIN,

                        RegistrationStatus.PENDING_CHAIR,

                        RegistrationStatus.ACTIVE

                )

        )) {

    throw new RegistrationException(
            "This character has already been assigned."
    );

}

    // ------------------------------------
    // Save registration
    // ------------------------------------

    Registration registration = new Registration();

    registration.setUser(user);

    registration.setCommittee(committee);

    registration.setCharacter(character);

    registration.setWorkflowStatus(
        RegistrationStatus.PENDING_ADMIN
        );

        registration.setAdminApproval(
                ApprovalStatus.PENDING
        );

        registration.setChairApproval(
                ApprovalStatus.PENDING
        );

    return registrationRepository.save(registration);

}

public Registration approveRegistration(Long registrationId) {
      User reviewer = getLoggedInUser(); 
      
      if (reviewer.getRole() != Role.ADMIN) {
    throw new RuntimeException(
            "Only admins can approve registrations.");
}
    Registration registration = registrationRepository
            .findById(registrationId)
            .orElseThrow(() ->
                    new RuntimeException("Registration not found."));

    if (registration.getWorkflowStatus() == RegistrationStatus.REJECTED) {
        throw new RuntimeException("Registration has already been rejected.");
    }

registration.setAdminReviewer(reviewer);
registration.setAdminReviewedAt(LocalDateTime.now());

    registration.setAdminApproval(ApprovalStatus.APPROVED);

    registration.setWorkflowStatus(
            RegistrationStatus.PENDING_CHAIR
    );

    return registrationRepository.save(registration);
}


public Registration chairApproveRegistration(
        Long registrationId
){

        User reviewer = getLoggedInUser();

Registration registration =
        registrationRepository.findById(registrationId)
        .orElseThrow(() ->
                new RuntimeException("Registration not found."));

validateChairOwnsCommittee(
        registration,
        reviewer);

    // Prevent chair approval before admin approval
    if (registration.getAdminApproval() != ApprovalStatus.APPROVED) {
        throw new RuntimeException(
                "Admin approval is required first."
        );
    }

    registration.setChairApproval(
            ApprovalStatus.APPROVED
    );

    registration.setWorkflowStatus(
            RegistrationStatus.ACTIVE
    );

    registration.setChairReviewer(reviewer);
registration.setChairReviewedAt(LocalDateTime.now());

    return registrationRepository.save(registration);



}
        
public Registration rejectRegistration(
        Long registrationId, String reason
) {

        User reviewer = getLoggedInUser();

if (reviewer.getRole() != Role.ADMIN) {
    throw new RuntimeException(
            "Only admins can reject registrations.");
}

    Registration registration = registrationRepository
            .findById(registrationId)
            .orElseThrow(() ->
                    new RuntimeException("Registration not found."));

    registration.setAdminApproval(
            ApprovalStatus.REJECTED
    );
registration.setCharacter(null);
    registration.setWorkflowStatus(
            RegistrationStatus.REJECTED
    );
registration.setCharacter(null);
    registration.setAdminReviewer(reviewer);

registration.setAdminReviewedAt(LocalDateTime.now());

registration.setRejectionReason(reason);

    return registrationRepository.save(registration);


}


public Registration chairRejectRegistration(
        Long registrationId, String reason
) {
        User reviewer = getLoggedInUser();

Registration registration =
        registrationRepository.findById(registrationId)
        .orElseThrow(() ->
                new RuntimeException("Registration not found."));

validateChairOwnsCommittee(
        registration,
        reviewer);

    if (registration.getAdminApproval() != ApprovalStatus.APPROVED) {
        throw new RuntimeException(
                "Registration has not been approved by Admin."
        );
    }

    registration.setChairApproval(
            ApprovalStatus.REJECTED
    );

    registration.setWorkflowStatus(
            RegistrationStatus.REJECTED
    );

     registration.setChairReviewer(reviewer);

registration.setChairReviewedAt(LocalDateTime.now());

registration.setRejectionReason(reason);

    return registrationRepository.save(registration);

 
}

public Registration getById(
        Long id
) {

    return registrationRepository
            .findById(id)
            .orElseThrow();

}
public List<Registration> getActiveRegistrations() {

    return registrationRepository.findByWorkflowStatus(
            RegistrationStatus.ACTIVE
    );

}
public List<Registration> getCompletedRegistrations() {

    return registrationRepository.findByWorkflowStatus(
            RegistrationStatus.COMPLETED
    );

}
public List<Registration> getRejectedRegistrations() {

    return registrationRepository.findByWorkflowStatus(
            RegistrationStatus.REJECTED
    );

}
public List<Registration> getAll() {

    return registrationRepository.findAll();

}

public List<Registration> getUserRegistrations(Long userId) {

    return registrationRepository.findByUser_Id(userId);

}

public List<Registration> getPendingRegistrations() {

    return registrationRepository.findByWorkflowStatus(
        RegistrationStatus.PENDING_ADMIN
);

}
public Registration completeRegistration(Long id) {

    User reviewer = getLoggedInUser();

    Registration registration =
            registrationRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Registration not found."));

    validateChairOwnsCommittee(
            registration,
            reviewer);

    if (registration.getWorkflowStatus() != RegistrationStatus.ACTIVE) {
        throw new RuntimeException(
                "Only active delegates can be completed."
        );
    }

    registration.setWorkflowStatus(
            RegistrationStatus.COMPLETED
    );

    return registrationRepository.save(registration);
}

public Registration updateRegistration(
        Long id,
        Registration updatedRegistration) {

    Registration registration = registrationRepository
            .findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Registration not found."));

    // Update committee
    if (updatedRegistration.getCommittee() != null) {

        Committee committee = committeeRepository
                .findById(updatedRegistration.getCommittee().getId())
                .orElseThrow(() ->
                        new RuntimeException("Committee not found."));

        registration.setCommittee(committee);
    }

    // Update character
    if (updatedRegistration.getCharacter() != null) {

        Character character = characterRepository
                .findById(updatedRegistration.getCharacter().getId())
                .orElseThrow(() ->
                        new RuntimeException("Character not found."));

        registration.setCharacter(character);
    }

    // Update status
   if (updatedRegistration.getWorkflowStatus() != null) {
    registration.setWorkflowStatus(
            updatedRegistration.getWorkflowStatus()
    );
}

    return registrationRepository.save(registration);
}
public void deleteRegistration(Long id) {

    Registration registration =
            registrationRepository
                    .findById(id)
                    .orElseThrow(() ->
                            new RuntimeException("Registration not found."));

    registrationRepository.delete(registration);

}
public List<Registration> getPendingAdminRegistrations() {

    return registrationRepository.findByWorkflowStatus(
            RegistrationStatus.PENDING_ADMIN
    );

}
public List<Registration> getPendingChairRegistrations() {

   User chair = getLoggedInUser();
   
   return registrationRepository
           .findChairRegistrations(chair.getEmail())
           .stream()
           .filter(r -> r.getWorkflowStatus() == RegistrationStatus.PENDING_CHAIR)
           .toList();

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
        User chair) {

    // Administrators may complete the chair-review stage for any committee.
    if (chair.getRole() == Role.ADMIN) {
        return;
    }

    if (chair.getRole() != Role.CHAIR) {
        throw new RuntimeException(
                "Only committee chairs can perform this action.");
    }

    if (!registration.getCommittee()
            .getChairpersonEmail()
            .equalsIgnoreCase(chair.getEmail())) {

        throw new RuntimeException(
                "You are not assigned to this committee.");
    }
}



public List<Registration> getChairRegistrations() {

    User chair = getLoggedInUser();

    return registrationRepository.findChairRegistrations(
            chair.getEmail());

}
}
