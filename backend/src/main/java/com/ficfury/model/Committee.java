package com.ficfury.model;

import jakarta.persistence.*;

@Entity
@Table(name = "committees")
public class Committee {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    private String name;

    private String category;

    private String description;

    private String date;

    private String time;

    private String mode;

    private String venue;

    private String meetingLink;

    private String chairpersonName;

    private String chairpersonEmail;

    public Committee() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
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

    public String getChairpersonName() {
        return chairpersonName;
    }

    public void setChairpersonName(
            String chairpersonName
    ) {
        this.chairpersonName = chairpersonName;
    }

    public String getChairpersonEmail() {
        return chairpersonEmail;
    }

    public void setChairpersonEmail(
            String chairpersonEmail
    ) {
        this.chairpersonEmail = chairpersonEmail;
    }

}