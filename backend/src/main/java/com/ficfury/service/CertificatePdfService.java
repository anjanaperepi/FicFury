package com.ficfury.service;

import com.ficfury.model.Certificate;

import java.io.IOException;

public interface CertificatePdfService {

    String generateCertificatePdf(
            Certificate certificate
    ) throws IOException;
}