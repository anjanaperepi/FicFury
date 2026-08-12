package com.ficfury.service;

import java.util.List;

import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ficfury.model.Committee;
import com.ficfury.repository.AttendanceRepository;
import com.ficfury.repository.AwardRepository;
import com.ficfury.repository.CharacterRepository;
import com.ficfury.repository.CommitteeRepository;
import com.ficfury.repository.RegistrationRepository;
import com.ficfury.repository.UserRepository;
import com.ficfury.model.Role;
import com.ficfury.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.ficfury.model.Award;
import com.ficfury.model.Character;

@Service
public class CommitteeService {

   private final CommitteeRepository committeeRepository;
private final CharacterRepository characterRepository;
private final RegistrationRepository registrationRepository;
private final AttendanceRepository attendanceRepository;
private final AwardRepository awardRepository;
private final UserRepository userRepository;


public CommitteeService(
        CommitteeRepository committeeRepository,
        CharacterRepository characterRepository,
        RegistrationRepository registrationRepository,
        AttendanceRepository attendanceRepository,
        AwardRepository awardRepository,
        UserRepository userRepository){

    this.committeeRepository = committeeRepository;
    this.characterRepository = characterRepository;
    this.registrationRepository = registrationRepository;
    this.attendanceRepository = attendanceRepository;
    this.awardRepository = awardRepository;
    this.userRepository = userRepository;
}


    public List<Committee> getAllCommittees() {

        return committeeRepository.findAll();

    }

    public Committee getCommitteeById(
            Long id
    ) {

        return committeeRepository
                .findById(id)
                .orElse(null);

    }

public List<Committee> getCommitteesByChairEmail(
        String email
) {
    if (email == null || email.isBlank()) {
        throw new IllegalArgumentException(
                "Chair email is required."
        );
    }

    return committeeRepository
            .findByChairpersonEmail(email);
}

    public Committee createCommittee(
            Committee committee
    ) {
        if (committeeRepository.existsByNameIgnoreCase(
        committee.getName())) {

    throw new RuntimeException(
            "Committee already exists.");
}
if (committee.getName() == null ||
    committee.getName().isBlank()) {

    throw new RuntimeException(
            "Committee name is required.");
}
if (committee.getChairpersonEmail() == null ||
    committee.getChairpersonEmail().isBlank()) {

    throw new RuntimeException(
            "Chairperson email is required.");
}
if (committee.getDate() == null ||
    committee.getDate().isBlank()) {

    throw new RuntimeException(
            "Date is required.");
}
if (committee.getTime() == null ||
    committee.getTime().isBlank()) {

    throw new RuntimeException(
            "Time is required.");
}
User chair = userRepository
        .findByEmail(
                committee.getChairpersonEmail())
        .orElseThrow(() ->
                new RuntimeException(
                        "Chair not found."));
if (chair.getRole() != Role.CHAIR) {

    throw new RuntimeException(
            "Selected user is not a committee chair.");
}


        return committeeRepository.save(
                committee
        );


        

    }

@Transactional
public void deleteCommittee(Long id){

    Committee committee = committeeRepository
            .findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Committee not found"));

  registrationRepository.deleteByCommitteeId(id);

List<Character> characters =
        characterRepository.findByCommitteeId(id);

characterRepository.deleteAll(characters);

    attendanceRepository.deleteByCommitteeId(id);

    awardRepository.deleteByRegistration_Committee_Id(id);

    committeeRepository.delete(committee);
}

    public Committee updateCommittee(
        Long id,
        Committee updatedCommittee
) {

    Committee committee = committeeRepository
            .findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Committee not found"));

    committee.setName(updatedCommittee.getName());

    committee.setCategory(updatedCommittee.getCategory());

    committee.setDescription(updatedCommittee.getDescription());

    committee.setDate(updatedCommittee.getDate());

    committee.setTime(updatedCommittee.getTime());

    committee.setMode(updatedCommittee.getMode());

    committee.setVenue(updatedCommittee.getVenue());

    committee.setMeetingLink(updatedCommittee.getMeetingLink());

    committee.setChairpersonName(
            updatedCommittee.getChairpersonName()
    );

    committee.setChairpersonEmail(
            updatedCommittee.getChairpersonEmail()
    );

    if (!committee.getName()
        .equalsIgnoreCase(updatedCommittee.getName())
    && committeeRepository.existsByNameIgnoreCase(
            updatedCommittee.getName())) {

    throw new RuntimeException(
            "Committee name already exists.");
}

    return committeeRepository.save(committee);

}

}

