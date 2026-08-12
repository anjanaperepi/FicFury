package com.ficfury.debate.service;

import java.util.List;
import java.util.Optional;

import com.ficfury.debate.dto.request.CreateMotionRequest;
import com.ficfury.debate.dto.response.MotionResponse;

public interface MotionService {

    MotionResponse raiseMotion(CreateMotionRequest request);

    MotionResponse approveMotion(Long motionId, Long chairId);

    MotionResponse dismissMotion(Long motionId, Long chairId);

    MotionResponse executeMotion(Long motionId);

    MotionResponse getMotion(Long motionId);

    List<MotionResponse> getSessionMotions(Long sessionId);

    List<MotionResponse> getPendingMotions(Long sessionId);

}