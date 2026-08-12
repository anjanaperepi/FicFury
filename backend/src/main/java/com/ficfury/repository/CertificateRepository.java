package com.ficfury.repository;

import com.ficfury.model.Certificate;
import com.ficfury.model.CertificateType;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificateRepository
        extends JpaRepository<Certificate, Long> {
    
    Optional<Certificate> findByCertificateNumber(
            String certificateNumber
    );

    List<Certificate> findByCommitteeId(
            Long committeeId
    );

    List<Certificate> findByRecipientId(
            Long recipientId
    );

    

    boolean existsByRecipientIdAndCommitteeIdAndCertificateType(
        Long recipientId,
        Long committeeId,
        CertificateType certificateType
);
}