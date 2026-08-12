package com.ficfury.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import com.ficfury.model.Character;
import com.ficfury.service.CharacterService;

@RestController
@RequestMapping("/api/characters")
@CrossOrigin("*")
public class CharacterController {

    private final CharacterService characterService;

    public CharacterController(CharacterService characterService) {

        this.characterService = characterService;

    }

    @GetMapping
    public List<Character> getAllCharacters() {

        return characterService.getAllCharacters();

    }

    @GetMapping("/{id}")
    public Character getCharacterById(
            @PathVariable Long id) {

        return characterService.getCharacterById(id);

    }

    @GetMapping("/committee/{committeeId}")
    public List<Character> getCharactersByCommittee(
            @PathVariable Long committeeId) {

        return characterService.getCharactersByCommittee(committeeId);

    }
    @PreAuthorize("hasAnyRole('ADMIN','CHAIR')")

    @PostMapping
    public Character createCharacter(
            @RequestBody Character character) {

        return characterService.saveCharacter(character);

    }
    @PreAuthorize("hasAnyRole('ADMIN','CHAIR')")
    @PutMapping("/{id}")
    public Character updateCharacter(
            @PathVariable Long id,
            @RequestBody Character character) {

        return characterService.updateCharacter(id, character);

    }
    @PreAuthorize("hasAnyRole('ADMIN','CHAIR')")
    @DeleteMapping("/{id}")
    public void deleteCharacter(
            @PathVariable Long id) {

        characterService.deleteCharacter(id);

    }

}