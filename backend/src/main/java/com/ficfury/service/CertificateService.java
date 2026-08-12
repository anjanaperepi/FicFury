package com.ficfury.service;

import com.ficfury.dto.CertificateEligibleRecipientDTO;
import com.ficfury.dto.CertificateGenerationRequest;
import com.ficfury.model.Certificate;

import java.util.List;

public interface CertificateService {

    List<CertificateEligibleRecipientDTO>
    getEligibleRecipients(
            Long committeeId
    );

    Certificate getCertificateById(
            Long id
    );

    Certificate getCertificateByNumber(
            String certificateNumber
    );

    List<Certificate> getCertificates();

    List<Certificate> getMyCertificates();

    boolean isMyCertificateEligible();

    Certificate getMyCertificateForDownload(Long certificateId);

    List<Certificate> generateCertificates(
        CertificateGenerationRequest request);
}