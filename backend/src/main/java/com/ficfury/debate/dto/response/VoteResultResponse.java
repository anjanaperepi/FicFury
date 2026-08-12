package com.ficfury.debate.dto.response;

import com.ficfury.debate.entity.VoteType;

public class VoteResultResponse {

    private long yesVotes;
    private long noVotes;
    
    private long totalVotes;
    private boolean passed;
    private boolean hasVoted;
    private VoteType currentUserVote;

    public VoteResultResponse() {
    }

    public long getYesVotes() {
        return yesVotes;
    }

    public void setYesVotes(long yesVotes) {
        this.yesVotes = yesVotes;
    }

    public long getNoVotes() {
        return noVotes;
    }

    public void setNoVotes(long noVotes) {
        this.noVotes = noVotes;
    }



    public long getTotalVotes() {
        return totalVotes;
    }

    public void setTotalVotes(long totalVotes) {
        this.totalVotes = totalVotes;
    }

    public boolean isPassed() {
        return passed;
    }

    public void setPassed(boolean passed) {
        this.passed = passed;
    }

    public boolean isHasVoted() {
    return hasVoted;
    }

    public void setHasVoted(boolean hasVoted) {
        this.hasVoted = hasVoted;
    }

    public VoteType getCurrentUserVote() {
        return currentUserVote;
    }

    public void setCurrentUserVote(VoteType currentUserVote) {
        this.currentUserVote = currentUserVote;
    }
}