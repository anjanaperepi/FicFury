package com.ficfury.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;


import com.ficfury.dto.DashboardStats;
import com.ficfury.dto.DelegateDashboardResponse;
import com.ficfury.dto.RecentRegistrationDTO;

import com.ficfury.model.Award;
import com.ficfury.model.Registration;
import com.ficfury.model.RegistrationStatus;
import com.ficfury.repository.RegistrationRepository;
import com.ficfury.repository.UserRepository;
import com.ficfury.repository.CommitteeRepository;
import com.ficfury.repository.CharacterRepository;

import com.ficfury.dto.ChairDashboardResponse;
import com.ficfury.dto.ChairRegistrationDTO;
import com.ficfury.dto.CommitteeDelegateDTO;
import com.ficfury.model.Committee;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.ficfury.model.User;
@Service
public class DashboardService {

    private final RegistrationRepository registrationRepository;



    private final AwardService awardService;
    private final UserRepository userRepository;

private final CommitteeRepository committeeRepository;

private final CharacterRepository characterRepository;

    public DashboardService(

            RegistrationRepository registrationRepository,


            AwardService awardService,
              UserRepository userRepository,

        CommitteeRepository committeeRepository,

        CharacterRepository characterRepository

    ) {

        this.registrationRepository =
                registrationRepository;

  

        this.awardService =
                awardService;
        
        this.userRepository = userRepository;

    this.committeeRepository = committeeRepository;

    this.characterRepository = characterRepository;


    }

    /*
     * Existing Admin Dashboard Stats
     */

    public DashboardStats getStats() {

    DashboardStats stats = new DashboardStats();

    stats.setTotalUsers(

            userRepository.count()

    );

    stats.setTotalCommittees(

            committeeRepository.count()

    );

    stats.setTotalCharacters(

            characterRepository.count()

    );

    stats.setTotalRegistrations(

            registrationRepository.count()

    );

    stats.setApprovedRegistrations(

            registrationRepository

                    .findAll()

                    .stream()

                    .filter(r ->

                            r.getWorkflowStatus() == RegistrationStatus.ACTIVE

                    )

                    .count()

    );

    return stats;

}

    /*
     * Delegate Dashboard
     */

    public DelegateDashboardResponse getDelegateDashboard() {

    User user = getLoggedInUser();

      

Registration registration =
        registrationRepository
                      .findByUser_Id(user.getId())
                .stream()
                .findFirst()
                .orElse(null);

DelegateDashboardResponse response =
        new DelegateDashboardResponse();

response.setUser(user);

if (registration == null) {
    return response;
}


        List<Award> awards =
        awardService.getAwardsByRegistration(registration.getId());

        

        response.setUser(

                registration.getUser()

        );

        response.setRegistration(

                registration

        );

        response.setCommittee(

                registration.getCommittee()

        );

        response.setCharacter(

                registration.getCharacter()

        );


        response.setAwards(

                awards

        );


        return response;

    }



public List<RecentRegistrationDTO> getRecentRegistrations() {

    return registrationRepository
            .findTop5ByOrderByRegisteredAtDesc()
            .stream()
            .map(registration ->

                    new RecentRegistrationDTO(

                            registration.getId(),

                            registration.getUser().getFullName(),

                            registration.getCommittee().getName(),

                            registration.getCharacter() != null
                                    ? registration.getCharacter().getName()
                                    : "Not Assigned",

                            registration.getWorkflowStatus().name(),

                            registration.getRegisteredAt()

                    )

            )
            .toList();

}

public ChairDashboardResponse getChairDashboard() {

    User chair = getLoggedInUser();

  List<Committee> committees =
        committeeRepository.findByChairpersonEmail(chair.getEmail());

if (committees.isEmpty()) {
    throw new RuntimeException(
            "No committee assigned to chair: " + chair.getEmail());
}
List<Registration> registrations = new ArrayList<>();

for (Committee committee : committees) {

   registrations.addAll(
    registrationRepository
        .findByCommittee_IdAndWorkflowStatus(
            committee.getId(),
            RegistrationStatus.ACTIVE
        ));
}

    ChairDashboardResponse response =
            new ChairDashboardResponse();

    response.setChairName(chair.getFullName());
response.setChairEmail(chair.getEmail());
response.setCommittees(committees);

    response.setDelegateCount(registrations.size());
    response.setAttendancePercentage(0);
    response.setPaperCount(0);
    response.setActiveDebates(0);

    response.setPresentCount(0);
    response.setAbsentCount(0);
    response.setLateCount(0);

    List<ChairRegistrationDTO> registrationDTOs =
            registrations.stream()
                    .map(registration ->
                            new ChairRegistrationDTO(
                                    registration.getId(),
                                    registration.getUser().getId(),
                                    registration.getUser().getFullName(),
                                    registration.getUser().getEmail(),
                                    registration.getCharacter() != null
                                            ? registration.getCharacter().getName()
                                            : "Not Assigned",
                                    registration.getCommittee().getName(),
                                    registration.getWorkflowStatus().name(),
                                    registration.getRegisteredAt()
                            )
                    )
                    .toList();

    response.setRegistrations(registrationDTOs);
    response.setRecentActivity(List.of());

    return response;
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
    

    public List<CommitteeDelegateDTO> getCommitteeDelegates(Long committeeId) {

    User chair = getLoggedInUser();

    Committee committee = committeeRepository.findById(committeeId)
            .orElseThrow(() ->
                    new RuntimeException("Committee not found"));

    if (!committee.getChairpersonEmail().equals(chair.getEmail())) {
        throw new RuntimeException(
                "You are not assigned to this committee.");
    }

    return registrationRepository
            .findByCommittee_IdAndWorkflowStatus(
                    committeeId,
                    RegistrationStatus.ACTIVE)
            .stream()
            .map(registration -> new CommitteeDelegateDTO(
                    registration.getId(),
                    registration.getUser().getId(),
                    registration.getUser().getFullName(),
                    registration.getUser().getEmail(),
                    registration.getCharacter() != null
                            ? registration.getCharacter().getName()
                            : "Not Assigned",
                    registration.getCommittee().getName(),
                    registration.getWorkflowStatus().name(),
                    registration.getRegisteredAt()
            ))
            .toList();
}
   
public String leaveCommittee(Long committeeId) {

    User chair = getLoggedInUser();


    Committee committee =
            committeeRepository.findById(committeeId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Committee not found"
                            )
                    );


    if (
            committee.getChairpersonEmail() == null ||
            !committee.getChairpersonEmail()
                    .equalsIgnoreCase(chair.getEmail())
    ) {

        throw new RuntimeException(
                "You are not assigned to this committee."
        );
    }


    committee.setChairpersonName(null);
    committee.setChairpersonEmail(null);

    committeeRepository.save(committee);


    List<Committee> remainingCommittees =
            committeeRepository
                    .findByChairpersonEmail(
                            chair.getEmail()
                    );


    if (remainingCommittees.isEmpty()) {

        chair.setRole(
                com.ficfury.model.Role.DELEGATE
        );

        userRepository.save(chair);

        return
                "You have left the committee and "
                + "are now a delegate.";
    }


    return "You have left the committee successfully.";
}
}





