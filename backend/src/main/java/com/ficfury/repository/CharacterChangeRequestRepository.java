package com.ficfury.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ficfury.model.CharacterChangeRequest;
import com.ficfury.model.RequestStatus;

public interface CharacterChangeRequestRepository
        extends JpaRepository<CharacterChangeRequest, Long> {


    List<CharacterChangeRequest>
    findByUser_Id(Long userId);


    List<CharacterChangeRequest>
    findByCommittee_Id(Long committeeId);


    List<CharacterChangeRequest>
    findByStatus(RequestStatus status);


    boolean existsByUser_IdAndStatus(
        Long userId,
        RequestStatus status
    );


    boolean existsByRequestedCharacter_IdAndStatus(
        Long characterId,
        RequestStatus status
    );

}