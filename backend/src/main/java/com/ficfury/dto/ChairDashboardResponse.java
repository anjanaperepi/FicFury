package com.ficfury.dto;

import java.util.List;

import com.ficfury.model.Committee;


import com.ficfury.dto.ChairRegistrationDTO;

public class ChairDashboardResponse {

    // =====================================================
    // CHAIR
    // =====================================================

    private String chairName;

    private String chairEmail;

    // =====================================================
    // COMMITTEE
    // =====================================================

   private List<Committee> committees;

    // =====================================================
    // DASHBOARD STATISTICS
    // =====================================================

    private long delegateCount;

    private double attendancePercentage;

    private long paperCount;

    private long activeDebates;

    // =====================================================
    // ATTENDANCE SUMMARY
    // =====================================================

    private long presentCount;

    private long absentCount;

    private long lateCount;

    // =====================================================
    // COMMITTEE ACTIVITY
    // =====================================================

    private List<String> recentActivity;


    // =====================================================
    // CONSTRUCTORS
    // =====================================================

    public ChairDashboardResponse() {
    }

    // =====================================================
    // GETTERS & SETTERS
    // =====================================================

    public String getChairName() {
        return chairName;
    }

    public void setChairName(String chairName) {
        this.chairName = chairName;
    }

    public String getChairEmail() {
        return chairEmail;
    }

    public void setChairEmail(String chairEmail) {
        this.chairEmail = chairEmail;
    }

    public List<Committee> getCommittees() {
    return committees;
}

    public void setCommittees(List<Committee> committees) {
    this.committees = committees;
}

    public long getDelegateCount() {
        return delegateCount;
    }

    public void setDelegateCount(long delegateCount) {
        this.delegateCount = delegateCount;
    }

    public double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }

    public long getPaperCount() {
        return paperCount;
    }

    public void setPaperCount(long paperCount) {
        this.paperCount = paperCount;
    }

    public long getActiveDebates() {
        return activeDebates;
    }

    public void setActiveDebates(long activeDebates) {
        this.activeDebates = activeDebates;
    }

    public long getPresentCount() {
        return presentCount;
    }

    public void setPresentCount(long presentCount) {
        this.presentCount = presentCount;
    }

    public long getAbsentCount() {
        return absentCount;
    }

    public void setAbsentCount(long absentCount) {
        this.absentCount = absentCount;
    }

    public long getLateCount() {
        return lateCount;
    }

    public void setLateCount(long lateCount) {
        this.lateCount = lateCount;
    }

    public List<String> getRecentActivity() {
        return recentActivity;
    }

    public void setRecentActivity(List<String> recentActivity) {
        this.recentActivity = recentActivity;
    }

   private List<ChairRegistrationDTO> recentRegistrations;
   private List<ChairRegistrationDTO> registrations;

   public List<ChairRegistrationDTO> getRegistrations() {
    return registrations;
}

public void setRegistrations(List<ChairRegistrationDTO> registrations) {
    this.registrations = registrations;
}
    

}