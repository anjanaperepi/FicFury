package com.ficfury.debate.service.impl;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.ficfury.debate.dto.request.CreateMotionRequest;
import com.ficfury.debate.dto.response.MotionResponse;
import com.ficfury.debate.mapper.MotionMapper;
import com.ficfury.debate.repository.MotionRepository;
import com.ficfury.debate.repository.DebateSessionRepository;
import com.ficfury.debate.service.MotionService;
import com.ficfury.repository.UserRepository;


import com.ficfury.debate.entity.DebateSession;
import com.ficfury.debate.entity.Motion;
import com.ficfury.debate.enums.MotionStatus;
import com.ficfury.debate.enums.SessionStatus;
import com.ficfury.model.User;







@Service
public class MotionServiceImpl implements MotionService {

    private final MotionRepository motionRepository;

    private final DebateSessionRepository sessionRepository;

    private final UserRepository userRepository;

    private final MotionMapper motionMapper;

    public MotionServiceImpl(
            MotionRepository motionRepository,
            DebateSessionRepository sessionRepository,
            UserRepository userRepository,
            MotionMapper motionMapper) {

        this.motionRepository = motionRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.motionMapper = motionMapper;
    }

@Override
public MotionResponse approveMotion(Long motionId, Long chairId) {

    // 1. Find the motion
    Motion motion = motionRepository.findById(motionId)
            .orElseThrow(() ->
                    new RuntimeException("Motion not found."));

    // 2. Verify the debate session is ACTIVE
    DebateSession session = motion.getSession();

    if (session.getStatus() != SessionStatus.ACTIVE) {
        throw new IllegalStateException(
                "The debate session is not active."
        );
    }

    // 3. Verify the chair exists
    User chair = userRepository.findById(chairId)
            .orElseThrow(() ->
                    new RuntimeException("Chair not found."));
    
    // 4. Verify this chair is assigned to the session
    if (!session.getChair().getId().equals(chairId)) {
        throw new IllegalStateException(
                "Only the assigned chair can approve motions."
        );
    }

    // 5. Verify the motion is still pending
    if (motion.getStatus() != MotionStatus.PENDING) {
        throw new IllegalStateException(
                "Only pending motions can be approved."
        );
    }

    // 6. Approve the motion
    motion.setStatus(MotionStatus.APPROVED);
    motion.setReviewedBy(chair);
    motion.setReviewedAt(LocalDateTime.now());
    motion.setUpdatedAt(LocalDateTime.now());

    Motion savedMotion = motionRepository.save(motion);

    return motionMapper.toMotionResponse(savedMotion);
}

@Override
public MotionResponse dismissMotion(Long motionId, Long chairId) {

    Motion motion = motionRepository.findById(motionId)
            .orElseThrow(() ->
                    new RuntimeException("Motion not found."));

    DebateSession session = motion.getSession();

    if (session.getStatus() != SessionStatus.ACTIVE) {
        throw new IllegalStateException(
                "The debate session is not active."
        );
    }

    User chair = userRepository.findById(chairId)
            .orElseThrow(() ->
                    new RuntimeException("Chair not found."));

    if (!session.getChair().getId().equals(chairId)) {
        throw new IllegalStateException(
                "Only the assigned chair can dismiss motions."
        );
    }



    motion.setStatus(MotionStatus.DISMISSED);
    motion.setReviewedBy(chair);
    motion.setReviewedAt(LocalDateTime.now());
    motion.setUpdatedAt(LocalDateTime.now());

    Motion savedMotion = motionRepository.save(motion);

    return motionMapper.toMotionResponse(savedMotion);
}

@Override
public MotionResponse executeMotion(Long motionId) {

    Motion motion = motionRepository.findById(motionId)
            .orElseThrow(() ->
                    new RuntimeException("Motion not found."));

    DebateSession session = motion.getSession();

    if (session.getStatus() != SessionStatus.ACTIVE) {
        throw new IllegalStateException(
                "The debate session is not active."
        );
    }

    if (motion.getStatus() != MotionStatus.APPROVED) {
        throw new IllegalStateException(
                "Only approved motions can be executed."
        );
    }

    motion.setStatus(MotionStatus.EXECUTED);
    motion.setUpdatedAt(LocalDateTime.now());

    Motion savedMotion = motionRepository.save(motion);

    return motionMapper.toMotionResponse(savedMotion);
}

@Override
public MotionResponse getMotion(Long motionId) {

    Motion motion = motionRepository.findById(motionId)
            .orElseThrow(() ->
                    new RuntimeException("Motion not found."));

    return motionMapper.toMotionResponse(motion);
}

@Override
public List<MotionResponse> getSessionMotions(Long sessionId) {

    return motionRepository.findBySessionId(sessionId)
            .stream()
            .map(motionMapper::toMotionResponse)
            .toList();
}



@Override
public List<MotionResponse> getPendingMotions(Long sessionId) {

    return motionRepository
            .findBySessionIdAndStatus(
                    sessionId,
                    MotionStatus.PENDING
            )
            .stream()
            .map(motionMapper::toMotionResponse)
            .toList();
}

@Override
public MotionResponse raiseMotion(CreateMotionRequest request) {

    DebateSession session = sessionRepository
            .findById(request.getSessionId())
            .orElseThrow(() ->
                    new RuntimeException(
                            "Debate session not found."));

    User delegate = userRepository
            .findById(request.getDelegateId())
            .orElseThrow(() ->
                    new RuntimeException(
                            "Delegate not found."));

        if (session.getStatus() != SessionStatus.ACTIVE) {

        throw new IllegalStateException(
                "Motions can only be raised in an active session.");


    }

        Motion motion = new Motion();

    motion.setSession(session);

    motion.setDelegate(delegate);

    motion.setMotionType(
            request.getMotionType());

    motion.setDurationMinutes(
            request.getDurationMinutes());

    motion.setPurpose(
            request.getPurpose());

    motion.setPriority(
            request.getPriority());

    motion.setStatus(MotionStatus.PENDING);

    motion.setCreatedAt(LocalDateTime.now());
        Motion savedMotion =
            motionRepository.save(motion);

    return motionMapper.toMotionResponse(savedMotion);



}
}
