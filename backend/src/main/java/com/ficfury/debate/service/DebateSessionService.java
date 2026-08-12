package com.ficfury.debate.service;

import com.ficfury.debate.dto.request.CreateDebateSessionRequest;
import com.ficfury.debate.dto.response.DebateSessionResponse;
import com.ficfury.debate.entity.DebateSession;
import com.ficfury.debate.enums.SessionStatus;
import com.ficfury.debate.dto.request.ActiveSessionResponse;

import java.util.List;
import java.util.Optional;

public interface DebateSessionService {

DebateSessionResponse createSession(CreateDebateSessionRequest request);

DebateSessionResponse getChairSession(Long chairId);

DebateSessionResponse initiateSession(Long sessionId);

DebateSessionResponse activateSession(Long sessionId);

DebateSessionResponse stopSession(Long sessionId);

DebateSessionResponse archiveSession(Long sessionId);

Optional<DebateSessionResponse> getSession(Long sessionId);

List<DebateSessionResponse> getAllSessions();

List<DebateSessionResponse> getSessionsByStatus(SessionStatus status);
ActiveSessionResponse getActiveSession(Long committeeId);




}