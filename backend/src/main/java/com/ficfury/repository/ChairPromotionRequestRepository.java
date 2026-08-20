package com.ficfury.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ficfury.model.ChairPromotionRequest;
import com.ficfury.model.RequestStatus;

public interface ChairPromotionRequestRepository
        extends JpaRepository<
            ChairPromotionRequest,
            Long
        > {


    List<ChairPromotionRequest>
    findByUser_Id(Long userId);


    List<ChairPromotionRequest>
    findByStatus(RequestStatus status);


    boolean existsByUser_IdAndStatus(
            Long userId,
            RequestStatus status
    );

}