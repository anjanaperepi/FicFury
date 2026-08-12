package com.ficfury.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import com.ficfury.model.Award;

@Repository
public interface AwardRepository
extends JpaRepository<Award, Long> {
      
  




@Modifying
@Transactional
@Query("""
DELETE FROM Award a
WHERE a.registration.committee.id = :committeeId
""")
void deleteByRegistration_Committee_Id(Long committeeId);


List<Award> findByRegistration_Id(Long registrationId);

    List<Award> findByRegistration_Committee_Id(Long committeeId);

    boolean existsByRegistration_Id(Long registrationId);

}
