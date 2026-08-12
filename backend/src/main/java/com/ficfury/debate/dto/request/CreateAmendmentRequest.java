package com.ficfury.debate.dto.request;

import com.ficfury.debate.entity.AmendmentType;

public class CreateAmendmentRequest {

    private Long resolutionId;

    private Long delegateId;

    private AmendmentType amendmentType;

private Long clauseId;

    private String proposedText;
private Long insertAfterClauseId;;

    

public Long getClauseId() {
    return clauseId;
}

public void setClauseId(Long clauseId) {
    this.clauseId = clauseId;
}

public AmendmentType getAmendmentType() {
    return amendmentType;
}

public void setAmendmentType(AmendmentType amendmentType) {
    this.amendmentType = amendmentType;
}

public String getProposedText() {
    return proposedText;
}

public void setProposedText(String proposedText) {
    this.proposedText = proposedText;
}

public Long getResolutionId() {
    return resolutionId;
}

public void setResolutionId(Long resolutionId) {
    this.resolutionId = resolutionId;
}

public Long getDelegateId() {
    return delegateId;
}

public void setDelegateId(Long delegateId) {
    this.delegateId = delegateId;
}

public Long getInsertAfterClauseId() {
    return insertAfterClauseId;
}

public void setInsertAfterClauseId(Long insertAfterClauseId) {
    this.insertAfterClauseId = insertAfterClauseId;
}
}
