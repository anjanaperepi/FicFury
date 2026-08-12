package com.ficfury.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.ficfury.model.Attendance;
import com.ficfury.model.AttendanceStatus;

public interface AttendanceRepository
        extends JpaRepository<Attendance, Long> {

    // Delegate attendance history
    List<Attendance> findByRegistration_Id(Long registrationId);

    // Committee attendance
    List<Attendance> findByRegistration_Committee_Id(Long committeeId);


    List<Attendance> findByRegistration_Committee_IdAndAttendanceDate(
        Long committeeId,
        LocalDate attendanceDate);

    // Attendance statistics
    long countByRegistration_Id(Long registrationId);

    long countByRegistration_IdAndStatus(
            Long registrationId,
            AttendanceStatus status
    );

    // Prevent duplicate attendance for the same day
    boolean existsByRegistration_IdAndAttendanceDate(
            Long registrationId,
            LocalDate attendanceDate
    );

    @Transactional
    @Modifying
    @Query("""
        DELETE FROM Attendance a
        WHERE a.registration.committee.id = :committeeId
    """)
    void deleteByCommitteeId(@Param("committeeId") Long committeeId);
}