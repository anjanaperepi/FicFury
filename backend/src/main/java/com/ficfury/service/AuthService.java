package com.ficfury.service;

import com.ficfury.dto.AuthResponse;
import com.ficfury.dto.LoginRequest;
import com.ficfury.dto.RegisterRequest;
import com.ficfury.model.Role;
import com.ficfury.model.User;
import com.ficfury.model.UserStatus;
import com.ficfury.repository.UserRepository;
import com.ficfury.security.CustomUserDetailsService;
import com.ficfury.security.JwtUtil;
import com.ficfury.dto.AuthResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.ficfury.repository.RegistrationRepository;
import com.ficfury.model.Committee;
import com.ficfury.model.Registration;
import com.ficfury.repository.CommitteeRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    private final RegistrationRepository registrationRepository;

    private final BCryptPasswordEncoder encoder;

    private final AuthenticationManager authenticationManager;

    private final JwtUtil jwtUtil;

    private final CustomUserDetailsService userDetailsService;

    private final CommitteeRepository committeeRepository;
    

    public String register(
            RegisterRequest request
    ) {

        if (
            userRepository.findByEmail(
                request.getEmail()
            ).isPresent()
        ) {

            return "Email already exists";

        }

        User user = new User();

user.setFullName(
    request.getFullName()
);

user.setUsername(
    request.getUsername()
);
if (request.getUsername().length() < 3) {
    throw new RuntimeException(
            "Username must contain at least 3 characters.");
}
user.setEmail(
    request.getEmail()
);

if (userRepository.existsByUsernameIgnoreCase(
        request.getUsername())) {

    throw new RuntimeException(
            "Username already exists.");
}
user.setPassword(
    encoder.encode(
        request.getPassword()
    )
);

String password = request.getPassword();

if (password.length() < 8) {
    throw new RuntimeException(
            "Password must be at least 8 characters.");
}

user.setRole(
    Role.DELEGATE
);

user.setStatus(
    UserStatus.ACTIVE
);

if (request.getEmail() == null ||
    request.getEmail().isBlank()) {

    throw new RuntimeException(
            "Email is required.");
}

if (request.getUsername() == null ||
    request.getUsername().isBlank()) {

    throw new RuntimeException(
            "Username is required.");
}

        userRepository.save(user);

        return "Registration Successful";

    }
public AuthResponse login(LoginRequest request) {

    authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
            )
    );

    UserDetails userDetails =
            userDetailsService.loadUserByUsername(
                    request.getEmail()
            );

    User user = userRepository
            .findByEmail(userDetails.getUsername())
            .or(() -> userRepository.findByUsername(userDetails.getUsername()))
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

String token = jwtUtil.generateToken(userDetails);

Long committeeId = null;

if (user.getRole() == Role.DELEGATE) {

    committeeId = registrationRepository
            .findFirstByUser_Id(user.getId())
            .map(registration -> registration.getCommittee().getId())
            .orElse(null);

}
else if (user.getRole() == Role.CHAIR) {

    System.out.println("Looking up committee for chair: " + user.getEmail());

    committeeId = committeeRepository
            .findByChairpersonEmail(user.getEmail())
            .stream()
            .findFirst()
            .map(Committee::getId)
            .orElse(null);

    System.out.println("Committee found: " + committeeId);

}
System.out.println("==================================");
System.out.println("Role        : " + user.getRole());
System.out.println("Email       : " + user.getEmail());
System.out.println("CommitteeId : " + committeeId);
System.out.println("==================================");
return new AuthResponse(
        token,
        user.getId(),
        user.getRole().name(),
        user.getFullName(),
        committeeId
       
);
}
}