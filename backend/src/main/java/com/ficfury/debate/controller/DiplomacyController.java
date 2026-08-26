package com.ficfury.debate.controller;

import com.ficfury.debate.entity.DiplomacyConversation;
import com.ficfury.debate.entity.DiplomacyMessage;
import com.ficfury.debate.mapper.DiplomacyMapper;
import com.ficfury.debate.enums.ConversationType;
import com.ficfury.debate.service.DiplomacyService;
import com.ficfury.dto.CommitteeDelegateDTO;
import com.ficfury.debate.dto.request.SendMessageRequest;
import com.ficfury.debate.dto.request.CreateConversationRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import com.ficfury.model.User;
import com.ficfury.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/diplomacy")
@CrossOrigin
public class DiplomacyController {

    private final DiplomacyService diplomacyService;
    private final UserRepository userRepository;
    private final DiplomacyMapper diplomacyMapper;


public DiplomacyController(
        DiplomacyService diplomacyService,
        UserRepository userRepository,
        DiplomacyMapper diplomacyMapper
) {
    this.diplomacyService = diplomacyService;
    this.userRepository = userRepository;
    this.diplomacyMapper = diplomacyMapper;
}

    /* =====================================================
       GET CONVERSATIONS
       ===================================================== */

    @GetMapping("/session/{sessionId}/conversations")
    public ResponseEntity<?> getConversations(
            @PathVariable Long sessionId,
            Authentication authentication
    ) {

        try {

            Long userId =
                    getUserId(authentication);

            List<DiplomacyConversation> conversations =
                    diplomacyService
                            .getVisibleConversations(
                                    sessionId,
                                    userId
                            );

return ResponseEntity.ok(
        diplomacyMapper.toConversationDTOs(
                conversations
        )
);

        } catch (SecurityException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "error",
                            e.getMessage()
                    ));

        } catch (IllegalArgumentException |
                 IllegalStateException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "error",
                            e.getMessage()
                    ));
        }
    }


    /* =====================================================
       PUBLIC COUNCIL
       ===================================================== */

    @GetMapping("/session/{sessionId}/public")
    public ResponseEntity<?> getPublicCouncil(
            @PathVariable Long sessionId,
            Authentication authentication
    ) {

        try {

            Long userId =
                    getUserId(authentication);

            DiplomacyConversation conversation =
                    diplomacyService
                            .getOrCreatePublicCouncil(
                                    sessionId,
                                    userId
                            );

return ResponseEntity.ok(
        diplomacyMapper.toConversationDTO(
                conversation
        )
);

        } catch (SecurityException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "error",
                            e.getMessage()
                    ));

        } catch (IllegalArgumentException |
                 IllegalStateException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "error",
                            e.getMessage()
                    ));
        }
    }



    /* =====================================================
       GET MESSAGES
       ===================================================== */

    @GetMapping(
        "/conversations/{conversationId}/messages"
    )
    public ResponseEntity<?> getMessages(
            @PathVariable Long conversationId,
            Authentication authentication
    ) {

        try {

            Long userId =
                    getUserId(authentication);


            List<DiplomacyMessage> messages =
                    diplomacyService
                            .getMessages(
                                    conversationId,
                                    userId
                            );


return ResponseEntity.ok(
        diplomacyMapper.toMessageDTOs(
                messages
        )
);


        } catch (SecurityException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "error",
                            e.getMessage()
                    ));

        } catch (IllegalArgumentException |
                 IllegalStateException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "error",
                            e.getMessage()
                    ));
        }
    }

@PostMapping("/session/{sessionId}/conversations")
public ResponseEntity<?> createConversation(
        @PathVariable Long sessionId,
        @RequestBody CreateConversationRequest request,
        Authentication authentication
) {

    try {

        Long userId = getUserId(authentication);

        if (request == null || request.type() == null) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "error",
                            "Conversation type is required."
                    ));
        }

        ConversationType type;

        try {
            type = ConversationType.valueOf(
                    request.type().trim().toUpperCase()
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "error",
                            "Invalid conversation type."
                    ));
        }

        DiplomacyConversation conversation =
                diplomacyService.createConversation(
                        sessionId,
                        userId,
                        type,
                        request.participantRegistrationIds()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        diplomacyMapper.toConversationDTO(
                                conversation
                        )
                );

    } catch (SecurityException e) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                        "error",
                        e.getMessage()
                ));

    } catch (
            IllegalArgumentException |
            IllegalStateException e
    ) {

        return ResponseEntity
                .badRequest()
                .body(Map.of(
                        "error",
                        e.getMessage()
                ));
    }
}
    /* =====================================================
       SEND MESSAGE
       ===================================================== */

