package com.ficfury.dto;

import java.util.List;

import com.ficfury.model.Attendance;
import com.ficfury.model.Award;
import com.ficfury.model.Character;
import com.ficfury.model.Committee;
import com.ficfury.model.Registration;
import com.ficfury.model.User;

public class DelegateDashboardResponse {

    private User user;

    private Registration registration;

    private Committee committee;

    private Character character;

    private List<Attendance> attendance;


    private List<Award> awards;

    private boolean certificateEligible;

    public DelegateDashboardResponse() {
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Registration getRegistration() {
        return registration;
    }

    public void setRegistration(Registration registration) {
        this.registration = registration;
    }

    public Committee getCommittee() {
        return committee;
    }

    public void setCommittee(Committee committee) {
        this.committee = committee;
    }

    public Character getCharacter() {
        return character;
    }

    public void setCharacter(Character character) {
        this.character = character;
    }

    public List<Attendance> getAttendance() {
        return attendance;
    }

    public void setAttendance(List<Attendance> attendance) {
        this.attendance = attendance;
    }




    public List<Award> getAwards() {
        return awards;
    }

    public void setAwards(List<Award> awards) {
        this.awards = awards;
    }

    public boolean isCertificateEligible() {
        return certificateEligible;
    }

    public void setCertificateEligible(
            boolean certificateEligible) {

        this.certificateEligible =
                certificateEligible;
    }

}