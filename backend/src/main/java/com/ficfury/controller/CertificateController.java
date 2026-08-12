package com.ficfury.controller;

import com.ficfury.dto.CertificateEligibleRecipientDTO;
import com.ficfury.dto.CertificateGenerationRequest;
import com.ficfury.model.Certificate;
import com.ficfury.service.CertificateService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.io.File;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    private final CertificateService certificateService;


    public CertificateController(
            CertificateService certificateService
    ) {

        this.certificateService =
                certificateService;
    }


    // =====================================================
    // ELIGIBLE RECIPIENTS
    // =====================================================

    @GetMapping("/eligible")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<
            List<CertificateEligibleRecipientDTO>
            > getEligibleRecipients(
                    @RequestParam Long committeeId
            ) {

        return ResponseEntity.ok(
                certificateService
                        .getEligibleRecipients(
                                committeeId
                        )
        );
    }


    // =====================================================
    // GENERATE CERTIFICATES
    // =====================================================

    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<
            List<Certificate>
            > generateCertificates(
                    @RequestBody
                    CertificateGenerationRequest request
            ) {

        return ResponseEntity.ok(
                certificateService
                        .generateCertificates(
                                request
                        )
        );
    }


    // =====================================================
    // ALL CERTIFICATES
    // =====================================================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<
            List<Certificate>
            > getCertificates() {

        return ResponseEntity.ok(
                certificateService
                        .getCertificates()
        );
    }
// =====================================================
// MY CERTIFICATES — DELEGATE
// =====================================================

@GetMapping("/my")
@PreAuthorize("hasRole('DELEGATE')")
public ResponseEntity<List<Certificate>>
getMyCertificates() {

    return ResponseEntity.ok(
            certificateService
                    .getMyCertificates()
    );
}
@GetMapping("/eligibility")
@PreAuthorize("hasRole('DELEGATE')")
public ResponseEntity<Boolean> getMyCertificateEligibility() {
    return ResponseEntity.ok(
        certificateService.isMyCertificateEligible()
    );
}
    // =====================================================
    // GET CERTIFICATE
    // =====================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Certificate>
    getCertificate(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                certificateService
                        .getCertificateById(id)
        );
    }


    // =====================================================
    // PUBLIC VERIFICATION
    // =====================================================

    @GetMapping("/verify/{certificateNumber}")
    public ResponseEntity<Certificate>
    verifyCertificate(
            @PathVariable String certificateNumber
    ) {

        return ResponseEntity.ok(
                certificateService
                        .getCertificateByNumber(
                                certificateNumber
                        )
        );
    }


// =====================================================
// DOWNLOAD CERTIFICATE
// ADMIN + OWNER DELEGATE
// =====================================================

@GetMapping("/{id}/download")
@PreAuthorize("hasAnyRole('ADMIN', 'DELEGATE')")
public ResponseEntity<Resource> downloadCertificate(
        @PathVariable Long id
) {

    Certificate certificate;

    /*
     * ADMIN:
     * Admin can download any certificate.
     *
     * DELEGATE:
     * Service verifies that the certificate belongs
     * to the currently authenticated delegate.
     */

    if (
            SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getAuthorities()
                    .stream()
                    .anyMatch(
                            authority ->
                                    authority
                                            .getAuthority()
                                            .equals("ROLE_ADMIN")
                    )
    ) {

        certificate =
                certificateService
                        .getCertificateById(id);

    } else {

        certificate =
                certificateService
                        .getMyCertificateForDownload(id);
    }


    if (
            certificate.getFilePath() == null ||
            certificate.getFilePath().isBlank()
    ) {

        return ResponseEntity
                .notFound()
                .build();
    }


    File file =
            new File(
                    certificate.getFilePath()
            );


    if (
            !file.exists() ||
            !file.isFile()
    ) {

        return ResponseEntity
                .notFound()
                .build();
    }


    Resource resource =
            new FileSystemResource(file);


    return ResponseEntity
            .ok()
            .contentType(
                    MediaType.APPLICATION_PDF
            )
            .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" +
                            certificate
                                    .getCertificateNumber()
                            + ".pdf\""
            )
            .contentLength(
                    file.length()
            )
            .body(resource);
}
}