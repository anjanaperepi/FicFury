package com.ficfury.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ficfury.model.CertificateType;
import com.ficfury.model.Character;

@Repository
public interface CharacterRepository extends JpaRepository<Character, Long> {
    
    List<Character> findByCommitteeId(Long committeeId);
    boolean existsByCommittee_Id(Long committeeId);



}