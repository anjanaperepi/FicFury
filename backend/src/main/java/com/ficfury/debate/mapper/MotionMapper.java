package com.ficfury.debate.mapper;

import org.springframework.stereotype.Component;

import com.ficfury.debate.dto.response.MotionResponse;
import com.ficfury.debate.entity.Motion;

@Component
public class MotionMapper {

    public MotionResponse toMotionResponse(Motion motion) {

        if (motion == null) {
            return null;
        }

        MotionResponse response = new MotionResponse();

        response.setId(motion.getId());

        response.setSessionId(motion.getSession().getId());

        response.setDelegateId(motion.getDelegate().getId());
        response.setDelegateName(
                motion.getDelegate().getFullName());

        response.setMotionType(motion.getMotionType());

        response.setDurationMinutes(
                motion.getDurationMinutes());

        response.setPurpose(motion.getPurpose());

        response.setPriority(motion.getPriority());

        response.setStatus(motion.getStatus());

        if (motion.getReviewedBy() != null) {

            response.setReviewedById(
                    motion.getReviewedBy().getId());

            response.setReviewedByName(
                    motion.getReviewedBy().getFullName());
        }

        response.setCreatedAt(
                motion.getCreatedAt());

        response.setUpdatedAt(
                motion.getUpdatedAt());

        response.setReviewedAt(
                motion.getReviewedAt());

        return response;
    }

}