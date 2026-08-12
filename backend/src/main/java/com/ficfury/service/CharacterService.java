package com.ficfury.service;

import java.util.List;


import com.ficfury.model.Character;

public interface CharacterService {

    List<Character> getAllCharacters();

    Character getCharacterById(Long id);

    Character saveCharacter(Character character);

    Character updateCharacter(Long id, Character character);

    void deleteCharacter(Long id);

    List<Character> getCharactersByCommittee(Long committeeId);

}