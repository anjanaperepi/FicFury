package com.ficfury.dto;

public class DashboardStats {

    private long totalUsers;
    private long totalCommittees;
    private long totalCharacters;
    private long totalRegistrations;
    private long pendingRegistrations;
    private long approvedRegistrations;

    public DashboardStats() {
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalCommittees() {
        return totalCommittees;
    }

    public void setTotalCommittees(long totalCommittees) {
        this.totalCommittees = totalCommittees;
    }

    public long getTotalCharacters() {
        return totalCharacters;
    }

    public void setTotalCharacters(long totalCharacters) {
        this.totalCharacters = totalCharacters;
    }

    public long getTotalRegistrations() {
        return totalRegistrations;
    }

    public void setTotalRegistrations(long totalRegistrations) {
        this.totalRegistrations = totalRegistrations;
    }

    public long getPendingRegistrations() {
        return pendingRegistrations;
    }

    public void setPendingRegistrations(long pendingRegistrations) {
        this.pendingRegistrations = pendingRegistrations;
    }

    public long getApprovedRegistrations() {
        return approvedRegistrations;
    }

    public void setApprovedRegistrations(long approvedRegistrations) {
        this.approvedRegistrations = approvedRegistrations;
    }

}