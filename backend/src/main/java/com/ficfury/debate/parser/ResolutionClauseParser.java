package com.ficfury.debate.parser;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.ficfury.debate.entity.ClauseType;
import com.ficfury.debate.entity.Resolution;
import com.ficfury.debate.entity.ResolutionClause;

@Component
public class ResolutionClauseParser {

public List<ResolutionClause> generateClauses(
        Resolution resolution) {

    List<ResolutionClause> clauses =
            new ArrayList<>();

    String content = resolution.getContent();

    if (content == null || content.isBlank()) {

        return clauses;

    }

    String[] lines = content.split("\\r?\\n");

    ClauseType currentType = null;

    int clauseNumber = 1;

    for (String line : lines) {

        line = line.trim();

        if (line.isBlank()) {

            continue;

        }

        if (line.equalsIgnoreCase("PREAMBULATORY CLAUSES")) {

            currentType = ClauseType.PREAMBULATORY;

            continue;

        }

        if (line.equalsIgnoreCase("OPERATIVE CLAUSES")) {

            currentType = ClauseType.OPERATIVE;

            continue;

        }

        if (currentType == null) {

            continue;

        }

        ResolutionClause clause =
                new ResolutionClause();

        clause.setResolution(resolution);

        clause.setClauseNumber(clauseNumber++);

        clause.setClauseType(currentType);

        clause.setContent(cleanClause(line));

        clause.setCreatedAt(
                java.time.LocalDateTime.now());

        clauses.add(clause);

    }

    return clauses;

}

private String cleanClause(String line) {

    return line

            .replaceFirst("^\\d+\\.", "")

            .replaceFirst("^\\d+\\)", "")

            .trim();

}

}