@PostMapping(
    "/conversations/{conversationId}/messages"
)
public ResponseEntity<?> sendMessage(
        @PathVariable Long conversationId,

        @RequestBody
        SendMessageRequest request,

        Authentication authentication
) {

    try {

        Long userId =
                getUserId(authentication);

        if (
            request == null ||
            request.content() == null ||
            request.content().trim().isEmpty()
        ) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "error",
                            "Message content cannot be empty."
                    ));
        }

        DiplomacyMessage message =
                diplomacyService.sendMessage(
                        conversationId,
                        userId,
                        request.content().trim()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        diplomacyMapper.toMessageDTO(
                                message
                        )
                );

    } catch (SecurityException e) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                        "error",
                        e.getMessage()
                ));

    } catch (
        IllegalArgumentException |
        IllegalStateException e
    ) {

        return ResponseEntity
                .badRequest()
                .body(Map.of(
                        "error",
                        e.getMessage()
                ));
    }
}

    /* =====================================================
       CHAIR OVERSIGHT
       ===================================================== */

    @GetMapping(
        "/session/{sessionId}/chair/oversight"
    )
    public ResponseEntity<?> getChairOversight(
            @PathVariable Long sessionId,
            Authentication authentication
    ) {

        try {

            Long userId =
                    getUserId(authentication);


            List<DiplomacyConversation> conversations =
                    diplomacyService
                            .getAllConversationsForChair(
                                    sessionId,
                                    userId
                            );


return ResponseEntity.ok(
        conversations.stream()
                .map(diplomacyMapper::toConversationDTO)
                .toList()
);


        } catch (SecurityException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "error",
                            e.getMessage()
                    ));

        } catch (IllegalArgumentException |
                 IllegalStateException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "error",
                            e.getMessage()
                    ));
        }
    }


@GetMapping("/session/{sessionId}/participants")
public ResponseEntity<?> getSessionParticipants(
        @PathVariable Long sessionId,
        Authentication authentication
) {

    try {

        Long userId =
                getUserId(authentication);

        return ResponseEntity.ok(
                diplomacyService.getSessionParticipants(
                        sessionId,
                        userId
                )
        );

    } catch (SecurityException e) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                        "error",
                        e.getMessage()
                ));

    } catch (
            IllegalArgumentException |
            IllegalStateException e
    ) {

        return ResponseEntity
                .badRequest()
                .body(Map.of(
                        "error",
                        e.getMessage()
                ));
    }
}

@GetMapping(
    "/conversations/{conversationId}/chair/messages"
)
public ResponseEntity<?> getChairMessages(
        @PathVariable Long conversationId,
        Authentication authentication
) {

    try {

        Long userId =
                getUserId(authentication);

        List<DiplomacyMessage> messages =
                diplomacyService
                        .getMessagesForChair(
                                conversationId,
                                userId
                        );

        return ResponseEntity.ok(
                diplomacyMapper.toMessageDTOs(
                        messages
                )
        );

    } catch (SecurityException e) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                        "error",
                        e.getMessage()
                ));

    } catch (
            IllegalArgumentException |
            IllegalStateException e
    ) {

        return ResponseEntity
                .badRequest()
                .body(Map.of(
                        "error",
                        e.getMessage()
                ));
    }
}
    /* =====================================================
       AUTHENTICATED USER ID
       ===================================================== */
private Long getUserId(
        Authentication authentication
) {

    if (
        authentication == null ||
        !authentication.isAuthenticated()
    ) {
        throw new SecurityException(
                "Authentication required."
        );
    }

    String email =
            authentication.getName();

    User user =
            userRepository
                    .findByEmail(email)
                    .orElseThrow(() ->
                        new SecurityException(
                            "Authenticated user not found."
                        )
                    );

    return user.getId();
}
    /* =====================================================
       REQUEST RECORDS
       ===================================================== */

    public record CreateConversationRequest(

            String type,

            List<Long>
            participantRegistrationIds

    ) {}


    public record SendMessageRequest(

            String content

    ) {}

}