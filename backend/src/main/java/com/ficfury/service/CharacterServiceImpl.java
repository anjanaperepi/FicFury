package com.ficfury.service;

import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import com.ficfury.repository.RegistrationRepository;
import com.ficfury.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.ficfury.model.Character;
import com.ficfury.model.RegistrationStatus;
import com.ficfury.repository.CharacterRepository;
import com.ficfury.service.CharacterService     ;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.ficfury.model.Role;
import com.ficfury.model.User;

@Service
public class CharacterServiceImpl implements CharacterService {

    
    private final CharacterRepository characterRepository;
private final RegistrationRepository registrationRepository;
private final UserRepository userRepository;


public CharacterServiceImpl(
        CharacterRepository characterRepository,
        RegistrationRepository registrationRepository,
        UserRepository userRepository) {

    this.characterRepository = characterRepository;
    this.registrationRepository = registrationRepository;
    this.userRepository = userRepository;
}

    @Override
    public List<Character> getAllCharacters() {
        return characterRepository.findAll();
    }

    @Override
    public Character getCharacterById(Long id) {

        return characterRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Character not found"));

    }

    @Override
    public Character saveCharacter(Character character) {

    User user = getLoggedInUser();

    if (user.getRole() != Role.ADMIN &&
        !character.getCommittee()
                .getChairpersonEmail()
                .equalsIgnoreCase(user.getEmail())) {

        throw new RuntimeException(
                "You are not assigned to this committee.");
    }

    return characterRepository.save(character);
}

    @Override
    public Character updateCharacter(Long id, Character updatedCharacter) {

        

        Character character = characterRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Character not found"));

                        User user = getLoggedInUser();

validateChairOwnsCommittee(
        character,
        user);

        character.setName(updatedCharacter.getName());

        character.setTitle(updatedCharacter.getTitle());

        character.setDescription(updatedCharacter.getDescription());

        character.setDifficulty(updatedCharacter.getDifficulty());

        character.setFaction(updatedCharacter.getFaction());

        character.setCommittee(updatedCharacter.getCommittee());

        return characterRepository.save(character);

    }

@Transactional
@Override
public void deleteCharacter(Long id) {

    

    Character character = characterRepository.findById(id)
            .orElseThrow(() ->
                    new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Character not found"));


                            User user = getLoggedInUser();

validateChairOwnsCommittee(
        character,
        user);

    // Delete all registrations assigned to this character
    registrationRepository.deleteByCharacterId(id);

    // Delete the character
    characterRepository.delete(character);
}

    @Override
    public List<Character> getCharactersByCommittee(Long committeeId) {

        return characterRepository.findByCommitteeId(committeeId);

    }
@Override
public List<Character> getAvailableCharactersByCommittee(
        Long committeeId) {

    List<Character> characters =
            characterRepository.findByCommitteeId(
                    committeeId
            );

    return characters.stream()
            .filter(character ->
                    !registrationRepository
                            .existsByCharacter_IdAndWorkflowStatusIn(
                                    character.getId(),
                                    List.of(
                                            RegistrationStatus.PENDING_ADMIN,
                                            RegistrationStatus.PENDING_CHAIR,
                                            RegistrationStatus.ACTIVE
                                    )
                            )
            )
            .toList();

}
private User getLoggedInUser() {

    Authentication authentication =
            SecurityContextHolder
                    .getContext()
                    .getAuthentication();

    String username = authentication.getName();

    return userRepository
            .findByEmail(username)
            .or(() -> userRepository.findByUsername(username))
            .orElseThrow(() ->
                    new RuntimeException(
                            "Logged-in user not found."));
}
private void validateChairOwnsCommittee(
        Character character,
        User user) {

    if (user.getRole() == Role.ADMIN) {
        return;
    }

    if (user.getRole() != Role.CHAIR) {
        throw new RuntimeException(
                "Only admins or committee chairs can manage characters.");
    }

    if (!character.getCommittee()
            .getChairpersonEmail()
            .equalsIgnoreCase(user.getEmail())) {

        throw new RuntimeException(
                "You are not assigned to this committee.");
    }
}
}