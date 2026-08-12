package com.ficfury.model;

import jakarta.persistence.*;

@Entity
@Table(name = "characters")
public class Character {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    private String name;

    private String title;

    @Column(length = 2000)
    private String description;

    private String difficulty;

    private String faction;

    @ManyToOne
    @JoinColumn(name = "committee_id")
    private Committee committee;

    public Character() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description
    ) {
        this.description = description;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(
            String difficulty
    ) {
        this.difficulty = difficulty;
    }

    public String getFaction() {
        return faction;
    }

    public void setFaction(
            String faction
    ) {
        this.faction = faction;
    }

    public Committee getCommittee() {
        return committee;
    }

    public void setCommittee(
            Committee committee
    ) {
        this.committee = committee;
    }
}