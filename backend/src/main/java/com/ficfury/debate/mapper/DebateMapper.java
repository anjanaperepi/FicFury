package com.ficfury.debate.mapper;

import com.ficfury.debate.dto.response.DebateSessionResponse;
import com.ficfury.debate.entity.DebateSession;
import org.springframework.stereotype.Component;

@Component
public class DebateMapper {

    public DebateSessionResponse toDebateSessionResponse(
            DebateSession session) {

        if (session == null) {
            return null;
        }

        DebateSessionResponse response =
                new DebateSessionResponse();

        response.setId(session.getId());

        response.setCommitteeId(session.getCommittee().getId());
        response.setCommitteeName(session.getCommittee().getName());

        response.setChairId(session.getChair().getId());
        response.setChairName(session.getChair().getFullName());

        response.setStatus(session.getStatus());
        response.setActive(session.getActive());

        response.setCreatedAt(session.getCreatedAt());
        response.setInitiatedAt(session.getInitiatedAt());
        response.setActivatedAt(session.getActivatedAt());
        response.setEndedAt(session.getEndedAt());
        response.setArchivedAt(session.getArchivedAt());

        return response;
    }

}