package com.ficfury.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(
        name = "certificate_number",
        nullable = false,
        unique = true
    )
    private String certificateNumber;


    @Column(name = "recipient_id")
    private Long recipientId;


    @Column(
        name = "recipient_name",
        nullable = false
    )
    private String recipientName;


    @Column(name = "character_name")
    private String characterName;


    @Column(name = "committee_id")
    private Long committeeId;


    @Column(name = "committee_name")
    private String committeeName;


    @Enumerated(EnumType.STRING)
    @Column(
        name = "certificate_type",
        nullable = false
    )
    private CertificateType certificateType;


    @Column(name = "event_name")
    private String eventName;


    @Column(name = "issued_at")
    private LocalDateTime issuedAt;


    @Column(name = "file_path")
    private String filePath;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CertificateStatus status =
            CertificateStatus.GENERATED;


    @Column(name = "created_at")
    private LocalDateTime createdAt;


    public Certificate() {
    }


    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public String getCertificateNumber() {
        return certificateNumber;
    }

    public void setCertificateNumber(
            String certificateNumber
    ) {
        this.certificateNumber =
                certificateNumber;
    }


    public Long getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Long recipientId) {
        this.recipientId =
                recipientId;
    }


    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(
            String recipientName
    ) {
        this.recipientName =
                recipientName;
    }


    public String getCharacterName() {
        return characterName;
    }

    public void setCharacterName(
            String characterName
    ) {
        this.characterName =
                characterName;
    }


    public Long getCommitteeId() {
        return committeeId;
    }

    public void setCommitteeId(Long committeeId) {
        this.committeeId =
                committeeId;
    }


    public String getCommitteeName() {
        return committeeName;
    }

    public void setCommitteeName(
            String committeeName
    ) {
        this.committeeName =
                committeeName;
    }


    public CertificateType getCertificateType() {
        return certificateType;
    }

    public void setCertificateType(
            CertificateType certificateType
    ) {
        this.certificateType =
                certificateType;
    }


    public String getEventName() {
        return eventName;
    }

    public void setEventName(
            String eventName
    ) {
        this.eventName =
                eventName;
    }


    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(
            LocalDateTime issuedAt
    ) {
        this.issuedAt =
                issuedAt;
    }


    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(
            String filePath
    ) {
        this.filePath =
                filePath;
    }


    public CertificateStatus getStatus() {
        return status;
    }

    public void setStatus(
            CertificateStatus status
    ) {
        this.status =
                status;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt =
                createdAt;
    }
}