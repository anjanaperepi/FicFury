package com.ficfury.dto;

public class CommitteeChangeRequestDTO {

    private Long committeeId;

    private String committeeName;

    private String category;

    private String description;

    private String date;

    private String time;

    private String mode;

    private String venue;

    private String meetingLink;

    private String changeReason;


    public CommitteeChangeRequestDTO() {
    }


    public Long getCommitteeId() {
        return committeeId;
    }


    public void setCommitteeId(Long committeeId) {
        this.committeeId = committeeId;
    }


    public String getCommitteeName() {
        return committeeName;
    }


    public void setCommitteeName(
        String committeeName
    ) {
        this.committeeName = committeeName;
    }


    public String getCategory() {
        return category;
    }


    public void setCategory(
        String category
    ) {
        this.category = category;
    }


    public String getDescription() {
        return description;
    }


    public void setDescription(
        String description
    ) {
        this.description = description;
    }


    public String getDate() {
        return date;
    }


    public void setDate(
        String date
    ) {
        this.date = date;
    }


    public String getTime() {
        return time;
    }


    public void setTime(
        String time
    ) {
        this.time = time;
    }


    public String getMode() {
        return mode;
    }


    public void setMode(
        String mode
    ) {
        this.mode = mode;
    }


    public String getVenue() {
        return venue;
    }


    public void setVenue(
        String venue
    ) {
        this.venue = venue;
    }


    public String getMeetingLink() {
        return meetingLink;
    }


    public void setMeetingLink(
        String meetingLink
    ) {
        this.meetingLink = meetingLink;
    }


    public String getChangeReason() {
        return changeReason;
    }


    public void setChangeReason(
        String changeReason
    ) {
        this.changeReason = changeReason;
    }

}
